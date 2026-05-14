'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import CategoryStats from '@/components/vendor/CategoryStats';
import CategoryTable from '@/components/vendor/CategoryTable';
import AddCategoryModal from '@/components/vendor/AddCategoryModal';
import EditCategoryModal from '@/components/vendor/EditCategoryModal';
import QuickAddCategoryModal from '@/components/vendor/QuickAddCategoryModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { toast } from '@/components/ui/Toast';
import { useGetCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useCategory';

import { useAuth } from '@/hooks/useAuth';
import RoleGuard from '@/components/auth/RoleGuard';
import clsx from 'clsx';

export default function CategoriesPage() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [quickAdd, setQuickAdd] = useState({ open: false, parent: null, level: 2 });

    // Pass null to fetch ALL categories regardless of vendor
    const { data: apiResponse, isLoading, error } = useGetCategories();
    const categories = Array.isArray(apiResponse) ? apiResponse : (apiResponse?.data || []);

    const createCategoryMutation = useCreateCategory();
    const deleteCategoryMutation = useDeleteCategory();

    const categoryData = useMemo(() => {
        if (!categories.length) return [];

        const categoryMap = new Map();
        categories.forEach(cat => categoryMap.set(cat._id, cat));

        const getPath = (cat) => {
            const pathParts = [cat.name];
            let current = cat;
            while (current.parentId && categoryMap.has(current.parentId)) {
                current = categoryMap.get(current.parentId);
                pathParts.unshift(current.name);
            }
            return pathParts.join(' > ');
        };

        return categories.map(cat => ({
            categoryId: cat._id,
            ...cat, // Spread all backend properties
            path: getPath(cat),
            totalProducts: 0, // Placeholder if backend doesn't provide
            incompleteProducts: 0
        }));
    }, [categories]);

    const filteredCategories = useMemo(() => {
        let result = categoryData;

        // Filter by Tab
        if (activeTab !== 'all') {
            result = result.filter(cat => {
                const type = cat.categoryType || 'product';
                return type === activeTab;
            });
        }

        // Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((cat) =>
                cat.name.toLowerCase().includes(query) ||
                cat.path.toLowerCase().includes(query)
            );
        }

        return result;
    }, [categoryData, searchQuery, activeTab]);

    const handleAddCategory = async (formData) => {
        try {
            if (user?._id) {
                formData.append('userid', user._id);
            }
            const result = await createCategoryMutation.mutateAsync(formData);
            return result.data._id;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to create category";
            toast.error(errorMessage);
            throw error;
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
    };

    const handleDeleteClick = (category) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await deleteCategoryMutation.mutateAsync(categoryToDelete.categoryId);
            toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete category");
        } finally {
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
        }
    };

    if (isLoading) {
        return (
            <Container className="py-8 flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-8 text-center text-red-500">
                Failed to load categories. Please try again later.
            </Container>
        );
    }

    return (
        <RoleGuard allowedRoles={['admin']}>
            <Container className="py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View and manage all classification levels in the product catalog.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 border bg-white border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full text-black transition-all"
                            />
                        </div>

                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center bg-primary text-white cursor-pointer hover:bg-white hover:text-primary border border-primary font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-100"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Category
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2 mb-8 border-b border-gray-100 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'all', label: 'All Categories' },
                        { id: 'product', label: 'Products' },
                        { id: 'custom_maker', label: 'Custom Makers' },
                        { id: 'contractor_service', label: 'Contractor Services' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
                                activeTab === tab.id
                                    ? "text-primary"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-4px_12px_rgba(217,168,138,0.4)]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        {activeTab === 'all' ? 'FULL STRUCTURE' : `${activeTab.replace('_', ' ')} STRUCTURE`} & HIERARCHY ({filteredCategories.length} ITEMS)
                    </span>
                </div>
                <CategoryTable
                    categories={filteredCategories}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onAddChild={(parent, level) => setQuickAdd({ open: true, parent, level })}
                />

                <AddCategoryModal
                    isOpen={isAddModalOpen}
                    existingCategories={categoryData}
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAddCategory}
                    defaultCategoryType={activeTab !== 'all' ? activeTab : 'product'}
                />

                <EditCategoryModal
                    isOpen={!!editingCategory}
                    category={editingCategory}
                    categories={categoryData}
                    onClose={() => setEditingCategory(null)}
                />

                <QuickAddCategoryModal
                    isOpen={quickAdd.open}
                    onClose={() => setQuickAdd({ open: false, parent: null, level: 2 })}
                    onAdd={handleAddCategory}
                    parentCategory={quickAdd.parent}
                    level={quickAdd.level}
                    categoryType="contractor_service"
                />

                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Category"
                    message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone and will fail if the category contains children or products.`}
                    confirmText="Delete Category"
                    type="danger"
                />
            </Container>
        </RoleGuard>
    );
}
