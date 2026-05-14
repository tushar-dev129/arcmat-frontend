import React, { useState } from 'react';
import { MapPin, Edit2, Trash2, Plus, CheckCircle2, Loader2, Navigation, Mail, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import AddressForm from './AddressForm';
import { useGetAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from '@/hooks/useAddress';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/Toast';
import clsx from 'clsx';

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
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-200 shadow-sm animate-pulse">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-sm font-bold text-gray-400 ">Fetching Addresses...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 bg-red-50 text-red-600 rounded-[2.5rem] border border-red-100 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                    <X size={24} />
                </div>
                <p className="font-bold  tracking-tight text-sm text-center">Error loading addresses.<br />Please try again later.</p>
            </div>
        );
    }

    if (isAdding || editingAddress) {
        return (
            <div className="animate-in slide-in-from-right duration-500">
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
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Manage Addresses</h2>
                        <p className="text-sm text-gray-500 font-medium">Your saved shipping and billing locations</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-primary text-white flex items-center gap-2 px-8 py-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                >
                    <Plus size={20} strokeWidth={3} />
                    Add New
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {addresses?.length === 0 ? (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-6">
                            <MapPin size={40} />
                        </div>
                        <p className="text-lg font-bold text-gray-400 ">No addresses found</p>
                        <p className="text-gray-400 text-sm mt-2">Add an address to expedite your checkout process.</p>
                    </div>
                ) : (
                    addresses?.map((address) => (
                        <div
                            key={address._id}
                            className={clsx(
                                "relative p-8 rounded-[2.5rem] border transition-all duration-300 bg-white group hover:shadow-xl hover:shadow-gray-100",
                                address.defaultaddress === 1 ? 'border-primary shadow-lg shadow-primary/5' : 'border-gray-200 hover:border-primary/30'
                            )}
                        >
                            {address.defaultaddress === 1 && (
                                <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[13px] font-black ">
                                    <CheckCircle2 size={16} strokeWidth={3} />
                                    Primary Address
                                </div>
                            )}

                            <div className="flex items-start gap-5 mb-6">
                                <div className={clsx(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors",
                                    address.defaultaddress === 1 ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                                )}>
                                    <Navigation size={24} />
                                </div>
                                <div className="pt-1">
                                    <h4 className="text-lg font-black text-gray-900 tracking-tight">
                                        {address.first_name} {address.last_name}
                                    </h4>
                                    <div className="flex flex-col gap-1 mt-2">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Mail size={16} />
                                            <span className="text-xs font-bold  tracking-tight">{address.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Phone size={16} />
                                            <span className="text-xs font-bold  tracking-tight">{address.mobile}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1 ml-1 pt-4 border-t border-gray-50 mb-8">
                                <p className="text-sm text-gray-800 font-bold leading-relaxed">
                                    {address.address1}
                                    {address.address2 ? `, ${address.address2}` : ''}
                                </p>
                                <p className="text-sm text-gray-500 font-medium">
                                    {address.city}, {address.state} — {address.pincode}
                                </p>
                                <p className="text-[13px] font-black text-gray-400  mt-2">{address.country}</p>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    onClick={() => setEditingAddress(address)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-all border border-transparent cursor-pointer"
                                >
                                    <Edit2 size={16} />
                                    Update
                                </button>
                                <button
                                    onClick={() => handleDelete(address._id)}
                                    className="flex items-center justify-center w-12 h-12 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent cursor-pointer"
                                >
                                    <Trash2 size={20} />
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
