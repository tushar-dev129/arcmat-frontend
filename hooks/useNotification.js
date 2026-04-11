import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';
import { NOTIFICATION_KEYS } from './useNotificationCounts';

// NOTE: Use a DIFFERENT root key than NOTIFICATION_KEYS to avoid cache collision.
// NOTIFICATION_KEYS (counts) uses ['notifications', 'counts'].
// App notifications use ['app-notifications'] so invalidations don't cross-contaminate.
const APP_NOTIF_KEYS = {
    all: ['app-notifications'],
    list: () => [...APP_NOTIF_KEYS.all, 'list'],
};

export const useGetNotifications = () => {
    return useQuery({
        queryKey: APP_NOTIF_KEYS.list(),
        queryFn: notificationService.getMyNotifications,
        refetchInterval: 30000,      // Poll every 30s
        refetchOnWindowFocus: true,
        staleTime: 15000,
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            // Refresh the notification list AND the sidebar counts badge
            queryClient.invalidateQueries({ queryKey: APP_NOTIF_KEYS.list() });
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.counts() });
        },
    });
};

export const useNotificationAction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }) => notificationService.handleAction(id, status),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: APP_NOTIF_KEYS.list() });
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.counts() });
            toast.success(`Action ${data.data.actionStatus} successfully`);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to handle action');
        }
    });
};

export const useCreateNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationService.createNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: APP_NOTIF_KEYS.list() });
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.counts() });
        },
    });
};
