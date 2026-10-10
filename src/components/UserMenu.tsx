import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Trash2,
  Check,
} from 'lucide-react';
import { QuotaInfo, Theme } from '../types';
import { CypherLogo } from './CypherLogo';

interface UserMenuProps {
  quota: QuotaInfo | null;
  theme: Theme;
  onThemeToggle: () => void;
  onOpenSettings: () => void;
  onClearHistory: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  quota,
  theme,
  onThemeToggle,
  onOpenSettings,
  onClearHistory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleDocumentClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const remaining = quota ? quota.remaining : 50;
  const count = quota ? quota.count : 0;
  const limit = quota ? quota.limit : 50;
  const percentage = Math.min(100, Math.round((count / limit) * 100));

  return (
    <div className="relative w-full" ref={menuRef}>
      {/* Trigger Button - Always 'Cypher' as requested */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors text-left group cursor-pointer"
        aria-label="Menu du compte Cypher"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CypherLogo size={28} useImage={true} className="ring-1 ring-zinc-700/50" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              Cypher
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              Compte Cypher · {remaining} req
            </p>
          </div>
        </div>
        <div className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
          <Settings className="w-4 h-4" />
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md"
        >
          {/* Header profile info inside popover */}
          <div className="px-3.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 mb-1">
              <CypherLogo size={20} useImage={true} />
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Cypher
              </p>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Espace personnel & quotas journaliers
            </p>

            {/* Quota bar */}
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                <span>Consommation</span>
                <span className="font-mono text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  {count} / {limit}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left"
            >
              <Settings className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span>Paramètres</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onThemeToggle();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                ) : (
                  <Sun className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                )}
                <span>Thème d'affichage</span>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 capitalize">
                {theme === 'dark' ? 'Sombre' : 'Clair'}
              </span>
            </button>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800/80 my-1" />

          {/* Clear history option */}
          <div className="py-0.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onClearHistory();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Effacer l'historique</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
