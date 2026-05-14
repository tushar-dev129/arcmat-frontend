import React, { useState } from 'react';
import { useChangePasswordMutation } from '@/hooks/useAuth';
import clsx from 'clsx';
import { Loader2, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

const ChangePasswordCard = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const changePasswordMutation = useChangePasswordMutation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords don't match", "Validation Error");
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters", "Validation Error");
            return;
        }

        changePasswordMutation.mutate({
            oldPassword: formData.currentPassword,
            newPassword: formData.newPassword
        }, {
            onSuccess: () => {
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        });
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden mt-8 transition-all hover:shadow-md">
            <div className="px-10 py-8 border-b border-gray-200 bg-white flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm">
                    <KeyRound size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Security & Password</h2>
                    <p className="text-sm text-gray-500 font-medium">Keep your account secure with a strong password</p>
                </div>
            </div>

            <div className="p-10">
                <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Current Password */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                                <Lock size={16} />
                                Current Password
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                                placeholder="••••••••"
                                required
                                disabled={changePasswordMutation.isPending}
                            />
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                                <ShieldCheck size={16} />
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                                placeholder="Min. 6 characters"
                                required
                                disabled={changePasswordMutation.isPending}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                                <ShieldCheck size={16} />
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                                placeholder="Re-enter new password"
                                required
                                disabled={changePasswordMutation.isPending}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-50">
                        <Button
                            type="submit"
                            disabled={changePasswordMutation.isPending}
                            className="bg-primary text-white font-bold rounded-2xl px-12 py-4 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {changePasswordMutation.isPending ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Updating...</span>
                                </div>
                            ) : "Update Password"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordCard;
