'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, CheckCircle2, ArrowRight, RefreshCw, X } from 'lucide-react';
import { useAddEmailMutation, useVerifyEmailOtpMutation } from '@/hooks/useAuth';
import { toast } from '@/components/ui/Toast';
import clsx from 'clsx';

/**
 * AddEmailVerification
 * A self-contained, animated panel for adding and verifying an email address.
 *
 * Usage: Drop into any page/dashboard where you want to prompt email verification.
 * Props:
 *  - onSuccess: () => void  (called after email is fully verified)
 *  - onDismiss: () => void  (called if user closes the panel)
 *  - compact: bool          (renders as a small inline card vs full-size panel)
 */
export default function AddEmailVerification({ onSuccess, onDismiss, compact = false }) {
    const [step, setStep] = useState('enter-email'); // 'enter-email' | 'enter-otp' | 'done'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [emailError, setEmailError] = useState('');
    const [otpError, setOtpError] = useState('');

    const addEmailMutation = useAddEmailMutation();
    const verifyEmailOtpMutation = useVerifyEmailOtpMutation();

    const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

    const handleSendOtp = async () => {
        setEmailError('');
        if (!email.trim()) return setEmailError('Please enter your email address.');
        if (!validateEmail(email)) return setEmailError('Please enter a valid email address.');

        addEmailMutation.mutate({ email: email.trim() }, {
            onSuccess: () => {
                toast.success(`Verification code sent to ${email}`, 'Check Your Email');
                setStep('enter-otp');
            },
            onError: (err) => {
                const msg = err?.response?.data?.message || 'Failed to send OTP. Please try again.';
                setEmailError(msg);
                toast.error(msg, 'Error');
            }
        });
    };

    const handleVerifyOtp = async () => {
        setOtpError('');
        if (!otp.trim() || otp.trim().length !== 6) return setOtpError('Please enter the 6-digit code.');

        verifyEmailOtpMutation.mutate({ otp: otp.trim() }, {
            onSuccess: () => {
                setStep('done');
                toast.success('Your email has been verified!', 'Email Verified');
                setTimeout(() => onSuccess?.(), 1200);
            },
            onError: (err) => {
                const msg = err?.response?.data?.message || 'Invalid or expired code. Please try again.';
                setOtpError(msg);
            }
        });
    };

    const handleResend = () => {
        setOtp('');
        setOtpError('');
        setStep('enter-email');
    };

    return (
        <div className={clsx(
            "w-full bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden",
            compact ? "max-w-sm" : "max-w-md"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "flex items-center justify-center w-9 h-9 rounded-xl",
                        step === 'done' ? "bg-emerald-50 text-emerald-500" : "bg-[#fef7f2] text-[#d9a88a]"
                    )}>
                        {step === 'done' ? <CheckCircle2 className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-[#2d3748]">
                            {step === 'done' ? 'Email Verified!' : step === 'enter-otp' ? 'Enter Verification Code' : 'Add Your Email'}
                        </h3>
                        <p className="text-xs text-[#718096] mt-0.5">
                            {step === 'done'
                                ? `${email} is now verified`
                                : step === 'enter-otp'
                                    ? `Code sent to ${email}`
                                    : 'Receive notifications & recover your account'}
                        </p>
                    </div>
                </div>
                {onDismiss && step !== 'done' && (
                    <button
                        onClick={onDismiss}
                        className="text-[#a0aec0] hover:text-[#718096] transition-colors p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="px-5 pb-5">
                <AnimatePresence mode="wait">

                    {/* Step 1: Enter Email */}
                    {step === 'enter-email' && (
                        <motion.div
                            key="enter-email"
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.22 }}
                            className="space-y-3"
                        >
                            <div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                                    placeholder="your@email.com"
                                    className={clsx(
                                        "w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[#fafafa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d9a88a] focus:border-transparent transition-all",
                                        emailError ? "border-red-400" : "border-[#e2e8f0]"
                                    )}
                                />
                                {emailError && <p className="mt-1.5 text-xs text-red-500">{emailError}</p>}
                            </div>
                            <button
                                onClick={handleSendOtp}
                                disabled={addEmailMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#d9a88a] hover:bg-[#c99775] text-white text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {addEmailMutation.isPending ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>Send Code <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {/* Step 2: Enter OTP */}
                    {step === 'enter-otp' && (
                        <motion.div
                            key="enter-otp"
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.22 }}
                            className="space-y-3"
                        >
                            <div>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                                    placeholder="6-digit code"
                                    maxLength={6}
                                    className={clsx(
                                        "w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[#fafafa] text-center tracking-[0.4em] font-semibold text-[#2d3748] placeholder:tracking-normal placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d9a88a] focus:border-transparent transition-all",
                                        otpError ? "border-red-400" : "border-[#e2e8f0]"
                                    )}
                                />
                                {otpError && <p className="mt-1.5 text-xs text-red-500">{otpError}</p>}
                            </div>
                            <button
                                onClick={handleVerifyOtp}
                                disabled={verifyEmailOtpMutation.isPending || otp.length < 6}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#d9a88a] hover:bg-[#c99775] text-white text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {verifyEmailOtpMutation.isPending ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>Verify Email <CheckCircle2 className="w-4 h-4" /></>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleResend}
                                className="w-full text-xs text-[#718096] hover:text-[#d9a88a] transition-colors"
                            >
                                ← Change email or resend code
                            </button>
                        </motion.div>
                    )}

                    {/* Step 3: Done */}
                    {step === 'done' && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="flex flex-col items-center py-2 gap-2"
                        >
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            </div>
                            <p className="text-sm font-semibold text-[#2d3748]">All set!</p>
                            <p className="text-xs text-[#718096] text-center">You&apos;ll now receive notifications at <span className="font-medium text-[#d9a88a]">{email}</span></p>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
