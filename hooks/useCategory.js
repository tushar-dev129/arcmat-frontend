import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryService from '@/services/categoryService';

// Hook to get all categories (flat list)
export const useGetCategories = ({ enabled = true, ...params } = {}) => {
    return useQuery({
        queryKey: ['categories', params],
        queryFn: async () => {
            const response = await categoryService.getAllCategories(params);
            return response.data || response;
        },
        enabled
    });
};

// Hook to get category tree
export const useGetCategoryTree = (params = {}) => {
    return useQuery({
        queryKey: ['categories-tree', params],
        queryFn: () => categoryService.getCategoryTree(params),
    });
};

// Hook to get a single category
export const useGetCategory = (id) => {
    return useQuery({
        queryKey: ['category', id],
        queryFn: () => categoryService.getCategoryById(id),
        enabled: !!id,
    });
};

// Hook to create a category
export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: categoryService.createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
        },
    });
};

// Hook to update a category
export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
            queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
        },
    });
};

// Hook to delete a category
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: categoryService.deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
        },
    });
};
