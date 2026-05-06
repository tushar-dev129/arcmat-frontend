import React, { useMemo } from 'react';
import { useGetCategoryTree } from '@/hooks/useCategory';
import { getCategoryPath } from '@/lib/productUtils';
import Breadcrumb from '../ui/Breadcrumb';
import { Loader2 } from 'lucide-react';

/**
 * Section component for Category Breadcrumbs on the Product List page.
 * Replaces the static header with a dynamic 3-step category path.
 */
const CategoryBreadcrumb = ({ selectedCategory, onCategoryChange }) => {
    const { data: treeDataRaw, isLoading } = useGetCategoryTree();

    const treeData = useMemo(() => {
        return Array.isArray(treeDataRaw?.data) ? treeDataRaw.data : (Array.isArray(treeDataRaw) ? treeDataRaw : []);
    }, [treeDataRaw]);

    const breadcrumbItems = useMemo(() => {
        const path = getCategoryPath(treeData, selectedCategory);

        const items = [];

        // Add the category path (up to 3 levels: Parent > Sub > Sub-Sub)
        path.forEach(p => {
            items.push({
                label: p.name,
                onClick: () => onCategoryChange(p.id)
            });
        });

        return items;
    }, [treeData, selectedCategory, onCategoryChange]);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 mb-8">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-sm text-gray-400 font-medium">Updating breadcrumbs...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1 ">
            <Breadcrumb items={breadcrumbItems} />
        </div>
    );
};

export default CategoryBreadcrumb;
