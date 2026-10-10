import React, { useState, useRef, useEffect } from 'react';
import {
  SquarePen,
  Settings,
  Sun,
  Moon,
  Sidebar as SidebarIcon,
  Code2,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AppMode, QuotaInfo, Theme } from '../types';
import { ModelSelector, ModelOption } from './ModelSelector';
import { CypherLogo } from './CypherLogo';

interface HeaderProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  selectedModelId?: string;
  onModelSelect: (model: ModelOption) => void;
  quota: QuotaInfo | null;
  theme: Theme;
  onThemeToggle: () => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isCodeStudioOpen?: boolean;
  onToggleCodeStudio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  selectedModelId,
  onModelSelect,
  quota,
  theme,
  onThemeToggle,
  onOpenSettings,
  onNewChat,
  onToggleSidebar,
  isSidebarOpen,
  isCodeStudioOpen,
  onToggleCodeStudio,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const remaining = quota ? quota.remaining : 50;
  const limit = quota ? quota.limit : 50;

  return (
    <header className="h-14 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 sticky top-0 transition-colors">
      {/* Left: Sidebar Toggle + Model Selector */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
          title={isSidebarOpen ? 'Fermer la barre latérale' : 'Ouvrir la barre latérale'}
          aria-label="Basculer la barre latérale"
        >
          <SidebarIcon className="w-5 h-5" />
        </button>

        {/* Minimal Model Selector Dropdown */}
        <ModelSelector
          currentMode={currentMode}
          selectedModelId={selectedModelId}
          onModelSelect={onModelSelect}
        />
      </div>

      {/* Right: Actions organized cleanly in menus */}
      <div className="flex items-center gap-2">
        {/* New Chat Button */}
        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          title="Nouvelle conversation (Ctrl+K)"
        >
          <SquarePen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nouveau chat</span>
        </button>

        {/* Unified Options & Account Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors cursor-pointer text-zinc-700 dark:text-zinc-300"
            title="Menu et options Cypher"
            aria-expanded={isMenuOpen}
          >
            <CypherLogo size={22} useImage={true} />
            <span className="text-xs font-semibold hidden md:inline">Cypher</span>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu Popover */}
          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
            >
              {/* Account & Quota header */}
              <div className="p-2.5 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CypherLogo size={20} useImage={true} />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Cypher AI
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {remaining} / {limit}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Quota gratuit réinitialisé chaque minuit UTC
                </p>
              </div>

              {/* Action Items */}
              <div className="space-y-0.5">
                {/* Code Studio Toggle */}
                {onToggleCodeStudio && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onToggleCodeStudio();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Code2 className="w-4 h-4 text-emerald-500" />
                      <span>Code Studio (Écran partagé)</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isCodeStudioOpen
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {isCodeStudioOpen ? 'Actif' : 'Masqué'}
                    </span>
                  </button>
                )}

                {/* Theme Toggle */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onThemeToggle();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                    <span>Mode d'affichage</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 capitalize">
                    {theme === 'dark' ? 'Sombre' : 'Clair'}
                  </span>
                </button>

                {/* Settings Modal */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onOpenSettings();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-zinc-400" />
                  <span>Paramètres et préférences</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
