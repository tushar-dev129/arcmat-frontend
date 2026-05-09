import api from '@/lib/api';

export const brandService = {
    getAllBrands: async (params = {}) => {
        const response = await api.get('/brand', { params });
        return response.data;
    },

    getBrandById: async (id) => {
        const response = await api.get(`/brand/${id}`);
        return response.data;
    },

    getBespokeOptions: async (id) => {
        const response = await api.get(`/brand/${id}/bespoke-options`);
        return response.data;
    },

    createContractorRequest: async ({ brandId, message }) => {
        const response = await api.post(`/brand/${brandId}/contractor-requests`, { message });
        return response.data;
    },

    getContractorRequests: async ({ brandId, mine } = {}) => {
        const response = await api.get(`/brand/${brandId}/contractor-requests`, {
            params: mine ? { mine } : {}
        });
        return response.data;
    },

    decideContractorRequest: async ({ brandId, requestId, status, brandNote }) => {
        const response = await api.patch(`/brand/${brandId}/contractor-requests/${requestId}`, {
            status,
            brandNote
        });
        return response.data;
    },

    createBrand: async (brandData) => {
        const config = brandData instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const response = await api.post('/brand', brandData, config);
        return response.data;
    },

    updateBrand: async (id, brandData) => {
        const config = brandData instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const response = await api.patch(`/brand/${id}`, brandData, config);
        return response.data;
    },

    deleteBrand: async (id) => {
        const response = await api.delete(`/brand/${id}`);
        return response.data;
    },
    createBrandQuery: async (brandId, queryData) => {
        const response = await api.post(`/brand/${brandId}/queries`, queryData);
        return response.data;
    },
    getBrandLeads: async (params = {}) => {
        const response = await api.get('/brand/queries/all', { params });
        return response.data;
    },
};
