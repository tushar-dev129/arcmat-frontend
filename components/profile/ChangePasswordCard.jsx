import React, { useState } from 'react';
import { useChangePasswordMutation } from '@/hooks/useAuth';
import clsx from 'clsx';
import { Loader2, Lock } from 'lucide-react';
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className="px-8 py-6 border-b border-gray-100 bg-white">
                <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
            </div>

            <div className="p-8">
                <form onSubmit={handleSubmit} className="max-w-xl">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="Enter current password"
                                    required
                                    disabled={changePasswordMutation.isPending}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="Enter new password"
                                    required
                                    disabled={changePasswordMutation.isPending}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="Confirm new password"
                                    required
                                    disabled={changePasswordMutation.isPending}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            type="submit"
                            disabled={changePasswordMutation.isPending}
                            className={clsx(
                                "bg-primary text-white px-6 py-2 transition-all",
                                changePasswordMutation.isPending ? "opacity-70 cursor-not-allowed" : "hover:bg-white hover:text-primary hover:border-primary border"
                            )}
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
