import React, { useState, useEffect } from 'react';
import {
  Settings,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Shield,
  RefreshCw,
  Globe,
  Download,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Key,
  Server,
  Eye,
  EyeOff,
  Check,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { User, UserSettings, NotificationLog } from '../types.ts';
import { exportProductivityHistoryToCsv } from '../lib/exportCsv.ts';
import { isSpecialUser, isRohitUser, isNavyaUser } from '../lib/userTheme.ts';
import {
  WashiTape,
  HeartDoodle,
  SparkleDoodle,
  FlowerDoodle,
  PencilIllustration,
} from './PlannerDoodles.tsx';

interface SettingsViewProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUserUpdated }) => {
  const isRohit = isRohitUser(user.email);
  const isStationery = !isRohit; // Pink cute art stationery theme for Navya Sri & default

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [smtpStatus, setSmtpStatus] = useState<{
    isConfigured: boolean;
    activeSource: string;
    senderEmail: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  // Form states
  const [timezone, setTimezone] = useState(user.timezone || 'Asia/Kolkata');
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [taskCompletionEmail, setTaskCompletionEmail] = useState(true);
  const [scheduledRemindersEmail, setScheduledRemindersEmail] = useState(true);
  const [morningDigestEmail, setMorningDigestEmail] = useState(true);
  const [morningDigestTime, setMorningDigestTime] = useState('08:00');
  const [missedTaskEmail, setMissedTaskEmail] = useState(true);

  // Custom SMTP configuration state
  const [customSmtpHost, setCustomSmtpHost] = useState('');
  const [customSmtpPort, setCustomSmtpPort] = useState<number | ''>('');
  const [customSmtpUser, setCustomSmtpUser] = useState('');
  const [customSmtpPassword, setCustomSmtpPassword] = useState('');
  const [customFromEmail, setCustomFromEmail] = useState('');
  const [showCustomSmtp, setShowCustomSmtp] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // Statuses
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTriggeringMorning, setIsTriggeringMorning] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadNotifications();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.getSettings();
      const s = res.settings;
      setSettings(s);
      setSmtpStatus(res.smtpStatus);

      setTimezone(s.timezone || user.timezone || 'Asia/Kolkata');
      setEmailNotificationsEnabled(s.emailNotificationsEnabled);
      setTaskCompletionEmail(s.taskCompletionEmail);
      setScheduledRemindersEmail(s.scheduledRemindersEmail);
      setMorningDigestEmail(s.morningDigestEmail);
      setMorningDigestTime(s.morningDigestTime || '08:00');
      setMissedTaskEmail(s.missedTaskEmail);
      setCustomSmtpHost(s.customSmtpHost || '');
      setCustomSmtpPort(s.customSmtpPort || '');
      setCustomSmtpUser(s.customSmtpUser || '');
      setCustomSmtpPassword(s.customSmtpPassword || '');
      setCustomFromEmail(s.customFromEmail || '');

