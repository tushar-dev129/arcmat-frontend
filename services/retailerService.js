import api from '@/lib/api';

export const retailerService = {
    // Brand Management
    getRetailerBrands: async (retailerId) => {
        const params = retailerId ? { retailerId } : {};
        const response = await api.get('/retailer/brands', { params });
        return response.data;
    },

    updateRetailerBrands: async ({ brandId, action, retailerId }) => {
        const response = await api.patch('/retailer/brands', { brandId, action, retailerId });
        return response.data;
    },

    getBrandInventory: async (brandId, params = {}) => {
        // params can include retailerId for admins
        const response = await api.get(`/retailer/brands/${brandId}/inventory`, { params });
        return response.data;
    },

    // Product & Override Management
    getRetailerProducts: async (params = {}) => {
        // params can include retailerId for admins
        const response = await api.get('/retailer/products', { params });
        return response.data;
    },

    upsertProductOverride: async (data) => {
        // data: { productId, variantId, mrp_price, selling_price, stock, isActive, retailerId }
        const response = await api.post('/retailer/products', data);
        return response.data;
    },

    updateProductOverride: async (id, data) => {
        // data can include retailerId for admins
        const response = await api.patch(`/retailer/products/${id}`, data);
        return response.data;
    },

    deleteProductOverride: async (id) => {
        const response = await api.delete(`/retailer/products/${id}`);
        return response.data;
    },

    getRetailerProductDetail: async (productId) => {
        const response = await api.get(`/retailer/products/detail/${productId}`);
        return response.data;
    },

    bulkAddInventory: async (data) => {
        const response = await api.post('/retailer/inventory/bulk-add', data);
        return response.data;
    },

    bulkRemoveInventory: async (data) => {
        const response = await api.post('/retailer/inventory/bulk-remove', data);
        return response.data;
    }
};
