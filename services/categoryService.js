import api from '@/lib/api';

const categoryService = {
    // Get all categories (flat list)
    getAllCategories: async (params = {}) => {
        const response = await api.get('/category', { params });
        return response.data;
    },

    // Get categories tree structure
    getCategoryTree: async (params = {}) => {
        const response = await api.get('/category/tree', { params });
        return response.data;
    },

    // Get single category by ID
    getCategoryById: async (id) => {
        const response = await api.get(`/category/${id}`);
        return response.data;
    },

    // Create a new category
    createCategory: async (categoryData) => {
        const config = {};
        // If sending FormData (which we are for images), let the browser set Content-Type
        if (categoryData instanceof FormData) {
            config.headers = { 'Content-Type': undefined };
        }

        const response = await api.post('/category', categoryData, config);
        return response.data;
    },

    // Update an existing category
    updateCategory: async (id, categoryData) => {
        let payload = categoryData;
        let config = {};

        const containsFiles = (data) => {
            if (data instanceof FormData) return true;
            return Object.values(data).some(value =>
                value instanceof File ||
                value instanceof Blob ||
                (Array.isArray(value) && value.some(v => v instanceof File || v instanceof Blob))
            );
        };

        if (containsFiles(categoryData) && !(categoryData instanceof FormData)) {
            const formData = new FormData();
            Object.keys(categoryData).forEach(key => {
                const value = categoryData[key];
                if (value !== undefined) {
                    if (Array.isArray(value)) {
                        value.forEach(v => formData.append(key, v));
                    } else if (typeof value === 'object' && value !== null && !(value instanceof File) && !(value instanceof Blob)) {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, value);
                    }
                }
            });
            payload = formData;
            config.headers = { 'Content-Type': 'multipart/form-data' };
        } else if (categoryData instanceof FormData) {
            config.headers = { 'Content-Type': 'multipart/form-data' };
        }

        const response = await api.patch(`/category/${id}`, payload, config);
        return response.data;
    },

    // Delete a category
    deleteCategory: async (id) => {
        const response = await api.delete(`/category/${id}`);
        return response.data;
    },

    // Get frontend category list (optimized for UI)
    getFrontendCategoryList: async () => {
        const response = await api.get('/category/frontedcategorylist');
        return response.data;
    },

    // Get subcategories for given parent IDs
    getSubcategories: async (parentIdsString) => {
        // API expects { categorys: "id1,id2" }
        const response = await api.post('/category/subcategory', { categorys: parentIdsString });
        return response.data;
    }
};

export default categoryService;
