import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  Bell,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types.ts';
import { api } from '../lib/api.ts';
import { getClientSocket } from '../lib/socket.ts';

interface WelcomeGreetingPageProps {
  user: User;
  onProceedToDashboard: () => void;
}

export const WelcomeGreetingPage: React.FC<WelcomeGreetingPageProps> = ({
  user,
  onProceedToDashboard,
}) => {
  const [isEmailConfirmed, setIsEmailConfirmed] = useState<boolean>(
    Boolean(user.welcomeEmailSeen)
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [reminderSeconds, setReminderSeconds] = useState(60);
  const [noticeCount, setNoticeCount] = useState(user.welcomeNotificationCount || 1);

  // 60-second visual countdown till next automated 1-minute ping
  useEffect(() => {
    if (isEmailConfirmed) return;

    const timer = setInterval(() => {
      setReminderSeconds((prev) => {
        if (prev <= 1) {
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isEmailConfirmed]);

  // Listen to WebSocket events for real-time verification or ping alerts
  useEffect(() => {
    const socket = getClientSocket();

    const handleConfirmed = (data: { seen: boolean; seenAt?: string }) => {
      console.log('[WelcomePage] Welcome email seen event received:', data);
      setIsEmailConfirmed(true);
      setFeedbackMsg({
        type: 'success',
        text: 'Receipt confirmed! Welcome email verified. You are ready to enter your dashboard.',
      });
    };

    const handleReminder = (data: { message: string; notificationCount: number }) => {
      console.log('[WelcomePage] 1-min reminder received:', data);
      setNoticeCount(data.notificationCount);
      setReminderSeconds(60);
      setFeedbackMsg({
        type: 'info',
        text: `Automated 1-minute notice #${data.notificationCount} dispatched to your inbox.`,
      });
    };

    socket.on('welcome_email_seen_confirmed', handleConfirmed);
    socket.on('welcome_email_reminder', handleReminder);

    return () => {
      socket.off('welcome_email_seen_confirmed', handleConfirmed);
      socket.off('welcome_email_reminder', handleReminder);
    };
  }, []);

  // Manual confirm action: User confirms they have seen/opened the welcome letter
  const handleConfirmReceipt = async () => {
    try {
      setIsConfirming(true);
      setFeedbackMsg(null);
      const res = await api.confirmWelcomeEmail();
      if (res.success) {
        setIsEmailConfirmed(true);
        setFeedbackMsg({
          type: 'success',
          text: 'Welcome email verified! You may now proceed directly to your main dashboard.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Failed to confirm email receipt. Please try again.',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  // Resend action: User requests immediate re-dispatch of the cover letter
  const handleResendLetter = async () => {
    try {
      setIsResending(true);
      setFeedbackMsg(null);
      const res = await api.resendWelcomeEmail();
      if (res.success) {
        setNoticeCount(res.notificationCount);
        setReminderSeconds(60);
        setFeedbackMsg({
          type: 'success',
          text: `Welcome cover letter re-sent to ${user.email}. Check your inbox or spam folder!`,
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Failed to re-dispatch welcome email.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      id="welcome-greeting-screen"
      className="min-h-screen bg-custom-grabient text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Main Card Container */}
        <div className="bg-white/95 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-900/10 relative overflow-hidden text-slate-900">
          
          {/* Top Brand & Status Pill */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Registration Complete</span>
            </div>

            {/* 1-minute automated reminder indicator */}
            {!isEmailConfirmed ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Next 1-min ping: {reminderSeconds}s</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified & Ready</span>
              </div>
            )}
          </div>

          {/* Animated Greeting Heading */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome on board, <span className="text-blue-600">{user.name}</span>!
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
              Your productivity command center is now active. We’ve dispatched an executive welcome cover letter to{' '}
              <strong className="text-slate-900 underline decoration-blue-500/50">{user.email}</strong>.
            </p>
          </motion.div>

          {/* Cover Letter Preview Box */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Executive Welcome Cover Letter
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Notice #{noticeCount}</span>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed font-sans">
              <p>
                Dear <strong className="text-slate-900">{user.name}</strong>,
              </p>
              <p className="text-slate-600">
                Welcome to your personal productivity system. Your account is backed by <strong className="text-slate-800">Cloud SQL PostgreSQL</strong> and an ultra-low latency <strong className="text-slate-800">WebSocket sync channel</strong> to guarantee real-time updates for your tasks, focus timers, and productivity velocity graphs across every device.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-xs">
                  ⚡ Live WebSockets
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-xs">
                  🎯 Focus Mode & Pomodoro
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-xs">
                  📊 Real-Time 7-Day Velocity
                </span>
              </div>
            </div>
          </div>

          {/* Verification / Receipt Confirmation Status Banner */}
          <div className="mb-6">
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isEmailConfirmed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-blue-50 border-blue-200 text-slate-800'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isEmailConfirmed
                      ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                      : 'bg-blue-100 text-blue-600 border border-blue-200'
                  }`}
                >
                  {isEmailConfirmed ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Mail className="w-5 h-5 animate-pulse" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {isEmailConfirmed
                        ? 'Welcome Email Receipt Verified'
                        : 'Confirm Welcome Email Receipt'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {isEmailConfirmed
                      ? 'You have confirmed receipt of your welcome cover letter. The 1-minute automated notice loop has stopped.'
                      : 'Please check your email inbox and confirm receipt. Until confirmed, our server will dispatch automated notices every 1 minute.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          <AnimatePresence>
            {feedbackMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : feedbackMsg.type === 'error'
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}
              >
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedbackMsg.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions Section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {/* If not yet confirmed, provide Confirmation button and Resend button */}
            {!isEmailConfirmed ? (
              <>
                <button
                  type="button"
                  id="confirm-welcome-email-button"
                  onClick={handleConfirmReceipt}
                  disabled={isConfirming}
                  className="flex-1 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isConfirming ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>I've Received & Seen My Welcome Letter</span>
                </button>

                <button
                  type="button"
                  id="resend-welcome-email-button"
                  onClick={handleResendLetter}
                  disabled={isResending}
                  className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-slate-200"
                >
                  {isResending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                  <span>Resend Email</span>
                </button>
              </>
            ) : (
              /* Once confirmed, activate the Proceed to Main Dashboard button */
              <button
                type="button"
                id="proceed-to-dashboard-button"
                onClick={onProceedToDashboard}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Main Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Safe escape / helper note */}
          {!isEmailConfirmed && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleConfirmReceipt}
                className="text-[11px] text-slate-500 hover:text-slate-700 underline cursor-pointer transition-colors"
              >
                Already reviewed your email in another tab? Click here to confirm & unlock dashboard.
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
