import dns from 'node:dns';
// Force IPv4 resolution first to prevent Linux ETIMEDOUT on OpenRouter endpoints
dns.setDefaultResultOrder('ipv4first');

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
import { getUserQuota, incrementUserUsage } from './quota';
import { sanitizeUserInput, CYPHER_SYSTEM_PROMPTS } from './security';
import { performWebSearch, SearchResult } from './search';
import {
  createChatStream,
  VALIDATED_MODELS,
  AVAILABLE_FREE_MODELS,
  MessagePayload,
} from './openrouter';
import { executePythonCode } from './pythonSandbox';
import { generatePDF, generatePPTX } from './documentGenerator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// Global Artifacts Storage
interface StoredArtifact {
  id: string;
  filename: string;
  mimeType: string;
  data: Buffer;
  createdAt: number;
}
const artifactsStore = new Map<string, StoredArtifact>();

// Disable leaking express metadata
app.disable('x-powered-by');

// Middleware
app.use(
  cors({
    origin: '*',
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  })
);
app.use(express.json({ limit: '10mb' }));

// Strict Security Headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Helper to extract or generate client identity
function getClientId(req: Request): string {
  const headerId = req.headers['x-cypher-client-id'] as string;
  if (headerId && headerId.trim().length > 0) {
    return headerId.trim();
  }
  const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
  return ip;
}

// GET /api/health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Cypher AI Engine',
    openrouterKeyConfigured: !!OPENROUTER_API_KEY,
    tools: ['python_sandbox', 'pdf_generator', 'pptx_generator', 'web_search'],
  });
});

// GET /api/usage
app.get('/api/usage', (req: Request, res: Response) => {
  const clientId = getClientId(req);
  const quota = getUserQuota(clientId);

  res.setHeader('X-RateLimit-Limit', quota.limit.toString());
  res.setHeader('X-RateLimit-Remaining', quota.remaining.toString());
  res.setHeader('X-RateLimit-Reset', quota.resetsAt.toString());

  res.json({
    clientId,
    ...quota,
    message: `${quota.remaining} requêtes restantes aujourd'hui (limite grand public : ${quota.limit}/jour)`,
  });
});

// GET /api/models - Returns real discovered free models catalog
app.get('/api/models', (req: Request, res: Response) => {
  res.json({
    models: AVAILABLE_FREE_MODELS,
  });
});

// GET /api/artifacts/:id - Serve generated artifacts (PDF, PPTX, PNG plots)
app.get('/api/artifacts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const artifact = artifactsStore.get(id);

  if (!artifact) {
    res.status(404).json({ error: 'ARTIFACT_NOT_FOUND', message: 'Fichier introuvable.' });
    return;
  }

  res.setHeader('Content-Type', artifact.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(artifact.filename)}"`);
  res.send(artifact.data);
});

// POST /api/tools/python - Execute Python code in sandbox
app.post('/api/tools/python', async (req: Request, res: Response): Promise<void> => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'MISSING_CODE', message: 'Le script Python est requis.' });
    return;
  }

  try {
    const result = await executePythonCode(code);

    // Store any generated files in artifactsStore
    for (const art of result.artifacts) {
      if (art.dataBase64) {
        artifactsStore.set(art.id, {
          id: art.id,
          filename: art.filename,
          mimeType: art.mimeType,
          data: Buffer.from(art.dataBase64, 'base64'),
          createdAt: Date.now(),
        });
      }
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'EXECUTION_ERROR',
      message: err.message || 'Erreur lors de l\'exécution du script Python.',
    });
  }
});

// POST /api/tools/pdf - Generate high-quality PDF document
app.post('/api/tools/pdf', async (req: Request, res: Response): Promise<void> => {
  const { title, sections, author } = req.body;

  if (!title || !Array.isArray(sections)) {
    res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'Titre et sections requis.' });
    return;
  }

  try {
    const normalizedSections = sections.map((s: any) => ({
      title: s.title || '',
      content:
        s.content ||
        s.body ||
        s.text ||
        (Array.isArray(s.bulletPoints) ? s.bulletPoints.map((b: string) => `• ${b}`).join('\n') : ''),
    }));

    const pdfBytes = await generatePDF({ title, sections: normalizedSections, author });
    const artifactId = 'pdf-' + crypto.randomUUID();
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_').slice(0, 30)}.pdf`;

    artifactsStore.set(artifactId, {
      id: artifactId,
      filename,
      mimeType: 'application/pdf',
      data: Buffer.from(pdfBytes),
      createdAt: Date.now(),
    });

    res.json({
      success: true,
      artifactId,
      filename,
      url: `/api/artifacts/${artifactId}`,
      sizeBytes: pdfBytes.length,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'PDF_GENERATION_FAILED',
      message: err.message || 'Échec de génération du PDF.',
    });
  }
});

