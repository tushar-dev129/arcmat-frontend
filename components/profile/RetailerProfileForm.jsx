import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import { Loader2, Plus, X, Building2, User, Mail, Phone, MapPin, Store, Clock } from 'lucide-react';
import clsx from 'clsx';

const RetailerProfileForm = ({ user, brands, onSubmit, isSubmitting }) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            companyName: user?.retailerProfile?.companyName || '',
            contactPerson: user?.retailerProfile?.contactPerson || user?.name || '',
            businessAddress: user?.retailerProfile?.businessAddress || '',
            cityRegion: user?.retailerProfile?.cityRegion || '',
            email: user?.retailerProfile?.email || user?.email || '',
            mobile: user?.mobile || '',
            cities: user?.retailerProfile?.cities || [],
            preferredContactMethod: user?.retailerProfile?.preferredContactMethod || 'Phone',
            callingHours: user?.retailerProfile?.callingHours || '',
            selectedBrands: Array.from(new Set(user?.selectedBrands?.map(b => (typeof b === 'object' ? b._id : b)?.toString()))) || []
        }
    });

    const [cityInput, setCityInput] = useState('');
    const cities = watch('cities');
    const currentSelectedBrands = watch('selectedBrands');

    useEffect(() => {
        if (user) {
            reset({
                companyName: user.retailerProfile?.companyName || '',
                contactPerson: user.retailerProfile?.contactPerson || user.name || '',
                businessAddress: user.retailerProfile?.businessAddress || '',
                cityRegion: user.retailerProfile?.cityRegion || '',
                email: user.retailerProfile?.email || user.email || '',
                mobile: user.mobile || '',
                cities: user.retailerProfile?.cities || [],
                preferredContactMethod: user.retailerProfile?.preferredContactMethod || 'Phone',
                callingHours: user.retailerProfile?.callingHours || '',
                selectedBrands: Array.from(new Set(user.selectedBrands?.map(b => (typeof b === 'object' ? b._id : b)?.toString()))) || []
            });
        }
    }, [user, reset]);

    const handleAddCity = () => {
        if (!cityInput.trim()) return;
        if (!cities.includes(cityInput.trim())) {
            setValue('cities', [...cities, cityInput.trim()], { shouldDirty: true });
        }
        setCityInput('');
    };

    const handleRemoveCity = (cityToRemove) => {
        setValue('cities', cities.filter(c => c !== cityToRemove), { shouldDirty: true });
    };

    const handleCityKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCity();
        }
    };

    const handleToggleBrand = (brandId) => {
        const idStr = String(brandId);
        const exists = currentSelectedBrands.some(id => String(id) === idStr);

        let updatedBrands;
        if (exists) {
            updatedBrands = currentSelectedBrands.filter(id => String(id) !== idStr);
        } else {
            updatedBrands = [...currentSelectedBrands, brandId];
        }

        setValue('selectedBrands', updatedBrands, { shouldDirty: true });
    };

    const handleFormSubmit = (data) => {
        const payload = {
            retailerProfile: {
                companyName: data.companyName,
                contactPerson: data.contactPerson,
                businessAddress: data.businessAddress,
                cityRegion: data.cityRegion,
                email: data.email,
                cities: data.cities,
                preferredContactMethod: data.preferredContactMethod,
                callingHours: data.callingHours
            },
            mobile: data.mobile,
            selectedBrands: data.selectedBrands
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Details */}
                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <Building2 size={16} />
                        Company Name
                    </label>
                    <input
                        {...register('companyName', { required: 'Company name is required' })}
                        className={clsx(
                            "w-full px-5 py-4 rounded-2xl border transition-all outline-none text-sm font-medium",
                            errors.companyName ? "border-red-200 bg-red-50/30 focus:border-red-400" : "border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm"
                        )}
                        placeholder="e.g. Acme Supplies"
                    />
                    {errors.companyName && <p className="text-red-500 text-[13px] font-bold mt-1  tracking-wider">{errors.companyName.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <User size={16} />
                        Contact Person
                    </label>
                    <input
                        {...register('contactPerson', { required: 'Contact person is required' })}
                        className={clsx(
                            "w-full px-5 py-4 rounded-2xl border transition-all outline-none text-sm font-medium",
                            errors.contactPerson ? "border-red-200 bg-red-50/30 focus:border-red-400" : "border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm"
                        )}
                        placeholder="e.g. John Doe"
                    />
                </div>

                {/* Contact Email (Read Only) */}
                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <Mail size={16} />
                        Contact Email
                    </label>
                    <div className="relative group">
                        <input
                            {...register('email')}
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
                            errors.mobile ? "border-red-200 bg-red-50/30 focus:border-red-400" : "border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm"
                        )}
                        placeholder="e.g. +91 9876543210"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <MapPin size={16} />
                        Base City / Region
                    </label>
                    <input
                        {...register('cityRegion', { required: 'City / Region is required' })}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                        placeholder="e.g. Delhi"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <Phone size={16} />
                        Preferred Contact Method
                    </label>
                    <select
                        {...register('preferredContactMethod')}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                    >
                        <option value="Phone">Phone</option>
                        <option value="Email">Email</option>
                        <option value="WhatsApp">WhatsApp</option>
                    </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                        <Clock size={16} />
                        Calling Hours
                    </label>
                    <input
                        {...register('callingHours')}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                        placeholder="e.g. Mon – Sat, 9:00 AM – 5:00 PM"
                    />
                    <p className="text-[13px] text-gray-400 ml-1 italic font-medium  tracking-tight mt-1">Visible to architects before calling</p>
                </div>
            </div>

            {/* Cities Served Section */}
            <div className="space-y-6 pt-10 border-t border-gray-50">
                <div className="flex items-center gap-3 ml-1">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                        <MapPin size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900  tracking-[0.15em]">Cities Served (Service Areas)</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-3">
                        <input
                            value={cityInput}
                            onChange={(e) => setCityInput(e.target.value)}
                            onKeyDown={handleCityKeyDown}
                            className="flex-1 px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium"
                            placeholder="Add a city (e.g. Noida)"
                        />
                        <button
                            type="button"
                            onClick={handleAddCity}
                            className="px-8 bg-primary text-white rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
                        >
                            Add
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50/50 rounded-[2rem] border border-gray-50 min-h-[64px]">
                        {cities.length > 0 ? (
                            cities.map((city, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-primary/20 text-primary text-xs font-bold rounded-xl shadow-sm animate-in zoom-in duration-300"
                                >
                                    {city}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCity(city)}
                                        className="hover:bg-red-50 hover:text-red-500 rounded-full p-0.5 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </span>
                            ))
                        ) : (
                            <p className="text-gray-400 text-xs italic py-2 px-2">No cities added yet. Define your service areas.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Business Address */}
            <div className="space-y-2 pt-6">
                <label className="text-[13px] font-bold tracking-[0.2em] text-gray-400  flex items-center gap-2 ml-1">
                    <MapPin size={16} />
                    Full Business Address
                </label>
                <textarea
                    {...register('businessAddress', { required: 'Business address is required' })}
                    rows={3}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/30 focus:border-primary focus:bg-white focus:shadow-sm transition-all outline-none text-sm font-medium resize-none"
                    placeholder="Enter full physical address..."
                />
            </div>

            {/* Brands Selection */}
            <div className="space-y-6 pt-10 border-t border-gray-50">
                <div className="flex items-center gap-3 ml-1">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <Store size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900  tracking-[0.15em]">Authorized Brands Supplied</h3>
                </div>

                <div className="bg-gray-50/30 rounded-[2.5rem] p-8 border border-gray-50">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {brands?.map((brand) => (
                            <button
                                key={brand._id}
                                type="button"
                                onClick={() => handleToggleBrand(brand._id)}
                                className={clsx(
                                    "flex items-center justify-between gap-3 px-5 py-3 rounded-2xl text-xs font-bold transition-all border shadow-sm",
                                    currentSelectedBrands.includes(brand._id)
                                        ? "bg-primary text-white border-primary shadow-primary/20 scale-105"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-primary/50 hover:text-primary"
                                )}
                            >
                                <span className="truncate">{brand.name}</span>
                                {currentSelectedBrands.includes(brand._id) ? <X size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-10 border-t border-gray-50">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white font-bold rounded-2xl px-12 py-4 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70"
                    text={isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={18} />
                            <span>Saving Changes...</span>
                        </div>
                    ) : 'Save Retailer Profile'}
                />
            </div>
        </form>
    );
};

export default RetailerProfileForm;
