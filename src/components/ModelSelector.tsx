import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  Check,
  Search,
  MessageSquare,
  Globe,
  Code2,
  Brain,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AppMode } from '../types';

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  mode: AppMode;
  desc: string;
  context: string;
  icon: any;
  isFree: boolean;
}

export const FREE_MODELS_CATALOG: ModelOption[] = [
  {
    id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    name: 'Nemotron 30B Reasoning',
    provider: 'NVIDIA',
    mode: 'chat',
    desc: 'Raisonnement pas-à-pas avec réflexion interne visible, ultra-rapide et fiable.',
    context: '256k',
    icon: Brain,
    isFree: true,
  },
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'Nemotron 3.5 Lightning',
    provider: 'NVIDIA',
    mode: 'search',
    desc: 'Contexte massif de 1M tokens, idéal pour la recherche web en direct et les synthèses.',
    context: '1M',
    icon: Globe,
    isFree: true,
  },
  {
    id: 'cohere/north-mini-code:free',
    name: 'Cohere North Mini Code',
    provider: 'Cohere',
    mode: 'code',
    desc: 'Modèle expert pour le développement, l’architecture logicielle et les algorithmes.',
    context: '256k',
    icon: Code2,
    isFree: true,
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    name: 'Nemotron 3 Ultra (550B)',
    provider: 'NVIDIA',
    mode: 'chat',
    desc: 'Puissance maximale de 550 milliards de paramètres pour analyses approfondies.',
    context: '1M',
    icon: MessageSquare,
    isFree: true,
  },
  {
    id: 'nvidia/nemotron-3-super-120b-a12b:free',
    name: 'Nemotron 3 Super (120B)',
    provider: 'NVIDIA',
    mode: 'chat',
    desc: 'Grand modèle polyvalent d’analyse complexe, de logique et de créativité.',
    context: '262k',
    icon: Sparkles,
    isFree: true,
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Google Gemma 4 (31B)',
    provider: 'Google',
    mode: 'chat',
    desc: 'Modèle instruction de pointe Google DeepMind pour dialogue et vulgarisation.',
    context: '262k',
    icon: Sparkles,
    isFree: true,
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Google Gemma 4 A4B (26B)',
    provider: 'Google',
    mode: 'chat',
    desc: 'Architecture Mixture-of-Experts compacte et réactive pour tâches polyvalentes.',
    context: '262k',
    icon: Zap,
    isFree: true,
  },
  {
    id: 'dots-studio/dots-3-note-preview:free',
    name: 'Dots3 Note Preview',
    provider: 'Dots Studio',
    mode: 'search',
    desc: 'Orienté prise de notes, résumés de documents volumineux et synthèse.',
    context: '512k',
    icon: Globe,
    isFree: true,
  },
  {
    id: 'apodex/apodex-1.1-mini:free',
    name: 'Apodex 1.1 Mini',
    provider: 'Apodex',
    mode: 'chat',
    desc: 'Modèle compact, extrêmement vif pour réponses concises et directes.',
    context: '262k',
    icon: Zap,
    isFree: true,
  },
  {
    id: 'liquid/lfm-2.5-2.6b:free',
    name: 'Liquid LFM 2.5',
    provider: 'Liquid AI',
    mode: 'chat',
    desc: 'Réseau neuronal fluide (Liquid Foundation Model) à latence ultra-faible.',
    context: '65k',
    icon: Zap,
    isFree: true,
  },
  {
    id: 'poolside/laguna-s-2.1:free',
    name: 'Poolside Laguna S 2.1',
    provider: 'Poolside',
    mode: 'code',
    desc: 'Conçu spécifiquement pour l’ingénierie logicielle et le refactoring.',
    context: '262k',
    icon: Code2,
    isFree: true,
  },
  {
    id: 'poolside/laguna-xs-2.1:free',
    name: 'Poolside Laguna XS 2.1',
    provider: 'Poolside',
    mode: 'code',
    desc: 'Version allégée de Poolside pour scripts rapides et autocomplétion.',
    context: '262k',
    icon: Code2,
    isFree: true,
  },
  {
    id: 'thinkingmachines/inkling:free',
    name: 'Thinking Machines Inkling',
    provider: 'Thinking Machines',
    mode: 'chat',
    desc: 'Modèle créatif avec fenêtre de 1M tokens pour exploration étendue.',
    context: '1M',
    icon: MessageSquare,
    isFree: true,
  },
  {
    id: 'thinkingmachines/inkling-small:free',
    name: 'Inkling Small',
    provider: 'Thinking Machines',
    mode: 'chat',
    desc: 'Version légère et agile pour réponses instantanées avec long contexte.',
    context: '1M',
    icon: Zap,
    isFree: true,
  },
];

interface ModelSelectorProps {
  currentMode: AppMode;
  selectedModelId?: string;
  onModelSelect: (model: ModelOption) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentMode,
  selectedModelId,
  onModelSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeModel =
    FREE_MODELS_CATALOG.find((m) => m.id === selectedModelId) ||
    FREE_MODELS_CATALOG.find((m) => m.mode === currentMode) ||
    FREE_MODELS_CATALOG[0];

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleDocumentClick);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredModels = useMemo(() => {
    return FREE_MODELS_CATALOG.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMode =
        filterMode === 'all' || m.mode === filterMode;

      return matchesSearch && matchesMode;
    });
  }, [searchQuery, filterMode]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-900 dark:text-zinc-100 font-semibold text-xs sm:text-sm transition-colors cursor-pointer group select-none border border-zinc-200/60 dark:border-zinc-800"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="truncate max-w-[130px] sm:max-w-[180px]">{activeModel.name}</span>
        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md hidden sm:inline">
          {activeModel.context}
        </span>
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
          Gratuit
        </span>
        <ChevronDown
          size={13}
          className={`text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-full mt-2 left-0 w-80 sm:w-[420px] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100 text-zinc-900 dark:text-zinc-100 backdrop-blur-md"
        >
          {/* Header */}
          <div className="px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Catalogue IA ({FREE_MODELS_CATALOG.length} modèles disponibles)
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              100% Gratuit
            </span>
          </div>

          {/* Search Box */}
          <div className="px-1.5 py-1">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs">
              <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, fournisseur (NVIDIA, Google, Cohere...)"
                className="w-full bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 px-1.5 py-1 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'chat', label: 'Discussion' },
              { id: 'code', label: 'Code' },
              { id: 'search', label: 'Recherche' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterMode(f.id)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                  filterMode === f.id
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Model list */}
          <div className="space-y-1 py-1 max-h-80 overflow-y-auto">
            {filteredModels.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400">
                Aucun modèle ne correspond à votre recherche.
              </div>
            ) : (
              filteredModels.map((model) => {
                const isSelected = model.id === activeModel.id;
                const ModelIcon = model.icon;

                return (
                  <button
                    key={model.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onModelSelect(model);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-start justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-100 dark:bg-zinc-800/90 font-medium'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                      <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5">
                        <ModelIcon size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-zinc-900 dark:text-white truncate">
                            {model.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                            · {model.provider}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono shrink-0 ml-auto sm:ml-0">
                            ({model.context})
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed line-clamp-1">
                          {model.desc}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-blue-500 dark:text-blue-400 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
