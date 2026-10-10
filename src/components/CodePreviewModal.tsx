import React, { useState } from 'react';
import { X, Play, RefreshCw, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface CodePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
}

export const CodePreviewModal: React.FC<CodePreviewModalProps> = ({
  isOpen,
  onClose,
  code,
  language,
}) => {
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build iframe document
  const getDocumentSrcDoc = () => {
    if (language === 'html') {
      return code;
    }
    // Escape closing script tags to avoid breaking out of the inline script
    const safeJsCode = code.replace(/<\/script/gi, '<\\/script');

    // If JS or React or CSS
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { margin: 0; padding: 1.5rem; font-family: system-ui, -apple-system, sans-serif; background: #09090b; color: #f4f4f5; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <div id="output" style="white-space: pre-wrap; font-family: monospace; font-size: 13px; line-height: 1.6;"></div>
    <script>
      const output = document.getElementById('output');
      const originalLog = console.log;
      console.log = (...args) => {
        originalLog(...args);
        output.innerText += args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' ') + '\\n';
      };
      try {
        ${safeJsCode}
      } catch (err) {
        document.body.innerHTML += '<div style="color: #f87171; background: #450a0a; padding: 12px; border-radius: 12px; margin-top: 12px; font-family: monospace; font-size: 13px;">❌ Erreur d\\'exécution : ' + err.message + '</div>';
      }
    </script>
  </body>
</html>`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[85vh] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-zinc-700/80" />
              <span className="w-3 h-3 rounded-full bg-zinc-700/80" />
              <span className="w-3 h-3 rounded-full bg-zinc-700/80" />
            </div>
            <div className="h-4 w-px bg-zinc-800 mx-1" />
            <div>
              <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                <span>Bac à Sable Interactif</span>
                <span className="uppercase text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-emerald-400 font-mono font-semibold border border-zinc-700">
                  {language}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setKey((k) => k + 1)}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Recharger l'aperçu"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Content Body: Sandbox Iframe */}
        <div className="flex-1 bg-zinc-950 relative overflow-hidden">
          <iframe
            key={key}
            srcDoc={getDocumentSrcDoc()}
            title="Cypher Code Preview"
            sandbox="allow-scripts allow-modals"
            className="w-full h-full border-0 bg-[#09090b]"
          />
        </div>
      </div>
    </div>
  );
};
