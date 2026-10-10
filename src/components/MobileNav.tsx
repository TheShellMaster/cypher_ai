import React from 'react';
import { MessageSquare, Globe, Code2, Plus } from 'lucide-react';
import { AppMode } from '../types';

interface MobileNavProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onNewChat: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentMode,
  onModeChange,
  onNewChat,
}) => {
  return (
    <nav className="md:hidden h-14 bg-zinc-950/95 border-t border-zinc-850 backdrop-blur-xl flex items-center justify-around px-2 z-20 shrink-0 pb-[env(safe-area-inset-bottom)]">
      <button
        onClick={() => onModeChange('chat')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
          currentMode === 'chat'
            ? 'text-cyan-400 font-bold'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <MessageSquare size={18} className={currentMode === 'chat' ? 'stroke-[2.5]' : ''} />
        <span className="mt-0.5">Chat</span>
      </button>

      <button
        onClick={() => onModeChange('search')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
          currentMode === 'search'
            ? 'text-purple-400 font-bold'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Globe size={18} className={currentMode === 'search' ? 'stroke-[2.5]' : ''} />
        <span className="mt-0.5">Web</span>
      </button>

      {/* Floating Center Action Button */}
      <button
        onClick={onNewChat}
        className="w-10 h-10 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-cyan-500/25 -mt-4 active:scale-95 transition-transform"
        title="Nouvelle discussion"
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>

      <button
        onClick={() => onModeChange('code')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
          currentMode === 'code'
            ? 'text-emerald-400 font-bold'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Code2 size={18} className={currentMode === 'code' ? 'stroke-[2.5]' : ''} />
        <span className="mt-0.5">Code</span>
      </button>
    </nav>
  );
};
