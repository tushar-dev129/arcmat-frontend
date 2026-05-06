import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                {address ? 'Edit Address' : 'Add New Address'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                        {...register('first_name', { required: 'First name is required' })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="First Name"
                    />
                    {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                        {...register('last_name', { required: 'Last name is required' })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Last Name"
                    />
                    {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        {...register('email', {
                            required: 'Email is required',
                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                        })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Email"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input
                        {...register('mobile', { required: 'Mobile number is required' })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Mobile Number"
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                        {...register('pincode', { required: 'Pincode is required' })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Pincode"
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                        {...register('city', { required: 'City is required' })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="City"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                        {...register('state', { required: 'State is required' })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="State"
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                    {...register('country', { required: 'Country is required' })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Country"
                />
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                <textarea
                    {...register('address1', { required: 'Address is required' })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    placeholder="House No, Building Name, Street"
                />
                {errors.address1 && <p className="text-red-500 text-xs mt-1">{errors.address1.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                <textarea
                    {...register('address2')}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    placeholder="Area, Landmark"
                />
            </div>

            <div className="flex items-center gap-2 py-2">
                <input
                    type="checkbox"
                    id="default_check"
                    checked={watch('defaultaddress') === 1}
                    onChange={(e) => {
                        reset({ ...watch(), defaultaddress: e.target.checked ? 1 : 0 });
                    }}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                />
                <label htmlFor="default_check" className="text-sm text-gray-600 cursor-pointer">Set as default address</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                    type="button"
                    onClick={onCancel}
                    className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 cursor-pointer"
                    text="Cancel"
                />
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white cursor-pointer hover:bg-white hover:text-primary border border-primary min-w-[120px] px-2"
                    text={isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} />
                            <span>Saving...</span>
                        </div>
                    ) : (address ? 'Update Address' : 'Add Address')}
                />
            </div>
        </form>
    );
};

export default AddressForm;
