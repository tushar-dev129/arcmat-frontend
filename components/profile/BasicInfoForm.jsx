import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import { Loader2, User, Mail, Phone, Shield } from 'lucide-react';
import clsx from 'clsx';

const BasicInfoForm = ({ user, onSubmit, isSubmitting }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            name: user?.name || '',
            mobile: user?.mobile || '',
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name || '',
                mobile: user.mobile || '',
            });
        }
    }, [user, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <User size={16} />
                        Full Name
                    </label>
                    <input
                        {...register('name', { required: 'Name is required' })}
                        className={clsx(
                            "w-full px-5 py-4 rounded-2xl border transition-all outline-none text-sm font-medium",
                            errors.name
                                ? "border-red-200 bg-red-50/30 focus:border-red-400"
                                : "border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm"
                        )}
                        placeholder="e.g. John Doe"
                    />
                    {errors.name && <p className="text-red-500 text-[13px] font-bold mt-1 ml-1  tracking-wider">{errors.name.message}</p>}
                </div>

                {/* Email (Read Only) */}
                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <Mail size={16} />
                        Email Address
                    </label>
                    <div className="relative group">
                        <input
                            type="email"
                            value={user?.email || ''}
                            readOnly
                            className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-400 text-sm font-medium cursor-not-allowed outline-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-black text-gray-300  tracking-tighter">Read Only</span>
                        </div>
                    </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <Phone size={16} />
                        Phone Number
                    </label>
                    <input
                        {...register('mobile', { required: 'Phone number is required' })}
                        className={clsx(
                            "w-full px-5 py-4 rounded-2xl border transition-all outline-none text-sm font-medium",
                            errors.mobile
                                ? "border-red-200 bg-red-50/30 focus:border-red-400"
                                : "border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm"
                        )}
                        placeholder="+91 9876543210"
                    />
                    {errors.mobile && <p className="text-red-500 text-[13px] font-bold mt-1 ml-1  tracking-wider">{errors.mobile.message}</p>}
                </div>

                {/* Account Role (Read Only) */}
                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <Shield size={16} />
                        Account Role
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={user?.role || 'User'}
                            readOnly
                            className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-400 text-sm font-medium capitalize cursor-not-allowed outline-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-black text-gray-300  tracking-tighter">System Only</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-50">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white font-bold rounded-2xl px-10 py-4 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    text={isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={18} />
                            <span>Updating...</span>
                        </div>
                    ) : (
                        <span className="flex items-center gap-2">
                            Save Changes
                        </span>
                    )}
                />
            </div>
        </form>
    );
};

export default BasicInfoForm;
