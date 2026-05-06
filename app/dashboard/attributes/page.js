'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Settings,
    Tag,
    AlertTriangle,
    CheckCircle2,
    X
} from 'lucide-react';
import {
    useGetAttributes,
    useCreateAttribute,
    useUpdateAttribute,
    useDeleteAttribute
} from '@/hooks/useAttribute';
import { toast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import clsx from 'clsx';
import RoleGuard from '@/components/auth/RoleGuard';

export default function AttributesPage() {
    const { data: attributesResponse, isLoading } = useGetAttributes();
    const createMutation = useCreateAttribute();
    const updateMutation = useUpdateAttribute();
    const deleteMutation = useDeleteAttribute();

    const attributes = attributesResponse?.data || [];

    const [formData, setFormData] = useState({
        attributeName: '',
        attributeValues: '',
        status: 1
    });
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [attributeToDelete, setAttributeToDelete] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'status' ? Number(value) : value
        }));
    };

    const handleEdit = (attr) => {
        setEditingId(attr._id || attr.id);
        setFormData({
            attributeName: attr.attributeName,
            attributeValues: attr.attributeValues.join(', '),
            status: attr.status ?? 1
        });
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            attributeName: '',
            attributeValues: '',
            status: 1
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.attributeName.trim()) {
            toast.error("Attribute name is required");
            return;
        }

        try {
            if (editingId) {
                await updateMutation.mutateAsync({
                    id: editingId,
                    data: formData
                });
                toast.success("Attribute updated successfully");
            } else {
                await createMutation.mutateAsync(formData);
                toast.success("Attribute created successfully");
            }
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    const handleDeleteClick = (attr) => {
        setAttributeToDelete(attr);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!attributeToDelete) return;
        try {
            await deleteMutation.mutateAsync(attributeToDelete._id || attributeToDelete.id);
            toast.success(`Attribute "${attributeToDelete.attributeName}" deleted`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete attribute");
        } finally {
            setIsDeleteModalOpen(false);
            setAttributeToDelete(null);
        }
    };

    const filteredAttributes = attributes.filter(attr =>
        attr.attributeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attr.attributeValues.some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <RoleGuard allowedRoles={['admin']}>
            <Container className="py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Settings className="w-6 h-6 text-primary" />
                            Attribute Management
                        </h1>
                        <p className="text-gray-500 mt-1">Define and manage product specifications and variants attributes.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                            <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                    {editingId ? (
                                        <><Pencil className="w-4 h-4" /> Edit Attribute</>
                                    ) : (
                                        <><Plus className="w-4 h-4" /> Create Attribute</>
                                    )}
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Attribute Key (Name)</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 font-bold" />
                                        <input
                                            name="attributeName"
                                            value={formData.attributeName}
                                            onChange={handleChange}
                                            placeholder="e.g. Color, Size, Material"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Attribute Values</label>
                                    <textarea
                                        name="attributeValues"
                                        value={formData.attributeValues}
                                        onChange={handleChange}
                                        placeholder="Enter values separated by commas (e.g. Red, Blue, Green)"
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 italic">Values will be automatically cleaned and categorized.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none appearance-none bg-white font-semibold"
                                    >
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <Button
                                        type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className="flex-1 bg-primary text-white hover:bg-white hover:text-primary border border-primary rounded-xl font-bold py-3 transition-all cursor-pointer shadow-lg shadow-orange-100"
                                    >
                                        {editingId ? "Update Attribute" : "Create Attribute"}
                                    </Button>
                                    {editingId && (
                                        <Button
                                            type="button"
                                            onClick={resetForm}
                                            variant="outline"
                                            className="rounded-xl px-4 cursor-pointer hover:border-red-500 hover:text-red-500"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search attributes or values..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all"
                            />
                        </div>

                        {/* Attributes Table/List */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Attribute Key</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Values</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-20 text-center">
                                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                                                    <p className="mt-2 text-gray-500 font-medium">Loading attributes...</p>
                                                </td>
                                            </tr>
                                        ) : filteredAttributes.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic">
                                                    No attributes found. Create your first one!
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredAttributes.map(attr => (
                                                <tr key={attr._id || attr.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <div className="font-bold text-gray-900">{attr.attributeName}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{attr._id || attr.id}</div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                                                            {attr.attributeValues.map((val, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-full border border-gray-200">
                                                                    {val}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={clsx(
                                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                                                            attr.status === 0 || attr.status === 'Inactive'
                                                                ? "bg-red-50 text-red-600"
                                                                : "bg-green-50 text-green-600"
                                                        )}>
                                                            {attr.status === 0 || attr.status === 'Inactive' ? (
                                                                <><AlertTriangle className="w-3 h-3" /> Inactive</>
                                                            ) : (
                                                                <><CheckCircle2 className="w-3 h-3" /> Active</>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEdit(attr)}
                                                                className="p-2 text-primary hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                                                                title="Edit Attribute"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(attr)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                                                title="Delete Attribute"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Attribute"
                    message={`Are you sure you want to delete the "${attributeToDelete?.attributeName}" attribute? This action cannot be undone if used by products.`}
                    confirmText="Delete Attribute"
                    type="danger"
                />
            </Container>
        </RoleGuard>
    );
}
