import React, { useState } from 'react';
import { Copy, Check, Play, Terminal } from 'lucide-react';

interface MarkdownProps {
  content: string;
  onPreviewCode?: (code: string, language: string) => void;
  onCitationClick?: (index: number) => void;
}

export const MarkdownRenderer: React.FC<MarkdownProps> = ({
  content,
  onPreviewCode,
  onCitationClick,
}) => {
  // Split content by code blocks ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-slate-200 text-[15px]">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // It's a code block
          const firstLineEnd = part.indexOf('\n');
          let lang = 'code';
          let codeBody = '';

          if (firstLineEnd !== -1) {
            lang = part.slice(3, firstLineEnd).trim().toLowerCase() || 'code';
            codeBody = part.slice(firstLineEnd + 1, -3);
          } else {
            codeBody = part.slice(3, -3);
          }

          return (
            <CodeBlock
              key={index}
              code={codeBody}
              language={lang}
              onPreview={onPreviewCode}
            />
          );
        }

        // Regular markdown text
        return (
          <TextBlock
            key={index}
            text={part}
            onCitationClick={onCitationClick}
          />
        );
      })}
    </div>
  );
};

const CodeBlock: React.FC<{
  code: string;
  language: string;
  onPreview?: (code: string, language: string) => void;
}> = ({ code, language, onPreview }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPreviewable = ['html', 'js', 'javascript', 'jsx', 'tsx', 'css'].includes(language);

  return (
    <div className="my-3.5 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-xl group">
      {/* Code Header with Mac-style dots */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-xs text-zinc-400 font-mono select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
          </div>
          <span className="text-[11px] uppercase font-semibold tracking-wider text-zinc-300">
            {language || 'code'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isPreviewable && onPreview && (
            <button
              onClick={() => onPreview(code, language)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all text-[11px] font-sans font-medium active:scale-95 cursor-pointer"
              title="Exécuter et voir l'aperçu"
            >
              <Play size={12} className="fill-current" />
              <span>Tester en direct</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white transition-all text-[11px] font-sans font-medium active:scale-95 cursor-pointer"
            title="Copier le code"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copié !</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <pre className="p-4 overflow-x-auto text-[13.5px] font-mono leading-relaxed text-zinc-200 selection:bg-cyan-500/30 selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const TextBlock: React.FC<{
  text: string;
  onCitationClick?: (index: number) => void;
}> = ({ text, onCitationClick }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-base font-bold text-cyan-300 pt-2 pb-1">
              {renderInlineStyles(trimmed.slice(4), onCitationClick)}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-lg font-bold text-white pt-3 pb-1 border-b border-slate-800">
              {renderInlineStyles(trimmed.slice(3), onCitationClick)}
            </h2>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-xl font-extrabold text-white pt-3 pb-1">
              {renderInlineStyles(trimmed.slice(2), onCitationClick)}
            </h1>
          );
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-4 border-cyan-500/50 pl-3 py-1 my-1 italic text-slate-300 bg-slate-800/20 rounded-r">
              {renderInlineStyles(trimmed.slice(2), onCitationClick)}
            </blockquote>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <span>{renderInlineStyles(trimmed.slice(2), onCitationClick)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 my-1">
              <span className="text-cyan-400 font-mono text-xs font-bold pt-0.5 shrink-0">
                {numMatch[1]}.
              </span>
              <span>{renderInlineStyles(numMatch[2], onCitationClick)}</span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="my-1">
            {renderInlineStyles(line, onCitationClick)}
          </p>
        );
      })}
    </div>
  );
};

function renderInlineStyles(
  text: string,
  onCitationClick?: (index: number) => void
): React.ReactNode {
  // Regex parsing for bold, code, links, and citations [1]
  const tokenRegex = /(\*\*.*?\*\*|`.*?`|\[\d+\]|\[.*?\]\(.*?\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Bold **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline code `code`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 font-mono text-xs text-cyan-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Citation reference [1], [2], etc.
    const citationMatch = part.match(/^\[(\d+)\]$/);
    if (citationMatch) {
      const citeNum = parseInt(citationMatch[1], 10);
      return (
        <button
          key={i}
          onClick={() => onCitationClick && onCitationClick(citeNum - 1)}
          className="inline-flex items-center justify-center px-1.5 py-0.2 mx-0.5 text-[11px] font-bold font-mono text-cyan-300 bg-cyan-950/80 hover:bg-cyan-800/50 border border-cyan-500/30 rounded cursor-pointer transition-colors align-super"
          title={`Voir la source [${citeNum}]`}
        >
          {citeNum}
        </button>
      );
    }

    // Link [text](url) - Sanitized against javascript: XSS
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const rawUrl = linkMatch[2].trim();
      const isSafe = /^https?:\/\//i.test(rawUrl) || /^mailto:/i.test(rawUrl) || rawUrl.startsWith('#');
      if (!isSafe) {
        return (
          <span key={i} className="text-slate-300 font-medium">
            {linkMatch[1]}
          </span>
        );
      }
      return (
        <a
          key={i}
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}
