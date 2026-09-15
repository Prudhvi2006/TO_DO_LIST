import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  Plus,
  Flame,
  Trash2,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Target,
  RotateCcw,
  CheckCircle2,
  Trophy,
  BarChart3,
  CalendarDays,
  X,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { Habit } from '../types.ts';
import { isRohitUser, isSpecialUser } from '../lib/userTheme.ts';
import {
  CricketBallDoodle,
  CricketBatDoodle,
  TrophyDoodle,
  CrownDoodle,
  Number45Sticker,
  CardStickerBadge,
} from './CricketDoodles.tsx';
import {
  HeartDoodle,
  SparkleDoodle,
  FlowerDoodle,
  BowDoodle,
  WashiTape,
} from './PlannerDoodles.tsx';

interface HabitTrackerProps {
  userEmail?: string;
  className?: string;
  onHabitCompletedChange?: (completedCount: number, totalCount: number) => void;
}

const DEFAULT_ROHIT_HABITS: Omit<Habit, 'id' | 'createdAt'>[] = [
  {
    title: 'Morning Fitness & Warmup',
    category: 'Fitness',
    icon: '🏃',
    targetDaysPerWeek: 7,
    completedDates: [],
  },
  {
    title: 'Net Practice & Skill Drills',
    category: 'Cricket',
    icon: '🏏',
    targetDaysPerWeek: 6,
    completedDates: [],
  },
  {
    title: 'Hydration Target (3 Litres)',
    category: 'Health',
    icon: '💧',
    targetDaysPerWeek: 7,
    completedDates: [],
  },
  {
    title: 'Hitman Focus & Visualization 45m',
    category: 'Mindset',
    icon: '⚡',
    targetDaysPerWeek: 5,
    completedDates: [],
  },
];

