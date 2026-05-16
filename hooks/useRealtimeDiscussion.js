import { useEffect } from 'react';
import { getSocket } from '../lib/socket';
import useAuthStore from '../store/useAuthStore';

/**
 * Hook to manage real-time discussion features for a specific project.
 * 
 * @param {Object} params
 * @param {string} params.projectId The ID of the project to join the room for.
 * @param {Function} params.onNewMessage Callback triggered when a new message is received.
 * @param {Function} params.onDeleteMessage Callback triggered when a message is deleted.
 */
export const useRealtimeDiscussion = ({ projectId, onNewMessage, onDeleteMessage }) => {
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated || !projectId) return;

        const socket = getSocket();
        if (!socket) return;

        // Join the specific project room
        socket.emit('join_project', projectId);

        const handleNewMessage = (message) => {
            console.log("New discussion message received:", message);
            if (onNewMessage) onNewMessage(message);
        };

        const handleDeleteMessage = ({ commentId }) => {
            console.log("Discussion message deleted:", commentId);
            if (onDeleteMessage) onDeleteMessage(commentId);
        };

        socket.on('discussion:new-message', handleNewMessage);
        socket.on('discussion:delete-message', handleDeleteMessage);

        return () => {
            // Clean up listeners
            socket.off('discussion:new-message', handleNewMessage);
            socket.off('discussion:delete-message', handleDeleteMessage);
            
            // Leave the room
            socket.emit('leave_project', projectId);
        };
    }, [projectId, isAuthenticated, onNewMessage, onDeleteMessage]);
};

export default useRealtimeDiscussion;
