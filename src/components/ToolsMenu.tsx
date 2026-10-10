import React, { useState, useRef, useEffect } from 'react';
import { Plus, Globe, Code2, Check, Sparkles, FileText, Presentation } from 'lucide-react';
import { AppMode } from '../types';

interface ToolsMenuProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onQuickAction?: (prompt: string) => void;
  disabled?: boolean;
}

export const ToolsMenu: React.FC<ToolsMenuProps> = ({
  currentMode,
  onSelectMode,
  onQuickAction,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const modes = [
    {
      id: 'chat' as AppMode,
      name: 'Discussion standard',
      description: 'Réponses rapides et fluides pour tout sujet',
      icon: Sparkles,
      color: 'text-zinc-600 dark:text-zinc-400',
    },
    {
      id: 'search' as AppMode,
      name: 'Recherche Web en direct',
      description: 'Accède aux informations web actualisées et sourcées',
      icon: Globe,
      color: 'text-blue-500 dark:text-blue-400',
    },
    {
      id: 'code' as AppMode,
      name: 'Code Studio',
      description: 'Studio de développement, débogage et bac à sable',
      icon: Code2,
      color: 'text-emerald-500 dark:text-emerald-400',
    },
  ];

  const documentTools = [
    {
      id: 'pdf',
      name: 'Générer un PDF',
      description: 'Crée un rapport ou document haute fidélité téléchargeable',
      icon: FileText,
      color: 'text-rose-500 dark:text-rose-400',
      prompt: 'Génère un rapport structuré et complet au format PDF sur le sujet suivant : ',
    },
    {
      id: 'pptx',
      name: 'Créer un PowerPoint',
      description: 'Conçoit une présentation professionnelle (.pptx)',
      icon: Presentation,
      color: 'text-amber-500 dark:text-amber-400',
      prompt: 'Génère une présentation PowerPoint (.pptx) moderne et percutante de 5 diapositives sur : ',
    },
  ];

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Plus button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-colors disabled:opacity-40"
        title="Outils et modes"
        aria-label="Outils et modes"
        aria-expanded={isOpen}
      >
        <Plus className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          role="menu"
          className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        >
          {/* Modes Section */}
          <div className="px-2 py-1 mb-1">
            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Modes d'intelligence
            </p>
          </div>

          <div className="space-y-0.5 mb-2">
            {modes.map((tool) => {
              const Icon = tool.icon;
              const isSelected = currentMode === tool.id;

              return (
                <button
                  key={tool.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onSelectMode(tool.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${tool.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold leading-tight">
                        {tool.name}
                      </p>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {tool.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Document Tools Section */}
          <div className="px-2 py-1 mb-1 border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Générateurs de Documents
            </p>
          </div>

          <div className="space-y-0.5">
            {documentTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <button
                  key={tool.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    if (onQuickAction) {
                      onQuickAction(tool.prompt);
                    }
                    setIsOpen(false);
                  }}
                  className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${tool.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-tight">
                      {tool.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {tool.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
