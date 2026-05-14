import React, { useState, useEffect } from 'react';
import { useAuth, useUpdateUser } from '@/hooks/useAuth';
import { useGetVendors } from '@/hooks/useVendor';
import RetailerProfileForm from '@/components/profile/RetailerProfileForm';
import { toast } from '@/components/ui/Toast';
import { useLoader } from '@/context/LoaderContext';
import { Loader2, Store } from 'lucide-react';

const RetailerProfileTab = () => {
    const { user, queryClient } = useAuth();
    const { setLoading } = useLoader();
    const userId = user?._id || user?.id;

    // Fetch all brands for the form
    const { data: vendorsData, isLoading: isBrandsLoading } = useGetVendors();
    const brands = vendorsData?.data || vendorsData || [];

    const { mutate: updateProfile, isPending: isUpdating } = useUpdateUser();

    const handleUpdate = async (payload) => {
        if (!userId) {
            toast.error("User ID not found", "Error");
            return;
        }

        updateProfile({ id: userId, data: payload }, {
            onSuccess: () => {
                toast.success('Retailer profile updated successfully', 'Success');
                // Invalidate user info to refresh the profile view
                queryClient.invalidateQueries({ queryKey: ['user-info'] });
            },
            onError: (error) => {
                const message = error?.response?.data?.message || 'Failed to update profile';
                toast.error(message, 'Error');
            }
        });
    };

    if (isBrandsLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-200 shadow-sm animate-pulse">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-sm font-bold text-gray-400  tracking-widest">Loading Brands...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden mb-8 transition-all hover:shadow-md">
            <div className="px-10 py-8 border-b border-gray-200 bg-white flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                    <Store size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Retailer Profile</h2>
                    <p className="text-sm text-gray-500 font-medium">Manage your retail presence and service areas</p>
                </div>
            </div>

            <div className="p-10">
                <RetailerProfileForm
                    user={user}
                    brands={brands}
                    onSubmit={handleUpdate}
                    isSubmitting={isUpdating}
                />
            </div>
        </div>
    );
};

export default RetailerProfileTab;
