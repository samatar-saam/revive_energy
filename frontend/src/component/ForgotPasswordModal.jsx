// src/components/ForgotPasswordModal.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPasswordModal = ({ isOpen, onClose, prefilledEmail = '' }) => {
  const STEPS = { EMAIL: 1, OTP: 2, NEW_PASSWORD: 3, SUCCESS: 4 };

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState(prefilledEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [otpError, setOtpError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const inputRefs = useRef([]);

  // ─── Helper to ensure OTP is an array ──────────────────────────
  const ensureOtpArray = (val) => (Array.isArray(val) ? val : ['', '', '', '', '', '']);

  // ─── Password validation ──────────────────────────────────────
  const isPasswordValid = (pwd) => {
    return /^[A-Za-z0-9]{6,}$/.test(pwd);
  };

  // ─── OTP handlers ──────────────────────────────────────────────
  const handleOtpChange = (idx, value) => {
    const currentOtp = ensureOtpArray(otp);
    const newOtp = [...currentOtp];
    newOtp[idx] = value.slice(0, 1);
    setOtp(newOtp);
    if (value && idx < 5) inputRefs.current[idx + 1]?.focus();
    setOtpError('');
    setError('');
  };

  const handleOtpKeyDown = (idx, e) => {
    const currentOtp = ensureOtpArray(otp);
    if (e.key === 'Backspace' && !currentOtp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const otpString = ensureOtpArray(otp).join('');

  // ─── API calls ──────────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      setStep(STEPS.OTP);
      setResendTimer(60);
      setCanResend(false);
      setSuccess('OTP sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOtpError('');
    if (otpString.length < 6) {
      setOtpError('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAttempts((prev) => prev + 1);
        throw new Error(data.message || 'Invalid OTP');
      }
      setStep(STEPS.NEW_PASSWORD);
      setError('');
      // ✅ FIX: Do NOT clear OTP – we need it for the reset call!
      // setOtp(['', '', '', '', '', '']); // ← REMOVED
    } catch (err) {
      setOtpError(err.message);
      if (attempts >= 4) setOtpError('Too many attempts. Request a new OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ─── Validate password before sending ──────────────────────
    if (!isPasswordValid(newPassword)) {
      setError('Password must be at least 6 characters and contain only letters and numbers.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // ─── DEBUG: Log the payload ─────────────────────────────────
    const payload = {
      email,
      otp: otpString, // This now has the correct value
      new_password: newPassword,
    };
    console.log('🔐 Reset password payload:', payload);

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Reset failed');
      }
      setStep(STEPS.SUCCESS);
      setSuccess('Password reset successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    setOtpError('');
    try {
      const res = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend');
      setSuccess('New OTP sent.');
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) { setCanResend(true); clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // ─── Reset modal state ──────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setStep(STEPS.EMAIL);
      setEmail(prefilledEmail || '');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      setOtpError('');
      setAttempts(0);
      setResendTimer(0);
      setCanResend(true);
      setShowPassword(false);
      setLoading(false);
    }
  }, [isOpen, prefilledEmail]);

  if (!isOpen) return null;

  // ─── Render steps ────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case STEPS.EMAIL:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#11402D]/10 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-[#11402D]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900">Forgot Password</h3>
              <p className="text-sm text-gray-500 mt-1">Enter your registered email to receive a reset code.</p>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                    required
                    autoFocus
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {success}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#11402D] text-white rounded-xl font-semibold hover:bg-[#0E2A1C] transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        );

      case STEPS.OTP:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#11402D]/10 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#11402D]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900">Verify Email</h3>
              <p className="text-sm text-gray-500 mt-1">Enter the 6‑digit code sent to <strong>{email}</strong></p>
            </div>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">OTP Code</label>
                <div className="flex justify-center gap-2">
                  {ensureOtpArray(otp).map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-[#11402D] transition"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {otpError}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-[#11402D] hover:underline font-medium"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Resend in {resendTimer}s
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => { setStep(STEPS.EMAIL); setError(''); setOtpError(''); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Change email
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || otpString.length < 6}
                className="w-full py-3 bg-[#11402D] text-white rounded-xl font-semibold hover:bg-[#0E2A1C] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </button>
            </form>
          </motion.div>
        );

      case STEPS.NEW_PASSWORD:
        const passwordOk = isPasswordValid(newPassword);
        const passwordsMatch = newPassword === confirmPassword;
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#11402D]/10 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-[#11402D]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900">Create New Password</h3>
              <p className="text-sm text-gray-500 mt-1">
                At least <strong>6 characters</strong> – letters and numbers <strong>only</strong>.
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="e.g. abc123"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-1 text-xs">
                    {passwordOk ? (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Valid password</span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1"><AlertCircle size={14} /> Must be 6+ characters (letters & numbers only)</span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                    required
                  />
                </div>
                {confirmPassword && newPassword && confirmPassword !== newPassword && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={14} /> Passwords do not match</p>
                )}
                {confirmPassword && newPassword && confirmPassword === newPassword && passwordOk && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Passwords match</p>
                )}
              </div>
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !passwordOk || !passwordsMatch}
                className="w-full py-3 bg-[#11402D] text-white rounded-xl font-semibold hover:bg-[#0E2A1C] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Password'
                )}
              </button>
            </form>
          </motion.div>
        );

      case STEPS.SUCCESS:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="font-display text-2xl font-bold text-gray-900">Password Reset Successful!</h3>
            <p className="text-gray-500 mt-2">Your password has been updated. You can now login.</p>
            <button onClick={onClose} className="mt-6 px-6 py-3 bg-[#11402D] text-white rounded-xl font-semibold hover:bg-[#0E2A1C] transition">
              Back to Login
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
          <X className="w-5 h-5" />
        </button>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;