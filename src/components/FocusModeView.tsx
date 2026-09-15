import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Clock,
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Maximize2,
  Minimize2,
  Coffee,
  Brain,
  Tag,
  Calendar,
} from 'lucide-react';
import { Todo } from '../types.ts';
import { TaskToggle } from './TaskToggle.tsx';

interface FocusModeProps {
  task: Todo;
  onExit: () => void;
  onToggleComplete: (id: number) => Promise<void>;
}

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const TIMER_PRESETS: Record<TimerMode, { label: string; minutes: number; icon: React.ReactNode }> = {
  pomodoro: { label: 'Deep Focus', minutes: 25, icon: <Brain className="w-4 h-4" /> },
  shortBreak: { label: 'Short Break', minutes: 5, icon: <Coffee className="w-4 h-4" /> },
  longBreak: { label: 'Long Break', minutes: 15, icon: <Coffee className="w-4 h-4" /> },
};

// Clean harmonic bell chime using Web Audio API (no external file needed)
const playChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.85);
    });
  } catch {
    // AudioContext blocked or not supported
  }
};

export const FocusModeView: React.FC<FocusModeProps> = ({ task, onExit, onToggleComplete }) => {
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_PRESETS.pomodoro.minutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTogglingTask, setIsTogglingTask] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = TIMER_PRESETS[timerMode].minutes * 60;

  // Switch timer presets
  const selectMode = useCallback((mode: TimerMode) => {
    setTimerMode(mode);
    setIsRunning(false);
    setTimeLeft(TIMER_PRESETS[mode].minutes * 60);
  }, []);

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            if (soundEnabled) {
              playChime();
            }
            if (timerMode === 'pomodoro') {
              setCompletedSessions((s) => s + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled, timerMode]);

  // Keyboard shortcut: Esc to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_PRESETS[timerMode].minutes * 60);
  };

  const handleTaskToggle = async () => {
    try {
      setIsTogglingTask(true);
      await onToggleComplete(task.id);
      if (!task.completed && soundEnabled) {
        playChime();
      }
    } finally {
      setIsTogglingTask(false);
    }
  };

  // Format time mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage
  const progress = Math.max(0, Math.min(100, ((totalDuration - timeLeft) / totalDuration) * 100));

  // Stroke Dash for Circular SVG
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      id="focus-mode-container"
      className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between overflow-y-auto"
    >
      {/* MINIMAL TOP BAR */}
      <header className="p-4 sm:p-6 flex items-center justify-between border-b border-slate-900 shrink-0">
        <button
          id="exit-focus-mode-btn"
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Focus Mode</span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline ml-1">[ESC]</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Focus Mode Active</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Chime' : 'Unmute Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer hidden sm:flex"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* CENTERED CONTENT: SHOWS ONLY TASK DETAILS, DESCRIPTION, AND POMODORO TIMER */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
        {/* TASK DETAILS & DESCRIPTION CARD */}
        <div
          id="focus-task-card"
          className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 backdrop-blur-md"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-5">
            <div className="flex items-center gap-3.5">
              <div className="shrink-0 flex items-center">
                <TaskToggle
                  id={`focus-toggle-${task.id}`}
                  checked={task.completed}
                  onChange={handleTaskToggle}
                  disabled={isTogglingTask}
                  size="lg"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      task.priority === 'high'
                        ? 'bg-red-950/80 text-red-400 border border-red-800/60'
                        : task.priority === 'medium'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {task.priority} Priority
                  </span>

                  {task.category && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full">
                      <Tag className="w-3 h-3 text-slate-400" /> {task.category}
                    </span>
                  )}

                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full">
                      <Calendar className="w-3 h-3 text-slate-400" /> {task.dueDate}
                      {task.dueTime && ` at ${task.dueTime}`}
                    </span>
                  )}
                </div>

                <h1
                  className={`text-xl sm:text-2xl font-bold tracking-tight text-white ${
                    task.completed ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {task.title}
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTaskToggle}
              disabled={isTogglingTask}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                task.completed
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {task.completed ? 'Task Completed 🎉' : 'Mark Completed'}
            </button>
          </div>

          {/* Task Description */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Task Description & Notes
            </h2>
            {task.description ? (
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/70 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                {task.description}
              </div>
            ) : (
              <div className="p-4 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-xs text-slate-500 italic">
                No extra description provided for this task. Focus exclusively on executing the primary objective.
              </div>
            )}
          </div>
        </div>

        {/* BUILT-IN POMODORO TIMER */}
        <div
          id="pomodoro-timer-widget"
          className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center backdrop-blur-md"
        >
          {/* Preset Selector */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-8 max-w-sm w-full">
            {(['pomodoro', 'shortBreak', 'longBreak'] as TimerMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => selectMode(mode)}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  timerMode === mode
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {TIMER_PRESETS[mode].icon}
                <span>{TIMER_PRESETS[mode].label}</span>
              </button>
            ))}
          </div>

          {/* Timer Clock with Circular Progress SVG */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
              {/* Track background */}
              <circle
                cx="120"
                cy="120"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress track */}
              <circle
                cx="120"
                cy="120"
                r={radius}
                className={`transition-all duration-500 ${
                  timerMode === 'pomodoro'
                    ? 'stroke-blue-500'
                    : timerMode === 'shortBreak'
                    ? 'stroke-emerald-500'
                    : 'stroke-purple-500'
                }`}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Clock Display */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-mono text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
                {formattedTime}
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                {timerMode === 'pomodoro'
                  ? isRunning
                    ? 'Focusing'
                    : 'Paused'
                  : 'Resting'}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button
              id="pomodoro-reset-btn"
              type="button"
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              id="pomodoro-start-toggle-btn"
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2.5 cursor-pointer shadow-lg ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/25'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" /> Pause Timer
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" /> Start Focus Session
                </>
              )}
            </button>
          </div>

          {/* Focus Sessions Completed Tally */}
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800/80">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Completed Pomodoro Cycles:</span>
            <strong className="text-white font-mono">{completedSessions}</strong>
          </div>
        </div>
      </main>

      {/* MINIMAL FOOTER */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900 shrink-0">
        Focus Mode minimizes all peripheral UI so you can channel 100% of your cognitive energy on
        this single objective.
      </footer>
    </div>
  );
};
