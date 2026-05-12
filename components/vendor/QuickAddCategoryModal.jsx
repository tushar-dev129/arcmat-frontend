'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { generateSlug } from '@/lib/productUtils';
import { toast } from '@/components/ui/Toast';

/**
 * QuickAddCategoryModal
 * A focused, single-step modal for adding a child category under a specific known parent.
 * Used by the inline "+ Sub-Category" / "+ Add Item" buttons in CategoryTable.
 */
export default function QuickAddCategoryModal({ isOpen, onClose, onAdd, parentCategory, level, categoryType }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setDescription('');
        }
    }, [isOpen]);

    if (!isOpen || !parentCategory) return null;

    const levelLabel = level === 2 ? 'Sub-Category' : 'Item';
    const slug = generateSlug(name);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) { toast.error('Name is required'); return; }
        if (!description.trim()) { toast.error('Description is required'); return; }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('category_name', name.trim());
            formData.append('category_url', slug);
            formData.append('editor', description.trim());
            formData.append('status', 'Active');
            formData.append('categoryType', categoryType || 'contractor_service');
            formData.append('parent_category', parentCategory._id || parentCategory.categoryId);

            await onAdd(formData);
            toast.success(`"${name}" added under "${parentCategory.name}"!`);
            onClose();
        } catch (err) {
            toast.error(err?.message || 'Failed to create category');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[102] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Add {levelLabel}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Under: <span className="font-semibold text-[#d9a88a]">{parentCategory.name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            placeholder={`e.g. ${level === 2 ? 'Interior Design' : 'Residential Projects'}`}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d9a88a] text-gray-900"
                        />
                        {name && (
                            <p className="text-[10px] text-gray-400 mt-1 font-mono">slug: {slug}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Short description..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d9a88a] text-gray-900 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 bg-[#d9a88a] hover:bg-[#c8956e] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60"
                        >
                            <Plus className="w-4 h-4" />
                            {isSubmitting ? 'Saving...' : `Add ${levelLabel}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
