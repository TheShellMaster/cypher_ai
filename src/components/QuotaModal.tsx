import React, { useState, useEffect } from 'react';
import { X, Zap, Clock, ShieldCheck, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { QuotaInfo } from '../types';

interface QuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  quota: QuotaInfo | null;
}

export const QuotaModal: React.FC<QuotaModalProps> = ({ isOpen, onClose, quota }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [notified, setNotified] = useState(false);

  useEffect(() => {
    if (!quota) return;

    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, quota.resetsAt - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [quota]);

  if (!isOpen) return null;

  const count = quota ? quota.count : 0;
  const limit = quota ? quota.limit : 50;
  const remaining = quota ? quota.remaining : 50;
  const percentUsed = Math.min(100, Math.round((count / limit) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Title & Badge */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Quota Journalier Grand Public</h2>
            <p className="text-xs text-zinc-400">Accès gratuit équitable et transparent</p>
          </div>
        </div>

        {/* Usage Progress Gauge */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 mb-5 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium text-zinc-300">Requêtes utilisées aujourd'hui</span>
            <span className="font-mono font-bold text-zinc-100">
              <span className="text-cyan-400">{count}</span> / {limit}
            </span>
          </div>

          {/* Bar */}
          <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-750">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentUsed >= 90
                  ? 'bg-gradient-to-r from-amber-500 to-red-500'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <span>{remaining} requêtes restantes</span>
            <span className="flex items-center gap-1 font-mono text-cyan-300">
              <Clock size={12} />
              Recharge dans {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
          </div>
        </div>

        {/* Info Points */}
        <div className="space-y-2.5 mb-6 text-xs text-zinc-300">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>100% Gratuit & Sans Carte Bancaire</strong> : Cypher AI interroge des modèles ouverts gratuits via OpenRouter.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Confidentialité totale</strong> : Vos données de session restent en mémoire locale sur votre machine.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Réinitialisation automatique</strong> : Le compteur revient à 50 chaque nuit à minuit UTC.
            </span>
          </div>
        </div>

        {/* Pro Teaser Card */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-400" />
              <span className="font-semibold text-xs text-zinc-200">
                Mode Développeur Illimité
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Prochainement : connectez votre propre clé pour débloquer les quotas illimités.
            </p>
          </div>

          <button
            onClick={() => setNotified(true)}
            disabled={notified}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              notified
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
            }`}
          >
            {notified ? 'Inscrit !' : 'M\'avertir'}
          </button>
        </div>
      </div>
    </div>
  );
};
