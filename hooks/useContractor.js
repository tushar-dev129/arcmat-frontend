import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractorService } from '@/services/contractorService';

export const useGetContractors = (params) => {
    return useQuery({
        queryKey: ['contractors', params],
        queryFn: () => contractorService.getContractors(params),
    });
};

export const useGetContractorBySlug = (slug) => {
    return useQuery({
        queryKey: ['contractor', slug],
        queryFn: () => contractorService.getContractorBySlug(slug),
        enabled: !!slug,
    });
};

export const useGetMyContractorProfile = (userId) => {
    return useQuery({
        queryKey: ['my-contractor-profile', userId],
        queryFn: () => contractorService.getMyProfile(userId),
        enabled: !!userId,
    });
};

export const useCreateContractorProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => contractorService.createProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contractors'] });
            queryClient.invalidateQueries({ queryKey: ['my-contractor-profile'] });
            queryClient.invalidateQueries({ queryKey: ['user-info'] });
        },
    });
};

export const useUpdateContractorProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => contractorService.updateProfile(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['contractors'] });
            queryClient.invalidateQueries({ queryKey: ['my-contractor-profile'] });
            queryClient.invalidateQueries({ queryKey: ['contractor', data.slug] });
        },
    });
};

export const useCreateContractorLead = () => {
    return useMutation({
        mutationFn: (leadData) => contractorService.createLead(leadData),
    });
};

export const useUploadContractorImage = () => {
    return useMutation({
        mutationFn: (formData) => contractorService.uploadImage(formData),
    });
};

export const useCreateContractorPortfolioItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ contractorId, formData }) => contractorService.createPortfolioItem(contractorId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-contractor-profile'] });
            queryClient.invalidateQueries({ queryKey: ['contractors'] });
        },
    });
};

export const useDeleteContractorPortfolioItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (itemId) => contractorService.deletePortfolioItem(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-contractor-profile'] });
            queryClient.invalidateQueries({ queryKey: ['contractors'] });
        },
    });
};
 
export const useGetPortfolioItemById = (itemId) => {
    return useQuery({
        queryKey: ['portfolio-item', itemId],
        queryFn: () => contractorService.getPortfolioItemById(itemId),
        enabled: !!itemId,
    });
};

export const useGetContractorLeads = (contractorId) => {
    return useQuery({
        queryKey: ['contractor-leads', contractorId],
        queryFn: () => contractorService.getLeads(contractorId),
        enabled: !!contractorId,
    });
};

export const useGetContractorStats = (userId) => {
    return useQuery({
        queryKey: ['contractor-stats', userId],
        queryFn: () => contractorService.getStats(userId),
        enabled: !!userId,
    });
};

export const useGetCategoryRequests = () => {
    return useQuery({
        queryKey: ['category-requests'],
        queryFn: () => contractorService.getCategoryRequests(),
    });
};
