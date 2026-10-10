import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Globe,
  Code2,
  Sparkles,
  X,
  Command,
} from 'lucide-react';
import { AppMode, QuotaInfo } from '../types';
import { ToolsMenu } from './ToolsMenu';

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  quota: QuotaInfo | null;
  hasMessages: boolean;
  onSelectSuggestion?: (text: string) => void;
}

const SLASH_COMMANDS = [
  { cmd: '/search', desc: 'Activer la recherche web en direct', mode: 'search' as AppMode },
  { cmd: '/code', desc: 'Activer le studio de code', mode: 'code' as AppMode },
  { cmd: '/chat', desc: 'Revenir en mode discussion', mode: 'chat' as AppMode },
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isStreaming,
  onStop,
  currentMode,
  onModeChange,
  quota,
}) => {
  const [input, setInput] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isQuotaExceeded = quota ? !quota.isAllowed : false;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Handle slash commands detection
  useEffect(() => {
    if (input.startsWith('/') && !input.includes(' ')) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming || isQuotaExceeded) return;

    const trimmed = input.trim();
    if (trimmed === '/search') {
      onModeChange('search');
      setInput('');
      return;
    }
    if (trimmed === '/code') {
      onModeChange('code');
      setInput('');
      return;
    }
    if (trimmed === '/chat') {
      onModeChange('chat');
      setInput('');
      return;
    }

    onSend(trimmed);
    setInput('');
    setShowSlashMenu(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setShowSlashMenu(false);
    }
  };

  const handleSelectSlash = (mode: AppMode) => {
    onModeChange(mode);
    setInput('');
    setShowSlashMenu(false);
    textareaRef.current?.focus();
  };

  const getPlaceholder = () => {
    if (isQuotaExceeded) {
      return 'Quota journalier atteint (50 requêtes). Rechargement à minuit UTC.';
    }
    switch (currentMode) {
      case 'search':
        return 'Poser une question avec recherche web en temps réel...';
      case 'code':
        return 'Décrire le composant, le script ou le problème de code...';
      default:
        return 'Message Cypher AI...';
    }
  };

  const canSubmit = input.trim().length > 0 && !isStreaming && !isQuotaExceeded;

  return (
    <div className="max-w-3xl mx-auto w-full px-3 sm:px-4 pb-3 sm:pb-4 pt-1 relative">
      {/* Slash command popover */}
      {showSlashMenu && (
        <div className="absolute bottom-full mb-2 left-4 right-4 sm:left-6 sm:right-6 max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 shadow-xl z-40 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[11px] font-semibold uppercase text-zinc-400 dark:text-zinc-500">
            Modes rapides
          </div>
          <div className="space-y-0.5">
            {SLASH_COMMANDS.filter((c) => c.cmd.includes(input.toLowerCase())).map((item) => (
              <button
                key={item.cmd}
                type="button"
                onClick={() => handleSelectSlash(item.mode)}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
                    {item.cmd}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">{item.desc}</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">↵</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Input Pill Container */}
      <div
        className={`relative rounded-[26px] bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 shadow-sm focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-all ${
          isQuotaExceeded ? 'opacity-70 border-red-300 dark:border-red-900/50' : ''
        }`}
      >
        {/* Active Mode Pill (if search or code) */}
        {currentMode !== 'chat' && (
          <div className="px-4 pt-3 pb-0 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
              {currentMode === 'search' ? (
                <>
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>Recherche Web activée</span>
                </>
              ) : (
                <>
                  <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Mode Code Studio</span>
                </>
              )}
              <button
                type="button"
                onClick={() => onModeChange('chat')}
                className="ml-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                title="Désactiver"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Text Input Area */}
        <div className="px-4 pt-3 pb-2 flex items-start gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={isQuotaExceeded}
            className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm leading-relaxed resize-none focus:outline-hidden max-h-44 disabled:opacity-50"
          />
        </div>

        {/* Bottom Bar: Plus Button (Tools) + Send Button */}
        <div className="px-3 pb-2.5 pt-0.5 flex items-center justify-between gap-2">
          {/* Left: Tools Popover Menu */}
          <div className="flex items-center gap-1">
            <ToolsMenu
              currentMode={currentMode}
              onSelectMode={onModeChange}
              disabled={isQuotaExceeded || isStreaming}
            />
          </div>

          {/* Right: Submit / Stop */}
          <div>
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center hover:opacity-90 transition-opacity"
                title="Arrêter la réponse"
                aria-label="Arrêter la réponse"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!canSubmit}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  canSubmit
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                }`}
                title="Envoyer"
                aria-label="Envoyer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Legal & Safety Disclaimer */}
      <div className="text-center mt-2">
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Cypher AI peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  );
};
