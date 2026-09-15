import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Bell, AlertCircle, Tag, Flag, Sparkles, CheckCircle2, RefreshCw, Check } from 'lucide-react';
import { Todo } from '../types.ts';
import { isRohitUser, isNavyaUser } from '../lib/userTheme.ts';
import { WashiTape, HeartDoodle, SparkleDoodle, FlowerDoodle, BowDoodle } from './PlannerDoodles.tsx';
import { CricketBallDoodle, CricketBatDoodle, Number45Sticker } from './CricketDoodles.tsx';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description: string;
    dueDate: string;
    dueTime: string | null;
    reminderMinutesBefore: number | null;
    priority: 'low' | 'medium' | 'high';
    category: string;
  }) => Promise<void>;
  initialData?: Todo | null;
  defaultDate?: string;
  userEmail?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDate,
  userEmail,
}) => {
  const isRohit = isRohitUser(userEmail);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number | null>(30);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('Work');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setDueDate(initialData.dueDate);
      setDueTime(initialData.dueTime || '');
      setReminderMinutesBefore(initialData.reminderMinutesBefore ?? 30);
      setPriority(initialData.priority || 'medium');
      setCategory(initialData.category || 'General');
    } else {
      const todayStr = defaultDate || new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setDueDate(todayStr);
      setDueTime('18:00');
      setReminderMinutesBefore(30);
      setPriority('medium');
      setCategory('Work');
    }
    setError(null);
  }, [initialData, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }
    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        title: title.trim(),
        description: description.trim(),
        dueDate,
        dueTime: dueTime || null,
        reminderMinutesBefore,
        priority,
        category,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* SPECIAL ROHIT SHARMA FAN SCRAPBOOK THEME */
  if (isRohit) {
    return (
      <div
        id="task-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      >
        <div
          id="task-modal-container"
          className="relative w-full max-w-lg bg-[#FFFDF7] rounded-[28px] p-6 sm:p-7 text-[#082B63] shadow-2xl border-2 border-[#8EC5FF] z-10 my-8 overflow-hidden space-y-4"
        >
          {/* Decorative Washi Tape */}
          <div className="absolute -top-1.5 left-10 z-10">
            <WashiTape color="blue" angle={-1} className="w-24 h-4.5" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-dashed border-[#8EC5FF]/60 pb-3.5 mb-2 pt-1">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-handwriting font-bold text-[#082B63] flex items-center gap-2">
                  <CricketBatDoodle className="w-5 h-5 text-[#1769E0]" />
                  <span>{initialData ? 'Edit Hitman Task' : 'New Hitman Task'}</span>
                  <Number45Sticker size="sm" />
                </h2>
              </div>
              <p className="text-xs font-handwriting font-semibold text-[#1769E0] mt-0.5">
                Plan like the Hitman — stay focused, execute, and win 💙
              </p>
            </div>
            <button
              id="close-task-modal-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#1769E0] hover:text-[#082B63] hover:bg-[#EAF4FF] rounded-xl transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs font-handwriting font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Task Title */}
            <div className="space-y-1">
              <label className="block text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63]">
                Task Title *
              </label>
              <input
                id="task-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master innings plan: complete morning focus session"
                className="w-full px-4 py-2.5 bg-white border-2 border-[#8EC5FF] rounded-2xl text-[#082B63] placeholder:text-[#1769E0]/40 focus:outline-none focus:border-[#1769E0] text-sm font-handwriting font-bold transition-all"
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63]">
                Notes / Match Plan (Optional)
              </label>
              <textarea
                id="task-desc-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add sub-points, strategy, or reminder details..."
                rows={2}
                className="w-full px-4 py-2 bg-white border-2 border-[#8EC5FF] rounded-2xl text-[#082B63] placeholder:text-[#1769E0]/40 focus:outline-none focus:border-[#1769E0] text-sm font-handwriting font-semibold resize-none transition-all"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63] mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#1769E0]" /> Match Date *
                </label>
                <input
                  id="task-duedate-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#8EC5FF] rounded-2xl text-[#082B63] text-sm font-handwriting font-bold focus:outline-none focus:border-[#1769E0]"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63] mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#1769E0]" /> Match Time
                </label>
                <input
                  id="task-duetime-input"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#8EC5FF] rounded-2xl text-[#082B63] text-sm font-handwriting font-bold focus:outline-none focus:border-[#1769E0]"
                />
              </div>
            </div>

            {/* Reminder & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63] mb-1">
                  <Bell className="w-3.5 h-3.5 text-[#1769E0]" /> Hitman Email Reminder
                </label>
                <select
                  id="task-reminder-select"
                  value={reminderMinutesBefore === null ? 'none' : reminderMinutesBefore}
                  onChange={(e) =>
                    setReminderMinutesBefore(e.target.value === 'none' ? null : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 bg-white border-2 border-[#8EC5FF] rounded-2xl text-[#082B63] text-sm font-handwriting font-bold focus:outline-none focus:border-[#1769E0] cursor-pointer"
                >
                  <option value="none">No reminder</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="120">2 hours before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63] mb-1">
                  <Flag className="w-3.5 h-3.5 text-[#1769E0]" /> Match Priority
                </label>
                <select
                  id="task-priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-3 py-2 bg-white border-2 border-[#8EC5FF] rounded-2xl text-[#082B63] text-sm font-handwriting font-bold focus:outline-none focus:border-[#1769E0] cursor-pointer"
                >
                  <option value="low">Standard Innings 🏏</option>
                  <option value="medium">Important Match ⭐</option>
                  <option value="high">Finals / Crucial 🔥</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#082B63] mb-2">
                <Tag className="w-3.5 h-3.5 text-[#1769E0]" /> Category
              </label>
              <div className="flex gap-2 flex-wrap">
                {['Work', 'Personal', 'Study', 'Health', 'Finance', 'General'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-handwriting font-bold rounded-2xl border-2 transition-all cursor-pointer ${
                      category === cat
                        ? 'bg-[#1769E0] border-[#082B63] text-white shadow-xs scale-105'
                        : 'bg-white border-[#8EC5FF] text-[#082B63] hover:bg-[#EAF4FF]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t-2 border-dashed border-[#8EC5FF]/60 mt-4">
              <button
                id="cancel-task-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-handwriting font-bold text-[#082B63] hover:bg-[#EAF4FF] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="submit-task-btn"
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-handwriting font-bold text-white bg-linear-to-r from-[#1769E0] to-[#082B63] hover:from-[#082B63] hover:to-[#051c42] disabled:opacity-50 rounded-2xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {initialData ? 'Save Changes 🏏' : 'Add Hitman Task 🏏'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* CUTE PASTEL PINK STATIONERY SCRAPBOOK THEME (NAVYA SRI / DEFAULT) */
  return (
    <div
      id="task-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/40 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="task-modal-container"
        className="relative w-full max-w-lg bg-[#FFFDF7] rounded-[28px] p-6 sm:p-7 text-[#881337] shadow-2xl border-2 border-[#fbcfe8] z-10 my-8 overflow-hidden space-y-4"
      >
        {/* Decorative Washi Tape */}
        <div className="absolute -top-1.5 left-10 z-10">
          <WashiTape color="pink" angle={-2} className="w-24 h-4.5" />
        </div>
        <div className="absolute -top-1.5 right-12 z-10 hidden sm:block">
          <WashiTape color="yellow" angle={3} className="w-20 h-4" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-dashed border-[#fbcfe8] pb-3.5 mb-2 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <FlowerDoodle className="w-5 h-5 text-[#f43f5e]" />
              <h2 className="text-xl sm:text-2xl font-handwriting font-bold text-[#881337] flex items-center gap-2">
                <span>{initialData ? 'Edit Task ♡' : 'New Task ♡'}</span>
                <HeartDoodle className="w-4 h-4 text-[#f43f5e]" color="#f43f5e" />
              </h2>
            </div>
            <p className="text-xs font-handwriting font-semibold text-[#e11d48] mt-0.5 flex items-center gap-1">
              <span>Write your plans with love — take small steps and smile bright ♡</span>
              <SparkleDoodle className="w-3 h-3 text-[#f59e0b]" color="#f59e0b" />
            </p>
          </div>
          <button
            id="close-task-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#fda4af] hover:text-[#e11d48] hover:bg-[#fff1f2] rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs font-handwriting font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Title */}
          <div className="space-y-1">
            <label className="block text-xs font-handwriting font-bold uppercase tracking-wider text-[#881337]">
              Task Title *
            </label>
            <input
              id="task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read favorite book, complete work notes ♡"
              className="w-full px-4 py-2.5 bg-white border-2 border-[#fbcfe8] rounded-2xl text-[#881337] placeholder:text-[#fda4af] focus:outline-none focus:border-[#f43f5e] text-sm font-handwriting font-bold transition-all"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-handwriting font-bold uppercase tracking-wider text-[#881337]">
              Notes / Sub-points (Optional)
            </label>
            <textarea
              id="task-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add your cute thoughts, study goals, or reminder details..."
              rows={2}
              className="w-full px-4 py-2 bg-white border-2 border-[#fbcfe8] rounded-2xl text-[#881337] placeholder:text-[#fda4af] focus:outline-none focus:border-[#f43f5e] text-sm font-handwriting font-semibold resize-none transition-all"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#881337] mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#f43f5e]" /> Due Date *
              </label>
              <input
                id="task-duedate-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#fbcfe8] rounded-2xl text-[#881337] text-sm font-handwriting font-bold focus:outline-none focus:border-[#f43f5e]"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#881337] mb-1">
                <Clock className="w-3.5 h-3.5 text-[#f43f5e]" /> Due Time
              </label>
              <input
                id="task-duetime-input"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#fbcfe8] rounded-2xl text-[#881337] text-sm font-handwriting font-bold focus:outline-none focus:border-[#f43f5e]"
              />
            </div>
          </div>

          {/* Reminder & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#881337] mb-1">
                <Bell className="w-3.5 h-3.5 text-[#f43f5e]" /> Email Reminder 💌
              </label>
              <select
                id="task-reminder-select"
                value={reminderMinutesBefore === null ? 'none' : reminderMinutesBefore}
                onChange={(e) =>
                  setReminderMinutesBefore(e.target.value === 'none' ? null : Number(e.target.value))
                }
                className="w-full px-3 py-2 bg-white border-2 border-[#fbcfe8] rounded-2xl text-[#881337] text-sm font-handwriting font-bold focus:outline-none focus:border-[#f43f5e] cursor-pointer"
              >
                <option value="none">No reminder</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="120">2 hours before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#881337] mb-1">
                <Flag className="w-3.5 h-3.5 text-[#f43f5e]" /> Priority
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 bg-white border-2 border-[#fbcfe8] rounded-2xl text-[#881337] text-sm font-handwriting font-bold focus:outline-none focus:border-[#f43f5e] cursor-pointer"
              >
                <option value="low">Standard Task 🌸</option>
                <option value="medium">Important Goal ⭐</option>
                <option value="high">Top Priority 🔥</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-handwriting font-bold uppercase tracking-wider text-[#881337] mb-2">
              <Tag className="w-3.5 h-3.5 text-[#f43f5e]" /> Category
            </label>
            <div className="flex gap-2 flex-wrap">
              {['Work', 'Personal', 'Study', 'Self-Care', 'Health', 'General'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-handwriting font-bold rounded-2xl border-2 transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-[#f43f5e] border-[#be123c] text-white shadow-xs scale-105'
                      : 'bg-white border-[#fbcfe8] text-[#881337] hover:bg-[#fff1f2]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t-2 border-dashed border-[#fbcfe8] mt-4">
            <button
              id="cancel-task-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-handwriting font-bold text-[#881337] hover:bg-[#fff1f2] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-task-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-handwriting font-bold text-white bg-linear-to-r from-[#f43f5e] to-[#e11d48] hover:from-[#e11d48] hover:to-[#be123c] disabled:opacity-50 rounded-2xl shadow-md shadow-rose-400/30 border border-[#be123c] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  {initialData ? 'Save Changes ♡ ✨' : 'Add Task ♡ 🌸'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

