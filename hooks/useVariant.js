import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { variantService } from '../services/variantService';

export const VARIANT_KEYS = {
    all: ['variants'],
    list: (productId) => [...VARIANT_KEYS.all, 'list', productId],
    detail: (id) => [...VARIANT_KEYS.all, 'detail', id],
};

export const useGetVariants = (productId) => {
    return useQuery({
        queryKey: VARIANT_KEYS.list(productId),
        queryFn: () => variantService.getVariantsByProductId(productId),
        enabled: !!productId,
    });
};

export const useGetVariant = (id) => {
    return useQuery({
        queryKey: VARIANT_KEYS.detail(id),
        queryFn: () => variantService.getVariantById(id),
        enabled: !!id,
    });
};

export const useCreateVariant = (productId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: variantService.createVariant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VARIANT_KEYS.list(productId) });
            queryClient.invalidateQueries({ queryKey: ['attributes'] });
        },
    });
};

export const useUpdateVariant = (productId, variantId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, variantId: mId, data }) => variantService.updateVariant(id || mId || variantId, data),
        onSuccess: (data, variables) => {
            if (productId) {
                queryClient.invalidateQueries({ queryKey: VARIANT_KEYS.list(productId) });
            }
            const vId = variables.id || variables.variantId || variantId;
            if (vId) {
                queryClient.invalidateQueries({ queryKey: VARIANT_KEYS.detail(vId) });
            }
            queryClient.invalidateQueries({ queryKey: ['attributes'] });
        },
    });
};

export const useDeleteVariant = (productId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: variantService.deleteVariant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VARIANT_KEYS.list(productId) });
        },
    });
};