// POST /api/tools/pptx - Generate modern PowerPoint presentation
app.post('/api/tools/pptx', async (req: Request, res: Response): Promise<void> => {
  const { title, subtitle, slides, author } = req.body;

  if (!title || !Array.isArray(slides)) {
    res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'Titre et diapositives requis.' });
    return;
  }

  try {
    const normalizedSlides = slides.map((s: any) => ({
      title: s.title || 'Diapositive',
      points: Array.isArray(s.points)
        ? s.points
        : Array.isArray(s.bullets)
        ? s.bullets
        : [s.content || s.body || ''],
      notes: s.notes,
    }));

    const pptxBuffer = await generatePPTX({ title, subtitle, slides: normalizedSlides, author });
    const artifactId = 'pptx-' + crypto.randomUUID();
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_').slice(0, 30)}.pptx`;

    artifactsStore.set(artifactId, {
      id: artifactId,
      filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      data: Buffer.from(pptxBuffer),
      createdAt: Date.now(),
    });

    res.json({
      success: true,
      artifactId,
      filename,
      url: `/api/artifacts/${artifactId}`,
      sizeBytes: pptxBuffer.byteLength,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'PPTX_GENERATION_FAILED',
      message: err.message || 'Échec de génération de la présentation PowerPoint.',
    });
  }
});