const DEFAULT_STATIONERY_HABITS: Omit<Habit, 'id' | 'createdAt'>[] = [
  {
    title: 'Morning Gratitude & Smile',
    category: 'Wellness',
    icon: '🌸',
    targetDaysPerWeek: 7,
    completedDates: [],
  },
  {
    title: 'Stay Hydrated (8 Glasses)',
    category: 'Health',
    icon: '💧',
    targetDaysPerWeek: 7,
    completedDates: [],
  },
  {
    title: '30 Mins Focused Study / Reading',
    category: 'Learning',
    icon: '📚',
    targetDaysPerWeek: 6,
    completedDates: [],
  },
  {
    title: 'Daily Reflection & Journal Note',
    category: 'Mindfulness',
    icon: '✨',
    targetDaysPerWeek: 5,
    completedDates: [],
  },
];

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  userEmail,
  className = '',
  onHabitCompletedChange,
}) => {
  const isRohit = isRohitUser(userEmail);
  const isSpecial = isSpecialUser(userEmail);
  const storageKey = `habits_v1_${userEmail ? userEmail.trim().toLowerCase() : 'guest'}`;

  // View Mode: 'weekly' or 'monthly'
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  // Week navigation offset (0 = current week, -1 = last week, 1 = next week)
  const [weekOffset, setWeekOffset] = useState(0);

  // Month navigation offset (0 = current month, -1 = last month, 1 = next month)
  const [monthOffset, setMonthOffset] = useState(0);

  // Modal / drawer state for inspecting a single habit's month history from the weekly grid
  const [inspectHabitId, setInspectHabitId] = useState<string | null>(null);

  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Routine');
  const [newIcon, setNewIcon] = useState('⭐');
  const [newTargetDays, setNewTargetDays] = useState(7);

  // Helper to test if a habit contains any Rohit / Hitman / Cricket themes
  const isHitmanHabit = (h: any): boolean => {
    const text = `${h?.title || ''} ${h?.category || ''}`.toLowerCase();
    return /hitman|rohit|cricket|pull-shot|pull shot|net practice|innings|wankhede/i.test(text);
  };

  // Initialize habits from localStorage or pre-populated starter items
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If this is NOT a Rohit user, ensure no Hitman/Rohit habits are restored from previous sessions
          if (!isRohit) {
            const sanitized = parsed.filter((h) => !isHitmanHabit(h));
            if (sanitized.length > 0) {
              return sanitized;
            }
          } else {
            return parsed;
          }
        }
      }
    } catch (e) {
      // ignore
    }

    const initialTemplate = isRohit ? DEFAULT_ROHIT_HABITS : DEFAULT_STATIONERY_HABITS;
    const nowStr = new Date().toISOString();
    return initialTemplate.map((item, idx) => ({
      ...item,
      id: `habit_${Date.now()}_${idx}`,
      createdAt: nowStr,
    }));
  });

  // Safeguard: If theme resolves to non-Rohit (e.g. Navya Sri), purge any Hitman habits immediately
  useEffect(() => {
    if (!isRohit) {
      setHabits((prev) => {
        const hasHitman = prev.some(isHitmanHabit);
        if (hasHitman) {
          const cleaned = prev.filter((h) => !isHitmanHabit(h));
          if (cleaned.length === 0) {
            const nowStr = new Date().toISOString();
            return DEFAULT_STATIONERY_HABITS.map((item, idx) => ({
              ...item,
              id: `habit_${Date.now()}_${idx}`,
              createdAt: nowStr,
            }));
          }
          return cleaned;
        }
        return prev;
      });
    }
  }, [isRohit]);

  // Save to localStorage whenever habits change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(habits));
    } catch (e) {
      // ignore
    }
  }, [habits, storageKey]);

  // Format local YYYY-MM-DD helper
  const formatLocalDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Compute Monday for the selected week offset
  const getMonday = (offset = 0): Date => {
    const now = new Date();
    const day = now.getDay();
    // Monday is day 1. If today is Sunday (0), diff is -6. Otherwise 1 - day.
    const diff = (day === 0 ? -6 : 1) - day + offset * 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const mondayDate = getMonday(weekOffset);
  const todayDate = new Date();
  const todayStr = formatLocalDate(todayDate);

  // Generate the 7 days of the active week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + i);
      const dateStr = formatLocalDate(d);
      return {
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
        dayNumber: d.getDate(),
        isToday: dateStr === todayStr,
      };
    });
  }, [mondayDate, todayStr]);

  const sundayDate = new Date(mondayDate);
  sundayDate.setDate(mondayDate.getDate() + 6);

  const weekRangeLabel = `${mondayDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} – ${sundayDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  // Monthly Date Calculation
  const activeMonthDate = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthYearLabel = activeMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const monthDays = useMemo(() => {
    const year = activeMonthDate.getFullYear();
    const month = activeMonthDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: totalDays }, (_, i) => {
      const dayNum = i + 1;
      const d = new Date(year, month, dayNum);
      const dateStr = formatLocalDate(d);
      return {
        dayNum,
        date: dateStr,
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: dateStr === todayStr,
        isFuture: d > todayDate,
      };
    });
  }, [activeMonthDate, todayStr, todayDate]);

  // Toggle habit completion on a specific date
  const toggleHabitDate = (habitId: string, targetDate: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const exists = h.completedDates.includes(targetDate);
        const updatedDates = exists
          ? h.completedDates.filter((d) => d !== targetDate)
          : [...h.completedDates, targetDate];
        return {
          ...h,
          completedDates: updatedDates,
        };
      })
    );
  };

  // Delete habit
  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    if (inspectHabitId === habitId) {
      setInspectHabitId(null);
    }
  };

  // Add new habit
  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory.trim() || 'Daily',
      icon: newIcon || '⭐',
      targetDaysPerWeek: Number(newTargetDays) || 7,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };

    setHabits((prev) => [...prev, newHabit]);
    setNewTitle('');
    setIsAddingHabit(false);
  };

  // Calculate streak for a habit (consecutive days leading up to today or yesterday)
  const calculateStreak = (completedDates: string[]): number => {
    if (!completedDates.length) return 0;
    const dateSet = new Set(completedDates);
    let streak = 0;
    const checkDate = new Date();

    // Check if today is completed; if not, check from yesterday
    const todayFormatted = formatLocalDate(checkDate);
    if (!dateSet.has(todayFormatted)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const formatted = formatLocalDate(checkDate);
      if (dateSet.has(formatted)) {
        streak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Calculate monthly stats for a given habit in active month
  const getHabitMonthlyStats = (habit: Habit) => {
    const yearMonth = `${activeMonthDate.getFullYear()}-${String(
      activeMonthDate.getMonth() + 1
    ).padStart(2, '0')}`;
    const completedThisMonth = habit.completedDates.filter((d) =>
      d.startsWith(yearMonth)
    ).length;
    const totalDaysInMonth = monthDays.length;
    const percentage =
      totalDaysInMonth > 0
        ? Math.round((completedThisMonth / totalDaysInMonth) * 100)
        : 0;

    return {
      completedCount: completedThisMonth,
      totalDays: totalDaysInMonth,
      percentage,
    };
  };

  // Today's summary stats
  const todayStats = useMemo(() => {
    const total = habits.length;
    const completed = habits.filter((h) => h.completedDates.includes(todayStr)).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, rate };
  }, [habits, todayStr]);

  // Overall monthly average completion
  const overallMonthStats = useMemo(() => {
    if (habits.length === 0) return { avgRate: 0, totalCheckins: 0, bestHabit: null };
    let totalCheckins = 0;
    let totalPct = 0;
    let bestHabit: { title: string; pct: number } | null = null;

    habits.forEach((h) => {
      const stats = getHabitMonthlyStats(h);
      totalCheckins += stats.completedCount;
      totalPct += stats.percentage;
      if (!bestHabit || stats.percentage > bestHabit.pct) {
        bestHabit = { title: h.title, pct: stats.percentage };
      }
    });

    const avgRate = Math.round(totalPct / habits.length);
    return { avgRate, totalCheckins, bestHabit };
  }, [habits, activeMonthDate, monthDays]);

  // Notify parent if callback provided
  useEffect(() => {
    if (onHabitCompletedChange) {
      onHabitCompletedChange(todayStats.completed, todayStats.total);
    }
  }, [todayStats, onHabitCompletedChange]);

  const inspectedHabit = habits.find((h) => h.id === inspectHabitId);

  return (
    <div
      id="habit-tracker-section"
      className={`rounded-[28px] p-5 sm:p-7 border-2 relative overflow-hidden transition-all ${
        isRohit
          ? 'bg-[#FFFDF7] border-[#8EC5FF] shadow-[0_6px_24px_rgba(8,43,99,0.08)]'
          : 'bg-[#FFFDF7] border-[#fbcfe8] shadow-[0_6px_24px_rgba(251,207,232,0.2)]'
      } ${className}`}
    >
      {/* Decorative Washi Tape */}
      <div className="absolute -top-1.5 left-8 z-10">
        <WashiTape
          color={isRohit ? 'blue' : 'pink'}
          angle={-2}
          className="w-24 h-4.5"
        />
      </div>
      <div className="absolute -top-1.5 right-12 z-10 hidden sm:block">
        <WashiTape color="yellow" angle={3} className="w-20 h-4" />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-b-2 border-dashed pb-4 mb-5 border-stone-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {isRohit ? (
              <CricketBatDoodle className="w-5 h-5 text-[#1769E0]" />
            ) : (
              <FlowerDoodle className="w-5 h-5 text-[#f43f5e]" />
            )}
            <h2
              className={`text-xl sm:text-2xl font-handwriting font-bold tracking-wide flex items-center gap-2 ${
                isRohit ? 'text-[#082B63]' : 'text-[#881337]'
              }`}
            >
              <span>
                {isRohit
                  ? 'Hitman Daily Habits & Routine Grid'
                  : 'Daily Habits & Routine Grid ♡'}
              </span>
              {isRohit ? (
                <Number45Sticker size="sm" />
              ) : (
                <SparkleDoodle className="w-4 h-4 text-[#f59e0b]" color="#f59e0b" />
              )}
            </h2>
          </div>
          <p
            className={`text-xs sm:text-sm font-handwriting font-semibold ${
              isRohit ? 'text-[#1769E0]' : 'text-[#e11d48]'
            }`}
          >
            {isRohit
              ? 'Consistency builds champions. Check off daily habits alongside your match goals.'
              : 'Small rituals repeated every day shape your future. Glow and stay disciplined ♡'}
          </p>
        </div>

        {/* Action Controls, View Switcher & Today Badge */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          {/* View Switcher: Weekly Grid vs Monthly History */}
          <div
            className={`flex items-center p-1 rounded-2xl border text-xs font-handwriting font-bold shadow-2xs ${
              isRohit
                ? 'bg-[#EAF4FF] border-[#8EC5FF]'
                : 'bg-[#fff1f2] border-[#fda4af]'
            }`}
          >
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'weekly'
                  ? isRohit
                    ? 'bg-[#1769E0] text-white shadow-2xs'
                    : 'bg-[#f43f5e] text-white shadow-2xs'
                  : isRohit
                  ? 'text-[#082B63] hover:text-[#1769E0]'
                  : 'text-[#881337] hover:text-[#e11d48]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Weekly Grid</span>
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'monthly'
                  ? isRohit
                    ? 'bg-[#1769E0] text-white shadow-2xs'
                    : 'bg-[#f43f5e] text-white shadow-2xs'
                  : isRohit
                  ? 'text-[#082B63] hover:text-[#1769E0]'
                  : 'text-[#881337] hover:text-[#e11d48]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Monthly History</span>
            </button>
          </div>

          {/* Today's Habits Progress Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-handwriting font-bold shadow-2xs ${
              isRohit
                ? 'bg-[#EAF4FF] border-[#8EC5FF] text-[#082B63]'
                : 'bg-[#fff1f2] border-[#fda4af] text-[#881337]'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 ${isRohit ? 'text-[#1769E0]' : 'text-[#f43f5e]'}`}
            />
            <span>
              Today: {todayStats.completed}/{todayStats.total} ({todayStats.rate}%)
            </span>
          </div>

          {/* Add Habit Button */}
          <button
            onClick={() => setIsAddingHabit((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-handwriting font-bold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
              isRohit
                ? 'bg-[#1769E0] hover:bg-[#082B63] text-white border border-[#082B63]'
                : 'bg-[#f43f5e] hover:bg-[#e11d48] text-white border border-[#be123c]'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isAddingHabit ? 'Cancel' : '+ New Habit'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Bar (Depends on Weekly or Monthly view) */}
      {viewMode === 'weekly' ? (
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap bg-white/70 p-2.5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${isRohit ? 'text-[#1769E0]' : 'text-[#f43f5e]'}`} />
            <span
              className={`text-xs sm:text-sm font-handwriting font-bold ${
                isRohit ? 'text-[#082B63]' : 'text-[#881337]'
              }`}
            >
              Weekly Grid: {weekRangeLabel}
            </span>
            {weekOffset === 0 && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Active Week
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer hover:scale-105 ${
                isRohit
                  ? 'bg-[#EAF4FF] hover:bg-[#D8ECFF] border-[#8EC5FF] text-[#082B63]'
                  : 'bg-[#fff1f2] hover:bg-[#ffe4e6] border-[#fda4af] text-[#be123c]'
              }`}
              title="Previous week"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className={`px-2.5 py-1 rounded-xl text-xs font-handwriting font-bold border transition-all cursor-pointer hover:scale-105 ${
                weekOffset === 0
                  ? isRohit
                    ? 'bg-[#1769E0] text-white border-[#082B63]'
                    : 'bg-[#f43f5e] text-white border-[#be123c]'
                  : isRohit
                  ? 'bg-[#EAF4FF] border-[#8EC5FF] text-[#082B63]'
                  : 'bg-[#fff1f2] border-[#fda4af] text-[#be123c]'
              }`}
            >
              Current Week
            </button>
            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer hover:scale-105 ${
                isRohit
                  ? 'bg-[#EAF4FF] hover:bg-[#D8ECFF] border-[#8EC5FF] text-[#082B63]'
                  : 'bg-[#fff1f2] hover:bg-[#ffe4e6] border-[#fda4af] text-[#be123c]'
              }`}
              title="Next week"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      ) : (
        /* Monthly History Sub-Bar & Month Summary Cards */
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between gap-3 flex-wrap bg-white/80 p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <CalendarDays
                className={`w-4 h-4 ${isRohit ? 'text-[#1769E0]' : 'text-[#f43f5e]'}`}
              />
              <span
                className={`text-sm sm:text-base font-handwriting font-bold ${
                  isRohit ? 'text-[#082B63]' : 'text-[#881337]'
                }`}
              >
                Monthly History: {monthYearLabel}
              </span>
              {monthOffset === 0 && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Current Month
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMonthOffset((prev) => prev - 1)}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer hover:scale-105 ${
                  isRohit
                    ? 'bg-[#EAF4FF] hover:bg-[#D8ECFF] border-[#8EC5FF] text-[#082B63]'
                    : 'bg-[#fff1f2] hover:bg-[#ffe4e6] border-[#fda4af] text-[#be123c]'
                }`}
                title="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                onClick={() => setMonthOffset(0)}
                className={`px-3 py-1 rounded-xl text-xs font-handwriting font-bold border transition-all cursor-pointer hover:scale-105 ${
                  monthOffset === 0
                    ? isRohit
                      ? 'bg-[#1769E0] text-white border-[#082B63]'
                      : 'bg-[#f43f5e] text-white border-[#be123c]'
                    : isRohit
                    ? 'bg-[#EAF4FF] border-[#8EC5FF] text-[#082B63]'
                    : 'bg-[#fff1f2] border-[#fda4af] text-[#be123c]'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setMonthOffset((prev) => prev + 1)}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer hover:scale-105 ${
                  isRohit
                    ? 'bg-[#EAF4FF] hover:bg-[#D8ECFF] border-[#8EC5FF] text-[#082B63]'
                    : 'bg-[#fff1f2] hover:bg-[#ffe4e6] border-[#fda4af] text-[#be123c]'
                }`}
                title="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Monthly Performance Badges Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                isRohit
                  ? 'bg-white border-[#8EC5FF]/80 text-[#082B63]'
                  : 'bg-white border-[#fda4af]/80 text-[#881337]'
              }`}
            >
              <div>
                <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
                  Monthly Consistency
                </span>
                <span className="text-xl font-handwriting font-bold">
                  {overallMonthStats.avgRate}% avg
                </span>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isRohit ? 'bg-[#EAF4FF] text-[#1769E0]' : 'bg-[#fff1f2] text-[#f43f5e]'
                }`}
              >
                <Percent className="w-4 h-4" />
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                isRohit
                  ? 'bg-white border-[#8EC5FF]/80 text-[#082B63]'
                  : 'bg-white border-[#fda4af]/80 text-[#881337]'
              }`}
            >
              <div>
                <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
                  Check-ins Logged
                </span>
                <span className="text-xl font-handwriting font-bold">
                  {overallMonthStats.totalCheckins} check-ins
                </span>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isRohit ? 'bg-[#EAF4FF] text-[#1769E0]' : 'bg-[#fff1f2] text-[#f43f5e]'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                isRohit
                  ? 'bg-white border-[#8EC5FF]/80 text-[#082B63]'
                  : 'bg-white border-[#fda4af]/80 text-[#881337]'
              }`}
            >
              <div className="min-w-0 pr-2">
                <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
                  Leading Habit
                </span>
                <span className="text-sm font-handwriting font-bold truncate block">
                  {overallMonthStats.bestHabit
                    ? `${overallMonthStats.bestHabit.title} (${overallMonthStats.bestHabit.pct}%)`
                    : 'No data yet'}
                </span>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isRohit ? 'bg-[#FFF9E6] text-[#b45309]' : 'bg-[#fff1f2] text-[#e11d48]'
                }`}
              >
                <Trophy className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline Form to Add a Habit */}
      {isAddingHabit && (
        <form
          onSubmit={handleCreateHabit}
          className={`p-4 rounded-2xl border-2 mb-5 space-y-3 shadow-xs animate-in fade-in duration-200 ${
            isRohit
              ? 'bg-[#EAF4FF]/80 border-[#8EC5FF]'
              : 'bg-[#fff1f2]/80 border-[#fda4af]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-handwriting font-bold uppercase tracking-wider ${
                isRohit ? 'text-[#082B63]' : 'text-[#881337]'
              }`}
            >
              + Create New Daily Routine Habit
            </span>
            <button
              type="button"
              onClick={() => setIsAddingHabit(false)}
              className="text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Habit title (e.g. Morning Jog, Reading, Practice)..."
                required
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
              />
            </div>

            <div>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
              >
                <option value="Routine">Routine</option>
                <option value="Fitness">Fitness</option>
                <option value="Health">Health</option>
                <option value="Mindset">Mindset</option>
                <option value="Focus">Focus</option>
                <option value="Cricket">Cricket</option>
                <option value="Learning">Learning</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="px-2.5 py-2 text-sm bg-white rounded-xl border border-stone-300 focus:outline-none"
              >
                <option value="⭐">⭐ Star</option>
                <option value="🏃">🏃 Run</option>
                <option value="🏏">🏏 Bat</option>
                <option value="💧">💧 Water</option>
                <option value="📚">📚 Book</option>
                <option value="⚡">⚡ Focus</option>
                <option value="🌸">🌸 Flower</option>
                <option value="✨">✨ Sparkle</option>
                <option value="🧠">🧠 Mind</option>
                <option value="🧘">🧘 Zen</option>
              </select>

              <button
                type="submit"
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-handwriting font-bold text-white transition-all cursor-pointer ${
                  isRohit ? 'bg-[#1769E0] hover:bg-[#082B63]' : 'bg-[#f43f5e] hover:bg-[#e11d48]'
                }`}
              >
                Save Habit
              </button>
            </div>
          </div>
        </form>
      )}

      {/* VIEW 1: WEEKLY GRID TABLE (with Completion % Indicator & Month Peeker) */}
      {viewMode === 'weekly' && (
        <div className="overflow-x-auto rounded-2xl border border-stone-200/90 bg-white shadow-xs">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className={isRohit ? 'bg-[#EAF4FF]/80' : 'bg-[#fff1f2]/80'}>
                <th
                  className={`p-3.5 text-xs font-handwriting font-bold uppercase tracking-wider w-[240px] sm:w-[270px] ${
                    isRohit ? 'text-[#082B63]' : 'text-[#881337]'
                  }`}
                >
                  Habit / Routine
                </th>

                {/* 7 Days Columns Headers */}
                {weekDays.map((day) => (
                  <th
                    key={day.date}
                    className={`p-2 text-center text-xs font-handwriting font-bold border-l border-stone-200/60 ${
                      day.isToday
                        ? isRohit
                          ? 'bg-[#1769E0] text-white shadow-2xs'
                          : 'bg-[#f43f5e] text-white shadow-2xs'
                        : isRohit
                        ? 'text-[#082B63]'
                        : 'text-[#881337]'
                    }`}
                  >
                    <div className="leading-tight">
                      <span className="block text-[11px] uppercase tracking-wider">
                        {day.dayName}
                      </span>
                      <span className="block text-xs font-mono font-bold mt-0.5">
                        {day.dayNumber}
                      </span>
                      {day.isToday && (
                        <span className="inline-block text-[9px] font-bold uppercase tracking-tight opacity-95">
                          Today
                        </span>
                      )}
                    </div>
                  </th>
                ))}

                {/* Completion % Indicator Column */}
                <th
                  className={`p-3 text-center text-xs font-handwriting font-bold uppercase tracking-wider w-[120px] border-l border-stone-200/60 ${
                    isRohit ? 'text-[#082B63]' : 'text-[#881337]'
                  }`}
                >
                  Completion %
                </th>

                {/* Month History Action Column */}
                <th
                  className={`p-3 text-center text-xs font-handwriting font-bold uppercase tracking-wider w-[90px] border-l border-stone-200/60 ${
                    isRohit ? 'text-[#082B63]' : 'text-[#881337]'
                  }`}
                >
                  History
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100 font-sans">
              {habits.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="p-8 text-center text-stone-400 font-handwriting text-sm"
                  >
                    No habits added yet. Click "+ New Habit" to begin tracking your daily consistency!
                  </td>
                </tr>
              ) : (
                habits.map((habit) => {
                  const streak = calculateStreak(habit.completedDates);
                  const weekCompletions = weekDays.filter((d) =>
                    habit.completedDates.includes(d.date)
                  ).length;
                  const weekPct = Math.round((weekCompletions / 7) * 100);
                  const monthStats = getHabitMonthlyStats(habit);

                  // Color coding for completion rate indicator
                  const getPctBadgeStyle = (pct: number) => {
                    if (pct >= 80)
                      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    if (pct >= 50)
                      return isRohit
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200';
                    return 'bg-amber-50 text-amber-700 border-amber-200';
                  };

                  return (
                    <tr
                      key={habit.id}
                      className="hover:bg-stone-50/80 transition-colors group"
                    >
                      {/* Habit Info & Streak */}
                      <td className="p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base select-none shrink-0">
                              {habit.icon || '⭐'}
                            </span>
                            <div className="min-w-0">
                              <span
                                className={`text-xs sm:text-sm font-handwriting font-bold block truncate ${
                                  isRohit ? 'text-[#082B63]' : 'text-stone-800'
                                }`}
                              >
                                {habit.title}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600">
                                  {habit.category}
                                </span>
                                {streak > 0 && (
                                  <span className="text-[10px] font-bold font-mono text-amber-600 flex items-center gap-0.5">
                                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                                    {streak}d streak
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Delete Action (visible on hover) */}
                          <button
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 rounded-md transition-all cursor-pointer"
                            title="Delete habit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* 7 Day Toggle Cells */}
                      {weekDays.map((day) => {
                        const isCompleted = habit.completedDates.includes(day.date);

                        return (
                          <td
                            key={day.date}
                            className={`p-2 text-center border-l border-stone-100 ${
                              day.isToday ? 'bg-amber-50/20' : ''
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleHabitDate(habit.id, day.date)}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl mx-auto flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xs ${
                                isCompleted
                                  ? isRohit
                                    ? 'bg-[#1769E0] text-white shadow-md shadow-blue-500/30'
                                    : 'bg-[#f43f5e] text-white shadow-md shadow-rose-400/30'
                                  : day.isToday
                                  ? isRohit
                                    ? 'border-2 border-dashed border-[#1769E0] hover:bg-blue-50/80 text-transparent'
                                    : 'border-2 border-dashed border-[#f43f5e] hover:bg-rose-50/80 text-transparent'
                                  : 'border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-transparent'
                              }`}
                              title={`${habit.title} on ${day.dayName}, ${day.date}: ${
                                isCompleted
                                  ? 'Completed (Click to uncheck)'
                                  : 'Click to complete'
                              }`}
                            >
                              {isCompleted && (
                                <Check className="w-4 h-4 stroke-[3]" />
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {/* ENHANCED: Completion Percentage Indicator */}
                      <td className="p-3 text-center border-l border-stone-100">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-mono font-bold border shadow-2xs ${getPctBadgeStyle(
                              weekPct
                            )}`}
                          >
                            {weekPct}%
                          </span>
                          <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isRohit ? 'bg-[#1769E0]' : 'bg-[#f43f5e]'
                              }`}
                              style={{ width: `${weekPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {weekCompletions}/7 days
                          </span>
                        </div>
                      </td>

                      {/* ENHANCED: Small Monthly History Button & Quick Stats */}
                      <td className="p-3 text-center border-l border-stone-100">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => setInspectHabitId(habit.id)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-handwriting font-bold border transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center gap-1 whitespace-nowrap ${
                              isRohit
                                ? 'bg-[#EAF4FF] hover:bg-[#D8ECFF] text-[#082B63] border-[#8EC5FF]'
                                : 'bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#881337] border-[#fda4af]'
                            }`}
                            title="View full month calendar for this habit"
                          >
                            <CalendarDays className="w-3 h-3" />
                            <span>{monthStats.percentage}% Mo</span>
                          </button>
                          <span className="text-[9px] text-stone-400 font-mono">
                            {monthStats.completedCount}/{monthStats.totalDays}d
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: FULL MONTHLY HISTORY MATRIX & HEATMAP */}
      {viewMode === 'monthly' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-stone-200/90 bg-white shadow-xs">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className={isRohit ? 'bg-[#EAF4FF]/80' : 'bg-[#fff1f2]/80'}>
                  <th
                    className={`p-3 text-xs font-handwriting font-bold uppercase tracking-wider w-[220px] ${
                      isRohit ? 'text-[#082B63]' : 'text-[#881337]'
                    }`}
                  >
                    Habit
                  </th>
                  <th
                    className={`p-3 text-center text-xs font-handwriting font-bold uppercase tracking-wider w-[120px] border-l border-stone-200/60 ${
                      isRohit ? 'text-[#082B63]' : 'text-[#881337]'
                    }`}
                  >
                    Month Rate %
                  </th>
                  <th
                    className={`p-3 text-left text-xs font-handwriting font-bold uppercase tracking-wider border-l border-stone-200/60 ${
                      isRohit ? 'text-[#082B63]' : 'text-[#881337]'
                    }`}
                  >
                    Monthly History Grid ({monthYearLabel})
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 font-sans">
                {habits.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-8 text-center text-stone-400 font-handwriting text-sm"
                    >
                      No habits to display in monthly view.
                    </td>
                  </tr>
                ) : (
                  habits.map((habit) => {
                    const stats = getHabitMonthlyStats(habit);

                    return (
                      <tr
                        key={habit.id}
                        className="hover:bg-stone-50/70 transition-colors"
                      >
                        {/* Habit Title */}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base select-none">
                              {habit.icon || '⭐'}
                            </span>
                            <div className="min-w-0">
                              <span
                                className={`text-xs font-handwriting font-bold block truncate ${
                                  isRohit ? 'text-[#082B63]' : 'text-stone-800'
                                }`}
                              >
                                {habit.title}
                              </span>
                              <span className="text-[10px] text-stone-400">
                                {habit.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Completion Percentage Indicator */}
                        <td className="p-3 text-center border-l border-stone-100">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-mono font-bold border shadow-2xs ${
                                stats.percentage >= 80
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : stats.percentage >= 50
                                  ? isRohit
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {stats.percentage}%
                            </span>
                            <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isRohit ? 'bg-[#1769E0]' : 'bg-[#f43f5e]'
                                }`}
                                style={{ width: `${stats.percentage}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-stone-500 font-mono">
                              {stats.completedCount}/{stats.totalDays} days
                            </span>
                          </div>
                        </td>

                        {/* Interactive Month Heatmap / Mini Date Squares */}
                        <td className="p-3 border-l border-stone-100">
                          <div className="flex flex-wrap items-center gap-1 max-w-full">
                            {monthDays.map((day) => {
                              const isCompleted = habit.completedDates.includes(
                                day.date
                              );

                              return (
                                <button
                                  key={day.date}
                                  onClick={() => toggleHabitDate(habit.id, day.date)}
                                  className={`w-5.5 h-6 rounded-md text-[10px] font-mono font-bold flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-115 active:scale-90 ${
                                    isCompleted
                                      ? isRohit
                                        ? 'bg-[#1769E0] text-white shadow-2xs'
                                        : 'bg-[#f43f5e] text-white shadow-2xs'
                                      : day.isToday
                                      ? isRohit
                                        ? 'border border-[#1769E0] bg-blue-50/70 text-[#1769E0]'
                                        : 'border border-[#f43f5e] bg-rose-50/70 text-[#f43f5e]'
                                      : day.isFuture
                                      ? 'bg-stone-50 text-stone-300 border border-stone-100'
                                      : 'bg-stone-100/70 text-stone-600 hover:bg-stone-200 border border-stone-200/60'
                                  }`}
                                  title={`${habit.title}: Day ${day.dayNum} (${day.date}) - ${
                                    isCompleted ? 'Completed' : 'Not completed'
                                  } (Click to toggle)`}
                                >
                                  <span>{day.dayNum}</span>
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3 text-xs font-handwriting text-stone-500 justify-between flex-wrap">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span
                  className={`w-3 h-3 rounded-sm ${
                    isRohit ? 'bg-[#1769E0]' : 'bg-[#f43f5e]'
                  }`}
                />
                <span>Completed</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-stone-100 border border-stone-300" />
                <span>Missed / Pending</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm border border-emerald-500 bg-emerald-50" />
                <span>Today</span>
              </span>
            </div>
            <span>Click any day square to toggle completion for that date.</span>
          </div>
        </div>
      )}

      {/* MODAL: SINGLE HABIT MONTH HISTORY INSPECTOR */}
      {inspectedHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 bg-white border-2 shadow-2xl space-y-4 relative ${
              isRohit ? 'border-[#8EC5FF]' : 'border-[#fda4af]'
            }`}
          >
            {/* Close button */}
            <button
              onClick={() => setInspectHabitId(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-2xs ${
                  isRohit ? 'bg-[#EAF4FF]' : 'bg-[#fff1f2]'
                }`}
              >
                {inspectedHabit.icon || '⭐'}
              </div>
              <div>
                <h3
                  className={`text-lg font-handwriting font-bold ${
                    isRohit ? 'text-[#082B63]' : 'text-[#881337]'
                  }`}
                >
                  {inspectedHabit.title}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {inspectedHabit.category} • Target {inspectedHabit.targetDaysPerWeek}d/week
                </p>
              </div>
            </div>

            {/* Monthly Stats Summary for this Habit */}
            {(() => {
              const stats = getHabitMonthlyStats(inspectedHabit);
              const streak = calculateStreak(inspectedHabit.completedDates);

              return (
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
                    <span className="text-[10px] text-stone-400 uppercase font-mono block">
                      Month Rate
                    </span>
                    <span
                      className={`text-xl font-handwriting font-bold ${
                        isRohit ? 'text-[#1769E0]' : 'text-[#f43f5e]'
                      }`}
                    >
                      {stats.percentage}%
                    </span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
                    <span className="text-[10px] text-stone-400 uppercase font-mono block">
                      Completed
                    </span>
                    <span className="text-xl font-handwriting font-bold text-stone-800">
                      {stats.completedCount}/{stats.totalDays}d
                    </span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
                    <span className="text-[10px] text-stone-400 uppercase font-mono block">
                      Current Streak
                    </span>
                    <span className="text-xl font-handwriting font-bold text-amber-600 flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4 fill-amber-500" />
                      {streak}d
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Monthly Calendar View for this Habit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-handwriting font-bold text-stone-600">
                <span>{monthYearLabel} Calendar</span>
                <span className="text-[11px] text-stone-400">
                  Tap to mark / unmark any day
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 p-3 bg-stone-50/70 rounded-2xl border border-stone-200/70">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayChar, i) => (
                  <div
                    key={i}
                    className="text-center text-[10px] font-mono font-bold text-stone-400 pb-1"
                  >
                    {dayChar}
                  </div>
                ))}

                {monthDays.map((day) => {
                  const isCompleted = inspectedHabit.completedDates.includes(
                    day.date
                  );

                  return (
                    <button
                      key={day.date}
                      onClick={() =>
                        toggleHabitDate(inspectedHabit.id, day.date)
                      }
                      className={`h-9 rounded-xl flex flex-col items-center justify-center text-xs font-mono font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs ${
                        isCompleted
                          ? isRohit
                            ? 'bg-[#1769E0] text-white shadow-blue-400/30'
                            : 'bg-[#f43f5e] text-white shadow-rose-400/30'
                          : day.isToday
                          ? isRohit
                            ? 'border-2 border-[#1769E0] bg-white text-[#1769E0]'
                            : 'border-2 border-[#f43f5e] bg-white text-[#f43f5e]'
                          : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <span>{day.dayNum}</span>
                      {isCompleted && (
                        <Check className="w-2.5 h-2.5 stroke-[3] -mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setInspectHabitId(null)}
                className={`px-4 py-2 text-xs font-handwriting font-bold rounded-xl text-white cursor-pointer ${
                  isRohit ? 'bg-[#082B63]' : 'bg-[#be123c]'
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Motivational Footer Note */}
      <div className="mt-3.5 flex items-center justify-between text-xs font-handwriting text-stone-500">
        <div className="flex items-center gap-1.5">
          <Sparkles
            className={`w-3.5 h-3.5 ${isRohit ? 'text-[#1769E0]' : 'text-[#f43f5e]'}`}
          />
          <span>
            {viewMode === 'weekly'
              ? 'Click any day cell to check off habits. Use "History" to peek into full month consistency.'
              : 'Monthly history highlights your consistency trends and completion percentages.'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Consistency fuels high performance every day</span>
        </div>
      </div>
    </div>
  );
};
