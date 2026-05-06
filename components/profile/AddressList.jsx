import React, { useState } from 'react';
import { MapPin, Edit2, Trash2, Plus, CheckCircle2, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import AddressForm from './AddressForm';
import { useGetAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from '@/hooks/useAddress';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/Toast';

const AddressList = () => {
    const { user } = useAuth();
    const { data: apiResponse, isLoading, error } = useGetAddresses(user?._id);
    const addresses = apiResponse?.data?.data || [];

    const createMutation = useCreateAddress();
    const updateMutation = useUpdateAddress();
    const deleteMutation = useDeleteAddress();

    const [isAdding, setIsAdding] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const handleCreate = async (data) => {
        try {
            await createMutation.mutateAsync(data);
            toast.success('Address added successfully');
            setIsAdding(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add address');
        }
    };

    const handleUpdate = async (data) => {
        try {
            await updateMutation.mutateAsync({ id: editingAddress._id, data });
            toast.success('Address updated successfully');
            setEditingAddress(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update address');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await deleteMutation.mutateAsync(id);
                toast.success('Address deleted successfully');
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete address');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-gray-500">Loading your addresses...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                <p>Error loading addresses. Please try again later.</p>
            </div>
        );
    }

    if (isAdding || editingAddress) {
        return (
            <AddressForm
                address={editingAddress}
                user={user}
                onSubmit={editingAddress ? handleUpdate : handleCreate}
                onCancel={() => {
                    setIsAdding(false);
                    setEditingAddress(null);
                }}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">My Addresses</h2>
                    <p className="text-sm text-gray-500">Manage your shipping and billing addresses</p>
                </div>
                <Button
                    onClick={() => setIsAdding(true)}
                    className="bg-primary text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white hover:text-primary border border-primary"
                    text={
                        <div className="flex items-center gap-2">
                            <Plus size={18} />
                            <span>Add New</span>
                        </div>
                    }
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses?.length === 0 ? (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <MapPin size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No addresses found</p>
                        <p className="text-gray-400 text-sm">Add an address to speed up your checkout process</p>
                    </div>
                ) : (
                    addresses?.map((address) => (
                        <div
                            key={address._id}
                            className={`
                                relative p-6 rounded-2xl border transition-all duration-200 bg-white
                                ${address.defaultaddress === 1 ? 'border-primary ring-1 ring-primary/10' : 'border-gray-100 hover:border-gray-300'}
                            `}
                        >
                            {address.defaultaddress === 1 && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                    <CheckCircle2 size={12} />
                                    Default
                                </div>
                            )}

                            <div className="flex items-start gap-4 mb-4">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                    ${address.defaultaddress === 1 ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400'}
                                `}>
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">
                                        {address.first_name} {address.last_name}
                                    </h4>
                                    <p className="text-sm text-gray-500">{address.email}</p>
                                    <p className="text-sm text-gray-500">{address.mobile}</p>
                                </div>
                            </div>

                            <div className="space-y-1 ml-14 mb-6">
                                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                    {address.address1}
                                    {address.address2 ? `, ${address.address2}` : ''}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {address.city}, {address.state} - {address.pincode}
                                </p>
                                <p className="text-sm text-gray-600">{address.country}</p>
                            </div>

                            <div className="flex items-center gap-2 ml-14 pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => setEditingAddress(address)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all border border-gray-100 cursor-pointer"
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(address._id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent cursor-pointer"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AddressList;
