import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bell,
  Check,
  Clock,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Todo } from '../types.ts';
import {
  checkTaskTimeCompleted,
  playDueAlarmChime,
  playTaskCompletedSound,
  requestDesktopNotificationPermission,
  sendDesktopNotification,
} from '../lib/timeUtils.ts';
import { isSpecialUser } from '../lib/userTheme.ts';
import { WashiTape, HeartDoodle, SparkleDoodle } from './PlannerDoodles.tsx';

interface DueTaskNotificationBannerProps {
  todos: Todo[];
  userTimezone: string;
  userEmail?: string;
  onToggleTodo: (id: number) => Promise<void>;
  onFocusTask?: (task: Todo) => void;
}

export const DueTaskNotificationBanner: React.FC<DueTaskNotificationBannerProps> = ({
  todos,
  userTimezone,
  userEmail,
  onToggleTodo,
  onFocusTask,
}) => {
  const isSpecial = isSpecialUser(userEmail);

  // Mute setting (persisted in localStorage)
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('task_alarm_muted') === 'true';
    } catch {
      return false;
    }
  });

  // Snoozed tasks mapping (taskId -> snooze expiry timestamp)
  const [snoozeMap, setSnoozeMap] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'denied';
  });

  // Keep track of tick to force recalculation every 10 seconds
  const [, setTick] = useState(0);
  const lastAlertTimeRef = useRef<number>(0);
  const isCompletingRef = useRef<boolean>(false);

  // Interval timer for checking task times
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 10000); // Check every 10 seconds

    return () => clearInterval(timer);
  }, []);

  // Compute active uncompleted tasks whose time has completed and aren't snoozed
  const dueTasks = useMemo(() => {
    const now = Date.now();
    return todos.filter((task) => {
      if (task.completed) return false;
      // Check snooze
      if (snoozeMap[task.id] && snoozeMap[task.id] > now) return false;

      const { isDue } = checkTaskTimeCompleted(task, userTimezone);
      return isDue;
    });
  }, [todos, snoozeMap, userTimezone]);

  // Adjust current index if it exceeds list
  useEffect(() => {
    if (currentIndex >= dueTasks.length && dueTasks.length > 0) {
      setCurrentIndex(0);
    }
  }, [dueTasks.length, currentIndex]);

  // Repeatedly alert the user every 60 seconds UNTIL the task is marked completed
  useEffect(() => {
    if (dueTasks.length === 0) return;

    const now = Date.now();
    // Alert immediately on discovery, or if 60 seconds have elapsed since previous alert
    if (now - lastAlertTimeRef.current >= 60000) {
      lastAlertTimeRef.current = now;
      playDueAlarmChime(isMuted);

      const activeTask = dueTasks[currentIndex] || dueTasks[0];
      if (activeTask) {
        sendDesktopNotification(
          `⏰ Task Time Completed: "${activeTask.title}"`,
          `Scheduled time (${activeTask.dueTime || 'Today'}) has completed. Please mark it done!`,
          `due-task-${activeTask.id}`
        );
      }
    }
  }, [dueTasks, currentIndex, isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('task_alarm_muted', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleSnooze = (taskId: number, minutes = 5) => {
    const expiry = Date.now() + minutes * 60 * 1000;
    setSnoozeMap((prev) => ({ ...prev, [taskId]: expiry }));
  };

  const handleMarkCompleted = async (task: Todo) => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;
    try {
      playTaskCompletedSound(isMuted);
      await onToggleTodo(task.id);
      // Remove from snooze map if present
      setSnoozeMap((prev) => {
        const copy = { ...prev };
        delete copy[task.id];
        return copy;
      });
    } finally {
      isCompletingRef.current = false;
    }
  };

  const handleMarkAllCompleted = async () => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;
    try {
      playTaskCompletedSound(isMuted);
      for (const t of dueTasks) {
        await onToggleTodo(t.id);
      }
    } finally {
      isCompletingRef.current = false;
    }
  };

  const handleRequestPermission = async () => {
    const perm = await requestDesktopNotificationPermission();
    setPermissionState(perm);
  };

  if (dueTasks.length === 0) return null;

  const activeTask = dueTasks[currentIndex] || dueTasks[0];
  const { displayText } = checkTaskTimeCompleted(activeTask, userTimezone);

  /* SPECIAL STATIONERY & HANDWRITTEN THEME */
  if (isSpecial) {
    return (
      <div
        id="due-task-alert-banner"
        className="fixed bottom-4 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-96 animate-bounce-subtle"
      >
        <div className="relative bg-[#fffdfa] rounded-[24px] p-4 sm:p-5 border-2 border-[#f43f5e] shadow-[0_12px_35px_rgba(244,63,94,0.3)] space-y-3">
          {/* Washi Tape Header */}
          <div className="absolute -top-2 left-8 z-10">
            <WashiTape color="pink" angle={-2} className="w-20 h-4" />
          </div>

          {/* Top bar with alert badge and controls */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-handwriting font-bold text-[#be123c]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f43f5e]" />
              </span>
              <span className="uppercase tracking-wider">Time Completed!</span>
              <HeartDoodle className="w-3.5 h-3.5 inline text-[#f43f5e]" color="#f43f5e" />
            </div>

            <div className="flex items-center gap-1">
              {/* Audio Mute toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                  isMuted
                    ? 'bg-stone-100 text-stone-400 border-stone-200'
                    : 'bg-[#fff1f2] text-[#e11d48] border-[#fecdd3] hover:bg-[#ffe4e6]'
                }`}
                title={isMuted ? 'Unmute reminder chime' : 'Mute reminder chime'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Multiple task pagination if > 1 */}
              {dueTasks.length > 1 && (
                <div className="flex items-center gap-1 bg-[#fff1f2] border border-[#fecdd3] rounded-xl px-1.5 py-0.5 text-[11px] font-cute text-[#be123c]">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : dueTasks.length - 1))
                    }
                    className="hover:text-[#881337] cursor-pointer"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <span>
                    {currentIndex + 1}/{dueTasks.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) => (prev < dueTasks.length - 1 ? prev + 1 : 0))
                    }
                    className="hover:text-[#881337] cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Task Details Card */}
          <div className="bg-[#fff1f2]/70 border border-[#fecdd3] rounded-2xl p-3 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm sm:text-base font-handwriting font-bold text-[#881337] leading-snug line-clamp-2">
                {activeTask.title}
              </h4>
              <span className="bg-[#f43f5e] text-white text-[10px] font-cute font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide">
                {activeTask.priority}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-cute text-[#9f1239] flex-wrap">
              <span className="flex items-center gap-1 font-bold">
                <Clock className="w-3.5 h-3.5 text-[#f43f5e]" />
                {activeTask.dueTime || 'Due Date'}
              </span>
              <span>•</span>
              <span className="font-bold text-[#e11d48]">{displayText || 'Time is up!'}</span>
              <span>•</span>
              <span className="text-[#be123c]/80">{activeTask.category}</span>
            </div>

            <p className="text-[11px] font-cute text-[#be123c]/80 italic">
              🔔 Notifying you until marked complete!
            </p>
          </div>

          {/* Desktop notification opt-in helper if not granted */}
          {permissionState === 'default' && (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="w-full text-left flex items-center justify-between text-[11px] font-cute text-[#9f1239] bg-[#fff5f7] hover:bg-[#ffe4e6] border border-[#fecdd3] rounded-xl px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Bell className="w-3 h-3 text-[#f43f5e]" />
                Enable desktop alerts for background tabs
              </span>
              <span className="font-bold underline">Allow →</span>
            </button>
          )}

          {/* Main Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleMarkCompleted(activeTask)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f43f5e] hover:bg-[#e11d48] text-white font-handwriting font-bold text-sm rounded-2xl shadow-md shadow-rose-500/25 hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Mark Completed ♡</span>
            </button>

            <button
              type="button"
              onClick={() => handleSnooze(activeTask.id, 5)}
              className="px-3.5 py-2.5 bg-white hover:bg-[#fff1f2] border-2 border-[#fecdd3] text-[#be123c] font-handwriting font-bold text-xs rounded-2xl hover:scale-102 active:scale-98 transition-all cursor-pointer shrink-0"
              title="Snooze reminder for 5 minutes"
            >
              Snooze (5m)
            </button>

            {dueTasks.length > 1 && (
              <button
                type="button"
                onClick={handleMarkAllCompleted}
                className="px-3 py-2.5 bg-[#fff1f2] hover:bg-[#ffe4e6] border border-[#fda4af] text-[#881337] font-cute font-bold text-xs rounded-2xl hover:scale-102 active:scale-98 transition-all cursor-pointer shrink-0"
                title="Mark all due tasks completed"
              >
                All Done ✓
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* NORMAL CLEAN MODERN THEME */
  return (
    <div
      id="due-task-alert-banner"
      className="fixed bottom-4 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-96 animate-bounce-subtle"
    >
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xl space-y-3">
        {/* Top bar with alert badge and controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
            </span>
            <span className="uppercase tracking-wider">Due Task Alert</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Mute toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
              }`}
              title={isMuted ? 'Unmute reminder chime' : 'Mute reminder chime'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Multiple task pagination if > 1 */}
            {dueTasks.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-1.5 py-0.5 text-xs text-slate-600 font-medium">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : dueTasks.length - 1))
                  }
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span>
                  {currentIndex + 1}/{dueTasks.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((prev) => (prev < dueTasks.length - 1 ? prev + 1 : 0))
                  }
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task Details Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
              {activeTask.title}
            </h4>
            <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase">
              {activeTask.priority}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {activeTask.dueTime || 'Due Date'}
            </span>
            <span>•</span>
            <span className="font-semibold text-rose-600">{displayText || 'Time reached!'}</span>
            <span>•</span>
            <span>{activeTask.category}</span>
          </div>

          <p className="text-[11px] text-slate-400">
            Alerting until marked complete.
          </p>
        </div>

        {/* Desktop notification opt-in helper if not granted */}
        {permissionState === 'default' && (
          <button
            type="button"
            onClick={handleRequestPermission}
            className="w-full text-left flex items-center justify-between text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Bell className="w-3 h-3 text-blue-600" />
              Enable desktop alerts for background tabs
            </span>
            <span className="font-semibold underline">Allow →</span>
          </button>
        )}

        {/* Main Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleMarkCompleted(activeTask)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Mark Done</span>
          </button>

          <button
            type="button"
            onClick={() => handleSnooze(activeTask.id, 5)}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer shrink-0"
            title="Snooze reminder for 5 minutes"
          >
            Snooze (5m)
          </button>

          {dueTasks.length > 1 && (
            <button
              type="button"
              onClick={handleMarkAllCompleted}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer shrink-0"
              title="Mark all due tasks completed"
            >
              All Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
