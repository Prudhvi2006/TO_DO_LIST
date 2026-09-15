import React, { useEffect, useState } from 'react';
import { X, Sparkles, Quote, CheckCircle2, RefreshCw } from 'lucide-react';
import { Todo } from '../types.ts';

interface AstronautCelebrationModalProps {
  task: Todo;
  quote?: string;
  onClose: () => void;
}

const CELESTIAL_QUOTES = [
  "One small step for today, one giant leap for your ambitions! Keep aiming for the cosmos. 🚀",
  "You conquered this mission! Consistency is the rocket fuel launching your dreams into reality. 🌌",
  "The stars don't shine without darkness, and success doesn't arrive without dedication. Stellar work! ✨",
  "Mission complete! Your focus and discipline are truly astronomical today. 🛰️",
  "Gravity cannot hold back someone with your dedication. Keep exploring new frontiers! 🌠",
  "A completed task is a shining constellation in your universe of progress. Brilliant execution! 🪐",
  "You are capable of incredible things. Another stellar milestone achieved in your journey! 🛸",
  "Perseverance takes you beyond the clouds. Huge congratulations on completing this mission! 🏆",
  "Every journey to the stars begins with a single completed checkpoint. Bravo on finishing this! 💫",
  "Small daily habits compound into galactic triumphs. Keep this momentum alive! ☄️"
];

export const AstronautCelebrationModal: React.FC<AstronautCelebrationModalProps> = ({
  task,
  quote,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(() =>
    Math.floor(Math.random() * CELESTIAL_QUOTES.length)
  );

  const activeQuote = quote || CELESTIAL_QUOTES[currentQuoteIndex];

  const handleNextQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentQuoteIndex((prev) => (prev + 1) % CELESTIAL_QUOTES.length);
  };

  // Gentle celebratory triumph sound via Web Audio API
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + idx * 0.1 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 0.7);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.75);
        });
      }
    } catch {
      // Audio autoplay policy handled safely
    }
  }, []);

  // 15-second countdown timer with auto-close
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onClose]);

  return (
    <div
      id="astronaut-celebration-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button at top corner */}
        <button
          onClick={onClose}
          className="absolute -top-3.5 -right-3.5 z-40 p-2 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-purple-500/50 hover:border-purple-400 shadow-xl cursor-pointer transition-all hover:scale-110 active:scale-95"
          title="Close celebratory popup"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* UIVERSE ASTRONAUT CARD */}
        <div className="card astronaut-card">
          <img
            src="https://uiverse.io/astronaut.png"
            alt="Astronaut"
            className="image"
          />

          {/* Heading & Task Title */}
          <div className="heading">
            <div className="text-xl font-black tracking-wide text-white drop-shadow-[0_2px_12px_rgba(155,64,252,0.9)] flex items-center justify-center gap-1.5">
              <span>Mission Accomplished!</span>
              <span>🚀</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-200 text-[12px] font-semibold max-w-[260px] shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">"{task.title}"</span>
            </div>
          </div>

          {/* HIGH-CONTRAST Motivational Quote & Best Wishes */}
          <div className="relative z-20 w-full max-w-[270px] bg-slate-950/90 rounded-xl border border-purple-500/35 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.7)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Best Wishes & Inspiration</span>
              </div>
              <button
                onClick={handleNextQuote}
                className="p-1 rounded text-purple-400 hover:text-purple-200 hover:bg-purple-900/40 transition-colors cursor-pointer"
                title="Next inspirational quote"
                aria-label="Next quote"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-start gap-2">
              <Quote className="w-3.5 h-3.5 text-purple-400/80 shrink-0 mt-0.5 rotate-180" />
              <p className="text-[12px] leading-relaxed text-slate-100 font-medium italic drop-shadow-xs">
                {activeQuote}
              </p>
            </div>
          </div>
        </div>

        {/* 15-second visual countdown bar and quick action */}
        <div className="mt-3.5 flex items-center justify-between gap-3 w-full max-w-[21em] px-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>Closes in <strong className="text-white font-bold">{secondsRemaining}s</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold cursor-pointer border border-white/10 transition-colors"
          >
            Keep Going →
          </button>
        </div>

        {/* Linear progress bar */}
        <div className="w-full max-w-[21em] h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-purple-500 to-pink-400 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${(secondsRemaining / 15) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
