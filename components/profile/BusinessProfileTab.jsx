import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useGetVendor, useCreateVendor, useUpdateVendor } from '@/hooks/useVendor';
import ProfileForm from '@/components/profile/ProfileForm';
import { toast } from '@/components/ui/Toast';
import { useLoader } from '@/context/LoaderContext';
import { Loader2, Building2 } from 'lucide-react';

const BusinessProfileTab = () => {
    const { user } = useAuth();
    const fetchUser = useAuthStore((s) => s.fetchUser);
    const { setLoading } = useLoader();
    const router = useRouter();
    const userId = user?._id || user?.id;
    const isCustomMaker = user?.role === 'custom_maker';

    // Hooks for brand data
    const { data: brandData, isLoading: isBrandLoading } = useGetVendor(userId);
    const { mutate: createVendor, isPending: isCreating } = useCreateVendor();
    const { mutate: updateVendor, isPending: isUpdating } = useUpdateVendor();

    const [currentBrand, setCurrentBrand] = useState(null);

    // Process brand data
    useEffect(() => {
        if (brandData) {
            const brand = brandData.data || brandData.vendor || brandData;
            if (brand && typeof brand === 'object' && !Array.isArray(brand)) {
                setCurrentBrand(brand);
            } else {
                setCurrentBrand(null);
            }
        } else {
            setCurrentBrand(null);
        }
    }, [brandData]);

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleCreateOrUpdate = async (data) => {
        try {
            const payload = {
                name: data.name,
                country: data.country,
                description: data.description,
                website: data.website,
                shippingAddress: data.shippingAddress,
                billingAddress: data.billingAddress,
                isActive: data.isActive,
                ownerType: isCustomMaker ? 'custom_maker' : 'brand'
            };

            if (!currentBrand && user) {
                payload.userId = user._id || user.id;
            }

            if (data.logo && data.logo[0]) {
                const base64Logo = await fileToBase64(data.logo[0]);
                payload.logo = base64Logo;
            }

            if (currentBrand) {
                updateVendor({ id: currentBrand._id || currentBrand.id, data: payload }, {
                    onSuccess: async (response) => {
                        toast.success('Profile updated successfully', 'Success');
                        // Refresh user data to update selectedBrands in store
                        await fetchUser();
                    },
                    onError: (error) => {
                        toast.error(error.message || 'Failed to update profile', 'Error');
                    }
                });
            } else {
                createVendor(payload, {
                    onSuccess: async (response) => {
                        toast.success(`${isCustomMaker ? 'Custom maker' : 'Brand'} profile created successfully`, 'Success');
                        // Re-fetch auth session so selectedBrands/activeBrand updates immediately
                        await fetchUser();
                    },
                    onError: (error) => {
                        toast.error(error.message || 'Failed to create profile', 'Error');
                    }
                });
            }
        } catch (error) {
            toast.error("Failed to prepare profile data", "Error");
        }
    };

    if (isBrandLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-200 shadow-sm animate-pulse">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-sm font-bold text-gray-400 ">Loading Business Data...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden mb-8 transition-all hover:shadow-md">
            <div className="px-10 py-8 border-b border-gray-200 bg-white flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm">
                    <Building2 size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {currentBrand
                            ? `${isCustomMaker ? 'Custom Maker' : 'Brand'} Profile`
                            : `Setup ${isCustomMaker ? 'Custom Maker' : 'Brand'} Profile`}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">Manage your brand presence and official details</p>
                </div>
            </div>

            <div className="p-10">
                <ProfileForm
                    brand={currentBrand}
                    onSubmit={handleCreateOrUpdate}
                    isSubmitting={isCreating || isUpdating}
                />
            </div>
        </div>
    );
};

export default BusinessProfileTab;
