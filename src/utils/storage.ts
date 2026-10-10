import { Conversation, AppMode, Theme } from '../types';

const STORAGE_KEY = 'cypher_ai_conversations_v1';
const CLIENT_ID_KEY = 'cypher_ai_client_id_v1';
const THEME_KEY = 'cypher_ai_theme_v1';

export function getStoredTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  // Default to clean light mode if system prefers light, or dark
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function setStoredTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function getOrCreateClientId(): string {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = 'cypher-usr-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load conversations from storage:', e);
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save conversations:', e);
  }
}

export function createNewConversation(mode: AppMode = 'chat'): Conversation {
  return {
    id: 'conv-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7),
    title: mode === 'chat' ? 'Nouvelle discussion' : mode === 'search' ? 'Nouvelle recherche' : 'Nouveau script / code',
    mode,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
