import React, { useEffect, useRef, useState } from 'react';
import { GraduationCap, Mail, Phone, User as UserIcon, ArrowLeft, Send, ShieldCheck, Lock, KeyRound } from 'lucide-react';
import { UserProfile } from '../../types';
import { ApiError, registerAccount, requestLogin, superadminLogin, verifyOtp } from '../../api/client';

interface AuthGateProps {
  onAuthenticated: (user: UserProfile, hasSubmittedSurvey: boolean) => Promise<void> | void;
  onSuperadminAuthenticated: () => Promise<void> | void;
}

type Mode = 'login' | 'register' | 'verify' | 'superadmin-password';

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthenticated, onSuperadminAuthenticated }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [superadminPassword, setSuperadminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendLoginCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setInfoMessage('');
    setIsSubmitting(true);
    try {
      const { message, requiresSuperadminPassword, accountNotFound } = await requestLogin(email.trim());
      if (requiresSuperadminPassword) {
        setPendingEmail(email.trim());
        setSuperadminPassword('');
        setMode('superadmin-password');
        return;
      }
      if (accountNotFound) {
        setInfoMessage(message);
        setMode('register');
        return;
      }
      setInfoMessage(message);
      setPendingEmail(email.trim());
      setOtp(Array(OTP_LENGTH).fill(''));
      setMode('verify');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !mobileNumber.trim() || !inviteCode.trim()) {
      setError('Please fill in your email, full name, mobile/WhatsApp number, and invite code.');
      return;
    }
    setError('');
    setInfoMessage('');
    setIsSubmitting(true);
    try {
      const { message, requiresSuperadminPassword } = await registerAccount({
        email: email.trim(),
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        inviteCode: inviteCode.trim(),
      });
      if (requiresSuperadminPassword) {
        setPendingEmail(email.trim());
        setSuperadminPassword('');
        setMode('superadmin-password');
        return;
      }
      setInfoMessage(message);
      setPendingEmail(email.trim());
      setOtp(Array(OTP_LENGTH).fill(''));
      setMode('verify');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuperadminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superadminPassword) {
      setError('Please enter the superadmin password.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await superadminLogin(pendingEmail, superadminPassword);
      await onSuperadminAuthenticated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setSuperadminPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const { message } = await requestLogin(pendingEmail);
      setInfoMessage(message);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setOtp(prev => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const { user, hasSubmittedSurvey } = await verifyOtp(pendingEmail, code);
      await onAuthenticated(user, hasSubmittedSurvey);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToLogin = () => {
    setMode('login');
    setError('');
    setInfoMessage('');
    setOtp(Array(OTP_LENGTH).fill(''));
    setSuperadminPassword('');
    setInviteCode('');
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex items-center justify-center font-sans px-4 py-10">
      <div className="paper-grain" aria-hidden="true" />

      <div className="w-full max-w-sm space-y-5">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded bg-primary text-on-primary flex items-center justify-center shadow-soft">
            <GraduationCap className="w-6 h-6 text-on-primary" />
          </div>
          <h1 className="font-serif font-semibold text-lg text-on-surface">
            Makati Science High School
          </h1>
          <p className="text-xs text-on-surface-variant">
            Batch 2007 Reunion Hub — sign in to continue
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded p-6 border border-outline-variant/30 shadow-soft space-y-4">
          {mode === 'superadmin-password' ? (
            <form onSubmit={handleSuperadminSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 text-on-primary-container flex items-center justify-center mx-auto border border-primary-container/50 mb-1">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="font-serif font-semibold text-base text-on-surface">
                  Superadmin password
                </h2>
                <p className="text-xs text-on-surface-variant">{pendingEmail}</p>
              </div>

              <div>
                <input
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  placeholder="Password"
                  value={superadminPassword}
                  onChange={(e) => setSuperadminPassword(e.target.value)}
                  className="w-full text-center px-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                />
              </div>

              {error && <p className="text-xs text-error text-center">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded bg-primary hover:opacity-90 disabled:opacity-60 text-on-primary font-semibold text-sm shadow-soft transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying…' : 'Log in'}</span>
              </button>

              <button
                type="button"
                onClick={resetToLogin}
                className="w-full text-xs text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Use a different email</span>
              </button>
            </form>
          ) : mode === 'verify' ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="font-serif font-semibold text-base text-on-surface">
                  Enter your code
                </h2>
                <p className="text-xs text-on-surface-variant">
                  {infoMessage || `We sent a 6-digit code to ${pendingEmail}`}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded border border-secondary/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                ))}
              </div>

              {error && <p className="text-xs text-error text-center">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded bg-primary hover:opacity-90 disabled:opacity-60 text-on-primary font-semibold text-sm shadow-soft transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying…' : 'Verify & Continue'}</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={resetToLogin}
                  className="text-on-surface-variant hover:text-on-surface flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Use a different email</span>
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || isSubmitting}
                  className="text-secondary hover:opacity-80 disabled:text-on-surface-variant disabled:opacity-60 font-semibold"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          ) : mode === 'login' ? (
            <form onSubmit={handleSendLoginCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-error">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded bg-primary hover:opacity-90 disabled:opacity-60 text-on-primary font-semibold text-sm shadow-soft transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending…' : 'Send login code'}</span>
              </button>

              <p className="text-center text-xs text-on-surface-variant">
                New here?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setInfoMessage(''); }}
                  className="text-secondary font-semibold hover:opacity-80"
                >
                  Create an account
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {infoMessage && (
                <p className="text-xs text-center text-on-primary-container bg-primary-container/20 border border-primary-container/50 rounded px-3 py-2">
                  {infoMessage}
                </p>
              )}

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Full name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Juan dela Cruz (IV-Curie)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Mobile / WhatsApp number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="e.g. 09171234567"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Invite code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="From the batch Messenger group"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded border border-secondary/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-error">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded bg-primary hover:opacity-90 disabled:opacity-60 text-on-primary font-semibold text-sm shadow-soft transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending…' : 'Create account'}</span>
              </button>

              <p className="text-center text-xs text-on-surface-variant">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setInfoMessage(''); }}
                  className="text-secondary font-semibold hover:opacity-80"
                >
                  Log in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
