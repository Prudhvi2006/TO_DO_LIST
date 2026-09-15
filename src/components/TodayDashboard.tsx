import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Bell,
  Plus,
  Trash2,
  Edit2,
  Flame,
  TrendingUp,
  Target,
  Sparkles,
  Calendar,
  AlertTriangle,
  MailCheck,
  Filter,
  X,
  Search,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TodayDashboardData, ProductivityGraphData, Todo, User } from '../types.ts';
import { checkTaskTimeCompleted } from '../lib/timeUtils.ts';
import { TaskToggle } from './TaskToggle.tsx';
import {
  CalendarDoodle,
  HeartDoodle,
  SparkleDoodle,
  FlowerDoodle,
  BowDoodle,
  WashiTape,
} from './PlannerDoodles.tsx';
import {
  CricketBallDoodle,
  CricketBatDoodle,
  TrophyDoodle,
  CrownDoodle,
  Number45Sticker,
  BlueHeartDoodle,
  RisingSunDoodle,
  CricketPitchDoodle,
  StarDoodle,
  AnimatedHitmanPullShot,
  AnimatedCricketBall,
  AnimatedCricketBat,
  AnimatedSixerBadge,
  AnimatedHitmanCap,
  AnimatedJersey45Badge,
  AnimatedHitmanCrown,
  AnimatedHitmanTrophy,
  HitmanCardMiniBadge,
  HitmanCardEmojiRow,
  RealRohitSticker,
  CardStickerBadge,
  MainCardStickers,
  RohitStickerShowcase,
} from './CricketDoodles.tsx';
import { isSpecialUser, isRohitUser } from '../lib/userTheme.ts';
import { HabitTracker } from './HabitTracker.tsx';

interface TodayDashboardProps {
  user: User;
  data: TodayDashboardData | null;
  graphData: ProductivityGraphData | null;
  onToggleTodo: (id: number) => Promise<void>;
  onDeleteTodo: (id: number) => Promise<void>;
  onEditTodo: (todo: Todo) => void;
  onOpenCreateModal: () => void;
  onFocusTask: (task: Todo) => void;
  onNavigateToPlanner?: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  user,
  data,
  graphData,
  onToggleTodo,
  onDeleteTodo,
  onEditTodo,
  onOpenCreateModal,
  onFocusTask,
  onNavigateToPlanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [mobileTab, setMobileTab] = useState<'tasks' | 'reminders'>('tasks');

  const handleToggle = (id: number) => {
    onToggleTodo(id);
  };

  // Determine greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${user.name} ☀️`;
    if (hour < 17) return `Good afternoon, ${user.name} 🌤️`;
    return `Good evening, ${user.name} 🌙`;
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const percentage = data?.percentage ?? 0;
  const totalCount = data?.totalCount ?? 0;
  const completedCount = data?.completedCount ?? 0;
  const remainingCount = data?.remainingCount ?? 0;
  const streak = data?.currentStreak ?? 0;
  const motivation = data?.motivationMessage || "Let's get started. One small task is enough.";

