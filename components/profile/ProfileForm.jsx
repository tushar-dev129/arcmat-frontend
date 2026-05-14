import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import { Loader2, Globe, Building2, MapPin, Info, Camera } from 'lucide-react';
import { getBrandImageUrl } from '@/lib/productUtils';
import clsx from 'clsx';

const ProfileForm = ({ brand, onSubmit, isSubmitting }) => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            name: '',
            country: 'India',
            description: '',
            website: '',
            shippingAddress: '',
            billingAddress: '',
            isActive: true
        }
    });

    useEffect(() => {
        if (brand) {
            reset({
                name: brand.name || '',
                country: brand.country || 'India',
                description: brand.description || '',
                website: brand.website || '',
                shippingAddress: brand.shippingAddress || '',
                billingAddress: brand.billingAddress || '',
                isActive: brand.isActive ?? true,
            });
        }
    }, [brand, reset]);

    const logoFile = watch('logo');
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (logoFile && logoFile[0]) {
            const objectUrl = URL.createObjectURL(logoFile[0]);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreview(brand?.logo ? getBrandImageUrl(brand.logo) : null);
        }
    }, [logoFile, brand]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Logo Upload Section */}
                <div className="lg:col-span-1">
                    <div className="space-y-4">
                        <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400 uppercase flex items-center gap-2 ml-1">
                            <Camera size={16} />
                            Brand Logo
                        </label>
                        <div className="relative group">
                            <div className="aspect-square w-full max-w-[240px] mx-auto bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-primary/5">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Logo Preview"
                                        className="w-full h-full object-contain p-8"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-300">
                                        <Camera size={40} />
                                        <span className="text-[13px] font-bold ">Upload Logo</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    {...register('logo', {
                                        validate: {
                                            fileSize: (files) => {
                                                if (!files?.[0]) return true;
                                                return files[0].size <= 500 * 1024 || 'File size must be less than 500KB';
                                            }
                                        }
                                    })}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-[13px] text-gray-400 font-medium uppercase tracking-tight">Recommended: PNG, JPG (Max 500KB)</p>
                                {errors.logo && <p className="text-red-500 text-[13px] font-bold mt-1 uppercase tracking-wider">{errors.logo.message}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Details Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400 uppercase flex items-center gap-2 ml-1">
                                <Building2 size={16} />
                                Brand Name
                            </label>
                            <input
                                {...register('name', { required: 'Name is required' })}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                                placeholder="e.g. Kajaria"
                            />
                            {errors.name && <p className="text-red-500 text-[13px] font-bold mt-1 ml-1 uppercase tracking-wider">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400 uppercase flex items-center gap-2 ml-1">
                                <Globe size={16} />
                                Country
                            </label>
                            <input
                                {...register('country')}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                                placeholder="e.g. India"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400 uppercase flex items-center gap-2 ml-1">
                                <Globe size={16} />
                                Website
                            </label>
                            <input
                                {...register('website')}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                                placeholder="https://www.example.com"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Addresses Section */}
            <div className="space-y-6 pt-10 border-t border-gray-50">
                <div className="flex items-center gap-3 ml-1">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <MapPin size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-[0.15em]">Official Addresses</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400 uppercase ml-1">Shipping Address</label>
                        <textarea
                            {...register('shippingAddress')}
                            rows={3}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium resize-none"
                            placeholder="Full shipping address..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400 uppercase ml-1">Billing Address</label>
                        <textarea
                            {...register('billingAddress')}
                            rows={3}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium resize-none"
                            placeholder="Full billing address..."
                        />
                    </div>
                </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2 pt-6">
                <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400 uppercase flex items-center gap-2 ml-1">
                    <Info size={16} />
                    Brand Description
                </label>
                <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium resize-none"
                    placeholder="Describe your brand, heritage, and unique value proposition..."
                />
            </div>

            <div className="flex justify-end pt-10 border-t border-gray-50">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white font-bold rounded-2xl px-12 py-4 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70"
                    text={isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={18} />
                            <span>Updating Profile...</span>
                        </div>
                    ) : 'Save All Changes'}
                />
            </div>
        </form>
    );
};

export default ProfileForm;
