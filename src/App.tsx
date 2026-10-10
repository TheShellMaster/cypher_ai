import React, { useState, useEffect, useRef } from 'react';
import {
  AppMode,
  Conversation,
  Message,
  QuotaInfo,
  Theme,
  ArtifactItem,
} from './types';
import {
  getOrCreateClientId,
  loadConversations,
  saveConversations,
  createNewConversation,
  getStoredTheme,
  setStoredTheme,
} from './utils/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { CypherArtifactsPanel } from './components/CypherArtifactsPanel';
import { CypherSplashScreen } from './components/CypherSplashScreen';
import { CypherLogo } from './components/CypherLogo';
import { ModelOption, FREE_MODELS_CATALOG } from './components/ModelSelector';
import {
  Globe,
  Sparkles,
  FileText,
  Presentation,
} from 'lucide-react';

export const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState<boolean>(true);

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = loadConversations();
    if (saved.length > 0) return saved;
    return [createNewConversation('chat')];
  });

  const [activeId, setActiveId] = useState<string>(() => {
    return conversations[0]?.id || '';
  });

  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  const [selectedModelId, setSelectedModelId] = useState<string>(FREE_MODELS_CATALOG[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<ArtifactItem | null>(null);
  const [isArtifactsPanelOpen, setIsArtifactsPanelOpen] = useState(false);

  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation: Conversation =
    conversations.find((c: Conversation) => c.id === activeId) || conversations[0];

  const currentMode: AppMode = activeConversation?.mode || 'chat';

  // Apply theme class to HTML element
  useEffect(() => {
    setStoredTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  // Mark boot complete
  const handleBootComplete = () => {
    sessionStorage.setItem('cypher_booted', 'true');
    setIsBooting(false);
  };

  // Save conversations to localStorage whenever changed
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Fetch initial usage quota
  const fetchQuota = async () => {
    try {
      const clientId = getOrCreateClientId();
      const res = await fetch('/api/usage', {
        headers: { 'x-cypher-client-id': clientId },
      });
      if (res.ok) {
        const data = await res.json();
        setQuota(data);
      }
    } catch (err) {
      console.warn('Failed to fetch quota:', err);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isStreaming]);

  // Handle Mode Change
  const handleModeChange = (mode: AppMode) => {
    if (!activeConversation) return;

    if (activeConversation.messages.length === 0) {
      setConversations((prev: Conversation[]) =>
        prev.map((c: Conversation) => (c.id === activeConversation.id ? { ...c, mode } : c))
      );
    } else {
      const newConv = createNewConversation(mode);
      setConversations((prev: Conversation[]) => [newConv, ...prev]);
      setActiveId(newConv.id);
    }
  };

  // Handle direct model select
  const handleModelSelect = (model: ModelOption) => {
    setSelectedModelId(model.id);
    handleModeChange(model.mode);
  };

  // Handle New Chat
  const handleNewChat = () => {
    const newConv = createNewConversation(currentMode);
    setConversations((prev: Conversation[]) => [newConv, ...prev]);
    setActiveId(newConv.id);
  };

  // Keyboard shortcut Ctrl+K for new conversation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMode]);

  // Rename Conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev: Conversation[]) =>
      prev.map((c: Conversation) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  // Delete Conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev: Conversation[]) => {
      const filtered = prev.filter((c: Conversation) => c.id !== id);
      if (filtered.length === 0) {
        const fallback = createNewConversation('chat');
        setActiveId(fallback.id);
        return [fallback];
      }
      if (activeId === id) {
        setActiveId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Clear All
  const handleClearAll = () => {
    if (window.confirm('Voulez-vous supprimer toutes les discussions enregistrées ?')) {
      const fresh = [createNewConversation('chat')];
      setConversations(fresh);
      setActiveId(fresh[0].id);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const clientId = getOrCreateClientId();
    const userMsgId = 'msg-' + Date.now() + '-u';
    const assistantMsgId = 'msg-' + (Date.now() + 1) + '-a';

    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      mode: currentMode,
    };

    const initialAssistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      mode: currentMode,
      isStreaming: true,
    };

    const updatedTitle =
      activeConversation.messages.length === 0
        ? text.slice(0, 32) + (text.length > 32 ? '...' : '')
        : activeConversation.title;

    const updatedMessages = [...activeConversation.messages, userMessage];

    // Handle local /model command cleanly
    if (text.trim().toLowerCase().startsWith('/model')) {
      const infoMsgId = 'msg-' + (Date.now() + 1) + '-info';
      const modelInfoContent = `🤖 **Catalogue des Modèles IA Gratuits Validés Cypher AI**

Voici les modèles d'élite actifs configurés via OpenRouter (100% gratuits) :

${FREE_MODELS_CATALOG.map(
  (m) => `- **${m.name}** (\`${m.id}\`) : ${m.desc} (Contexte : ${m.context})`
).join('\n')}

*Vous pouvez changer de modèle directement via le sélecteur dans l'en-tête.*`;

      const infoMessage: Message = {
        id: infoMsgId,
        role: 'assistant',
        content: modelInfoContent,
        timestamp: Date.now(),
        mode: currentMode,
        isStreaming: false,
      };

      setConversations((prev: Conversation[]) =>
        prev.map((c: Conversation) =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: [...c.messages, userMessage, infoMessage],
                updatedAt: Date.now(),
              }
            : c
        )
      );
      return;
    }

    setConversations((prev: Conversation[]) =>
      prev.map((c: Conversation) =>
        c.id === activeConversation.id
          ? {
              ...c,
              title: updatedTitle,
              messages: [...c.messages, userMessage, initialAssistantMessage],
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const apiEndpoint = currentMode === 'search' ? '/api/search' : '/api/chat';

      const payload = {
        messages: updatedMessages.map((m: Message) => ({
          role: m.role,
          content: m.content,
        })),
        customModel: selectedModelId,
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cypher-client-id': clientId,
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          const quotaErr = await response.json();
          setConversations((prev: Conversation[]) =>
            prev.map((c: Conversation) =>
              c.id === activeConversation.id
                ? {
                    ...c,
                    messages: c.messages.map((m: Message) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: `⚠️ **Limite journalière atteinte**\n\n${
                              quotaErr.message ||
                              'Vous avez atteint le quota maximal de 50 requêtes pour aujourd\'hui. Il se réinitialise à minuit UTC.'
                            }`,
                            isStreaming: false,
                          }
                        : m
                    ),
                  }
                : c
            )
          );
          fetchQuota();
          setIsStreaming(false);
          return;
        }

        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Erreur serveur (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Flux de réponse non disponible');

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedContent = '';
      let accumulatedThought = '';
      let receivedSources: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const dataStr = trimmedLine.slice(6);
          if (dataStr === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);

            // Handle sources
            if (Array.isArray(parsed)) {
              receivedSources = parsed;
              setConversations((prev: Conversation[]) =>
                prev.map((c: Conversation) =>
                  c.id === activeConversation.id
                    ? {
                        ...c,
                        messages: c.messages.map((m: Message) =>
                          m.id === assistantMsgId ? { ...m, sources: receivedSources } : m
                        ),
                      }
                    : c
                )
              );
            } else if (parsed.sources) {
              receivedSources = parsed.sources;
              setConversations((prev: Conversation[]) =>
                prev.map((c: Conversation) =>
                  c.id === activeConversation.id
                    ? {
                        ...c,
                        messages: c.messages.map((m: Message) =>
                          m.id === assistantMsgId ? { ...m, sources: receivedSources } : m
                        ),
                      }
                    : c
                )
              );
            }

            // Handle thought / reasoning
            const newThought = parsed.thought || (parsed.type === 'thought' ? parsed.content : null);
            if (newThought) {
              accumulatedThought += newThought;
              setConversations((prev: Conversation[]) =>
                prev.map((c: Conversation) =>
                  c.id === activeConversation.id
                    ? {
                        ...c,
                        messages: c.messages.map((m: Message) =>
                          m.id === assistantMsgId ? { ...m, thought: accumulatedThought } : m
                        ),
                      }
                    : c
                )
              );
            }

            // Handle main content tokens
            const newText = parsed.text || (parsed.type === 'token' ? parsed.content : null);
            if (newText) {
              accumulatedContent += newText;
              setConversations((prev: Conversation[]) =>
                prev.map((c: Conversation) =>
                  c.id === activeConversation.id
                    ? {
                        ...c,
                        messages: c.messages.map((m: Message) =>
                          m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m
                        ),
                      }
                    : c
                )
              );
            }
          } catch {
            // Ignore non-json lines
          }
        }
      }

      // Detect and process PDF & PPTX tool generations
      let finalCleanContent = accumulatedContent;
      const discoveredArtifacts: ArtifactItem[] = [];

      const pdfMatch = accumulatedContent.match(/\[CYPHER_TOOL:GENERATE_PDF\]([\s\S]*?)\[\/CYPHER_TOOL\]/);
      if (pdfMatch && pdfMatch[1]) {
        try {
          const pdfPayload = JSON.parse(pdfMatch[1].trim());
          const res = await fetch('/api/tools/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pdfPayload),
          });
          if (res.ok) {
            const artData = await res.json();
            const pdfArtifact: ArtifactItem = {
              id: artData.artifactId,
              title: artData.filename || pdfPayload.title || 'Document PDF',
              type: 'pdf',
              url: artData.url,
              sizeBytes: artData.sizeBytes,
              createdAt: Date.now(),
            };
            discoveredArtifacts.push(pdfArtifact);
            finalCleanContent = finalCleanContent.replace(/\[CYPHER_TOOL:GENERATE_PDF\][\s\S]*?\[\/CYPHER_TOOL\]/, '').trim();
            setActiveArtifact(pdfArtifact);
            setIsArtifactsPanelOpen(true);
          }
        } catch (e) {
          console.warn('Failed to process PDF tool:', e);
        }
      }

      const pptxMatch = accumulatedContent.match(/\[CYPHER_TOOL:GENERATE_PPTX\]([\s\S]*?)\[\/CYPHER_TOOL\]/);
      if (pptxMatch && pptxMatch[1]) {
        try {
          const pptxPayload = JSON.parse(pptxMatch[1].trim());
          const res = await fetch('/api/tools/pptx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pptxPayload),
          });
          if (res.ok) {
            const artData = await res.json();
            const pptxArtifact: ArtifactItem = {
              id: artData.artifactId,
              title: artData.filename || pptxPayload.title || 'Présentation PPTX',
              type: 'pptx',
              url: artData.url,
              sizeBytes: artData.sizeBytes,
              createdAt: Date.now(),
            };
            discoveredArtifacts.push(pptxArtifact);
            finalCleanContent = finalCleanContent.replace(/\[CYPHER_TOOL:GENERATE_PPTX\][\s\S]*?\[\/CYPHER_TOOL\]/, '').trim();
            setActiveArtifact(pptxArtifact);
            setIsArtifactsPanelOpen(true);
          }
        } catch (e) {
          console.warn('Failed to process PPTX tool:', e);
        }
      }

      // Mark streaming complete with cleaned content and artifacts
      setConversations((prev: Conversation[]) =>
        prev.map((c: Conversation) =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: c.messages.map((m: Message) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: finalCleanContent,
                        artifacts: discoveredArtifacts.length > 0 ? discoveredArtifacts : m.artifacts,
                        isStreaming: false,
                      }
                    : m
                ),
              }
            : c
        )
      );

      fetchQuota();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setConversations((prev: Conversation[]) =>
          prev.map((c: Conversation) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  messages: c.messages.map((m: Message) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: m.content + '\n\n*(Génération interrompue)*',
                          isStreaming: false,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      } else {
        setConversations((prev: Conversation[]) =>
          prev.map((c: Conversation) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  messages: c.messages.map((m: Message) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: `⚠️ **Erreur de connexion** : ${
                            err.message || 'Impossible de joindre le service.'
                          }`,
                          isStreaming: false,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Stop generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased">
      {/* Animated Brand Splash Screen on Boot */}
      {isBooting && <CypherSplashScreen onComplete={handleBootComplete} />}

      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => setActiveId(id)}
        onDelete={handleDeleteConversation}
        onRename={handleRenameConversation}
        onClearAll={handleClearAll}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat}
        quota={quota}
        theme={theme}
        onThemeToggle={handleToggleTheme}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative bg-white dark:bg-zinc-950 transition-colors overflow-hidden">
        {/* Header */}
        <Header
          currentMode={currentMode}
          onModeChange={handleModeChange}
          selectedModelId={selectedModelId}
          onModelSelect={handleModelSelect}
          quota={quota}
          theme={theme}
          onThemeToggle={handleToggleTheme}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onNewChat={handleNewChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Conversation Stream & Input Dock */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative bg-white dark:bg-zinc-950 overflow-hidden">
          <main className="flex-1 overflow-y-auto relative flex flex-col">
            {activeConversation.messages.length === 0 ? (
              /* Minimalist Apple / ChatGPT Style Clean Landing Screen */
              <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 max-w-2xl mx-auto my-auto w-full animate-in fade-in duration-300 select-none">
                {/* Official Mobius Emblem */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg mb-6 ring-1 ring-zinc-200 dark:ring-zinc-800 transition-transform hover:scale-105 duration-300">
                  <CypherLogo size={64} useImage={true} />
                </div>

                {/* Clean Welcoming Title */}
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 text-center mb-2">
                  Comment puis-je vous aider aujourd'hui ?
                </h1>

                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md mb-8 leading-relaxed">
                  Discussion avancée, recherche web actualisée et génération de documents.
                </p>

                {/* Minimal Subtle Suggestion Chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
                  <button
                    type="button"
                    onClick={() => {
                      handleModeChange('search');
                      handleSendMessage('Quelles sont les avancées majeures de l\'intelligence artificielle cette semaine ?');
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-100/90 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800 transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>Recherche d'actualités en direct</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSendMessage('Génère un rapport de synthèse complet et structuré au format PDF sur l\'architecture des Transformers.');
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-100/90 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800 transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-500" />
                    <span>Générer un rapport PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSendMessage('Conçois une présentation PowerPoint (.pptx) de 5 diapositives sur la transformation numérique.');
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-100/90 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800 transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
                  >
                    <Presentation className="w-3.5 h-3.5 text-amber-500" />
                    <span>Présentation PowerPoint (.pptx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleModeChange('chat');
                      handleSendMessage('Explique les principes clés de la théorie de l\'information de Claude Shannon.');
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-100/90 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800 transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>Analyse & vulgarisation conceptuelle</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Message Stream List */
              <div className="flex-1 py-4">
                {activeConversation.messages.map((message: Message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onOpenArtifact={(art: ArtifactItem) => {
                      setActiveArtifact(art);
                      setIsArtifactsPanelOpen(true);
                    }}
                  />
                ))}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </main>

          {/* Input Dock */}
          <ChatInput
            onSend={handleSendMessage}
            isStreaming={isStreaming}
            onStop={handleStop}
            currentMode={currentMode}
            onModeChange={handleModeChange}
            quota={quota}
            hasMessages={activeConversation.messages.length > 0}
          />
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        theme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        quota={quota}
        onClearAllConversations={handleClearAll}
        currentMode={currentMode}
        onModeChange={handleModeChange}
      />

      {/* Slide-over Artifacts Panel */}
      <CypherArtifactsPanel
        artifact={activeArtifact}
        isOpen={isArtifactsPanelOpen}
        onClose={() => setIsArtifactsPanelOpen(false)}
      />
    </div>
  );
};

export default App;
