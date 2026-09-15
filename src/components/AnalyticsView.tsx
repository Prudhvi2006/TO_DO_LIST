import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  BarChart3,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { AnalyticsData, ProductivityGraphData } from '../types.ts';
import { isRohitUser, isNavyaUser, isSpecialUser } from '../lib/userTheme.ts';
import {
  WashiTape,
  HeartDoodle,
  SparkleDoodle,
  FlowerDoodle,
  PencilIllustration,
} from './PlannerDoodles.tsx';

interface AnalyticsViewProps {
  analytics: AnalyticsData | null;
  graphData: ProductivityGraphData | null;
  userEmail?: string;
}

const MODERN_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
const CUTE_COLORS = ['#f43f5e', '#a855f7', '#38bdf8', '#34d399', '#f59e0b', '#ec4899'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, graphData, userEmail }) => {
  const isRohit = isRohitUser(userEmail);
  const isStationery = !isRohit; // Navya Sri and default users get Cute Pastel Pink Stationery theme

  const totalPlanned = analytics?.totalPlanned ?? 0;
  const totalCompleted = analytics?.totalCompleted ?? 0;
  const overallRate = analytics?.overallCompletionRate ?? 0;
  const weeklyRate = graphData?.weeklyCompletionRate ?? 0;
  const todayRate = graphData?.todayCompletionRate ?? 0;
  const currentStreak = analytics?.currentStreak ?? 0;
  const bestStreak = analytics?.bestStreak ?? 0;
  const mostProductiveDay = analytics?.mostProductiveDay || 'Start completing tasks to discover';

  // Prepare day-of-week data
  const dayChartData = analytics?.dayCounts
    ? Object.entries(analytics.dayCounts).map(([day, count]) => ({
        day: day.slice(0, 3),
        fullDay: day,
        completions: count,
      }))
    : [];

  // Prepare category data
  const categoryChartData = analytics?.categoryStats
    ? Object.entries(analytics.categoryStats).map(([name, stat]: [string, { total: number; completed: number }]) => ({
        name,
        completed: stat.completed,
        total: stat.total,
      }))
    : [];

  /* SPECIAL STATIONERY & HANDWRITTEN THEME */
  if (isStationery) {
    return (
      <div id="analytics-view" className="space-y-6">
        {/* Cute Header Card */}
        <div className="bg-[#fffdfa] rounded-[28px] p-6 sm:p-8 border-2 border-[#fbcfe8] shadow-[0_8px_30px_rgba(251,191,204,0.18)] space-y-6 relative overflow-hidden">
          {/* Washi Tape accents on header */}
          <div className="absolute -top-1.5 left-10 z-10">
            <WashiTape color="pink" angle={-2} className="w-24 h-4.5" />
          </div>
          <div className="absolute -top-1.5 right-12 z-10 hidden sm:block">
            <WashiTape color="yellow" angle={3} className="w-18 h-4" />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-dashed border-[#fce7f3] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-[#f43f5e]" />
                <h1 className="text-2xl sm:text-3xl font-handwriting font-bold text-[#881337] tracking-tight flex items-center gap-2">
                  <span>Productivity Journal & Analytics</span>
                  <HeartDoodle className="w-5 h-5 text-[#f43f5e] inline" color="#f43f5e" />
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-cute text-[#9f1239]/70 mt-1 flex items-center gap-1.5">
                <span>Recorded live from your personal planner database. Every step counts!</span>
                <SparkleDoodle className="w-3.5 h-3.5 text-[#fb7185] inline" color="#fb7185" />
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-handwriting font-bold px-3 py-1 bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] rounded-full shadow-2xs">
                ✨ Habit Streak: {currentStreak} days
              </span>
            </div>
          </div>

          {/* Top 4 Metric KPI Cards - Styled as Pastel Stationery Notes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Completion */}
            <div className="p-4 bg-[#fff1f2] rounded-[24px] border-2 border-[#fecdd3] shadow-2xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-handwriting font-bold text-[#be123c] mb-1">
                <span>Overall Rate ♡</span>
                <TrendingUp className="w-4 h-4 text-[#f43f5e]" />
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl sm:text-4xl font-handwriting font-bold text-[#be123c]">
                  {overallRate}%
                </span>
                <span className="text-[11px] font-cute text-[#be123c]/70">lifetime</span>
              </div>
              <p className="text-[11px] font-cute text-[#9f1239]/80 mt-1">
                {totalCompleted} of {totalPlanned} tasks finished
              </p>
            </div>

            {/* Weekly Rate */}
            <div className="p-4 bg-[#faf5ff] rounded-[24px] border-2 border-[#e9d5ff] shadow-2xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-handwriting font-bold text-[#7e22ce] mb-1">
                <span>Weekly Habit ✨</span>
                <Calendar className="w-4 h-4 text-[#a855f7]" />
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl sm:text-4xl font-handwriting font-bold text-[#7e22ce]">
                  {weeklyRate}%
                </span>
                <span className="text-[11px] font-cute text-[#7e22ce]/70">past 7 days</span>
              </div>
              <p className="text-[11px] font-cute text-[#6b21a8]/80 mt-1">
                {graphData?.totalCompletedWeek ?? 0} finished this week
              </p>
            </div>

            {/* Today's Rate */}
            <div className="p-4 bg-[#fdf4ff] rounded-[24px] border-2 border-[#f5d0fe] shadow-2xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-handwriting font-bold text-[#a21caf] mb-1">
                <span>Today's Rhythm ♡</span>
                <CheckCircle2 className="w-4 h-4 text-[#c026d3]" />
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl sm:text-4xl font-handwriting font-bold text-[#a21caf]">
                  {todayRate}%
                </span>
                <span className="text-[11px] font-cute text-[#a21caf]/70">today</span>
              </div>
              <p className="text-[11px] font-cute text-[#86198f]/80 mt-1">
                {graphData?.todayCompletedTasks ?? 0} of {graphData?.todayTotalTasks ?? 0} completed
              </p>
            </div>

            {/* Best Streak */}
            <div className="p-4 bg-[#fffbeb] rounded-[24px] border-2 border-[#fde68a] shadow-2xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-handwriting font-bold text-[#b45309] mb-1">
                <span>Best Streak 🔥</span>
                <Award className="w-4 h-4 text-[#d97706]" />
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl sm:text-4xl font-handwriting font-bold text-[#b45309]">
                  {bestStreak}
                </span>
                <span className="text-[11px] font-cute text-[#b45309]/70">days record</span>
              </div>
              <p className="text-[11px] font-cute text-[#92400e]/80 mt-1">
                Current active: {currentStreak} days
              </p>
            </div>
          </div>
        </div>

        {/* 2 Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completions by Day of Week */}
          <div className="bg-[#fffdfa] rounded-[28px] p-6 md:p-8 border-2 border-[#fbcfe8] shadow-[0_8px_30px_rgba(251,191,204,0.15)] space-y-4 relative overflow-hidden">
            <div className="absolute -top-1.5 left-10 z-10">
              <WashiTape color="lavender" angle={-2} className="w-20 h-4" />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-dashed border-[#fce7f3] pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-handwriting font-bold text-[#881337]">
                  Completions by Day of Week
                </h2>
                <p className="text-xs font-cute text-[#9f1239]/70">
                  Most productive day:{' '}
                  <span className="font-handwriting font-bold text-[#be123c] px-2 py-0.5 rounded-full bg-[#fff1f2] border border-[#fecdd3]">
                    {mostProductiveDay}
                  </span>
                </p>
              </div>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    stroke="#fda4af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#fce7f3' }}
                  />
                  <YAxis
                    stroke="#fda4af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#fce7f3' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#fffdfa] border-2 border-[#fbcfe8] p-2.5 rounded-2xl shadow-xl text-xs font-cute space-y-0.5">
                            <p className="font-handwriting font-bold text-[#881337]">{d.fullDay}</p>
                            <p className="text-[#be123c] font-bold">{d.completions} tasks checked off ♡</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="completions" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Categories Breakdown */}
          <div className="bg-[#fffdfa] rounded-[28px] p-6 md:p-8 border-2 border-[#fbcfe8] shadow-[0_8px_30px_rgba(251,191,204,0.15)] space-y-4 relative overflow-hidden">
            <div className="absolute -top-1.5 left-10 z-10">
              <WashiTape color="mint" angle={2} className="w-20 h-4" />
            </div>

            <div className="pt-2 border-b-2 border-dashed border-[#fce7f3] pb-3">
              <h2 className="text-lg sm:text-xl font-handwriting font-bold text-[#881337]">
                Task Categories Breakdown
              </h2>
              <p className="text-xs font-cute text-[#9f1239]/70">
                Distribution across your projects and study goals
              </p>
            </div>

            {categoryChartData.length > 0 ? (
              <div className="space-y-3 pt-2">
                {categoryChartData.map((cat, idx) => {
                  const percentage = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
                  const color = CUTE_COLORS[idx % CUTE_COLORS.length];
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-handwriting font-bold text-[#881337]">{cat.name}</span>
                        <span className="font-cute text-[#9f1239]/80 font-bold">
                          {cat.completed} / {cat.total} completed ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-[#fff1f2] border border-[#fecdd3] rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-[#fda4af] text-xs font-cute">
                No categorized task data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Cute Affirmation & Reflection Note */}
        <div className="bg-[#fffdfa] rounded-[26px] p-5 sm:p-6 border-2 border-[#fce7f3] shadow-[0_4px_20px_rgba(251,191,204,0.12)] flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center text-[#f43f5e] shrink-0">
              <PencilIllustration className="w-6 h-6" />
            </div>
            <div>
              <p className="font-handwriting font-bold text-base text-[#881337] flex items-center gap-1.5">
                <span>Daily Reflection: Consistency over Perfection</span>
                <Sparkles className="w-4 h-4 text-[#f43f5e]" />
              </p>
              <p className="font-cute text-xs text-[#9f1239]/75 mt-0.5 max-w-xl">
                "Small habits don't add up, they compound. Each task checked off brings you closer to your grandest dreams." ♡
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1 text-xs font-handwriting font-bold px-3.5 py-1.5 rounded-full bg-[#fdf4ff] text-[#a21caf] border border-[#f5d0fe]">
              Keep Going! ♡
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* NORMAL CLEAN MODERN THEME */
  return (
    <div id="analytics-view" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" /> Real Database Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Computed dynamically from PostgreSQL records in real-time. No static placeholders.
        </p>

        {/* Top 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Overall Completion</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{overallRate}%</span>
              <span className="text-xs text-slate-500">lifetime</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {totalCompleted} of {totalPlanned} tasks finished
            </p>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Weekly Rate</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{weeklyRate}%</span>
              <span className="text-xs text-slate-500">past 7 days</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {graphData?.totalCompletedWeek ?? 0} finished this week
            </p>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Today's Rate</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{todayRate}%</span>
              <span className="text-xs text-slate-500">current day</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {graphData?.todayCompletedTasks ?? 0} of {graphData?.todayTotalTasks ?? 0} today
            </p>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Best Streak</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{bestStreak}</span>
              <span className="text-xs text-slate-500">consecutive days</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Current active streak: {currentStreak} days
            </p>
          </div>
        </div>
      </div>

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity by Day of Week */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Completions by Day of Week
            </h2>
            <p className="text-xs text-slate-500">
              Most productive day: <strong className="text-blue-600">{mostProductiveDay}</strong>
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="day"
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
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs">
                          <p className="font-semibold text-slate-200">{d.fullDay}</p>
                          <p className="text-blue-300">{d.completions} tasks completed</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="completions" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Task Categories Breakdown
            </h2>
            <p className="text-xs text-slate-500">Distribution across your projects and areas</p>
          </div>

          {categoryChartData.length > 0 ? (
            <div className="space-y-3 pt-2">
              {categoryChartData.map((cat, idx) => {
                const percentage = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{cat.name}</span>
                      <span className="text-slate-500">
                        {cat.completed} / {cat.total} completed ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: MODERN_COLORS[idx % MODERN_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
              No categorized task data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
