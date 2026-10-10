import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Presentation,
  BarChart3,
  Code2,
  Globe,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { ArtifactItem } from '../types';

interface CypherArtifactsPanelProps {
  artifact: ArtifactItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInStudio?: (code: string, language: string) => void;
}

export const CypherArtifactsPanel: React.FC<CypherArtifactsPanelProps> = ({
  artifact,
  isOpen,
  onClose,
  onOpenInStudio,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !artifact) return null;

  const handleCopy = () => {
    if (artifact.content) {
      navigator.clipboard.writeText(artifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const getIcon = () => {
    switch (artifact.type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'pptx':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case 'plot':
        return <BarChart3 className="w-5 h-5 text-emerald-500" />;
      case 'code':
        return <Code2 className="w-5 h-5 text-indigo-500" />;
      case 'web':
        return <Globe className="w-5 h-5 text-blue-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
  };

  const getBadge = () => {
    switch (artifact.type) {
      case 'pdf':
        return 'Document PDF';
      case 'pptx':
        return 'PowerPoint Deck';
      case 'plot':
        return 'Graphique Python';
      case 'code':
        return artifact.language || 'Code source';
      case 'web':
        return 'Aperçu Web';
      default:
        return 'Artefact';
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800/80 shadow-2xl z-40 flex flex-col transition-all duration-300 ${
        isFullscreen ? 'w-full' : 'w-full md:w-[600px] lg:w-[700px]'
      }`}
    >
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {artifact.title}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {getBadge()}
              </span>
            </div>
            {artifact.sizeBytes && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Taille : {formatBytes(artifact.sizeBytes)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {artifact.url && (
            <a
              href={artifact.url}
              download={artifact.title}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              title="Télécharger le fichier"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger</span>
            </a>
          )}

          {artifact.type === 'code' && (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Copier le code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              {onOpenInStudio && artifact.content && (
                <button
                  type="button"
                  onClick={() => onOpenInStudio(artifact.content!, artifact.language || 'typescript')}
                  className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Ouvrir Studio
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors hidden sm:inline-flex"
            title={isFullscreen ? 'Réduire' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-zinc-100/50 dark:bg-zinc-950/60 p-4">
        {/* PDF VIEW */}
        {artifact.type === 'pdf' && (
          <div className="h-full flex flex-col rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            {artifact.url ? (
              <iframe
                src={`${artifact.url}#view=FitH`}
                title={artifact.title}
                className="w-full h-full border-none"
              />
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <FileText className="w-12 h-12 text-rose-500 mb-3" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Document PDF généré avec succès
                </p>
              </div>
            )}
          </div>
        )}

        {/* PPTX VIEW */}
        {artifact.type === 'pptx' && (
          <div className="h-full flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center mb-4">
              <Presentation className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              {artifact.title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
              Présentation professionnelle PowerPoint générée au format standard OpenXML (.pptx).
              Compatible avec Microsoft PowerPoint, Google Slides, Keynote et LibreOffice.
            </p>

            {artifact.url && (
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={artifact.url}
                  download={artifact.title}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-md shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  Télécharger le fichier .pptx
                </a>
              </div>
            )}
          </div>
        )}

        {/* PLOT / IMAGE VIEW */}
        {artifact.type === 'plot' && (
          <div className="h-full flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            {artifact.url ? (
              <div className="relative max-h-full max-w-full flex items-center justify-center p-2">
                <img
                  src={artifact.url}
                  alt={artifact.title}
                  className="rounded-lg max-h-[75vh] w-auto object-contain shadow-sm border border-zinc-200/60 dark:border-zinc-800"
                />
              </div>
            ) : (
              <div className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Graphique généré
                </p>
              </div>
            )}
          </div>
        )}

        {/* CODE VIEW */}
        {artifact.type === 'code' && (
          <div className="h-full flex flex-col bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden font-mono text-xs shadow-sm">
            <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-zinc-400">
              <span>{artifact.language || 'code'}</span>
              <span>{artifact.content?.split('\n').length || 0} lignes</span>
            </div>
            <pre className="p-4 overflow-auto text-zinc-200 flex-1 leading-relaxed whitespace-pre font-mono">
              <code>{artifact.content}</code>
            </pre>
          </div>
        )}

        {/* WEB PREVIEW */}
        {artifact.type === 'web' && (
          <div className="h-full flex flex-col rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white shadow-sm">
            <iframe
              srcDoc={artifact.content}
              title={artifact.title}
              sandbox="allow-scripts allow-modals"
              className="w-full h-full border-none bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
