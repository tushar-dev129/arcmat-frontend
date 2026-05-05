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
        },
    });
};

export const useUpdateContractorProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => contractorService.updateProfile(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['contractors'] });
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
