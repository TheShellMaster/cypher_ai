import React, { useState, useEffect, useRef } from 'react';

interface CypherSplashScreenProps {
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  text: string;
  color: string;
  size: number;
  progress: number;
  speed: number;
  delay: number;
  alpha: number;
}

const MATH_AND_CODE_SYMBOLS = [
  // Advanced Math
  '∑', '∫ dx', '∇²ψ', 'e^{iπ}+1=0', '∂L/∂W', 'λ_max', 'f\'(x)', '∞',
  '[A·B]', 'σ(Wx+b)', 'P(A|B)', 'lim_{x→0}', '√2π', 'Ω(n)', 'det(M)',
  'E=mc²', 'log₂(N)', 'ℝⁿ', '∂²u/∂t²', 'θ_{t+1}', 'argmax',
  // High-Performance Code
  'const cypher = AI()', 'tensor.forward()', '0x7FF000', 'async fn',
  '0100101', 'matrix.dot()', 'import { neural }', 'model.generate()',
  'stream.pipe()', 'softmax(z)', 'ReLU(x)', 'latent_dim = 4096',
  'loss.backward()', 'optimizer.step()', 'attention(Q,K,V)', 'return token;'
];

export const CypherSplashScreen: React.FC<CypherSplashScreenProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fused, setFused] = useState(false);
  const [fading, setFading] = useState(false);
  const [showBrand, setShowBrand] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const centerX = width / 2;
    const centerY = height / 2;

    // Create 70 particles originating from the 4 corners of the viewport
    const corners = [
      { x: -20, y: -20 }, // Top-Left
      { x: width + 20, y: -20 }, // Top-Right
      { x: -20, y: height + 20 }, // Bottom-Left
      { x: width + 20, y: height + 20 }, // Bottom-Right
    ];

    const colors = [
      '#60a5fa', // Blue
      '#818cf8', // Indigo
      '#a78bfa', // Purple
      '#34d399', // Emerald
      '#38bdf8', // Cyan
      '#f43f5e', // Rose accent
    ];

    const particles: Particle[] = Array.from({ length: 72 }).map((_, i) => {
      const corner = corners[i % 4];
      // Slight spread at the corners
      const jitterX = (Math.random() - 0.5) * (width * 0.4);
      const jitterY = (Math.random() - 0.5) * (height * 0.4);

      return {
        x: corner.x + jitterX,
        y: corner.y + jitterY,
        originX: corner.x + jitterX,
        originY: corner.y + jitterY,
        targetX: centerX,
        targetY: centerY,
        text: MATH_AND_CODE_SYMBOLS[i % MATH_AND_CODE_SYMBOLS.length],
        color: colors[i % colors.length],
        size: Math.floor(Math.random() * 5) + 11, // 11px to 16px
        progress: 0,
        speed: 0.007 + Math.random() * 0.012,
        delay: Math.random() * 15, // Staggered start frames
        alpha: 0,
      };
    });

    let frame = 0;
    let shockwaveRadius = 0;
    let shockwaveAlpha = 0;
    let fusionTriggered = false;

    const render = () => {
      frame++;

      // Trail fade effect on canvas
      ctx.fillStyle = 'rgba(9, 9, 11, 0.28)';
      ctx.fillRect(0, 0, width, height);

      let arrivedCount = 0;

      // Update & Draw Corner Converging Particles
      for (const p of particles) {
        if (frame > p.delay) {
          p.progress += p.speed * (1 + p.progress * 2.8); // Accelerate towards center singularity

          if (p.progress < 1) {
            // Cubic easing convergence from corners to center
            const ease = Math.pow(p.progress, 2.2);
            p.x = p.originX + (p.targetX - p.originX) * ease;
            p.y = p.originY + (p.targetY - p.originY) * ease;
            p.alpha = Math.min(1, p.progress * 2.5);

            // Draw glowing stream particle
            ctx.save();
            ctx.font = `${p.size}px "JetBrains Mono", monospace`;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * 0.85;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fillText(p.text, p.x, p.y);

            // Draw trailing trace line to center
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + (p.targetX - p.x) * 0.08, p.y + (p.targetY - p.y) * 0.08);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = p.alpha * 0.35;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.restore();
          } else {
            arrivedCount++;
          }
        }
      }

      // Singularity Fusion reached!
      if (arrivedCount >= particles.length * 0.75 && !fusionTriggered) {
        fusionTriggered = true;
        setFused(true);
        setTimeout(() => setShowBrand(true), 120);

        shockwaveAlpha = 1;
        shockwaveRadius = 5;

        // Auto transition into the chat after full emergence
        setTimeout(() => {
          setFading(true);
          setTimeout(onComplete, 700);
        }, 1600);
      }

      // Draw Singularity Shockwave Ring
      if (shockwaveAlpha > 0.01) {
        shockwaveRadius += 9;
        shockwaveAlpha *= 0.92;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, shockwaveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(96, 165, 250, ${shockwaveAlpha})`;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 24;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, shockwaveRadius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(167, 139, 250, ${shockwaveAlpha * 0.8})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [onComplete]);

  return (
    <div
      onClick={() => {
        setFading(true);
        setTimeout(onComplete, 200);
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b] text-white select-none transition-all duration-700 ease-out cursor-pointer overflow-hidden ${
        fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 60fps Convergence Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Central Singularity & Materialized 3D Mobius Emblem */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Core Glowing Singularity Aura */}
        <div
          className={`absolute w-72 h-72 rounded-full bg-gradient-to-tr from-blue-600/30 via-indigo-500/25 to-purple-600/25 blur-[70px] pointer-events-none transition-all duration-700 ${
            fused ? 'scale-125 opacity-100' : 'scale-50 opacity-40'
          }`}
        />

        {/* 3D Mobius Emblem Bursting from Singularity */}
        <div
          className={`relative p-2 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 shadow-[0_0_50px_rgba(59,130,246,0.35)] backdrop-blur-xl transition-all duration-700 ease-out ${
            showBrand
              ? 'scale-100 opacity-100 rotate-0'
              : 'scale-0 opacity-0 -rotate-12'
          }`}
        >
          {/* Official 3D Mobius Image */}
          <img
            src="/cypher_brand_mark.jpg"
            alt="Cypher AI"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-2xl"
          />

          {/* Specular Diagonal Light Sweep Overlay */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-45 animate-in slide-in-from-left duration-1000" />
          </div>
        </div>

        {/* Brand Typography & Staggered Reveal */}
        <div
          className={`text-center mt-6 space-y-1.5 transition-all duration-700 delay-100 ${
            showBrand ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[0.25em] uppercase text-white font-sans drop-shadow-md">
              Cypher
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
              AI
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase font-mono">
            Convergence Mathématique · Intelligence Épurée
          </p>
        </div>
      </div>

      {/* Discrete Skip Hint */}
      <span className="absolute bottom-6 text-[10px] text-zinc-600 font-mono tracking-widest uppercase z-10">
        Cliquer pour passer
      </span>
    </div>
  );
};
