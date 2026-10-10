import React, { useState } from 'react';
import {
  X,
  Settings,
  Cpu,
  Zap,
  ShieldCheck,
  Moon,
  Sun,
  Trash2,
  Check,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { QuotaInfo, Theme, AppMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  quota: QuotaInfo | null;
  onClearAllConversations: () => void;
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

type TabType = 'general' | 'models' | 'quota' | 'security';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  quota,
  onClearAllConversations,
  currentMode,
  onModeChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const remaining = quota ? quota.remaining : 50;
  const limit = quota ? quota.limit : 50;
  const count = quota ? quota.count : 0;
  const percentUsed = Math.min(100, Math.round((count / limit) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl h-[560px] max-h-[90vh] rounded-2xl bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col md:flex-row overflow-hidden text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Tabs Column */}
        <div className="w-full md:w-52 bg-zinc-50 dark:bg-[#181818] p-3 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 shrink-0 flex md:flex-col justify-between">
          <div className="space-y-1 w-full flex md:flex-col overflow-x-auto">
            <div className="hidden md:block px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Paramètres
            </div>

            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full transition-colors ${
                activeTab === 'general'
                  ? 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <Settings size={15} />
              <span>Général</span>
            </button>

            <button
              onClick={() => setActiveTab('models')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full transition-colors ${
                activeTab === 'models'
                  ? 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <Cpu size={15} />
              <span>Modèles IA</span>
            </button>

            <button
              onClick={() => setActiveTab('quota')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full transition-colors ${
                activeTab === 'quota'
                  ? 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <Zap size={15} />
              <span>Quotas & Accès</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full transition-colors ${
                activeTab === 'security'
                  ? 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
              }`}
            >
              <ShieldCheck size={15} />
              <span>Confidentialité</span>
            </button>
          </div>

          <div className="hidden md:block px-3 py-2 text-[11px] text-zinc-400">
            Cypher AI v1.0.0
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1e1e1e]">
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              {activeTab === 'general' && 'Paramètres généraux'}
              {activeTab === 'models' && 'Catalogue & Modèles connectés'}
              {activeTab === 'quota' && 'Consommation & Limites'}
              {activeTab === 'security' && 'Sécurité & Données locales'}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={17} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex-1 overflow-y-auto space-y-6 text-sm">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Theme Selector */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="font-medium">Apparence</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Personnalisez l'affichage de l'interface
                    </div>
                  </div>
                  <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <button
                      onClick={() => onThemeChange('light')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        theme === 'light'
                          ? 'bg-white text-zinc-900 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <Sun size={14} />
                      <span>Clair</span>
                    </button>
                    <button
                      onClick={() => onThemeChange('dark')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        theme === 'dark'
                          ? 'bg-zinc-900 text-white dark:bg-zinc-700 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <Moon size={14} />
                      <span>Sombre</span>
                    </button>
                  </div>
                </div>

                <hr className="border-zinc-100 dark:border-zinc-800" />

                {/* Language */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="font-medium">Langue de l'interface</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Langue utilisée pour les menus et réponses
                    </div>
                  </div>
                  <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    Français (Automatique)
                  </div>
                </div>

                <hr className="border-zinc-100 dark:border-zinc-800" />

                {/* Clear all history */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="font-medium text-red-600 dark:text-red-400">
                      Supprimer toutes les discussions
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Efface l'historique enregistré sur cet appareil
                    </div>
                  </div>
                  {confirmClear ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClearAllConversations();
                          setConfirmClear(false);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-xs font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClear(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>Tout effacer</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* MODELS TAB */}
            {activeTab === 'models' && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Cypher AI se connecte à des modèles ouverts gratuits hébergés via OpenRouter, rigoureusement vérifiés par test HTTP direct.
                </p>

                <div className="space-y-2.5">
                  <div
                    onClick={() => onModeChange('chat')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      currentMode === 'chat'
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-xs flex items-center gap-2">
                        <span>Cypher Core</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono">
                          nemotron-3-ultra:free
                        </span>
                      </div>
                      {currentMode === 'chat' && <Check size={15} className="text-zinc-900 dark:text-white" />}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      550 milliards de paramètres. Idéal pour la conversation générale, les analyses complexes et la synthèse.
                    </div>
                  </div>

                  <div
                    onClick={() => onModeChange('search')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      currentMode === 'search'
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-xs flex items-center gap-2">
                        <span>Cypher Fast Search</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono">
                          nemotron-3.5-lightning:free
                        </span>
                      </div>
                      {currentMode === 'search' && <Check size={15} className="text-zinc-900 dark:text-white" />}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Modèle ultra-rapide optimisé pour l'interrogation du web en temps réel et la citation de sources fiables.
                    </div>
                  </div>

                  <div
                    onClick={() => onModeChange('code')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      currentMode === 'code'
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-xs flex items-center gap-2">
                        <span>Cypher Code Studio</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono">
                          north-mini-code:free
                        </span>
                      </div>
                      {currentMode === 'code' && <Check size={15} className="text-zinc-900 dark:text-white" />}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Spécialisé en génération de code, débogage et bac à sable interactif.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QUOTA TAB */}
            {activeTab === 'quota' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs">Utilisation quotidienne</span>
                    <span className="font-mono text-xs font-semibold">
                      {count} / {limit} messages
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all duration-300"
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{remaining} requêtes restantes</span>
                    <span>Recharge chaque jour à minuit UTC</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-white">•</span>
                    <span><strong>Accès 100% libre</strong> : Pas de carte bancaire, pas d'inscription obligatoire.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-white">•</span>
                    <span><strong>Équité de service</strong> : Limite standard fixée à 50 requêtes/jour pour garantir la disponibilité pour tous.</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck size={16} />
                    <span>Garde-fous de Sécurité Actifs</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Les filtres anti-injections analysent en temps réel les prompts en français et en anglais pour neutraliser toute tentative de jailbreak ou d'évasion de rôle (normes OWASP LLM 2025).
                  </p>
                </div>

                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <p>
                    <strong>Confidentialité des données</strong> : Vos discussions restent enregistrées localement dans votre navigateur (localStorage). Aucune donnée n'est revendue à des tiers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
