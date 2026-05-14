import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import { Loader2, MapPin, User, Mail, Phone, Globe, Navigation } from 'lucide-react';
import clsx from 'clsx';

const AddressForm = ({ address, user, onSubmit, onCancel, isSubmitting }) => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            mobile: '',
            pincode: '',
            city: '',
            state: '',
            country: 'India',
            address1: '',
            address2: '',
            defaultaddress: 0
        }
    });

    useEffect(() => {
        if (address) {
            reset({
                first_name: address.first_name || '',
                last_name: address.last_name || '',
                email: address.email || '',
                mobile: address.mobile || '',
                pincode: address.pincode || '',
                city: address.city || '',
                state: address.state || '',
                country: address.country || 'India',
                address1: address.address1 || '',
                address2: address.address2 || '',
                defaultaddress: address.defaultaddress || 0
            });
        } else if (user) {
            const nameParts = user.name?.split(' ') || [];
            reset({
                first_name: nameParts[0] || '',
                last_name: nameParts.slice(1).join(' ') || '',
                email: user.email || '',
                mobile: user.mobile || '',
                country: 'India',
                defaultaddress: 0
            });
        }
    }, [address, user, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-10 rounded-[2.5rem] border border-gray-200 shadow-sm animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm">
                    <Navigation size={15} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                    {address ? 'Edit Address Details' : 'New Delivery Address'}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <User size={16} />
                        First Name
                    </label>
                    <input
                        {...register('first_name', { required: 'First name is required' })}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                        placeholder="First Name"
                    />
                    {errors.first_name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <User size={16} />
                        Last Name
                    </label>
                    <input
                        {...register('last_name', { required: 'Last name is required' })}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                        placeholder="Last Name"
                    />
                    {errors.last_name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.last_name.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <Mail size={16} />
                        Email Address
                    </label>
                    <input
                        {...register('email', {
                            required: 'Email is required',
                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                        })}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                        placeholder="contact@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <Phone size={16} />
                        Mobile Number
                    </label>
                    <input
                        {...register('mobile', { required: 'Mobile number is required' })}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                        placeholder="+91 98765 43210"
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1 ml-1">{errors.mobile.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  ml-1">Pincode</label>
                    <input
                        {...register('pincode', { required: 'Pincode is required' })}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                        placeholder="400001"
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1 ml-1">{errors.pincode.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  ml-1">City</label>
                    <input
                        {...register('city', { required: 'City is required' })}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                        placeholder="Mumbai"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  ml-1">State</label>
                    <input
                        {...register('state', { required: 'State is required' })}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                        placeholder="Maharashtra"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                    <Globe size={16} />
                    Country
                </label>
                <input
                    {...register('country', { required: 'Country is required' })}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                />
            </div>

            <div className="space-y-2">
                <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  ml-1">Address Line 1</label>
                <textarea
                    {...register('address1', { required: 'Address is required' })}
                    rows={2}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium resize-none"
                    placeholder="House No, Building Name, Street"
                />
                {errors.address1 && <p className="text-red-500 text-xs mt-1 ml-1">{errors.address1.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  ml-1">Address Line 2 (Optional)</label>
                <textarea
                    {...register('address2')}
                    rows={2}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium resize-none"
                    placeholder="Area, Landmark"
                />
            </div>

            <div className="flex items-center gap-3 py-2 ml-1">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        id="default_check"
                        checked={watch('defaultaddress') === 1}
                        onChange={(e) => {
                            reset({ ...watch(), defaultaddress: e.target.checked ? 1 : 0 });
                        }}
                        className="peer w-6 h-6 opacity-0 absolute cursor-pointer"
                    />
                    <div className="w-6 h-6 border-2 border-gray-200 rounded-lg flex items-center justify-center transition-all peer-checked:border-primary peer-checked:bg-primary">
                        <div className="w-2.5 h-2.5 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <label htmlFor="default_check" className="ml-3 text-sm font-bold text-gray-600 cursor-pointer select-none">Set as default address</label>
                </div>
            </div>

            <div className="flex justify-end gap-4  border-t border-gray-50">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-8 py-4 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Cancel
                </button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white font-bold rounded-2xl px-10 py-4 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70"
                    text={isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={18} />
                            <span>Saving...</span>
                        </div>
                    ) : (address ? 'Update Address' : 'Save Address')}
                />
            </div>
        </form>
    );
};

export default AddressForm;
