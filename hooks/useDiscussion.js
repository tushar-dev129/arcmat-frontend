import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discussionService } from '../services/discussionService';
import { toast } from '@/components/ui/Toast';
import { PROJECT_KEYS } from './useProject';
import { NOTIFICATION_KEYS } from './useNotificationCounts';

export const DISCUSSION_KEYS = {
    all: ['discussion'],
    project: (projectId, spaceId = null, aggregate = null) => [...DISCUSSION_KEYS.all, projectId, spaceId ? `space-${spaceId}` : 'general', aggregate ? 'aggregated' : 'specific'],
};

export const useGetComments = (projectId, spaceId = null, options = {}) => {
    const aggregate = options.aggregate || null;
    return useQuery({
        queryKey: DISCUSSION_KEYS.project(projectId, spaceId, aggregate),
        queryFn: () => discussionService.getComments(projectId, spaceId, null, null, null, aggregate),
        enabled: !!projectId && (options.enabled !== false),
        // 15s polling — balanced between real-time feel and server load
        refetchInterval: options.refetchInterval ?? 15000,
        ...options
    });
};

export const usePostComment = (projectId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => discussionService.postComment(projectId, data),
        onSuccess: () => {
            // Refresh the discussion thread
            queryClient.invalidateQueries({ queryKey: [...DISCUSSION_KEYS.all, projectId] });
            // Also refresh project list so unread badges update immediately
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
            // And refresh sidebar counts badge
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.counts() });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to post comment');
        },
    });
};

export const useDeleteComment = (projectId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentId) => discussionService.deleteComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...DISCUSSION_KEYS.all, projectId] });
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.counts() });
            toast.success('Comment deleted');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete comment');
        },
    });
};
