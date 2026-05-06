import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandService } from '../services/brandService';

export const BRAND_KEYS = {
    all: ['brands'],
    list: (params) => [...BRAND_KEYS.all, 'list', params],
    detail: (id) => [...BRAND_KEYS.all, 'detail', id],
    bespokeOptions: (id) => [...BRAND_KEYS.all, 'bespoke-options', id],
    contractorRequests: (brandId, mine) => [...BRAND_KEYS.all, 'contractor-requests', brandId, mine],
};

export const useGetBrands = (params = {}) => {
    return useQuery({
        queryKey: BRAND_KEYS.list(params),
        queryFn: () => brandService.getAllBrands(params),
    });
};

export const useGetBrandById = (id) => {
    return useQuery({
        queryKey: BRAND_KEYS.detail(id),
        queryFn: () => brandService.getBrandById(id),
        enabled: !!id,
    });
};

export const useGetBespokeOptions = (id) => {
    return useQuery({
        queryKey: BRAND_KEYS.bespokeOptions(id),
        queryFn: () => brandService.getBespokeOptions(id),
        enabled: !!id,
    });
};

export const useGetContractorBespokeRequests = ({ brandId, mine, enabled = true } = {}) => {
    return useQuery({
        queryKey: BRAND_KEYS.contractorRequests(brandId, mine),
        queryFn: () => brandService.getContractorRequests({ brandId, mine }),
        enabled: enabled && !!brandId,
    });
};

export const useCreateContractorBespokeRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: brandService.createContractorRequest,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: BRAND_KEYS.contractorRequests(variables.brandId) });
        },
    });
};

export const useDecideContractorBespokeRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: brandService.decideContractorRequest,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: BRAND_KEYS.contractorRequests(variables.brandId) });
            queryClient.invalidateQueries({ queryKey: BRAND_KEYS.detail(variables.brandId) });
            queryClient.invalidateQueries({ queryKey: BRAND_KEYS.all });
        },
    });
};

export const useCreateBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: brandService.createBrand,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BRAND_KEYS.all });
        },
    });
};

export const useUpdateBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => brandService.updateBrand(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BRAND_KEYS.all });
        },
    });
};

export const useDeleteBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: brandService.deleteBrand,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BRAND_KEYS.all });
        },
    });
};
