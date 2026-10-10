import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  SquarePen,
  Search,
  X,
  MessageSquare,
  Globe,
  Code2,
  MoreHorizontal,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import { Conversation, AppMode, QuotaInfo, Theme } from '../types';
import { CypherLogo } from './CypherLogo';
import { UserMenu } from './UserMenu';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  quota: QuotaInfo | null;
  theme: Theme;
  onThemeToggle: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onRename,
  onClearAll,
  isOpen,
  onClose,
  onNewChat,
  quota,
  theme,
  onThemeToggle,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // Close conversation action menu on outside click or Escape
  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveMenuId(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
        setEditingId(null);
      }
    };

    if (activeMenuId) {
      document.addEventListener('click', handleDocumentClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenuId]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Group conversations chronologically (Aujourd'hui, Hier, 7 derniers jours, etc.)
  const groupedConversations = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const last7Days = today - 7 * 86400000;
    const last30Days = today - 30 * 86400000;

    const groups: { [key: string]: Conversation[] } = {
      "Aujourd'hui": [],
      'Hier': [],
      '7 derniers jours': [],
      '30 derniers jours': [],
      'Plus ancien': [],
    };

    filteredConversations.forEach((conv) => {
      const convTime = conv.updatedAt || conv.createdAt || 0;
      if (convTime >= today) {
        groups["Aujourd'hui"].push(conv);
      } else if (convTime >= yesterday) {
        groups['Hier'].push(conv);
      } else if (convTime >= last7Days) {
        groups['7 derniers jours'].push(conv);
      } else if (convTime >= last30Days) {
        groups['30 derniers jours'].push(conv);
      } else {
        groups['Plus ancien'].push(conv);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [filteredConversations]);

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim() && onRename) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const getModeIcon = (mode: AppMode) => {
    switch (mode) {
      case 'search':
        return <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'code':
        return <Code2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-zinc-400 shrink-0" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        ref={sidebarRef}
        className={`fixed lg:static top-0 bottom-0 left-0 w-64 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col z-50 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header with App Logo and Close/Collapse */}
        <div className="h-14 px-3 flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-2.5 px-1 select-none">
            <CypherLogo size={24} useImage={true} />
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              Cypher AI
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 lg:hidden cursor-pointer"
            aria-label="Fermer la barre latérale"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Action */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium transition-colors shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CypherLogo size={16} useImage={true} />
              <span>Nouvelle discussion</span>
            </div>
            <SquarePen className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200" />
          </button>
        </div>

        {/* Search input if multiple conversations */}
        {conversations.length > 2 && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-900/60 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden transition-colors"
              />
            </div>
          </div>
        )}

        {/* Chronological List of Conversations */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-400">
              Aucune conversation trouvée
            </div>
          ) : (
            groupedConversations.map(([groupName, convs]) => (
              <div key={groupName} className="space-y-0.5">
                <div className="px-2.5 py-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  {groupName}
                </div>

                {convs.map((conv) => {
                  const isActive = conv.id === activeId;
                  const isMenuOpen = activeMenuId === conv.id;
                  const isEditing = editingId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      className="relative group rounded-xl transition-colors"
                    >
                      {isEditing ? (
                        <div className="p-1">
                          <input
                            type="text"
                            value={editTitle}
                            autoFocus
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleSaveRename(conv.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(conv.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-blue-500 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                          />
                        </div>
                      ) : (
                        <div
                          className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                          }`}
                          onClick={() => {
                            onSelect(conv.id);
                            if (window.innerWidth < 1024) onClose();
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                            {getModeIcon(conv.mode)}
                            <span className="truncate">{conv.title || 'Nouvelle discussion'}</span>
                          </div>

                          {/* Action Options Button (...) */}
                          <div
                            className={`flex items-center ${
                              isActive || isMenuOpen
                                ? 'opacity-100'
                                : 'opacity-0 group-hover:opacity-100'
                            } transition-opacity`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : conv.id);
                              }}
                              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                              title="Options"
                              aria-label="Options de la discussion"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Dropdown Menu for Conversation (Rename / Delete) */}
                      {isMenuOpen && (
                        <div
                          className="absolute right-2 top-full mt-1 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleStartRename(conv)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left"
                          >
                            <Edit2 className="w-3 h-3 text-zinc-400" />
                            <span>Renommer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDelete(conv.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Bottom User Profile & Settings Menu */}
        <div className="p-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <UserMenu
            quota={quota}
            theme={theme}
            onThemeToggle={onThemeToggle}
            onOpenSettings={onOpenSettings}
            onClearHistory={onClearAll}
          />
        </div>
      </aside>
    </>
  );
};