  const filteredTasks = useMemo(() => {
    if (!data?.tasks) return [];
    return data.tasks.filter((todo) => {
      if (statusFilter === 'pending' && todo.completed) return false;
      if (statusFilter === 'completed' && !todo.completed) return false;
      if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        todo.title.toLowerCase().includes(q) ||
        (todo.description && todo.description.toLowerCase().includes(q)) ||
        (todo.category && todo.category.toLowerCase().includes(q))
      );
    });
  }, [data?.tasks, searchQuery, statusFilter, priorityFilter]);

  const isSpecial = isSpecialUser(user?.email);
  const isRohit = isRohitUser(user?.email);

  return (
    <div id="today-dashboard-view" className="space-y-6">
      {/* Welcome Banner & Motivation - Rohit Sharma Hitman Theme vs Cute Pastel Stationery for Navya Sri */}
      {isRohit ? (
        <div className="relative bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border-2 border-[#8EC5FF] shadow-[0_8px_30px_rgba(8,43,99,0.1)] space-y-6 overflow-hidden">
          {/* Real Rohit Die-Cut Stickers (2 on Main Hero Card) */}
          <MainCardStickers leftPose="trophy" rightPose="pull_shot" size={72} />

          {/* Decorative washi tapes */}
          <div className="absolute -top-1.5 left-10 z-10">
            <WashiTape color="blue" angle={-3} className="w-24 h-5" />
          </div>
          <div className="absolute -top-1.5 right-12 z-10 hidden sm:block">
            <WashiTape color="yellow" angle={4} className="w-20 h-4" />
          </div>

          {/* Header section with Rohit branding and hero polaroid */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 pt-2">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              {/* Polaroid-framed Rohit Sharma portrait */}
              <div className="relative bg-white p-2 rounded-2xl shadow-md border border-[#8EC5FF]/80 -rotate-2 hover:rotate-0 transition-transform duration-300 shrink-0 hidden sm:block">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/98/Rohit_Sharma_Batting.jpg"
                  alt="Rohit Sharma Hitman"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="text-center mt-1">
                  <span className="font-handwriting font-bold text-[11px] text-[#082B63] whitespace-nowrap">
                    Hitman 45 💙
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-xs font-mono font-bold uppercase tracking-wider text-[#1769E0]">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <CricketBallDoodle className="w-3.5 h-3.5 shrink-0 text-[#1769E0]" />
                    <span>{formattedDate}</span>
                  </div>
                  <span className="text-[#8EC5FF] hidden sm:inline">•</span>
                  <span className="whitespace-nowrap bg-[#EAF4FF] text-[#082B63] px-2.5 py-0.5 rounded-lg border border-[#8EC5FF]/70 text-[11px] font-semibold">
                    {user.timezone}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  <CrownDoodle className="w-5 h-5 text-[#F4C95D] shrink-0" />
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-handwriting font-bold text-[#082B63] tracking-tight flex items-center gap-2 flex-wrap">
                    <span className="whitespace-nowrap">Rohit Sharma Fans</span>
                    <Number45Sticker size="sm" />
                  </h1>
                </div>

                <p className="text-xs sm:text-sm font-handwriting text-[#1769E0] font-semibold">
                  Plan your day like the Hitman — stay focused, stay consistent, keep winning.
                </p>

                {/* Fan badges */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-handwriting font-bold bg-[#EAF4FF] text-[#082B63] border border-[#8EC5FF] whitespace-nowrap shadow-2xs">
                    <CricketBatDoodle className="w-3.5 h-3.5 shrink-0" />
                    Hitman Mode ON 🔥
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-handwriting font-bold bg-[#FFF9E6] text-[#78350f] border border-[#F4C95D] whitespace-nowrap shadow-2xs">
                    <TrophyDoodle className="w-3.5 h-3.5 shrink-0" />
                    Small Steps. Big Innings.
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-handwriting font-bold bg-[#FFF0F5] text-[#9d174d] border border-[#F4B7C8] whitespace-nowrap shadow-2xs">
                    <BlueHeartDoodle className="w-3.5 h-3.5 shrink-0" color="#ec4899" />
                    45 — More than a Number
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0 w-full xl:w-auto pt-2 xl:pt-0">
              {onNavigateToPlanner && (
                <button
                  type="button"
                  onClick={onNavigateToPlanner}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-handwriting font-bold text-[#082B63] bg-[#EAF4FF] hover:bg-[#D4E9FF] border-2 border-[#8EC5FF] rounded-2xl shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                  title="View 7-day Weekly Grid & Task History"
                >
                  <Calendar className="w-4 h-4 text-[#1769E0] shrink-0" />
                  <span>Weekly Planner →</span>
                </button>
              )}

              <button
                id="quick-add-task-header-btn"
                onClick={onOpenCreateModal}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-handwriting font-bold text-white bg-[#1769E0] hover:bg-[#082B63] rounded-2xl shadow-md shadow-blue-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0 border border-[#082B63] whitespace-nowrap"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>+ Add Task</span>
              </button>
            </div>
          </div>

          {/* Special Motivational Note: SUN WILL RAISE AGAIN + Smile every body smile :) */}
          <div className="relative bg-white/90 rounded-2xl p-4 sm:p-5 border-2 border-[#8EC5FF]/80 shadow-xs overflow-hidden">
            {/* Real Rohit Die-Cut Stickers (2 on Motivational Card) */}
            <MainCardStickers leftPose="wave" rightPose="jersey_45_back" size={56} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <RisingSunDoodle className="w-7 h-7" />
                  <h2 className="text-xl sm:text-2xl font-handwriting font-bold text-[#082B63] tracking-wide">
                    SUN WILL RAISE AGAIN
                  </h2>
                </div>
                <p className="text-xs sm:text-sm font-handwriting text-[#1769E0] font-semibold">
                  No matter how dark the today is, a brighter tomorrow always comes.
                </p>
              </div>

              {/* Exact quote: Smile every body smile :) */}
              <div className="bg-[#FFF9E6] border-2 border-[#F4C95D] rounded-xl px-4 py-2 rotate-1 shadow-xs shrink-0 self-start sm:self-auto">
                <p className="font-handwriting font-bold text-xs sm:text-sm text-[#78350f] flex items-center gap-1.5">
                  <span>"Smile every body smile :)"</span>
                  <BlueHeartDoodle className="w-3.5 h-3.5" color="#1769E0" />
                </p>
                <span className="text-[10px] font-mono text-[#b45309]">Hitman Rohit Sharma</span>
              </div>
            </div>
          </div>

          {/* Real Rohit Sharma Sticker Album / Fan Showcase Strip */}
          <RohitStickerShowcase className="pt-1" />

          {/* Cricket Scoreboard Quick Stats Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
            {/* Today's completion - Runs */}
            <div className="rounded-[22px] p-4 bg-white border-2 border-[#8EC5FF] space-y-2 relative overflow-hidden shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-handwriting font-bold text-[#082B63] tracking-wide flex items-center gap-1">
                  <span>Match Progress</span>
                  <span className="text-[10px] animate-hitman-twinkle">⚡</span>
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#EAF4FF] flex items-center justify-center text-[#1769E0]">
                  <AnimatedHitmanCrown className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-handwriting font-bold text-[#082B63]">
                  {percentage}%
                </span>
                <span className="text-xs font-mono font-bold text-[#1769E0]">target</span>
                {percentage >= 100 && (
                  <span className="text-xs animate-hitman-six">🏆</span>
                )}
              </div>
              <div className="w-full h-2.5 bg-[#EAF4FF] rounded-full overflow-hidden p-0.5 border border-[#8EC5FF]">
                <div
                  className="h-full bg-linear-to-r from-[#8EC5FF] to-[#1769E0] rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                />
              </div>
            </div>

            {/* Completed - Boundaries */}
            <div className="rounded-[22px] p-4 bg-[#F0FFF4] border-2 border-[#86EFAC] space-y-2 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-handwriting font-bold text-[#14532d] tracking-wide flex items-center gap-1">
                  <span>Completed</span>
                  <span className="text-[10px] animate-hitman-twinkle">✨</span>
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16a34a]">
                  <AnimatedHitmanTrophy className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-handwriting font-bold text-[#14532d]">
                  {completedCount}
                </span>
                <span className="text-xs font-mono font-bold text-[#15803d]">of {totalCount} tasks</span>
                {completedCount > 0 && (
                  <AnimatedSixerBadge text="6" className="scale-75" />
                )}
              </div>
              <p className="text-[11px] font-handwriting text-[#16a34a] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
                Hitman Mentality 🔥
              </p>
            </div>

            {/* Remaining - Overs */}
            <div className="rounded-[22px] p-4 bg-[#FFFDF7] border-2 border-[#F4C95D] space-y-2 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-handwriting font-bold text-[#78350f] tracking-wide flex items-center gap-1">
                  <span>Remaining</span>
                  <AnimatedCricketBat className="w-3 h-3" />
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-[#d97706]">
                  <AnimatedCricketBall className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-handwriting font-bold text-[#78350f]">
                  {remainingCount}
                </span>
                <span className="text-xs font-mono font-bold text-[#b45309]">in the middle</span>
              </div>
              <p className="text-[11px] font-handwriting text-[#b45309] font-bold">
                Stay till the end 🏏
              </p>
            </div>

            {/* Streak - Match Series */}
            <div className="rounded-[22px] p-4 bg-[#FFF5F7] border-2 border-[#F4B7C8] space-y-2 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-handwriting font-bold text-[#9d174d] tracking-wide flex items-center gap-1">
                  <span>Series Streak</span>
                  <span className="text-xs animate-hitman-pull">🔥</span>
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#FCE7F3] flex items-center justify-center text-[#db2777]">
                  <AnimatedJersey45Badge size="sm" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-handwriting font-bold text-[#9d174d]">
                  {streak > 0 ? streak : 0}
                </span>
                <span className="text-xs font-mono font-bold text-[#be185d]">
                  {streak > 0 ? 'Matches 🔥' : 'Matches'}
                </span>
              </div>
              <p className="text-[11px] font-handwriting text-[#be185d] font-bold">
                Same Passion Every Match 💙
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Cute Pastel Stationery Scrapbook Theme for Navya Sri */
        <div className="relative bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border-2 border-[#fbcfe8] shadow-[0_8px_30px_rgba(251,207,232,0.22)] space-y-6 overflow-hidden">
          {/* Decorative washi tapes */}
          <div className="absolute -top-1.5 left-10 z-10">
            <WashiTape color="pink" angle={-3} className="w-24 h-5" />
          </div>
          <div className="absolute -top-1.5 right-12 z-10 hidden sm:block">
            <WashiTape color="yellow" angle={4} className="w-20 h-4" />
          </div>

          {/* Header section */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 pt-2">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              {/* Cute stationery Polaroid badge */}
              <div className="relative bg-white p-2 rounded-2xl shadow-md border border-[#fbcfe8] -rotate-2 hover:rotate-0 transition-transform duration-300 shrink-0 hidden sm:block">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#fce7f3] rounded-xl flex flex-col items-center justify-center text-center p-2 border border-[#fecdd3]">
                  <FlowerDoodle className="w-8 h-8 text-[#f43f5e]" />
                  <span className="text-[10px] font-handwriting font-bold text-[#be123c] mt-1 whitespace-nowrap">
                    Happy Day ✨
                  </span>
                </div>
                <div className="text-center mt-1">
                  <span className="font-handwriting font-bold text-[11px] text-[#881337] whitespace-nowrap">
                    Navya Sri ♡
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-xs font-mono font-bold uppercase tracking-wider text-[#e11d48]">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <HeartDoodle className="w-3.5 h-3.5 shrink-0" color="#f43f5e" />
                    <span>{formattedDate}</span>
                  </div>
                  <span className="text-[#fda4af] hidden sm:inline">•</span>
                  <span className="whitespace-nowrap bg-[#fff1f2] text-[#881337] px-2.5 py-0.5 rounded-lg border border-[#fda4af]/70 text-[11px] font-semibold">
                    {user.timezone}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  <SparkleDoodle className="w-5 h-5 text-[#f59e0b] shrink-0" color="#f59e0b" />
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-handwriting font-bold text-[#881337] tracking-tight flex items-center gap-2 flex-wrap">
                    <span className="whitespace-nowrap">Hello, {user.name || 'Navya Sri'}</span>
                    <HeartDoodle className="w-5 h-5 text-[#f43f5e] shrink-0" color="#f43f5e" />
                  </h1>
                </div>

                <p className="text-xs sm:text-sm font-handwriting text-[#e11d48] font-semibold">
                  Organize your goals, celebrate every win, and smile brightly today ♡
                </p>

                {/* Cute pastel badges */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-handwriting font-bold bg-[#fff1f2] text-[#9f1239] border border-[#fecdd3] whitespace-nowrap shadow-2xs">
                    <FlowerDoodle className="w-3.5 h-3.5 shrink-0" />
                    Cute Stationery Mode 🌸
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-handwriting font-bold bg-[#fffdf7] text-[#9a3412] border border-[#fed7aa] whitespace-nowrap shadow-2xs">
                    <SparkleDoodle className="w-3.5 h-3.5 shrink-0" color="#ea580c" />
                    Small steps, big dreams
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-handwriting font-bold bg-[#faf5ff] text-[#6b21a8] border border-[#e9d5ff] whitespace-nowrap shadow-2xs">
                    <BowDoodle className="w-4 h-3.5 shrink-0" color="#a855f7" />
                    Stay Radiant & Happy ✨
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0 w-full xl:w-auto pt-2 xl:pt-0">
              {onNavigateToPlanner && (
                <button
                  type="button"
                  onClick={onNavigateToPlanner}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-handwriting font-bold text-[#881337] bg-[#fff1f2] hover:bg-[#ffe4e6] border-2 border-[#fda4af] rounded-2xl shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                  title="View 7-day Weekly Grid & Task History"
                >
                  <Calendar className="w-4 h-4 text-[#f43f5e] shrink-0" />
                  <span>Weekly Planner →</span>
                </button>
              )}

              <button
                id="quick-add-task-header-btn"
                onClick={onOpenCreateModal}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-handwriting font-bold text-white bg-[#f43f5e] hover:bg-[#e11d48] rounded-2xl shadow-md shadow-rose-400/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0 border border-[#be123c] whitespace-nowrap"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>+ Add Task</span>
              </button>
            </div>
          </div>

          {/* Motivational Quote Banner */}
          <div className="relative bg-white/90 rounded-2xl p-4 sm:p-5 border-2 border-[#fbcfe8] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FlowerDoodle className="w-6 h-6 text-[#f43f5e]" />
                  <h2 className="text-xl sm:text-2xl font-handwriting font-bold text-[#881337] tracking-wide">
                    "One day at a time, you are doing wonderful ♡"
                  </h2>
                </div>
                <p className="text-xs sm:text-sm font-handwriting text-[#e11d48] font-semibold">
                  Every small task completed is a step toward your happiest self.
                </p>
              </div>

              <div className="bg-[#fff1f2] border-2 border-[#fda4af] rounded-xl px-4 py-2 rotate-1 shadow-xs shrink-0 self-start sm:self-auto">
                <p className="font-handwriting font-bold text-xs sm:text-sm text-[#9f1239] flex items-center gap-1.5">
                  <span>"Glow, grow, and smile ✨"</span>
                  <HeartDoodle className="w-3.5 h-3.5" color="#f43f5e" />
                </p>
                <span className="text-[10px] font-mono text-[#be123c]">Daily Note for Navya</span>
              </div>
            </div>
          </div>

          {/* Pastel Stationery Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
            {/* Daily Progress */}
            <div className="rounded-[22px] p-4 bg-white border-2 border-[#fbcfe8] space-y-2 relative overflow-hidden shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-handwriting font-bold text-[#881337] tracking-wide flex items-center gap-1">
                  <span>Daily Progress</span>
                  <SparkleDoodle className="w-3 h-3 text-[#f59e0b]" color="#f59e0b" />
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#fff1f2] flex items-center justify-center text-[#f43f5e]">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-handwriting font-bold text-[#881337]">
                  {percentage}%
                </span>
                <span className="text-xs font-mono font-bold text-[#e11d48]">completed</span>
                {percentage >= 100 && (
                  <span className="text-xs animate-bounce">🌸</span>
                )}
              </div>
              <div className="w-full h-2.5 bg-[#fff1f2] rounded-full overflow-hidden p-0.5 border border-[#fecdd3]">
                <div
                  className="h-full bg-linear-to-r from-[#fda4af] to-[#f43f5e] rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                />
              </div>
            </div>

            {/* Completed */}
            <div className="rounded-[22px] p-4 bg-[#F0FFF4] border-2 border-[#86EFAC] space-y-2 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-handwriting font-bold text-[#14532d] tracking-wide flex items-center gap-1">
                  <span>Completed</span>
                  <HeartDoodle className="w-3 h-3 text-[#16a34a]" color="#16a34a" />
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16a34a]">
                  <TrophyDoodle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-handwriting font-bold text-[#14532d]">
                  {completedCount}
                </span>
                <span className="text-xs font-mono font-bold text-[#15803d]">of {totalCount} tasks</span>
              </div>
              <p className="text-[11px] font-handwriting text-[#16a34a] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
                You are doing great! ✨
              </p>
            </div>

            {/* Remaining */}
            <div className="rounded-[22px] p-4 bg-[#FFFDF7] border-2 border-[#fed7aa] space-y-2 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-handwriting font-bold text-[#78350f] tracking-wide flex items-center gap-1">
                  <span>Remaining</span>
                  <Clock className="w-3 h-3 text-[#ea580c]" />
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#fff7ed] flex items-center justify-center text-[#ea580c]">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-handwriting font-bold text-[#78350f]">
                  {remainingCount}
                </span>
                <span className="text-xs font-mono font-bold text-[#b45309]">in progress</span>
              </div>
              <p className="text-[11px] font-handwriting text-[#b45309] font-bold">
                Take it easy, step by step ♡
              </p>
            </div>

            {/* Streak */}
            <div className="rounded-[22px] p-4 bg-[#FFF5F7] border-2 border-[#F4B7C8] space-y-2 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-handwriting font-bold text-[#9d174d] tracking-wide flex items-center gap-1">
                  <span>Daily Streak</span>
                  <Flame className="w-3.5 h-3.5 text-[#db2777]" />
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#FCE7F3] flex items-center justify-center text-[#db2777]">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-handwriting font-bold text-[#9d174d]">
                  {streak > 0 ? streak : 0}
                </span>
                <span className="text-xs font-mono font-bold text-[#be185d]">
                  {streak > 0 ? 'Days ✨' : 'Days'}
                </span>
              </div>
              <p className="text-[11px] font-handwriting text-[#be185d] font-bold">
                Consistency is magic ♡
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7-DAY PRODUCTIVITY GRAPH */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs relative overflow-hidden">
        {/* Real Rohit Die-Cut Stickers on Main Weekly Productivity Card */}
        {isRohit && (
          <MainCardStickers leftPose="bat_raise" rightPose="upper_cut" size={64} />
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 relative z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Weekly Productivity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real 7-day completion history generated directly from your database
            </p>
          </div>
          {graphData && (
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">
                <span>Weekly Rate:</span>
                <strong className="text-sm font-bold">{graphData.weeklyCompletionRate}%</strong>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
                <span>Completed:</span>
                <strong className="text-sm font-bold">{graphData.totalCompletedWeek}</strong>
              </div>
            </div>
          )}
        </div>

        {graphData && graphData.days && graphData.days.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={graphData.days}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="shortDay"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const day = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-semibold text-slate-200">{day.dayOfWeek}</p>
                          <p className="text-blue-300 font-medium">{day.completedTasks} tasks completed</p>
                          <p className="text-emerald-400 font-bold">{day.completionPercentage}% completion</p>
                          {day.isToday && (
                            <span className="inline-block bg-blue-600/60 text-blue-200 text-[10px] px-2 py-0.5 rounded-sm">
                              Current Day
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completionPercentage"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                  activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-medium text-slate-600">No database task history yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Add and complete tasks to start building your real productivity line chart!
            </p>
          </div>
        )}
      </div>

      {/* Mobile Segmented Switcher (Tasks vs Reminders) */}
      <div className="lg:hidden flex items-center bg-slate-200/70 p-1 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setMobileTab('tasks')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mobileTab === 'tasks'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Today's Tasks</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              mobileTab === 'tasks'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-slate-300/70 text-slate-700'
            }`}
          >
            {filteredTasks.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('reminders')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mobileTab === 'reminders'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-blue-600" />
          <span>Reminders</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              mobileTab === 'reminders'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-slate-300/70 text-slate-700'
            }`}
          >
            {data?.upcomingReminders?.length || 0}
          </span>
        </button>
      </div>

      {/* WEEKLY HABIT TRACKER GRID FOR RECURRING TASKS */}
      <HabitTracker userEmail={user?.email} />

      {/* TODAY'S TASKS & UPCOMING REMINDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Tasks List (2 cols) */}
        <div
          className={`rounded-3xl p-4 sm:p-6 md:p-8 space-y-4 lg:col-span-2 relative overflow-hidden ${
            isRohit
              ? 'bg-[#FFFDF7] border-2 border-[#8EC5FF] shadow-xs'
              : 'bg-[#FFFDF7] border-2 border-[#fbcfe8] shadow-[0_8px_30px_rgba(251,207,232,0.18)]'
          } ${
            mobileTab === 'reminders' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Real Rohit Die-Cut Stickers (2 on Today's Tasks Container) - Strictly Rohit only */}
          {isRohit && (
            <MainCardStickers leftPose="helmet_century" rightPose="knee_slide" size={58} />
          )}

          <div
            className={`flex items-center justify-between pb-4 relative z-10 ${
              isRohit ? 'border-b-2 border-[#8EC5FF]/50' : 'border-b-2 border-[#fbcfe8]/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <h2
                className={`text-lg font-bold tracking-tight flex items-center gap-2 ${
                  isRohit
                    ? 'font-handwriting text-[#082B63] text-xl'
                    : 'font-handwriting text-[#881337] text-xl'
                }`}
              >
                {isRohit ? (
                  <>
                    <CricketBatDoodle className="w-5 h-5 text-[#1769E0]" />
                    <span>Today's Hitman Tasks</span>
                  </>
                ) : (
                  <>
                    <FlowerDoodle className="w-5 h-5 text-[#f43f5e]" />
                    <span>Today's Tasks ♡</span>
                  </>
                )}
              </h2>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isRohit
                    ? 'bg-[#EAF4FF] text-[#082B63] font-mono font-bold border border-[#8EC5FF]'
                    : 'bg-[#fff1f2] text-[#881337] font-handwriting font-bold border border-[#fecdd3]'
                }`}
              >
                {filteredTasks.length}
              </span>
            </div>
            <button
              onClick={onOpenCreateModal}
              className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                isRohit
                  ? 'bg-[#1769E0] hover:bg-[#082B63] text-white font-handwriting font-bold shadow-xs'
                  : 'bg-linear-to-r from-[#f43f5e] to-[#e11d48] hover:from-[#e11d48] hover:to-[#be123c] text-white font-handwriting font-bold shadow-xs border border-[#be123c]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> {isRohit ? '+ New Task' : '+ Add Task ♡'}
            </button>
          </div>

          {/* Mobile & Desktop Responsive Search & Filter Bar */}
          <div className="w-full space-y-2.5">
            <div className="relative flex items-center w-full">
              <div
                className={`absolute left-3.5 pointer-events-none ${
                  isRohit ? 'text-[#1769E0]/50' : 'text-[#f43f5e]/60'
                }`}
              >
                <Search className="w-4 h-4" />
              </div>
              <input
                id="today-task-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isRohit
                    ? 'What do you want to do today?'
                    : "Search or plan today's tasks ♡..."
                }
                className={`w-full text-sm font-medium pl-10 pr-24 py-2.5 sm:py-3 rounded-2xl transition-all outline-none ${
                  isRohit
                    ? 'bg-white border-2 border-[#8EC5FF] focus:border-[#1769E0] text-[#082B63] placeholder:text-[#1769E0]/50 font-handwriting text-base'
                    : 'bg-[#fffdfa] border-2 border-[#fecdd3] focus:border-[#f43f5e] text-[#881337] placeholder:text-[#fda4af] font-handwriting text-base'
                }`}
              />
              <div className="absolute right-2.5 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setShowFilterDropdown((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    showFilterDropdown || statusFilter !== 'all' || priorityFilter !== 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-200/70 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Toggle filters"
                >
                  <Filter className="w-3 h-3" />
                  <span className="text-[11px]">Filter</span>
                  {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Filter Options */}
            {showFilterDropdown && (
              <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Filters</span>
                  {(statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setPriorityFilter('all');
                        setSearchQuery('');
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Reset all
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium text-[11px] w-14">Status:</span>
                    <div className="flex items-center gap-1">
                      {(['all', 'pending', 'completed'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-2.5 py-1 rounded-lg capitalize text-[11px] font-semibold transition-all cursor-pointer ${
                            statusFilter === s
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium text-[11px] w-14 sm:w-auto">Priority:</span>
                    <div className="flex items-center gap-1">
                      {(['all', 'high', 'medium', 'low'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPriorityFilter(p)}
                          className={`px-2.5 py-1 rounded-lg capitalize text-[11px] font-semibold transition-all cursor-pointer ${
                            priorityFilter === p
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active search tag & quick reset */}
            {(searchQuery.trim() || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
                <span>
                  Found {filteredTasks.length} matching task{filteredTasks.length === 1 ? '' : 's'}
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                  className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              </div>
            )}
          </div>

          {filteredTasks.length > 0 ? (
            <div className="space-y-2.5">
              {filteredTasks.map((todo, taskIndex) => {
                const dueInfo = checkTaskTimeCompleted(todo, user.timezone);
                const isAlerting = dueInfo.isDue && !todo.completed;

                return (
                  <div
                    key={todo.id}
                    className={`group flex items-start justify-between gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl border transition-all relative overflow-hidden ${
                      isRohit
                        ? todo.completed
                          ? 'bg-[#F0FFF4] border-2 border-[#86EFAC] text-[#15803d]/80 shadow-2xs'
                          : isAlerting
                          ? 'bg-[#FFF5F7] border-2 border-[#dc2626] ring-2 ring-red-200 shadow-md'
                          : 'bg-white border-2 border-[#8EC5FF] hover:border-[#1769E0] hover:shadow-md'
                        : todo.completed
                        ? 'bg-[#fff1f2]/60 border-2 border-[#fecdd3] text-[#881337]/60 shadow-2xs'
                        : isAlerting
                        ? 'bg-[#FFF5F7] border-2 border-[#dc2626] ring-2 ring-red-200 shadow-md'
                        : 'bg-white border-2 border-[#fbcfe8] hover:border-[#f43f5e] hover:shadow-sm'
                    }`}
                  >
                    {/* Subtle Hitman Watermark on hover for Rohit users only */}
                    {isRohit && !todo.completed && (
                      <div className="absolute right-2 -bottom-2 text-[32px] opacity-10 pointer-events-none group-hover:opacity-25 transition-opacity font-mono font-black select-none text-[#1769E0]">
                        45
                      </div>
                    )}

                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="mt-0.5 shrink-0 flex items-center">
                        <TaskToggle
                          id={`task-toggle-${todo.id}`}
                          checked={todo.completed}
                          onChange={() => handleToggle(todo.id)}
                          size="md"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-sm truncate font-handwriting font-bold text-base ${
                              isRohit
                                ? todo.completed
                                  ? 'line-through text-[#15803d]/70'
                                  : 'text-[#082B63]'
                                : todo.completed
                                ? 'line-through text-[#881337]/50'
                                : 'text-[#881337]'
                            }`}
                          >
                            {todo.title}
                          </p>

                          {/* Animated Hitman Emoji Row on Card for Rohit users only */}
                          {isRohit && (
                            <HitmanCardEmojiRow
                              taskIndex={taskIndex}
                              completed={todo.completed}
                              isAlerting={isAlerting}
                            />
                          )}

                          {/* Hitman Completed Badge - Strictly for Rohit */}
                          {isRohit && todo.completed && (
                            <span className="inline-flex items-center gap-1 bg-[#DCFCE7] text-[#16a34a] font-handwriting font-bold text-[11px] px-2 py-0.5 rounded-md border border-[#86EFAC] animate-hitman-pull">
                              <TrophyDoodle className="w-3 h-3 text-[#eab308]" />
                              Hitman mentality — DONE! 🔥💙
                            </span>
                          )}

                          {/* Sweet Stationery Completed Badge - For Navya Sri */}
                          {!isRohit && todo.completed && (
                            <span className="inline-flex items-center gap-1 bg-[#fff1f2] text-[#be123c] font-handwriting font-bold text-[11px] px-2 py-0.5 rounded-md border border-[#fecdd3]">
                              <HeartDoodle className="w-3 h-3 text-[#f43f5e]" color="#f43f5e" />
                              Completed with love ♡
                            </span>
                          )}

                          {isAlerting && (
                            <span className="inline-flex items-center gap-1 bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] font-cute font-bold text-[10px] px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e] animate-ping" />
                              ⏰ Time Completed ({dueInfo.displayText})
                            </span>
                          )}
                        </div>

                        {todo.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {todo.description}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                          {/* Animated Hitman Card Mini Badge for priority & flavor */}
                          {isRohit && !todo.completed && (
                            <HitmanCardMiniBadge
                              type={
                                todo.priority === 'high'
                                  ? 'pullshot'
                                  : todo.priority === 'medium'
                                  ? 'sixer'
                                  : 'bat'
                              }
                              label={
                                todo.priority === 'high'
                                  ? 'Pull Shot Power'
                                  : todo.priority === 'medium'
                                  ? 'Sixer Timing'
                                  : 'Middle the Ball'
                              }
                            />
                          )}

                          {todo.dueTime && (
                            <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                              <Clock className="w-3 h-3 text-slate-400" /> {todo.dueTime}
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold uppercase text-[10px] ${
                              todo.priority === 'high'
                                ? 'bg-red-50 text-red-700 border border-red-100'
                                : todo.priority === 'medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {todo.priority}
                          </span>

                          <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                            {todo.category}
                          </span>

                          {/* Compact Notification Status Badges */}
                          {todo.completionEmailSent && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-100">
                              <MailCheck className="w-3 h-3 text-emerald-600" /> Email sent
                            </span>
                          )}
                          {todo.reminderSent && (
                            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-medium border border-blue-100">
                              <Bell className="w-3 h-3 text-blue-600" /> Reminder sent
                            </span>
                          )}
                          {!todo.reminderSent && todo.reminderMinutesBefore && !todo.completed && (
                            <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              ⏰ Reminder set
                            </span>
                          )}
                          {todo.missedTaskEmailSent && !todo.completed && (
                            <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-md font-medium border border-red-100">
                              <AlertTriangle className="w-3 h-3 text-red-600" /> Missed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Real Die-Cut Sticker for each Task Card */}
                      {isRohit && (
                        <CardStickerBadge
                          taskIndex={taskIndex}
                          completed={todo.completed}
                          size={42}
                          className="shrink-0 transition-transform group-hover:scale-125"
                        />
                      )}

                      <button
                        id={`focus-task-btn-${todo.id}`}
                        type="button"
                        onClick={() => onFocusTask(todo)}
                        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                          isRohit
                            ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 border border-blue-200/70'
                            : 'text-[#be123c] bg-[#fff1f2] hover:bg-[#ffe4e6] hover:text-[#881337] border border-[#fecdd3]'
                        }`}
                        title="Activate Focus Mode with Pomodoro Timer"
                      >
                        <Target className={`w-3.5 h-3.5 shrink-0 ${isRohit ? 'text-blue-600' : 'text-[#f43f5e]'}`} />
                        <span className="hidden sm:inline">Focus</span>
                      </button>

                      {/* Action buttons: accessible on touch/mobile, hover on desktop */}
                      <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTodo(todo)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTodo(todo.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              {searchQuery.trim() || statusFilter !== 'all' || priorityFilter !== 'all' ? (
                <>
                  <p className="text-sm font-semibold text-slate-700">No tasks match your search</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                    }}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg cursor-pointer"
                  >
                    Clear Search & Filters
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-700">No tasks for today</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Enjoy your free time or click "Add Task" above to plan something productive!
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Reminders Card (1 col on desktop, tab/accordion on mobile) */}
        <div
          className={`rounded-3xl p-4 sm:p-6 space-y-4 flex flex-col justify-between relative overflow-hidden ${
            isRohit
              ? 'bg-white border border-slate-100 shadow-xs'
              : 'bg-[#FFFDF7] border-2 border-[#fbcfe8] shadow-[0_8px_30px_rgba(251,207,232,0.18)]'
          } ${
            mobileTab === 'tasks' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Real Rohit Die-Cut Stickers (2 on Upcoming Reminders Card) - Strictly Rohit only */}
          {isRohit && (
            <MainCardStickers leftPose="pull_shot" rightPose="trophy" size={52} />
          )}

          <div className="space-y-4 relative z-10">
            <div
              className={`flex items-center justify-between pb-3 ${
                isRohit ? 'border-b border-slate-100' : 'border-b-2 border-[#fce7f3]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    isRohit
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-[#fff1f2] text-[#f43f5e] border border-[#fecdd3]'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3
                    className={`text-sm font-bold tracking-tight ${
                      isRohit ? 'text-slate-900' : 'font-handwriting text-base text-[#881337]'
                    }`}
                  >
                    {isRohit ? 'Upcoming Reminders' : 'Upcoming Reminders ♡'}
                  </h3>
                  <p
                    className={`text-[10px] font-medium ${
                      isRohit ? 'text-slate-400' : 'text-[#9f1239]/70 font-cute'
                    }`}
                  >
                    Scheduled email alerts
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isRohit
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-[#fff1f2] text-[#be123c] border border-[#fecdd3] font-handwriting'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    isRohit ? 'bg-emerald-500' : 'bg-[#f43f5e]'
                  }`}
                />
                Active
              </span>
            </div>

            {data?.upcomingReminders && data.upcomingReminders.length > 0 ? (
              <div className="space-y-2.5">
                {data.upcomingReminders.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50/80 hover:bg-blue-50/40 border border-slate-200/70 rounded-2xl text-xs space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                        {item.reminderMinutesBefore
                          ? `${item.reminderMinutesBefore}m before`
                          : 'At due time'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.dueDate} {item.dueTime || ''}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <MailCheck className="w-3 h-3" /> Armed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-50/80 text-blue-500 flex items-center justify-center mx-auto">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">No Reminders Pending</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-[220px] mx-auto leading-relaxed">
                    Add tasks with a due time and reminder to receive automated emails.
                  </p>
                </div>
                <button
                  onClick={onOpenCreateModal}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-xl border border-blue-100 shadow-2xs cursor-pointer mt-1"
                >
                  <Plus className="w-3 h-3" /> Schedule a Task
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <span>Background scheduler sends emails at the configured reminder time even if your browser is closed.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