// Unified streaming handler for /api/chat, /api/search, /api/code
async function handleChatStreaming(req: Request, res: Response, forcedMode?: string): Promise<void> {
  const clientId = getClientId(req);
  const quota = getUserQuota(clientId);

  // Set rate-limit headers
  res.setHeader('X-RateLimit-Limit', quota.limit.toString());
  res.setHeader('X-RateLimit-Remaining', quota.remaining.toString());
  res.setHeader('X-RateLimit-Reset', quota.resetsAt.toString());

  // Enforce usage limit (50 req/day)
  if (!quota.isAllowed) {
    res.status(429).json({
      error: 'QUOTA_EXCEEDED',
      title: 'Limite journalière atteinte',
      message: `Vous avez utilisé la totalité de vos ${quota.limit} messages gratuits pour aujourd'hui. Votre quota sera réinitialisé à minuit UTC.`,
      resetsAt: quota.resetsAt,
      limit: quota.limit,
      remaining: 0,
    });
    return;
  }

  const { messages, mode = forcedMode || 'chat', customModel } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'La liste de messages est requise.' });
    return;
  }

  // Get last user message
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUserMessage || !lastUserMessage.content) {
    res.status(400).json({ error: 'MISSING_USER_MESSAGE', message: 'Message utilisateur introuvable.' });
    return;
  }

  // Security guardrails check (anti-prompt injection)
  const securityCheck = sanitizeUserInput(lastUserMessage.content);
  if (!securityCheck.safe) {
    res.status(400).json({
      error: 'SECURITY_ALERT',
      message: securityCheck.flag || 'Requête bloquée par les garde-fous de sécurité Cypher AI.',
    });
    return;
  }

  // Determine system prompt and model based on mode or explicit customModel
  let systemPrompt =
    CYPHER_SYSTEM_PROMPTS[mode as keyof typeof CYPHER_SYSTEM_PROMPTS] || CYPHER_SYSTEM_PROMPTS.chat;

  let targetModel =
    customModel ||
    (mode === 'code'
      ? VALIDATED_MODELS.code
      : mode === 'search'
      ? VALIDATED_MODELS.search
      : VALIDATED_MODELS.chat);

  let searchResults: SearchResult[] = [];

  // Live Web Search execution if mode is 'search'
  if (mode === 'search') {
    try {
      searchResults = await performWebSearch(lastUserMessage.content);
      const searchContext = searchResults
        .map(
          (r, i) =>
            `[Source ${i + 1}]: "${r.title}"\nExtrait: ${r.snippet}\nURL: ${r.url}`
        )
        .join('\n\n');
      systemPrompt += `\n\nVoici les résultats en direct du Web recueillis pour cette requête :\n${searchContext}\n\nUtilise ces sources pour répondre et insère les citations correspondantes [1], [2], etc.`;
    } catch (err) {
      console.warn('Web search enrichment failed, proceeding with model knowledge:', err);
    }
  }

  // Prepare messages array with Cypher system prompt (sliding window of 10 messages for long context)
  const preparedMessages: MessagePayload[] = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-10).map((m: any) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: String(m.content),
    })),
  ];

  // Client abort handling: listen on response close only if client disconnected early
  const clientAbortController = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) {
      clientAbortController.abort();
    }
  });

  // Set up SSE headers and flush
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Send search results event first if available
  if (searchResults.length > 0) {
    res.write(`data: ${JSON.stringify({ type: 'sources', sources: searchResults })}\n\n`);
  }

  try {
    let orResponse = await createChatStream(
      preparedMessages,
      targetModel,
      OPENROUTER_API_KEY,
      clientAbortController.signal
    );

    // Fallback if primary model fails (e.g. temporary 429 or provider glitch)
    if (!orResponse.ok) {
      console.warn(
        `Model ${targetModel} failed with status ${orResponse.status}. Attempting fallback to ${VALIDATED_MODELS.fallback}...`
      );
      targetModel = VALIDATED_MODELS.fallback;
      orResponse = await createChatStream(
        preparedMessages,
        targetModel,
        OPENROUTER_API_KEY,
        clientAbortController.signal
      );
    }

    if (!orResponse.ok) {
      const errBody = await orResponse.text();
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          error: 'AI_PROVIDER_ERROR',
          message: 'Le fournisseur IA a rencontré une indisponibilité momentanée.',
          details: errBody,
        })}\n\n`
      );
      res.end();
      return;
    }

    // Deduct usage
    const updatedQuota = incrementUserUsage(clientId);

    if (!orResponse.body) {
      throw new Error('No response body from OpenRouter');
    }

    const reader = orResponse.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let totalContent = '';
    let totalReasoning = '';

    while (true) {
      if (clientAbortController.signal.aborted) {
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed === 'data: [DONE]') {
          if (!totalContent && totalReasoning) {
            res.write(`data: ${JSON.stringify({ text: totalReasoning })}\n\n`);
          }
          res.write(`data: ${JSON.stringify({ type: 'quota', quota: updatedQuota })}\n\n`);
          res.write('data: [DONE]\n\n');
          continue;
        }

        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta;
            const content = delta?.content || '';
            const reasoning = delta?.reasoning || delta?.thought || '';

            if (content) totalContent += content;
            if (reasoning) totalReasoning += reasoning;

            if (content || reasoning) {
              res.write(
                `data: ${JSON.stringify({
                  text: content,
                  thought: reasoning,
                })}\n\n`
              );
            }
          } catch {
            // Ignore keep-alive or JSON parse fragments
          }
        }
      }
    }

    res.end();
  } catch (error: any) {
    if (clientAbortController.signal.aborted) {
      res.end();
      return;
    }
    console.error('Chat streaming error:', error);
    res.write(
      `data: ${JSON.stringify({
        type: 'error',
        error: 'STREAM_ERROR',
        message: error.message,
      })}\n\n`
    );
    res.end();
  }
}

// Routes
app.post('/api/chat', (req, res) => handleChatStreaming(req, res, 'chat'));
app.post('/api/search', (req, res) => handleChatStreaming(req, res, 'search'));
app.post('/api/code', (req, res) => handleChatStreaming(req, res, 'code'));

export { app };

const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('server/index.ts') || process.argv[1].endsWith('server/index.js'));

if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`⚡ Cypher AI Server listening on http://localhost:${PORT}`);
    console.log(`🛡️ Rate limiting: 50 messages/day/user`);
    console.log(`🤖 Active Free Models:`);
    console.log(`   - Chat:      ${VALIDATED_MODELS.chat}`);
    console.log(`   - Reasoning: ${VALIDATED_MODELS.reasoning}`);
    console.log(`   - Search:    ${VALIDATED_MODELS.search}`);
    console.log(`   - Code:      ${VALIDATED_MODELS.code}`);
  });
}
