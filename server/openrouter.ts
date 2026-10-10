/**
 * OpenRouter client integration for Cypher AI
 * Strictly uses real validated free models discovered from OpenRouter API
 */

export interface MessagePayload {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const VALIDATED_MODELS = {
  chat: 'nvidia/nemotron-3-ultra-550b-a55b:free',
  search: 'nvidia/nemotron-3.5-lightning:free',
  code: 'cohere/north-mini-code:free',
  reasoning: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  ultra: 'nvidia/nemotron-3-ultra-550b-a55b:free',
  super: 'nvidia/nemotron-3-super-120b-a12b:free',
  fallback: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
};

export const AVAILABLE_FREE_MODELS = [
  {
    id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    name: 'Nemotron 3 Nano Omni (30B)',
    provider: 'NVIDIA',
    mode: 'chat',
    description: 'Raisonnement pas-à-pas avec réflexion interne visible, ultra-rapide et stable.',
    contextTokens: '256k',
    isFree: true,
  },
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'Nemotron 3.5 Lightning',
    provider: 'NVIDIA',
    mode: 'search',
    description: 'Ultra-rapide avec fenêtre de 1M tokens, idéal pour la recherche et synthèses en temps réel.',
    contextTokens: '1M',
    isFree: true,
  },
  {
    id: 'cohere/north-mini-code:free',
    name: 'Cohere North Mini Code',
    provider: 'Cohere',
    mode: 'code',
    description: 'Spécialisé en architecture logicielle, algorithmes, débogage et refactoring.',
    contextTokens: '256k',
    isFree: true,
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    name: 'Nemotron 3 Ultra (550B)',
    provider: 'NVIDIA',
    mode: 'chat',
    description: 'Puissance maximale 550 milliards de paramètres pour synthèses complexes et stratégie.',
    contextTokens: '1M',
    isFree: true,
  },
  {
    id: 'nvidia/nemotron-3-super-120b-a12b:free',
    name: 'Nemotron 3 Super (120B)',
    provider: 'NVIDIA',
    mode: 'chat',
    description: 'Grand modèle équilibré pour analyse approfondie et écriture soignée.',
    contextTokens: '262k',
    isFree: true,
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Google Gemma 4 (31B)',
    provider: 'Google',
    mode: 'chat',
    description: 'Modèle instruction de pointe de Google DeepMind pour dialogue et vulgarisation.',
    contextTokens: '262k',
    isFree: true,
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Google Gemma 4 A4B (26B)',
    provider: 'Google',
    mode: 'chat',
    description: 'Architecture Mixture-of-Experts compacte et réactive pour tâches générales.',
    contextTokens: '262k',
    isFree: true,
  },
  {
    id: 'dots-studio/dots-3-note-preview:free',
    name: 'Dots3 Note Preview',
    provider: 'Dots Studio',
    mode: 'search',
    description: 'Modèle orienté prise de notes, analyse de documents volumineux et résumés structurés.',
    contextTokens: '512k',
    isFree: true,
  },
  {
    id: 'apodex/apodex-1.1-mini:free',
    name: 'Apodex 1.1 Mini',
    provider: 'Apodex',
    mode: 'chat',
    description: 'Modèle compact, extrêmement vif pour réponses concises et directes.',
    contextTokens: '262k',
    isFree: true,
  },
  {
    id: 'liquid/lfm-2.5-2.6b:free',
    name: 'Liquid LFM 2.5',
    provider: 'Liquid AI',
    mode: 'chat',
    description: 'Réseau neuronal fluide (Liquid Foundation Model) à faible latence.',
    contextTokens: '65k',
    isFree: true,
  },
  {
    id: 'poolside/laguna-s-2.1:free',
    name: 'Poolside Laguna S 2.1',
    provider: 'Poolside',
    mode: 'code',
    description: 'Conçu spécifiquement pour le développement logiciel et l\'ingénierie de code.',
    contextTokens: '262k',
    isFree: true,
  },
  {
    id: 'poolside/laguna-xs-2.1:free',
    name: 'Poolside Laguna XS 2.1',
    provider: 'Poolside',
    mode: 'code',
    description: 'Version allégée de Poolside pour autocomplétion rapide et scripts.',
    contextTokens: '262k',
    isFree: true,
  },
  {
    id: 'thinkingmachines/inkling:free',
    name: 'Thinking Machines Inkling',
    provider: 'Thinking Machines',
    mode: 'chat',
    description: 'Modèle avec fenêtre d\'un million de tokens pour exploration créative et contextes géants.',
    contextTokens: '1M',
    isFree: true,
  },
  {
    id: 'thinkingmachines/inkling-small:free',
    name: 'Inkling Small',
    provider: 'Thinking Machines',
    mode: 'chat',
    description: 'Version légère et agile pour réponses instantanées avec long contexte.',
    contextTokens: '1M',
    isFree: true,
  },
];

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export async function createChatStream(
  messages: MessagePayload[],
  model: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<Response> {
  const payload = {
    model,
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 4096,
  };

  // Defensive 45s connection timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 45000);

  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      signal: combinedSignal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cypher-ai.local',
        'X-Title': 'Cypher AI',
      },
      body: JSON.stringify(payload),
    });

    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
