import React, { useState, useEffect } from 'react';
import { CypherLogo } from './CypherLogo';

interface CypherSplashScreenProps {
  onComplete: () => void;
}

export const CypherSplashScreen: React.FC<CypherSplashScreenProps> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'enter' | 'pulse' | 'exit'>('enter');

  useEffect(() => {
    // Stage 1: Enter (logo & glow zoom in)
    const t1 = setTimeout(() => {
      setStage('pulse');
    }, 400);

    // Progress bar interpolation (0 -> 100% over 1400ms)
    const startTime = Date.now();
    const duration = 1400;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(nextProgress);

      if (elapsed >= duration) {
        clearInterval(interval);
        setStage('exit');
        setFading(true);
        setTimeout(onComplete, 600);
      }
    }, 30);

    return () => {
      clearTimeout(t1);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div
      onClick={() => {
        setFading(true);
        setTimeout(onComplete, 200);
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b] text-white select-none transition-all duration-700 ease-out cursor-pointer ${
        fading
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Cinematic Ambient Radial Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-purple-600/10 blur-[100px] pointer-events-none animate-pulse duration-1000" />

      {/* Central 3D Brand Logo Container */}
      <div className="relative mb-8 flex flex-col items-center justify-center">
        {/* Luminous Pulsing Halo */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-xl animate-pulse" />

        {/* Outer Ring */}
        <div className={`relative p-1.5 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl transition-all duration-700 ${
          stage === 'enter' ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
        }`}>
          <CypherLogo size={88} useImage={true} className="rounded-2xl" />
        </div>
      </div>

      {/* Brand Title & Typography with Staggered Entrance */}
      <div className={`text-center space-y-2 z-10 transition-all duration-700 delay-150 ${
        stage === 'enter' ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
      }`}>
        <div className="flex items-center justify-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-[0.2em] uppercase text-white font-sans">
            Cypher
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
            AI 2.0
          </span>
        </div>
        <p className="text-xs text-zinc-400 font-medium tracking-wide">
          Intelligence Épurée · Recherche & Documents
        </p>
      </div>

      {/* Cinematic Glowing Progress Bar */}
      <div className="w-56 h-1 bg-zinc-900 rounded-full mt-8 overflow-hidden z-10 border border-zinc-800/80">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(59,130,246,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Discrete Skip Hint */}
      <span className="text-[10px] text-zinc-600 mt-5 font-mono tracking-wider z-10 uppercase">
        Cliquer pour passer
      </span>
    </div>
  );
};
