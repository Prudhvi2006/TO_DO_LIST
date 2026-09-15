import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { User } from '../types.ts';
import { NeonSpinner } from './NeonSpinner.tsx';
import { AppLogo } from './AppLogo.tsx';
import { signInWithGoogle } from '../lib/firebase.ts';

interface AuthModalProps {
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>(() => {
    try {
      const hasAccount = localStorage.getItem('productivity_has_account');
      const lastEmail = localStorage.getItem('last_user_email');
      return !hasAccount && !lastEmail ? 'register' : 'login';
    } catch {
      return 'login';
    }
  });

  // Registration steps:
  // 1: Enter email to receive OTP
  // 2: Enter 6-digit OTP code received via email (OTP is NEVER displayed on screen)
  // 3: Enter Full Name and Password to complete sign-up
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('last_user_email') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deliveryNote, setDeliveryNote] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // User timezone detection
  const detectedTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch {
      return 'Asia/Kolkata';
    }
  }, []);

  // Cooldown countdown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMsg(null);
      const res = await api.sendOtp(email.trim().toLowerCase());
      if (res.emailDelivery === 'delivered') {
        setSuccessMsg(`Verification code sent to ${email.trim()}! Please check your inbox (and spam folder).`);
      } else {
        setSuccessMsg(`Verification code sent to ${email.trim()}! Please check your email inbox.`);
      }
      if (res.emailDeliveryError) {
        setDeliveryNote(`SMTP Notice: ${res.emailDeliveryError}`);
      } else {
        setDeliveryNote(null);
      }
      setResendCooldown(res.resendCooldown || 20);
      setRegisterStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP code received strictly via email
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.verifyOtp(email.trim().toLowerCase(), otpCode.trim());
      if (res.token && res.user) {
        localStorage.setItem('productivity_has_account', 'true');
        localStorage.setItem('last_user_email', email.trim().toLowerCase());
        setSuccessMsg('Email verified! Signing you in...');
        setTimeout(() => {
          onSuccess(res.user!);
        }, 350);
      } else if (res.isExistingUser) {
        setSuccessMsg('Account already registered! Please sign in with your password.');
        setMode('login');
      } else {
        setSuccessMsg('Code verified! Please enter your name and choose a password.');
        setRegisterStep(3);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code. Please check your email and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Complete Sign Up with Name & Password
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.register({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        password,
        confirmPassword,
        timezone: detectedTimezone,
      });

      localStorage.setItem('productivity_has_account', 'true');
      localStorage.setItem('last_user_email', email.trim().toLowerCase());

      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Failed to create your account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Login with Email & Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.login({
        email: email.trim().toLowerCase(),
        password,
      });

      localStorage.setItem('productivity_has_account', 'true');
      localStorage.setItem('last_user_email', email.trim().toLowerCase());

      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In with Firebase Auth
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser.email) {
        throw new Error('No email found with Google account');
      }

      const idToken = await firebaseUser.getIdToken();
      const res = await api.firebaseLogin({
        email: firebaseUser.email,
        name: firebaseUser.displayName || undefined,
        timezone: detectedTimezone,
        uid: firebaseUser.uid,
        idToken,
      });

      localStorage.setItem('productivity_has_account', 'true');
      localStorage.setItem('last_user_email', firebaseUser.email.toLowerCase());

      onSuccess(res.user);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User closed or dismissed popup, no error needed
        return;
      }
      if (code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups or use Email & OTP login.');
        return;
      }
      console.warn('Google Sign-In warning:', err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetRegisterFlow = () => {
    setRegisterStep(1);
    setOtpCode('');
    setError(null);
    setSuccessMsg(null);
    setDeliveryNote(null);
  };

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotCooldown, setForgotCooldown] = useState<number>(0);

  // Countdown timer for forgot password resend
  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const timer = setInterval(() => {
      setForgotCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotCooldown]);

  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    try {
      setForgotLoading(true);
      setForgotError(null);
      setForgotSuccess(null);
      const res = await api.forgotPassword(forgotEmail.trim().toLowerCase());
      setForgotSuccess(res.message || `Reset code sent to ${forgotEmail.trim()}! Please check your inbox.`);
      setForgotCooldown(res.resendCooldown || 15);
      setForgotStep(2);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send reset code. Please ensure your email is registered.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleExecuteResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotCode || forgotCode.trim().length < 4) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    try {
      setForgotLoading(true);
      setForgotError(null);
      const res = await api.resetPassword({
        email: forgotEmail.trim().toLowerCase(),
        code: forgotCode.trim(),
        newPassword: forgotNewPassword,
        confirmPassword: forgotConfirmPassword,
      });

      localStorage.setItem('productivity_has_account', 'true');
      localStorage.setItem('last_user_email', forgotEmail.trim().toLowerCase());

      setForgotSuccess('Password reset successfully! Launching your workspace...');
      setTimeout(() => {
        setShowForgotModal(false);
        onSuccess(res.user);
      }, 700);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password. Please check your verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div id="auth-screen-container" className="pastel-auth-screen">
      {/* Floating Pastel Glass Card */}
      <div className="pastel-login-container">
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md rounded-[35px] flex flex-col items-center justify-center p-6 animate-fadeIn">
            <NeonSpinner
              size="md"
              text={mode === 'login' ? 'Signing In...' : 'Please wait...'}
            />
          </div>
        )}

        {/* App Logo & Heading */}
        <div className="flex flex-col items-center justify-center mb-3">
          <AppLogo size="lg" variant="glow" />
          <div className="text-xs font-bold text-slate-800 tracking-wider uppercase mt-2">
            TO_DO_LIST
          </div>
        </div>

        {/* Heading */}
        <div className="pastel-heading">
          {mode === 'login' ? 'Sign In' : 'Sign Up'}
        </div>

        {/* Error and Info alerts */}
        {error && (
          <div className="mt-4 p-3 bg-red-50/90 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}
        {deliveryNote && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
            {deliveryNote}
          </div>
        )}

        {/* MODE: LOGIN (Standard Clean Pastel Login - NO Astronaut Theme) */}
        {mode === 'login' && (
          <form className="pastel-form" onSubmit={handleLogin}>
            <input
              placeholder="E-mail"
              id="email"
              name="email"
              type="email"
              className="pastel-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              placeholder="Password"
              id="password"
              name="password"
              type="password"
              className="pastel-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <span className="pastel-forgot-password">
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotStep(1);
                  setForgotCode('');
                  setForgotNewPassword('');
                  setForgotConfirmPassword('');
                  setForgotError(null);
                  setForgotSuccess(null);
                  setShowForgotModal(true);
                }}
              >
                Forgot Password ?
              </button>
            </span>

            <button
              type="submit"
              disabled={isLoading}
              className="pastel-login-button"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* MODE: REGISTER (3-Step Flow: Email -> Email OTP -> Profile Info) */}
        {mode === 'register' && (
          <div className="mt-4">
            {/* Step 1: Request OTP to email */}
            {registerStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <p className="text-center text-xs text-slate-500">
                  Enter your email address to receive a verification code.
                </p>
                <input
                  placeholder="E-mail"
                  id="register-email"
                  name="email"
                  type="email"
                  className="pastel-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="pastel-login-button mt-4"
                >
                  {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {/* Step 2: Enter OTP received strictly through email - NO on-screen OTP code! */}
            {registerStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="text-center text-xs text-slate-500">
                  Verification code sent to <strong>{email}</strong>
                  <br />
                  <button
                    type="button"
                    onClick={() => setRegisterStep(1)}
                    className="text-blue-500 hover:underline text-[11px] mt-1 inline-block"
                  >
                    Change email
                  </button>
                </div>

                <input
                  placeholder="6-digit code"
                  id="otp-code-input"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="pastel-input text-center tracking-widest font-mono text-lg"
                  required
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="pastel-login-button mt-4"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                  <button
                    type="button"
                    onClick={() => setRegisterStep(1)}
                    className="hover:text-slate-800"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={handleSendOtp}
                    className="text-blue-500 hover:underline disabled:text-slate-400 font-semibold"
                  >
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Complete profile name and password */}
            {registerStep === 3 && (
              <form onSubmit={handleCompleteRegistration} className="space-y-2">
                <input
                  placeholder="Full Name"
                  id="register-name"
                  type="text"
                  className="pastel-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
                <input
                  placeholder="Create Password (min 6 chars)"
                  id="register-password"
                  type="password"
                  className="pastel-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <input
                  placeholder="Confirm Password"
                  id="register-confirm-password"
                  type="password"
                  className="pastel-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="pastel-login-button mt-4"
                >
                  {isLoading ? 'Creating Account...' : 'Complete Sign Up'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Toggle between Sign In & Sign Up */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              resetRegisterFlow();
            }}
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            {mode === 'login'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </button>
        </div>

        {/* Divider & Google Sign-In with Firebase */}
        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-semibold text-slate-700 shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* License Agreement Link */}
        <span className="pastel-agreement">
          <button
            type="button"
            onClick={() => setShowAgreementModal(true)}
          >
            Learn user licence agreement
          </button>
        </span>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 mb-2 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {forgotStep === 1 ? 'Reset Your Password' : 'Set New Password'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {forgotStep === 1
                  ? 'Enter your account email to receive a 6-digit recovery code.'
                  : `Enter the code sent to ${forgotEmail}`}
              </p>
            </div>

            {/* Error and Success messages */}
            {forgotError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{forgotError}</span>
              </div>
            )}
            {forgotSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestResetOtp} className="space-y-3">
                <input
                  type="email"
                  placeholder="Your account email"
                  className="pastel-input !mt-1"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotError(null);
                      setForgotSuccess(null);
                    }}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail}
                    className="flex-1 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleExecuteResetPassword} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="pastel-input text-center font-mono tracking-widest text-base !mt-0"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="New password (min 6 chars)"
                    className="pastel-input !mt-0"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="pastel-input !mt-0"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotError(null);
                      setForgotSuccess(null);
                    }}
                    className="hover:text-slate-800 text-[11px]"
                  >
                    ← Change email
                  </button>
                  <button
                    type="button"
                    disabled={forgotCooldown > 0 || forgotLoading}
                    onClick={handleRequestResetOtp}
                    className="text-blue-500 hover:underline disabled:text-slate-400 font-semibold text-[11px]"
                  >
                    {forgotCooldown > 0 ? `Resend (${forgotCooldown}s)` : 'Resend Code'}
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotError(null);
                      setForgotSuccess(null);
                    }}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || forgotCode.length < 6 || forgotNewPassword.length < 6}
                    className="flex-1 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs"
                  >
                    {forgotLoading ? 'Updating...' : 'Reset & Sign In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Licence Agreement Modal */}
      {showAgreementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 text-center">
              User Licence Agreement
            </h3>
            <div className="max-h-60 overflow-y-auto text-xs text-slate-600 space-y-2 pr-1">
              <p>
                By accessing or using this productivity system, you agree to be bound by the terms and conditions outlined below.
              </p>
              <p>
                1. <strong>Account Responsibility:</strong> You are responsible for maintaining the security of your credentials and verification codes.
              </p>
              <p>
                2. <strong>Email Notifications:</strong> You consent to receive scheduled task digests, overdue reminders, and authentication emails.
              </p>
              <p>
                3. <strong>Data Privacy:</strong> Your personal tasks, schedule, and completion history remain private to your authenticated account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAgreementModal(false)}
              className="pastel-login-button !py-2.5 !text-xs"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
