export type AppMode = 'chat' | 'search' | 'code';
export type Theme = 'light' | 'dark';

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export interface ArtifactItem {
  id: string;
  title: string;
  type: 'pdf' | 'pptx' | 'plot' | 'code' | 'web';
  url?: string;
  sizeBytes?: number;
  content?: string;
  language?: string;
  createdAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  timestamp: number;
  sources?: SearchResult[];
  mode?: AppMode;
  isStreaming?: boolean;
  artifacts?: ArtifactItem[];
}

export interface Conversation {
  id: string;
  title: string;
  mode: AppMode;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface QuotaInfo {
  clientId: string;
  count: number;
  limit: number;
  remaining: number;
  resetsAt: number;
  isAllowed: boolean;
  message?: string;
}

export interface AIModel {
  id: string;
  name: string;
  mode: AppMode;
  description: string;
  isFree: boolean;
}
