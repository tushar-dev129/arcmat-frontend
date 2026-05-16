'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';
import { ClipLoader } from 'react-spinners';
import { toast } from '@/components/ui/Toast';
import { useVerifyLoginOtpMutation, useResendLoginOtpMutation } from '@/hooks/useAuth';
import BackLink from '@/components/ui/BackLink';

const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

function LoginOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const [timeLeft, setTimeLeft] = useState(30);
    const [canResend, setCanResend] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(otpSchema),
    });

    const verifyLoginOtpMutation = useVerifyLoginOtpMutation();
    const resendLoginOtpMutation = useResendLoginOtpMutation();

    useEffect(() => {
        if (!email) {
            toast.error('Email not found. Redirecting to login.', 'Error');
            router.push('/auth/login');
        }
    }, [email, router]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
        setCanResend(true);
    }, [timeLeft]);

    const onSubmit = (data) => {
        if (!email) return;

        verifyLoginOtpMutation.mutate({ email, otp: data.otp });
    };

    const handleResendOtp = () => {
        if (!email) return;

        resendLoginOtpMutation.mutate({ email }, {
            onSuccess: () => {
                setTimeLeft(30);
                setCanResend(false);
                toast.success('OTP resent to your email.', 'Check your inbox');
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || 'Failed to resend OTP');
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fcf8f6] px-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-sm border border-[#e2e8f0]">
                <div className="mb-6">
                    <BackLink href="/auth/login" />
                </div>

                <h2 className="text-3xl font-semibold text-[#4a5568] mb-2">Verify Login</h2>
                <p className="text-[#718096] mb-8">
                    We sent a 6-digit code to <span className="font-medium text-[#d9a88a]">{email}</span>.
                    Please enter it to complete sign in.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            {...register('otp')}
                            className={clsx(
                                'w-full px-4 py-3.5 border rounded-lg text-center text-2xl tracking-[0.5em] font-medium text-[#4a5568] placeholder:text-[#a0aec0] placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#d9a88a] focus:border-transparent transition-all',
                                errors.otp ? 'border-red-500' : 'border-[#e2e8f0]'
                            )}
                        />
                        {errors.otp && <p className="mt-1.5 text-center text-sm text-red-500">{errors.otp.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || verifyLoginOtpMutation.isPending}
                        className={clsx(
                            'w-full py-3.5 rounded-lg text-base font-medium text-white transition-all',
                            isSubmitting || verifyLoginOtpMutation.isPending ? 'bg-[#d9a88a]/70 cursor-not-allowed' : 'bg-[#d9a88a] hover:bg-white hover:text-[#d9a88a] border border-[#d9a88a] duration-300'
                        )}
                    >
                        {isSubmitting || verifyLoginOtpMutation.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <ClipLoader size={18} color="#ffffff" />
                                <span>Verifying...</span>
                            </span>
                        ) : (
                            'Verify & Sign In'
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-[#718096] text-sm">
                            Didn&apos;t receive the code?{' '}
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={!canResend || resendLoginOtpMutation.isPending}
                                className={clsx(
                                    'font-medium transition-colors',
                                    canResend ? 'text-[#d9a88a] hover:text-[#c99775] underline cursor-pointer' : 'text-[#cbd5e0] cursor-not-allowed'
                                )}
                            >
                                {canResend ? 'Resend OTP' : `Resend in ${timeLeft}s`}
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function LoginOtpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><ClipLoader color="#d9a88a" /></div>}>
            <LoginOtpContent />
        </Suspense>
    );
}
