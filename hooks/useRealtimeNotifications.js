import { useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { toast } from 'sonner'; // Assuming sonner is used based on package.json, or replace with your toast library
import useAuthStore from '../store/useAuthStore';

/**
 * Hook to listen for real-time notifications.
 * @param {Object} options Options for the hook.
 * @param {Function} options.onNewNotification Callback triggered when a new notification is received.
 */
export const useRealtimeNotifications = ({ onNewNotification } = {}) => {
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) return;

        const socket = getSocket();
        if (!socket) return;

        const handleNewNotification = (notification) => {
            console.log("New real-time notification received:", notification);
            
            // Show a toast by default
            toast(notification.type || "New Notification", {
                description: notification.message || "You have a new notification",
            });

            // Call the custom callback if provided (e.g., to refetch notifications list)
            if (onNewNotification) {
                onNewNotification(notification);
            }
        };

        socket.on('notification:new', handleNewNotification);

        return () => {
            socket.off('notification:new', handleNewNotification);
        };
    }, [isAuthenticated, onNewNotification]);
};

export default useRealtimeNotifications;
