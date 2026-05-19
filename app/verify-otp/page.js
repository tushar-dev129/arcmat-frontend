'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/Toast';
import { ClipLoader } from 'react-spinners';
import clsx from 'clsx';
import { useVerifyOtpMutation, useResendOtpMutation } from '@/hooks/useAuth';
import BackLink from '@/components/ui/BackLink';

const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mobile = searchParams.get('mobile');

    const [timeLeft, setTimeLeft] = useState(30);
    const [canResend, setCanResend] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(otpSchema),
    });

    const verifyOtpMutation = useVerifyOtpMutation();
    const resendOtpMutation = useResendOtpMutation();

    useEffect(() => {
        if (!mobile) {
            toast.error('Mobile number not found. Redirecting to register.', 'Error');
            router.push('/auth/register');
        }
    }, [mobile, router]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const onSubmit = (data) => {
        if (!mobile) return;

        verifyOtpMutation.mutate({ mobile, otp: data.otp }, {
            onSuccess: () => {
                toast.success('Mobile verified successfully!', 'Success');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Verification failed. Please try again.', 'Verification Failed');
            }
        });
    };

    const handleResendOtp = async () => {

        toast.info('Resending OTP...', 'Please wait');

        resendOtpMutation.mutate({ mobile }, {
            onSuccess: () => {
                setTimeLeft(30);
                setCanResend(false);
                toast.success('OTP Resent!', 'Check your phone');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to resend OTP');
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fcf8f6] px-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-sm border border-[#e2e8f0]">
                <div className="mb-6">
                    <BackLink href="/auth/register" />
                </div>

                <h2 className="text-3xl font-semibold text-[#4a5568] mb-2">Verify Your Mobile</h2>
                <p className="text-[#718096] mb-8">
                    We've sent a 6-digit code to <span className="font-medium text-[#d9a88a]">{mobile}</span>.
                    Please enter it below to verify your account.
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
                        disabled={isSubmitting || verifyOtpMutation.isPending}
                        className={clsx(
                            'w-full py-3.5 rounded-lg text-base font-medium text-white transition-all',
                            isSubmitting || verifyOtpMutation.isPending ? 'bg-[#d9a88a]/70 cursor-not-allowed' : 'bg-[#d9a88a] hover:bg-white hover:text-[#d9a88a] border border-[#d9a88a] duration-300'
                        )}
                    >
                        {isSubmitting || verifyOtpMutation.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <ClipLoader size={18} color="#ffffff" />
                                <span>Verifying...</span>
                            </span>
                        ) : (
                            'Verify & Create Account'
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-[#718096] text-sm">
                            Didn't receive the code?{' '}
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={!canResend}
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

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><ClipLoader color="#d9a88a" /></div>}>
            <VerifyOtpContent />
        </Suspense>
    );
}
