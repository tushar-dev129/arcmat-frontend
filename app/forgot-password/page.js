'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/Toast';
import { useForgotPasswordMutation } from '@/hooks/useAuth';
import BackLink from '@/components/ui/BackLink';
import { ClipLoader } from 'react-spinners';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

const forgotPasswordSchema = z.object({
    mobile: z.string().length(10, 'Please enter a valid 10-digit mobile number').regex(/^\d+$/, 'Mobile number must contain only digits'),
});

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const forgotPasswordMutation = useForgotPasswordMutation();

    const onSubmit = (data) => {
        forgotPasswordMutation.mutate(data, {
            onSuccess: () => {
                toast.success('OTP sent to your mobile', 'Success');
                router.push(`/verify-otp?mobile=${encodeURIComponent(data.mobile)}&flow=reset`);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to send OTP', 'Error');
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fcf8f6] px-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-sm border border-[#e2e8f0]">
                <div className="mb-6">
                    <BackLink href="/auth/login" />
                </div>

                <h2 className="text-3xl font-semibold text-[#4a5568] mb-2">Forgot Password?</h2>
                <p className="text-[#718096] mb-8">
                    Enter your mobile number and we'll send you a 6-digit OTP to reset your password.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <input
                            type="tel"
                            maxLength={10}
                            placeholder="Enter your mobile number"
                            {...register('mobile')}
                            className={clsx(
                                'w-full px-4 py-3.5 border rounded-lg text-base text-[#4a5568] placeholder:text-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#d9a88a] focus:border-transparent transition-all',
                                errors.mobile ? 'border-red-500' : 'border-[#e2e8f0]'
                            )}
                        />
                        {errors.mobile && <p className="mt-1.5 text-sm text-red-500">{errors.mobile.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || forgotPasswordMutation.isPending}
                        className={clsx(
                            'w-full py-3.5 rounded-lg text-base font-medium text-white transition-all hover:text-[#d9a88a] hover:bg-white border border-[#d9a88a] duration-300',
                            isSubmitting || forgotPasswordMutation.isPending ? 'bg-[#d9a88a]/70 cursor-not-allowed' : 'bg-[#d9a88a]'
                        )}
                    >
                        {isSubmitting || forgotPasswordMutation.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <ClipLoader size={18} color="#ffffff" />
                                <span>Sending OTP...</span>
                            </span>
                        ) : (
                            'Send OTP'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
