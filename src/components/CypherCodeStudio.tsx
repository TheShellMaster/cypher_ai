import React, { useState, useEffect } from 'react';
import {
  Code2,
  Play,
  Copy,
  Check,
  RotateCw,
  Terminal,
  Eye,
  Maximize2,
  Minimize2,
  X,
  FileCode,
  Sparkles,
  Download,
} from 'lucide-react';

interface CypherCodeStudioProps {
  code: string;
  language: string;
  onCodeChange?: (newCode: string) => void;
  onClose: () => void;
}

export const CypherCodeStudio: React.FC<CypherCodeStudioProps> = ({
  code: initialCode,
  language: initialLanguage,
  onCodeChange,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'console'>('editor');
  const [code, setCode] = useState(initialCode || `// Cypher Code Studio
// Écrivez ou prévisualisez vos scripts et composants ici

function greet(name: string) {
  return \`Bonjour, \${name} ! Bienvenue sur Cypher Code Studio.\`;
}

console.log(greet('Développeur'));
`);
  const [language, setLanguage] = useState(initialLanguage || 'typescript');
  const [copied, setCopied] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      if (initialLanguage) setLanguage(initialLanguage);
    }
  }, [initialCode, initialLanguage]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setIsRunning(true);
    setConsoleLogs([]);
    setActiveTab('preview');
    setIframeKey((prev) => prev + 1);
    setTimeout(() => setIsRunning(false), 400);
  };

  const handleDownload = () => {
    const ext = language === 'python' ? 'py' : language === 'html' ? 'html' : language === 'javascript' ? 'js' : 'tsx';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cypher_code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate safe HTML bundle for live execution
  const getPreviewHtml = () => {
    const safeJs = code.replace(/<\/script/gi, '<\\/script');
    
    if (language === 'html') {
      return code;
    }

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 1.5rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #09090b;
      color: #fafafa;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="console-output" class="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed mt-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800"></div>
  
  <script>
    const outputEl = document.getElementById('console-output');
    const logs = [];
    const originalLog = console.log;
    
    console.log = (...args) => {
      originalLog(...args);
      const str = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
      logs.push(str);
      outputEl.innerText = logs.join('\\n');
    };

    console.error = (...args) => {
      const str = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
      outputEl.innerHTML += '<div style="color: #f87171;">⚠️ ' + str + '</div>';
    };

    try {
      ${safeJs}
    } catch (err) {
      console.error(err.message);
    }
  </script>
</body>
</html>`;
  };

  return (
    <div
      className={`h-full flex flex-col bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800 text-zinc-100 transition-all duration-200 relative ${
        isExpanded ? 'w-full' : 'w-full lg:w-[48%] xl:w-[50%]'
      }`}
    >
      {/* Studio Header Bar */}
      <div className="h-14 px-3 sm:px-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-100 tracking-tight">
                Cypher Code Studio
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-zinc-800 text-zinc-400 font-mono text-[10px] uppercase">
                {language}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono block -mt-0.5">
              Environnement interactif
            </span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'editor'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Aperçu</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'console'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Console</span>
          </button>
        </div>

        {/* Studio Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleRun}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-2xs"
            title="Exécuter"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Exécuter</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Copier le code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Télécharger le fichier"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors hidden lg:block"
            title={isExpanded ? 'Réduire' : 'Plein écran'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Fermer le studio de code"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'editor' && (
          <div className="w-full h-full flex flex-col">
            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (onCodeChange) onCodeChange(e.target.value);
              }}
              spellCheck={false}
              className="w-full h-full p-4 bg-zinc-950 text-zinc-100 font-mono text-xs sm:text-[13px] leading-relaxed resize-none focus:outline-hidden selection:bg-emerald-500/30 selection:text-emerald-200"
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="w-full h-full bg-zinc-900 flex flex-col">
            <div className="px-3 py-1.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>Bac à sable sécurisé (Sandbox)</span>
              <button
                type="button"
                onClick={() => setIframeKey((k) => k + 1)}
                className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
              >
                <RotateCw className="w-3 h-3" />
                <span>Recharger</span>
              </button>
            </div>
            <iframe
              key={iframeKey}
              srcDoc={getPreviewHtml()}
              sandbox="allow-scripts allow-modals"
              title="Cypher Code Preview"
              className="w-full h-full border-none bg-zinc-950"
            />
          </div>
        )}

        {activeTab === 'console' && (
          <div className="w-full h-full p-4 bg-zinc-950 font-mono text-xs overflow-y-auto space-y-1">
            <div className="text-zinc-500 pb-2 border-b border-zinc-900 flex items-center justify-between">
              <span>Sortie standard console</span>
              <button
                type="button"
                onClick={() => setConsoleLogs([])}
                className="text-[11px] text-zinc-500 hover:text-zinc-300"
              >
                Effacer
              </button>
            </div>
            {consoleLogs.length === 0 ? (
              <p className="text-zinc-600 italic py-4">
                Aucune sortie. Cliquez sur "Exécuter" pour lancer le script.
              </p>
            ) : (
              consoleLogs.map((log, index) => (
                <div key={index} className="text-zinc-300 leading-relaxed">
                  {log}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
