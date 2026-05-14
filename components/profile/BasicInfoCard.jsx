import React from 'react';
import { User, Mail, Shield, Phone } from 'lucide-react';
import { useUpdateUser } from '@/hooks/useAuth';
import BasicInfoForm from './BasicInfoForm';
import { toast } from '@/components/ui/Toast';
import { useQueryClient } from '@tanstack/react-query';

const BasicInfoCard = ({ user }) => {
    const { mutate: updateProfile, isPending } = useUpdateUser();
    const queryClient = useQueryClient();

    if (!user) return null;

    const handleUpdate = (data) => {
        const userId = user._id || user.id;
        updateProfile({ id: userId, data }, {
            onSuccess: () => {
                toast.success('Basic information updated successfully', 'Success');
                queryClient.invalidateQueries({ queryKey: ['user-info'] });
            },
            onError: (error) => {
                const message = error?.response?.data?.message || 'Failed to update information';
                toast.error(message, 'Error');
            }
        });
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden mb-8 transition-all hover:shadow-md">
            <div className="px-10 py-8 border-b border-gray-200 bg-white flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-primary shadow-sm">
                    <User size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                    <p className="text-sm text-gray-500">Update your personal details and contact info</p>
                </div>
            </div>

            <div className="p-10">
                <BasicInfoForm
                    user={user}
                    onSubmit={handleUpdate}
                    isSubmitting={isPending}
                />
            </div>
        </div>
    );
};

export default BasicInfoCard;
