import { Todo } from '../types.ts';

export function getTodayInTimezone(tz?: string): string {
  try {
    const targetTz = tz || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: targetTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // Returns YYYY-MM-DD
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function getCurrentTimeInTimezone(tz?: string): string {
  try {
    const targetTz = tz || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: targetTz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(new Date()); // Returns HH:mm
  } catch {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}

/**
 * Checks whether a task's scheduled due time is completed (passed/arrived)
 * and the task is still uncompleted.
 */
export function checkTaskTimeCompleted(
  task: Todo,
  tz?: string
): {
  isDue: boolean;
  elapsedMinutes: number;
  displayText: string;
} {
  if (task.completed) {
    return { isDue: false, elapsedMinutes: 0, displayText: '' };
  }

  if (!task.dueDate) {
    return { isDue: false, elapsedMinutes: 0, displayText: '' };
  }

  const todayStr = getTodayInTimezone(tz);
  const currentTimeStr = getCurrentTimeInTimezone(tz);

  // Case 1: Due Date is before today -> strictly overdue
  if (task.dueDate < todayStr) {
    // Rough calculation of days
    const [tY, tM, tD] = todayStr.split('-').map(Number);
    const [dY, dM, dD] = task.dueDate.split('-').map(Number);
    const diffDays = Math.max(1, Math.round((new Date(tY, tM - 1, tD).getTime() - new Date(dY, dM - 1, dD).getTime()) / (1000 * 60 * 60 * 24)));
    return {
      isDue: true,
      elapsedMinutes: diffDays * 1440,
      displayText: diffDays === 1 ? 'Due yesterday' : `Due ${diffDays} days ago`,
    };
  }

  // Case 2: Due Date is today
  if (task.dueDate === todayStr) {
    if (task.dueTime) {
      const [dueH, dueM] = task.dueTime.split(':').map(Number);
      const [curH, curM] = currentTimeStr.split(':').map(Number);
      const dueMinutes = dueH * 60 + dueM;
      const currentMinutes = curH * 60 + curM;

      if (currentMinutes >= dueMinutes) {
        const diffMinutes = currentMinutes - dueMinutes;
        const displayText =
          diffMinutes === 0
            ? 'Due right now!'
            : diffMinutes === 1
            ? 'Completed 1 min ago'
            : diffMinutes < 60
            ? `Completed ${diffMinutes}m ago`
            : `Completed ${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m ago`;

        return {
          isDue: true,
          elapsedMinutes: diffMinutes,
          displayText,
        };
      }
    }
  }

  return { isDue: false, elapsedMinutes: 0, displayText: '' };
}

// Audio Chime synthesizer using Web Audio API
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

/**
 * Plays a gentle, attention-grabbing chime for task due reminder
 */
export function playDueAlarmChime(muted = false) {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Harmonious melody: F5 (698.46Hz), A5 (880Hz), C6 (1046.5Hz), F6 (1396.9Hz)
    const freqs = [698.46, 880, 1046.5, 1396.91];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);

      gain.gain.setValueAtTime(0, now + idx * 0.14);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.4);
    });
  } catch (e) {
    console.warn('Audio chime playback failed:', e);
  }
}

/**
 * Plays a sweet celebratory chime when marking task completed
 */
export function playTaskCompletedSound(muted = false) {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Upward cheerful arpeggio: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.5)
    const freqs = [523.25, 659.25, 783.99, 1046.5];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.08 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  } catch (e) {
    console.warn('Completion sound playback failed:', e);
  }
}

/**
 * Requests browser desktop notification permissions
 */
export async function requestDesktopNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    return await Notification.requestPermission();
  } catch (e) {
    return Notification.permission || 'denied';
  }
}

/**
 * Dispatches a native browser notification if granted
 */
export function sendDesktopNotification(title: string, body: string, tag?: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(title, {
      body,
      tag: tag || 'task-due-alert',
      icon: '/favicon.ico',
    });
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (e) {
    console.warn('Failed to dispatch desktop notification:', e);
  }
}
