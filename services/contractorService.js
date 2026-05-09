import api from '@/lib/api';

export const contractorService = {
    getContractors: async (params = {}) => {
        const response = await api.get('/contractor', { params });
        return response.data;
    },

    getContractorBySlug: async (slug) => {
        const response = await api.get(`/contractor/${slug}`);
        return response.data;
    },

    getMyProfile: async (userId) => {
        const response = await api.get(`/contractor/my-profile/${userId}`);
        return response.data;
    },

    createProfile: async (data) => {
        const config = data instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const response = await api.post('/contractor/profile', data, config);
        return response.data;
    },

    updateProfile: async (id, data) => {
        const config = data instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const response = await api.patch(`/contractor/profile/${id}`, data, config);
        return response.data;
    },

    createLead: async (leadData) => {
        const response = await api.post('/contractor/leads', leadData);
        return response.data;
    },

    uploadImage: async (formData) => {
        const response = await api.post('/contractor/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    createPortfolioItem: async (contractorId, formData) => {
        const response = await api.post(`/contractor/${contractorId}/portfolio`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updatePortfolioItem: async (itemId, formData) => {
        const response = await api.patch(`/contractor/portfolio/${itemId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deletePortfolioItem: async (itemId) => {
        const response = await api.delete(`/contractor/portfolio/${itemId}`);
        return response.data;
    },
    
    getPortfolioItemById: async (itemId) => {
        const response = await api.get(`/contractor/portfolio/${itemId}`);
        return response.data;
    },
    getLeads: async (contractorId) => {
        const response = await api.get(`/contractor/${contractorId}/leads`);
        return response.data;
    },
    getStats: async (userId) => {
        const response = await api.get(`/contractor/stats/${userId}`);
        return response.data;
    }
};
