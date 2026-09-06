import React, { useEffect, useRef, useState } from 'react';
import { Mail, ArrowLeft, Lock } from 'lucide-react';
import { UserProfile } from '../../types';
import { ApiError, registerAccount, requestLogin, superadminLogin, verifyOtp } from '../../api/client';
import { AuthShell, FIELD_CLASS, OTP_CLASS, BTN_CLASS, LINK_CLASS, KICK_LABEL_CLASS } from './AuthShell';

interface AuthGateProps {
  onAuthenticated: (user: UserProfile, hasSubmittedSurvey: boolean) => Promise<void> | void;
  onSuperadminAuthenticated: () => Promise<void> | void;
}

type Mode = 'login' | 'register' | 'verify' | 'superadmin-password';

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;

const SCREEN_COPY: Record<Mode, { kicker: string; title: string; sub: string }> = {
  login: {
    kicker: 'Sign in',
    title: 'Welcome to our reunion hub!',
    sub: 'Enter your email address. You will be automatically redirected to the registration page if you do not have an account yet.',
  },
  register: {
    kicker: 'New account',
    title: 'Create an account',
    sub: 'Batch 2007 alumni only. The invite code is posted on our Messenger group.',
  },
  verify: {
    kicker: 'Verify',
    title: 'Enter your code',
    sub: '',
  },
  'superadmin-password': {
    kicker: 'Restricted · superadmin',
    title: 'Superadmin password',
    sub: 'This identity skips OTP entirely.',
  },
};

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

  const copy = SCREEN_COPY[mode];
  const verifySub = infoMessage || `We sent a 6-digit code to ${pendingEmail}`;

  return (
    <AuthShell kicker={copy.kicker} title={copy.title} sub={mode === 'verify' ? verifySub : copy.sub}>
      {mode === 'superadmin-password' ? (
        <form onSubmit={handleSuperadminSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2.5">
            <span className="w-[46px] h-[46px] rounded-2xl grid place-items-center bg-[rgba(20,33,29,.06)] border border-[rgba(20,33,29,.16)]">
              <Lock className="w-5 h-5 text-on-surface-variant" />
            </span>
            {pendingEmail && (
              <span className="font-mono text-label text-on-surface-variant">{pendingEmail}</span>
            )}
          </div>

          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            placeholder="Superadmin password"
            value={superadminPassword}
            onChange={(e) => setSuperadminPassword(e.target.value)}
            className={`${FIELD_CLASS} text-center`}
          />

          {error && <p className="text-body text-error text-center">{error}</p>}

          <button type="submit" disabled={isSubmitting} className={BTN_CLASS}>
            {isSubmitting ? 'Verifying…' : 'Log in'}
          </button>

          <button type="button" onClick={resetToLogin} className={`${LINK_CLASS} self-center flex items-center gap-1`}>
            <ArrowLeft className="w-3 h-3" />
            <span>Use a different email</span>
          </button>
        </form>
      ) : mode === 'verify' ? (
        <form onSubmit={handleVerify} className="flex flex-col gap-[17px]">
          <div className="flex gap-[7px]" onPaste={handleOtpPaste}>
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
                className={OTP_CLASS}
              />
            ))}
          </div>

          {error && <p className="text-body text-error text-center">{error}</p>}

          <button type="submit" disabled={isSubmitting} className={BTN_CLASS}>
            {isSubmitting ? 'Verifying…' : 'Verify & Continue'}
          </button>

          <div className="flex items-center justify-between gap-2.5">
            <button type="button" onClick={resetToLogin} className={LINK_CLASS}>
              Use a different email
            </button>
            <button type="button" onClick={handleResend} disabled={cooldown > 0 || isSubmitting} className={LINK_CLASS}>
              {cooldown > 0 ? (
                <span className="font-mono text-label no-underline text-on-surface-variant">Resend in {cooldown}s</span>
              ) : (
                'Resend code'
              )}
            </button>
          </div>
        </form>
      ) : mode === 'login' ? (
        <form onSubmit={handleSendLoginCode} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className={KICK_LABEL_CLASS}>Email address</span>
            <span className="flex items-center gap-2.5 rounded-xl border border-[rgba(20,33,29,.16)] bg-white/70 px-3.5 py-3 focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10">
              <Mail className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
              <input
                type="email"
                autoComplete="email"
                placeholder="juan.delacruz@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-0 bg-transparent text-body text-on-background placeholder:italic placeholder:font-serif placeholder:text-[#3d4d47] focus:outline-none"
              />
            </span>
          </label>

          {error && <p className="text-body text-error">{error}</p>}

          <button type="submit" disabled={isSubmitting} className={BTN_CLASS}>
            {isSubmitting ? 'Sending…' : 'Send login code'}
          </button>

          <p className="text-center text-body text-on-surface-variant/85">
            New here?{' '}
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setInfoMessage(''); }}
              className={LINK_CLASS}
            >
              Create an account
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {infoMessage && (
            <p className="text-body text-center text-primary bg-[rgba(14,90,77,.08)] border border-[rgba(14,90,77,.25)] rounded-xl px-3 py-2">
              {infoMessage}
            </p>
          )}

          <label className="flex flex-col gap-2">
            <span className={KICK_LABEL_CLASS}>Email address</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="juan.delacruz@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={FIELD_CLASS}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={KICK_LABEL_CLASS}>Full name</span>
            <input
              type="text"
              autoComplete="name"
              placeholder="e.g. Juan dela Cruz"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={FIELD_CLASS}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={KICK_LABEL_CLASS}>Mobile / WhatsApp number</span>
            <input
              type="tel"
              autoComplete="tel"
              placeholder="e.g. 09171234567"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className={FIELD_CLASS}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={KICK_LABEL_CLASS}>Invite code</span>
            <input
              type="text"
              autoComplete="off"
              placeholder="From the batch Messenger group"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className={FIELD_CLASS}
            />
          </label>

          {error && <p className="text-body text-error">{error}</p>}

          <button type="submit" disabled={isSubmitting} className={BTN_CLASS}>
            {isSubmitting ? 'Sending…' : 'Create account'}
          </button>

          <p className="text-center text-body text-on-surface-variant/85">
            Already registered?{' '}
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setInfoMessage(''); }}
              className={LINK_CLASS}
            >
              Log in
            </button>
          </p>
        </form>
      )}
    </AuthShell>
  );
};
