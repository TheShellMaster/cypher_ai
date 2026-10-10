import React, { useState } from 'react';
import {
  Copy,
  Check,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Brain,
  Sparkles,
  FileText,
  Presentation,
  BarChart3,
  Code2,
  Download,
  Eye,
} from 'lucide-react';
import { Message, AppMode, ArtifactItem } from '../types';
import { MarkdownRenderer } from '../utils/markdown';
import { CypherLogo } from './CypherLogo';

interface ChatMessageProps {
  message: Message;
  onPreviewCode?: (code: string, language: string) => void;
  onOpenArtifact?: (artifact: ArtifactItem) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onPreviewCode,
  onOpenArtifact,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const [showThought, setShowThought] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="py-2.5 px-3 sm:px-6 flex justify-end">
        <div className="max-w-[85%] sm:max-w-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-3xl rounded-tr-md px-4 py-2.5 shadow-2xs border border-zinc-200/60 dark:border-zinc-700/60">
          <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap select-text">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  const isThinkingActive = message.isStreaming && (!message.content || message.content.length === 0) && !!message.thought;

  return (
    <div className="py-3 px-3 sm:px-6 transition-colors">
      <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4">
        {/* Assistant Avatar with official Mobius Logo */}
        <div className="shrink-0 mt-0.5">
          <div className="relative">
            <CypherLogo size={28} useImage={true} className="ring-1 ring-zinc-200 dark:ring-zinc-800" />
            {message.isStreaming && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header Metadata */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              Cypher AI
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.isStreaming && (
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>Génération en cours...</span>
              </span>
            )}
          </div>

          {/* Sources Section (Web Search) */}
          {message.sources && message.sources.length > 0 && (
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 space-y-2 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => setShowSources(!showSources)}
                className="w-full flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>Sources Web consultées ({message.sources.length})</span>
                </div>
                {showSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showSources && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {message.sources.map((source, index) => {
                    let domain = '';
                    try {
                      domain = new URL(source.url).hostname.replace('www.', '');
                    } catch {
                      domain = 'web';
                    }

                    return (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-750 transition-all flex flex-col justify-between group"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                            [{index + 1}] {source.title}
                          </span>
                          <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-blue-500 shrink-0 mt-0.5" />
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {source.snippet}
                        </p>
                        <div className="mt-1.5 text-[10px] text-zinc-400 font-mono">
                          {domain}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Dynamic Thinking / Reasoning Section with Animation */}
          {message.thought && message.thought.trim().length > 0 && (
            <div className={`rounded-xl border transition-all overflow-hidden ${
              isThinkingActive
                ? 'border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50'
            }`}>
              <button
                type="button"
                onClick={() => setShowThought(!showThought)}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md ${isThinkingActive ? 'bg-indigo-500/20 text-indigo-500 animate-pulse' : 'text-zinc-500'}`}>
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    {isThinkingActive ? 'Réflexion en cours...' : 'Raisonnement de l\'IA'}
                  </span>
                  {isThinkingActive && (
                    <span className="flex gap-1 ml-1">
                      <span className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>
                {showThought ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
              </button>

              {showThought && (
                <div className="p-3 text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800/80 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-mono">
                  {message.thought}
                  {isThinkingActive && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-indigo-500 animate-pulse align-middle" />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Main Markdown Content with streaming cursor animation */}
          {message.content && (
            <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed text-[15px]">
              <MarkdownRenderer
                content={message.content}
                onPreviewCode={onPreviewCode}
              />
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 rounded-xs bg-zinc-800 dark:bg-zinc-200 animate-pulse align-middle" />
              )}
            </div>
          )}

          {/* Generated Artifacts Cards */}
          {message.artifacts && message.artifacts.length > 0 && (
            <div className="space-y-2 pt-2 animate-in fade-in duration-200">
              {message.artifacts.map((artifact) => {
                const isPdf = artifact.type === 'pdf';
                const isPptx = artifact.type === 'pptx';
                const isPlot = artifact.type === 'plot';

                return (
                  <div
                    key={artifact.id}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 shadow-xs shrink-0">
                        {isPdf && <FileText className="w-5 h-5 text-rose-500" />}
                        {isPptx && <Presentation className="w-5 h-5 text-amber-500" />}
                        {isPlot && <BarChart3 className="w-5 h-5 text-emerald-500" />}
                        {!isPdf && !isPptx && !isPlot && <Code2 className="w-5 h-5 text-indigo-500" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {artifact.title}
                          </p>
                          <span className="px-1.5 py-0.5 text-[9px] uppercase font-semibold rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {artifact.type}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {isPdf && 'Document haute fidélité prêt à télécharger ou visualiser'}
                          {isPptx && 'Présentation PowerPoint (.pptx) prête à l\'emploi'}
                          {isPlot && 'Graphique vectoriel/haute résolution généré par Python'}
                          {!isPdf && !isPptx && !isPlot && 'Artefact de code source'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onOpenArtifact && (
                        <button
                          type="button"
                          onClick={() => onOpenArtifact(artifact)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300/80 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Aperçu</span>
                        </button>
                      )}
                      {artifact.url && (
                        <a
                          href={artifact.url}
                          download={artifact.title}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:opacity-90 text-white dark:text-zinc-900 transition-opacity shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Télécharger</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Actions Bar */}
          {!message.isStreaming && message.content && (
            <div className="flex items-center gap-1 pt-1 text-zinc-400">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                title="Copier"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