      if (s.customSmtpHost || s.customSmtpUser) {
        setShowCustomSmtp(true);
      }
    } catch (err: any) {
      setErrorMessage('Failed to load settings: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const logs = await api.getNotifications();
      setNotifications(logs);
    } catch (err) {
      console.error('Failed to load notification logs:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSaveMessage(null);
      setErrorMessage(null);

      const res = await api.updateSettings({
        timezone,
        emailNotificationsEnabled,
        taskCompletionEmail,
        scheduledRemindersEmail,
        morningDigestEmail,
        morningDigestTime,
        missedTaskEmail,
        customSmtpHost: customSmtpHost.trim() || null,
        customSmtpPort: customSmtpPort ? Number(customSmtpPort) : null,
        customSmtpUser: customSmtpUser.trim() || null,
        customSmtpPassword: customSmtpPassword.trim() || null,
        customFromEmail: customFromEmail.trim() || null,
      });

      setSettings(res.settings);
      onUserUpdated({ ...user, timezone });
      setSaveMessage(isStationery ? 'Preferences and schedule saved with love! ♡' : 'Preferences and SMTP settings saved successfully!');
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    try {
      setIsTestingSmtp(true);
      setEmailFeedback(null);
      const res = await api.testSmtp();
      setEmailFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message || `Test email dispatched to ${user.email}!`,
      });
      loadNotifications();
    } catch (err: any) {
      setEmailFeedback({
        type: 'error',
        message: err.message || 'Failed to dispatch test email.',
      });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleTriggerMorningEmail = async () => {
    try {
      setIsTriggeringMorning(true);
      setEmailFeedback(null);
      const res = await api.triggerMorningEmail();
      setEmailFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });
      loadNotifications();
    } catch (err: any) {
      setEmailFeedback({
        type: 'error',
        message: 'Failed to trigger morning email: ' + (err.message || 'Unknown error'),
      });
    } finally {
      setIsTriggeringMorning(false);
    }
  };

  const detectBrowserTimezone = () => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) {
      setTimezone(detected);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      setExportFeedback(null);
      const result = await exportProductivityHistoryToCsv(user);
      setExportFeedback({
        type: 'success',
        message: `Successfully exported ${result.taskCount} historical tasks and productivity analytics to ${result.filename}!`,
      });
      setTimeout(() => {
        setExportFeedback(null);
      }, 6000);
    } catch (err: any) {
      setExportFeedback({
        type: 'error',
        message: err.message || 'Failed to export productivity data to CSV.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-[#be123c]">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading settings...
      </div>
    );
  }

  /* SPECIAL STATIONERY & HANDWRITTEN THEME */
  if (isStationery) {
    return (
      <div id="settings-view" className="space-y-6 max-w-4xl">
        {/* Cute Header */}
        <div className="bg-[#fffdfa] rounded-[28px] p-6 md:p-8 border-2 border-[#fbcfe8] shadow-[0_8px_30px_rgba(251,191,204,0.18)] relative overflow-hidden space-y-4">
          <div className="absolute -top-1.5 left-10 z-10">
            <WashiTape color="pink" angle={-2} className="w-24 h-4.5" />
          </div>
          <div className="absolute -top-1.5 right-12 z-10 hidden sm:block">
            <WashiTape color="yellow" angle={3} className="w-18 h-4" />
          </div>

          <div className="pt-2">
            <h1 className="text-2xl sm:text-3xl font-handwriting font-bold text-[#881337] tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#f43f5e]" />
              <span>Account &amp; Notification Settings</span>
              <HeartDoodle className="w-5 h-5 text-[#f43f5e] inline" color="#f43f5e" />
            </h1>
            <p className="text-xs sm:text-sm font-cute text-[#9f1239]/70 mt-1">
              Personalize your schedule, timezone, and live email notifications with love ♡
            </p>
          </div>

          {saveMessage && (
            <div className="p-3.5 bg-[#fff1f2] border-2 border-[#fecdd3] text-[#be123c] font-cute text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#f43f5e] shrink-0" />
              <span className="font-bold">{saveMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-3.5 bg-[#fdf2f2] border-2 border-[#fca5a5] text-[#b91c1c] font-cute text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-bold">{errorMessage}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* PROFILE & TIMEZONE */}
          <div className="bg-[#fffdfa] rounded-[28px] p-6 md:p-8 border-2 border-[#fbcfe8] shadow-[0_8px_30px_rgba(251,191,204,0.15)] space-y-4 relative overflow-hidden">
            <div className="absolute -top-1.5 left-10 z-10">
              <WashiTape color="mint" angle={-1} className="w-20 h-4" />
            </div>

            <div className="pt-2 border-b-2 border-dashed border-[#fce7f3] pb-3">
              <h2 className="text-lg sm:text-xl font-handwriting font-bold text-[#881337] tracking-tight flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#f43f5e]" />
                <span>User Profile</span>
                <SparkleDoodle className="w-4 h-4 text-[#fb7185] inline" color="#fb7185" />
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-handwriting font-bold text-[#881337] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-cute font-bold border-2 border-[#fce7f3] rounded-2xl bg-[#fff8f8] text-[#881337] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-handwriting font-bold text-[#881337] uppercase tracking-wider mb-1">
                  Verified Email
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-cute font-bold border-2 border-[#fce7f3] rounded-2xl bg-[#fff1f2]/60 text-[#881337] cursor-not-allowed"
                  />
                  <span className="px-2.5 py-1 text-[11px] font-handwriting font-bold bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] rounded-full shrink-0">
                    Verified ♡
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-handwriting font-bold text-[#881337] uppercase tracking-wider">
                    Productivity Timezone
                  </label>
                  <button
                    type="button"
                    onClick={detectBrowserTimezone}
                    className="text-xs font-handwriting font-bold text-[#f43f5e] hover:text-[#be123c] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Globe className="w-3 h-3" /> Detect Device Timezone
                  </button>
                </div>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-cute font-bold border-2 border-[#fce7f3] focus:border-[#f43f5e] rounded-2xl bg-[#fff8f8] text-[#881337] focus:outline-none transition-all"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30) [Pardhu &amp; Navy]</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+8)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST, UTC+9)</option>
                  <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
                </select>
                <p className="text-[11px] font-cute text-[#9f1239]/70 mt-1">
                  All task notification timers, morning planners, and celebration schedules align with this timezone.
                </p>
              </div>
            </div>
          </div>

          {/* EMAIL NOTIFICATIONS */}
          <div className="bg-[#fffdfa] rounded-[28px] p-6 md:p-8 border-2 border-[#fbcfe8] shadow-[0_8px_30px_rgba(251,191,204,0.15)] space-y-5 relative overflow-hidden">
            <div className="absolute -top-1.5 left-10 z-10">
              <WashiTape color="rose" angle={2} className="w-20 h-4" />
            </div>

            <div className="pt-2 border-b-2 border-dashed border-[#fce7f3] pb-3">
              <h2 className="text-lg sm:text-xl font-handwriting font-bold text-[#881337] tracking-tight flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#f43f5e]" />
                <span>Email Notification Preferences</span>
                <HeartDoodle className="w-4 h-4 text-[#f43f5e] inline" color="#f43f5e" />
              </h2>
              <p className="text-xs font-cute text-[#9f1239]/70 mt-0.5">
                Configure real-time automated emails sent directly to <strong>{user.email}</strong>.
              </p>
            </div>

            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#fff1f2]/70 border-2 border-[#fecdd3] rounded-2xl">
              <div>
                <span className="font-handwriting font-bold text-base text-[#881337] block">
                  Enable Automated Email Notifications ♡
                </span>
                <p className="text-xs font-cute text-[#9f1239]/80 mt-0.5">
                  Master switch to dispatch schedule alerts, daily digests, and milestone celebrations.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotificationsEnabled}
                  onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f43f5e]" />
              </label>
            </div>

            {/* Individual Triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3.5 bg-[#fffdfa] border-2 border-[#fce7f3] rounded-2xl hover:border-[#fbcfe8] transition-colors">
                <input
                  type="checkbox"
                  id="notifyTaskCompleted"
                  checked={taskCompletionEmail}
                  disabled={!emailNotificationsEnabled}
                  onChange={(e) => setTaskCompletionEmail(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded accent-[#f43f5e] cursor-pointer"
                />
                <label htmlFor="notifyTaskCompleted" className="cursor-pointer">
                  <span className="text-sm font-handwriting font-bold text-[#881337] block">
                    Task Completion Celebration ♡
                  </span>
                  <span className="text-[11px] font-cute text-[#9f1239]/70 leading-relaxed block">
                    Sends an encouraging email whenever a key task is checked off.
                  </span>
                </label>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-[#fffdfa] border-2 border-[#fce7f3] rounded-2xl hover:border-[#fbcfe8] transition-colors">
                <input
                  type="checkbox"
                  id="notifyDueReminder"
                  checked={scheduledRemindersEmail}
                  disabled={!emailNotificationsEnabled}
                  onChange={(e) => setScheduledRemindersEmail(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded accent-[#f43f5e] cursor-pointer"
                />
                <label htmlFor="notifyDueReminder" className="cursor-pointer">
                  <span className="text-sm font-handwriting font-bold text-[#881337] block">
                    Scheduled Task Reminders ⏰
                  </span>
                  <span className="text-[11px] font-cute text-[#9f1239]/70 leading-relaxed block">
                    Receive alert emails 15–30 minutes before important task due dates.
                  </span>
                </label>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-[#fffdfa] border-2 border-[#fce7f3] rounded-2xl hover:border-[#fbcfe8] transition-colors">
                <input
                  type="checkbox"
                  id="notifyMorningDigest"
                  checked={morningDigestEmail}
                  disabled={!emailNotificationsEnabled}
                  onChange={(e) => setMorningDigestEmail(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded accent-[#f43f5e] cursor-pointer"
                />
                <div className="flex-1">
                  <label htmlFor="notifyMorningDigest" className="cursor-pointer">
                    <span className="text-sm font-handwriting font-bold text-[#881337] block">
                      Morning Daily Plan Email ☀️
                    </span>
                    <span className="text-[11px] font-cute text-[#9f1239]/70 leading-relaxed block">
                      A personalized morning digest of all planned tasks and daily quote.
                    </span>
                  </label>
                  {morningDigestEmail && (
                    <div className="mt-2 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#f43f5e]" />
                      <span className="text-[11px] font-cute font-bold text-[#881337]">Dispatch at:</span>
                      <input
                        type="time"
                        value={morningDigestTime}
                        onChange={(e) => setMorningDigestTime(e.target.value)}
                        className="px-2 py-1 text-xs border-2 border-[#fecdd3] rounded-xl bg-[#fff8f8] text-[#881337] font-cute font-bold focus:outline-none focus:border-[#f43f5e]"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-[#fffdfa] border-2 border-[#fce7f3] rounded-2xl hover:border-[#fbcfe8] transition-colors">
                <input
                  type="checkbox"
                  id="notifyMissedTasks"
                  checked={missedTaskEmail}
                  disabled={!emailNotificationsEnabled}
                  onChange={(e) => setMissedTaskEmail(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded accent-[#f43f5e] cursor-pointer"
                />
                <label htmlFor="notifyMissedTasks" className="cursor-pointer">
                  <span className="text-sm font-handwriting font-bold text-[#881337] block">
                    Missed Task Recovery Alerts ⚡
                  </span>
                  <span className="text-[11px] font-cute text-[#9f1239]/70 leading-relaxed block">
                    Gentle nudge if important tasks are left pending past due time.
                  </span>
                </label>
              </div>
            </div>

            {/* Active SMTP Status */}
            <div className="p-4 bg-[#fff1f2] border-2 border-[#fecdd3] rounded-2xl text-xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-handwriting font-bold text-[#881337] text-sm flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-[#f43f5e]" />
                  <span>Active Email Delivery Infrastructure</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#fffdfa] text-[#be123c] border border-[#fecdd3] font-handwriting font-bold text-[11px]">
                  {smtpStatus?.activeSource === 'custom' ? 'Custom SMTP' : 'Verified Dedicated Server'}
                </span>
              </div>
              <p className="text-[#9f1239]/80 font-cute text-[11px]">
                Sending live alerts from{' '}
                <strong className="font-bold text-[#881337] font-mono">{smtpStatus?.senderEmail || 'pardhupavan457@gmail.com'}</strong>{' '}
                to <strong className="font-bold text-[#881337]">{user.email}</strong>.
              </p>
            </div>

            {/* Custom SMTP Toggle Accordion */}
            <div className="border-t-2 border-dashed border-[#fce7f3] pt-4">
              <button
                type="button"
                onClick={() => setShowCustomSmtp(!showCustomSmtp)}
                className="flex items-center justify-between w-full text-left py-1 text-xs font-handwriting font-bold text-[#881337] hover:text-[#f43f5e] cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-[#f43f5e]" />
                  <span>Optional: Use Custom Personal SMTP Credentials</span>
                </span>
                {showCustomSmtp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCustomSmtp && (
                <div className="mt-3 p-4 bg-[#fffdfa] border-2 border-[#fce7f3] rounded-2xl space-y-3">
                  <p className="text-[11px] font-cute text-[#9f1239]/70">
                    By default, the server uses a dedicated live Gmail SMTP account. You can override it here.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-handwriting font-bold text-[#881337] mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={customSmtpHost}
                        onChange={(e) => setCustomSmtpHost(e.target.value)}
                        placeholder="smtp.gmail.com"
                        className="w-full px-3 py-2 text-xs font-cute border-2 border-[#fce7f3] rounded-xl bg-white focus:border-[#f43f5e] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-handwriting font-bold text-[#881337] mb-1">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={customSmtpPort}
                        onChange={(e) =>
                          setCustomSmtpPort(e.target.value ? Number(e.target.value) : '')
                        }
                        placeholder="465 or 587"
                        className="w-full px-3 py-2 text-xs font-cute border-2 border-[#fce7f3] rounded-xl bg-white focus:border-[#f43f5e] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-handwriting font-bold text-[#881337] mb-1">
                        SMTP Username / Email
                      </label>
                      <input
                        type="email"
                        value={customSmtpUser}
                        onChange={(e) => setCustomSmtpUser(e.target.value)}
                        placeholder="your-email@gmail.com"
                        className="w-full px-3 py-2 text-xs font-cute border-2 border-[#fce7f3] rounded-xl bg-white focus:border-[#f43f5e] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-handwriting font-bold text-[#881337] mb-1">
                        SMTP Password / App Password
                      </label>
                      <div className="relative">
                        <input
                          type={showSmtpPassword ? 'text' : 'password'}
                          value={customSmtpPassword}
                          onChange={(e) => setCustomSmtpPassword(e.target.value)}
                          placeholder="16-character App Password"
                          className="w-full px-3 py-2 pr-9 text-xs font-cute border-2 border-[#fce7f3] rounded-xl bg-white focus:border-[#f43f5e] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        >
                          {showSmtpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Email Testing & Feedback */}
            <div className="pt-3 border-t-2 border-dashed border-[#fce7f3] space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={isTestingSmtp}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-handwriting font-bold text-[#be123c] bg-[#fff1f2] hover:bg-[#ffe4e6] border-2 border-[#fecdd3] rounded-2xl transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-[#f43f5e]" />
                  {isTestingSmtp ? 'Sending Test Email...' : 'Send Live Test Email to My Inbox ♡'}
                </button>

                <button
                  type="button"
                  onClick={handleTriggerMorningEmail}
                  disabled={isTriggeringMorning}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-handwriting font-bold text-[#7e22ce] bg-[#faf5ff] hover:bg-[#f3e8ff] border-2 border-[#e9d5ff] rounded-2xl transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#a855f7]" />
                  {isTriggeringMorning ? 'Dispatching...' : 'Dispatch Morning Plan Email (Test) ✨'}
                </button>
              </div>

              {emailFeedback && (
                <div
                  className={`flex items-start gap-2.5 p-3.5 text-xs font-cute rounded-2xl border-2 ${
                    emailFeedback.type === 'success'
                      ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]'
                      : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
                  }`}
                >
                  {emailFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 font-bold leading-relaxed">{emailFeedback.message}</div>
                </div>
              )}

              {/* Spam and Deliverability Tip Box */}
              <div className="p-4 bg-[#fffbeb] border-2 border-[#fde68a] rounded-[22px] text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-handwriting font-bold text-sm text-[#92400e]">
                  <Sparkles className="w-4 h-4 text-[#d97706] shrink-0" />
                  <span>Important: Inbox Delivery &amp; Spam Filter Guidance</span>
                </div>
                <p className="text-[#92400e]/90 font-cute text-[11px] leading-relaxed">
                  Notification emails are sent live to <strong className="font-bold">{user.email}</strong>. If an email doesn&apos;t appear in your Primary tab within 30 seconds:
                </p>
                <ul className="text-[#92400e]/90 font-cute text-[11px] space-y-1 list-disc list-inside pt-1 pl-1">
                  <li>Check your Gmail <strong>Spam</strong> or <strong>Promotions</strong> folder.</li>
                  <li>Click <strong>&quot;Report not spam&quot;</strong> or drag the message to your <strong>Primary</strong> inbox.</li>
                  <li>Add <strong className="font-mono">{smtpStatus?.senderEmail || 'pardhupavan457@gmail.com'}</strong> to Google Contacts so Gmail automatically trusts all reminders.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 text-sm font-handwriting font-bold text-white bg-gradient-to-r from-[#f43f5e] to-[#ec4899] hover:from-[#e11d48] hover:to-[#db2777] disabled:opacity-50 rounded-2xl shadow-lg shadow-rose-400/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving Preferences...
                </>
              ) : (
                <>
                  <HeartDoodle className="w-4 h-4 text-white inline" color="#ffffff" />
                  <span>Save Preferences ♡</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* DATA EXPORT & PERSONAL TRACKING (CSV) */}
        <div
          id="data-export-section"
          className="bg-[#fffdfa] rounded-[28px] p-6 md:p-8 border-2 border-[#fbcfe8] shadow-[0_8px_30px_rgba(251,191,204,0.15)] space-y-5 relative overflow-hidden"
        >
          <div className="absolute -top-1.5 left-10 z-10">
            <WashiTape color="yellow" angle={-2} className="w-20 h-4" />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-dashed border-[#fce7f3] pb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center text-[#f43f5e] shrink-0 mt-0.5">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-handwriting font-bold text-[#881337] tracking-tight flex items-center gap-2">
                  <span>Export Historical Data &amp; Personal Tracking</span>
                </h2>
                <p className="text-xs font-cute text-[#9f1239]/70 mt-0.5">
                  Download your task history, completion records, streaks, and study logs into a CSV spreadsheet.
                </p>
              </div>
            </div>

            <button
              id="export-csv-btn"
              type="button"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="px-6 py-2.5 text-xs font-handwriting font-bold text-white bg-gradient-to-r from-[#ec4899] to-[#f43f5e] hover:from-[#db2777] hover:to-[#e11d48] disabled:opacity-50 rounded-2xl shadow-md shadow-pink-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Preparing Export...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Export All to CSV 📄
                </>
              )}
            </button>
          </div>

          {exportFeedback && (
            <div
              className={`flex items-start gap-2.5 p-3.5 text-xs font-cute rounded-2xl border-2 ${
                exportFeedback.type === 'success'
                  ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]'
                  : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
              }`}
            >
              {exportFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-bold leading-relaxed">{exportFeedback.message}</div>
            </div>
          )}

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 bg-[#fff1f2] rounded-2xl border border-[#fecdd3] text-xs space-y-1">
              <span className="font-handwriting font-bold text-sm text-[#881337] block">📋 All Task Records</span>
              <p className="text-[#9f1239]/70 font-cute text-[11px] leading-relaxed">
                Task IDs, titles, descriptions, categories, priorities, due dates, and completion timestamps.
              </p>
            </div>

            <div className="p-3.5 bg-[#faf5ff] rounded-2xl border border-[#e9d5ff] text-xs space-y-1">
              <span className="font-handwriting font-bold text-sm text-[#7e22ce] block">🔥 Streaks &amp; Metrics</span>
              <p className="text-[#6b21a8]/70 font-cute text-[11px] leading-relaxed">
                Current active streak, best record, lifetime completion percentage, and most productive day.
              </p>
            </div>

            <div className="p-3.5 bg-[#fdf4ff] rounded-2xl border border-[#f5d0fe] text-xs space-y-1">
              <span className="font-handwriting font-bold text-sm text-[#a21caf] block">📊 Velocity History</span>
              <p className="text-[#86198f]/70 font-cute text-[11px] leading-relaxed">
                7-day daily completion rate velocity table and category distribution for personal analytics.
              </p>
            </div>
          </div>
        </div>

        {/* REAL NOTIFICATION LOGS AUDIT TRAIL */}
        <div className="bg-[#fffdfa] rounded-[28px] p-6 md:p-8 border-2 border-[#fbcfe8] shadow-[0_8px_30px_rgba(251,191,204,0.15)] space-y-4 relative overflow-hidden">
          <div className="absolute -top-1.5 left-10 z-10">
            <WashiTape color="lavender" angle={1} className="w-20 h-4" />
          </div>

          <div className="pt-2 flex items-center justify-between border-b-2 border-dashed border-[#fce7f3] pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-handwriting font-bold text-[#881337] tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#a855f7]" />
                <span>Real Notification History Log</span>
                <SparkleDoodle className="w-4 h-4 text-[#a855f7] inline" color="#a855f7" />
              </h2>
              <p className="text-xs font-cute text-[#9f1239]/70">
                Audit log of all background email notifications sent for your account.
              </p>
            </div>
            <button
              type="button"
              onClick={loadNotifications}
              className="p-2 text-[#be123c] hover:bg-[#fff1f2] border border-[#fecdd3] rounded-xl transition-colors cursor-pointer"
              title="Refresh logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {notifications.length > 0 ? (
            <div className="divide-y divide-[#fce7f3] max-h-72 overflow-y-auto">
              {notifications.map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-cute font-bold uppercase text-[10px] ${
                          log.status === 'sent'
                            ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]'
                            : 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]'
                        }`}
                      >
                        {log.status === 'sent' ? 'SENT ♡' : 'FAILED'}
                      </span>
                      <strong className="text-[#881337] font-handwriting font-bold text-sm truncate">
                        {log.title}
                      </strong>
                    </div>
                    <p className="text-[#9f1239]/80 font-cute text-xs mt-0.5 truncate">{log.body}</p>
                    {log.errorMessage && (
                      <p className="text-red-600 font-mono text-[10px] mt-0.5">
                        Error: {log.errorMessage}
                      </p>
                    )}
                  </div>
                  <span className="text-[#fda4af] font-cute text-[11px] shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-cute text-[#fda4af] py-6 text-center">
              No notification records logged yet. Complete tasks or trigger reminders to see live logs ♡
            </p>
          )}
        </div>
      </div>
    );
  }

  /* NORMAL CLEAN MODERN THEME */
  return (
    <div id="settings-view" className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" /> Account &amp; Notification Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your verified account, timezone preferences, and automated email notifications.
        </p>

        {saveMessage && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {saveMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-medium">
            <AlertCircle className="w-4 h-4 text-red-600" /> {errorMessage}
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* PROFILE & TIMEZONE */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" /> User Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={user.name}
                disabled
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Verified Email</label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <span className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md shrink-0">
                  Verified
                </span>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Productivity Timezone
                </label>
                <button
                  type="button"
                  onClick={detectBrowserTimezone}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Globe className="w-3 h-3" /> Detect Device Timezone
                </button>
              </div>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+8)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST, UTC+9)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                All scheduled reminders, morning digests, and weekly views will match this timezone.
              </p>
            </div>
          </div>
        </div>

        {/* EMAIL NOTIFICATIONS */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" /> Email Notification Preferences
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure automated background emails sent to <strong>{user.email}</strong>.
              </p>
            </div>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <div>
              <span className="font-semibold text-slate-900 text-sm block">
                Enable Automated Email Notifications
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Master switch to allow the server to dispatch task reminders and completion messages.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotificationsEnabled}
                onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {/* Individual Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
              <input
                type="checkbox"
                id="notifyTaskCompletedNormal"
                checked={taskCompletionEmail}
                disabled={!emailNotificationsEnabled}
                onChange={(e) => setTaskCompletionEmail(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="notifyTaskCompletedNormal" className="cursor-pointer">
                <span className="text-xs font-semibold text-slate-800 block">
                  Task Completion Celebration
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed block">
                  Sends an immediate email whenever you check off a task.
                </span>
              </label>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
              <input
                type="checkbox"
                id="notifyDueReminderNormal"
                checked={scheduledRemindersEmail}
                disabled={!emailNotificationsEnabled}
                onChange={(e) => setScheduledRemindersEmail(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="notifyDueReminderNormal" className="cursor-pointer">
                <span className="text-xs font-semibold text-slate-800 block">
                  Scheduled Task Reminders
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed block">
                  Receive advance reminders for tasks with assigned times (e.g. 30m before).
                </span>
              </label>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
              <input
                type="checkbox"
                id="notifyMorningDigestNormal"
                checked={morningDigestEmail}
                disabled={!emailNotificationsEnabled}
                onChange={(e) => setMorningDigestEmail(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <div className="flex-1">
                <label htmlFor="notifyMorningDigestNormal" className="cursor-pointer">
                  <span className="text-xs font-semibold text-slate-800 block">
                    Morning Daily Plan Email
                  </span>
                  <span className="text-[11px] text-slate-500 leading-relaxed block">
                    A morning digest of all planned tasks and daily quote.
                  </span>
                </label>
                {morningDigestEmail && (
                  <div className="mt-2 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] text-slate-600">Send daily at:</span>
                    <input
                      type="time"
                      value={morningDigestTime}
                      onChange={(e) => setMorningDigestTime(e.target.value)}
                      className="px-2 py-0.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
              <input
                type="checkbox"
                id="notifyMissedTasksNormal"
                checked={missedTaskEmail}
                disabled={!emailNotificationsEnabled}
                onChange={(e) => setMissedTaskEmail(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="notifyMissedTasksNormal" className="cursor-pointer">
                <span className="text-xs font-semibold text-slate-800 block">
                  Missed Task Recovery Alerts
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed block">
                  Gentle alert if scheduled tasks are left uncompleted past deadline.
                </span>
              </label>
            </div>
          </div>

          {/* Active SMTP Status */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-600" /> Active Email Delivery Server
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                {smtpStatus?.activeSource === 'custom' ? 'Custom User SMTP' : 'Verified Dedicated Server'}
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Sending notifications from <strong className="text-slate-800">{smtpStatus?.senderEmail || 'pardhupavan457@gmail.com'}</strong> to <strong className="text-slate-800">{user.email}</strong>.
            </p>
          </div>

          {/* Custom SMTP Toggle Accordion */}
          <div className="border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setShowCustomSmtp(!showCustomSmtp)}
              className="flex items-center justify-between w-full text-left py-1 text-xs font-semibold text-slate-700 hover:text-blue-600 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                <span>Optional: Use Custom Personal SMTP Credentials</span>
              </span>
              {showCustomSmtp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCustomSmtp && (
              <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={customSmtpHost}
                      onChange={(e) => setCustomSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={customSmtpPort}
                      onChange={(e) =>
                        setCustomSmtpPort(e.target.value ? Number(e.target.value) : '')
                      }
                      placeholder="465 or 587"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      SMTP Username / Email
                    </label>
                    <input
                      type="email"
                      value={customSmtpUser}
                      onChange={(e) => setCustomSmtpUser(e.target.value)}
                      placeholder="your-email@gmail.com"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      SMTP Password / App Password
                    </label>
                    <div className="relative">
                      <input
                        type={showSmtpPassword ? 'text' : 'password'}
                        value={customSmtpPassword}
                        onChange={(e) => setCustomSmtpPassword(e.target.value)}
                        placeholder="16-character App Password"
                        className="w-full px-3 py-2 pr-9 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSmtpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Email Testing & Feedback */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={isTestingSmtp}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                {isTestingSmtp ? 'Sending Test Email...' : 'Send Live Test Email to My Inbox'}
              </button>

              <button
                type="button"
                onClick={handleTriggerMorningEmail}
                disabled={isTriggeringMorning}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {isTriggeringMorning ? 'Dispatching...' : 'Dispatch Morning Plan Email (Test)'}
              </button>
            </div>

            {emailFeedback && (
              <div
                className={`flex items-start gap-2.5 p-3.5 text-xs rounded-xl border ${
                  emailFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {emailFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 font-medium leading-relaxed">{emailFeedback.message}</div>
              </div>
            )}

            {/* Spam and Deliverability Tip Box */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Important: Inbox Delivery &amp; Spam Filter Guidance</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Notification emails are sent live from <strong className="font-semibold">{smtpStatus?.senderEmail || 'pardhupavan457@gmail.com'}</strong> to <strong className="font-semibold">{user.email}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving Preferences...
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </form>

      {/* DATA EXPORT & PERSONAL TRACKING (CSV) */}
      <div
        id="data-export-section"
        className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Export Historical Data &amp; Personal Tracking
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Download your complete task history, completion velocity, categories, priorities,
                streaks, and email audit records into a standard CSV spreadsheet.
              </p>
            </div>
          </div>

          <button
            id="export-csv-btn"
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Preparing Export...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Export All to CSV
              </>
            )}
          </button>
        </div>

        {exportFeedback && (
          <div
            className={`flex items-start gap-2.5 p-3.5 text-xs rounded-xl border ${
              exportFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {exportFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium leading-relaxed">{exportFeedback.message}</div>
          </div>
        )}

        {/* Breakdown of What's Exported */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <span className="font-bold text-slate-800 block mb-1">📋 All Task Records</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Task IDs, titles, descriptions, categories, priorities, due dates, completion
              timestamps, and reminder details.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <span className="font-bold text-slate-800 block mb-1">🔥 Streaks &amp; Metrics</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Current active streak, best historical streak, lifetime completion percentage, and
              most productive day.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <span className="font-bold text-slate-800 block mb-1">📊 Velocity History</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              7-day daily completion rate velocity table and category distribution for personal
              analytics.
            </p>
          </div>
        </div>
      </div>

      {/* REAL NOTIFICATION LOGS AUDIT TRAIL */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Real Notification History Log
            </h2>
            <p className="text-xs text-slate-500">
              Audit log of all emails sent by the background scheduler for your account.
            </p>
          </div>
          <button
            type="button"
            onClick={loadNotifications}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {notifications.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                        log.status === 'sent'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {log.status}
                    </span>
                    <strong className="text-slate-900 truncate">{log.title}</strong>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5 truncate">{log.body}</p>
                  {log.errorMessage && (
                    <p className="text-red-600 text-[10px] font-mono mt-0.5">
                      Error: {log.errorMessage}
                    </p>
                  )}
                </div>
                <span className="text-slate-400 text-[11px] shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">
            No notification records logged yet. Complete tasks or trigger reminders to see live logs.
          </p>
        )}
      </div>
    </div>
  );
};
