import { useState, useEffect, useRef } from 'react';
import { useGetComments, usePostComment, useDeleteComment } from '@/hooks/useDiscussion';
import { useMarkNotificationsRead } from '@/hooks/useProject';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Send, MessageCircle, UserCircle2, Shield } from 'lucide-react';
import { getImageUrl } from '@/lib/productUtils';

export default function ProjectDiscussionTab({ projectId, projectName, moodboards = [] }) {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [filterSpaceId, setFilterSpaceId] = useState('general'); // 'general' | string (spaceId)
    const isArchitect = user?.role === 'architect';
    const scrollContainerRef = useRef(null);

    // spaceId and materialId are explicitly null for general project discussion
    // We now pass aggregate: "true" to fetch communication from ALL spaces
    const { data, isLoading } = useGetComments(projectId, null, {
        enabled: !!projectId,
        aggregate: "true"
    });

    const postMutation = usePostComment(projectId);
    const { mutate: markNotificationsRead } = useMarkNotificationsRead();

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    };

    // Mark messages as read when the tab is active or data changes
    useEffect(() => {
        if (projectId && user && !isLoading && data?.data?.length > 0) {
            // If we have a specific space filter, we clear that space. 
            // Otherwise, we clear the general project-wide notifications.
            const targetSpaceId = (filterSpaceId !== 'all' && filterSpaceId !== 'general') ? filterSpaceId : null;

            markNotificationsRead({
                id: projectId,
                spaceId: targetSpaceId,
                type: targetSpaceId ? 'space' : 'general'
            });
        }
    }, [projectId, user, isLoading, data, filterSpaceId, markNotificationsRead]);

    // Auto-scroll to the latest message
    useEffect(() => {
        if (!isLoading) {
            setTimeout(scrollToBottom, 100);
        }
    }, [data, isLoading, filterSpaceId]);

    if (!projectId) return null;

    const allComments = data?.data || [];

    // Fallback: Find material image from moodboards if not stored in comment
    const findMaterialImage = (itemId, itemName) => {
        if (!moodboards) return null;
        for (const mb of moodboards) {
            // Check architect's materials
            const archMaterial = mb.materials?.find(m => m._id === itemId || m.productName === itemName);
            if (archMaterial) return archMaterial.productThumbnail || archMaterial.imageUrl;

            // Check products list (if they were mapped)
            const product = mb.products?.find(p => p._id === itemId || p.productName === itemName);
            if (product) return product.productThumbnail || product.imageUrl;
        }
        return null;
    };

    // Filter comments based on selected space
    const filteredComments = allComments.filter(c => {
        if (filterSpaceId === 'all') return true;
        if (filterSpaceId === 'general') return !c.spaceId; // Include item discussions that aren't tied to a space
        return (c.spaceId === filterSpaceId || c.spaceId?._id === filterSpaceId);
    });

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Determination of space context for the message
        // If we have a specific space filter active, the message goes to that space
        const targetSpaceId = (filterSpaceId !== 'all' && filterSpaceId !== 'general') ? filterSpaceId : null;

        postMutation.mutate({
            message: message.trim(),
            spaceId: targetSpaceId,
            isInternal: isInternal
        }, {
            onSuccess: () => {
                setMessage('');
                setIsInternal(false);
                setTimeout(scrollToBottom, 50);
            }
        });
    };

    // Helper to get space name
    const getSpaceName = (id) => {
        if (!id) return null;
        const targetId = typeof id === 'object' ? id._id : id;
        const mb = moodboards.find(m => m._id === targetId);
        return mb ? mb.moodboard_name : 'Unknown Space';
    };

    return (
        <div className="flex flex-col h-[85vh] bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
            {/* Header Section with Filters */}
            <div className="px-8 pt-4 pb-1 border-b border-gray-100 bg-[#fef7f2]/50">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#d9a88a]">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#2d3142]">Communication Hub</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                    Project: {projectName || 'General'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-4 hide-scrollbar">
                        <button
                            onClick={() => setFilterSpaceId('general')}
                            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${filterSpaceId === 'general'
                                ? 'bg-[#d9a88a] text-white shadow-lg'
                                : 'bg-white text-gray-400 hover:bg-gray-100'
                                }`}
                        >
                            General
                        </button>
                        <div className="h-4 w-[1px] bg-gray-200 mx-1" />
                        {moodboards.map(mb => (
                            <button
                                key={mb._id}
                                onClick={() => setFilterSpaceId(mb._id)}
                                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${filterSpaceId === mb._id
                                    ? 'bg-[#d9a88a] text-white shadow-lg'
                                    : 'bg-white text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                {mb.moodboard_name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/20 custom-scrollbar"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 text-[#d9a88a] animate-spin mb-3" />
                        <p className="text-sm font-bold text-gray-400">Syncing messages...</p>
                    </div>
                ) : filteredComments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                        <div className="w-20 h-20 bg-white rounded-[32px] shadow-sm flex items-center justify-center mb-6">
                            <UserCircle2 className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-xl font-black text-[#2d3142] mb-2">No messages here</h3>
                        <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">
                            {filterSpaceId === 'all'
                                ? "Nobody has started a conversation in this project yet."
                                : `No messages found for ${filterSpaceId === 'general' ? 'General' : getSpaceName(filterSpaceId)}.`}
                        </p>
                    </div>
                ) : (
                    filteredComments.map(comment => {
                        const isMe = comment.authorId?._id === user?._id || comment.authorId === user?._id;
                        const authorName = comment.authorId?.name || (isMe ? user?.name : 'User');
                        const authorRole = comment.authorId?.role || (isMe ? user?.role : 'User');
                        const spaceName = getSpaceName(comment.spaceId);

                        return (
                            <div key={comment._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {/* Space/Context Label */}
                                    <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md ${!spaceName
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'bg-orange-50 text-orange-600'
                                        }`}>
                                        {spaceName ? `[${spaceName}]` : '[General]'}
                                    </span>

                                    {comment.referencedMaterialName && (
                                        <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md bg-purple-50 text-purple-600">
                                            [ITEM: {comment.referencedMaterialName}]
                                        </span>
                                    )}

                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#2d3142] ml-1">
                                        {isMe ? 'You' : authorName}
                                    </span>

                                    {comment.isInternal && (
                                        <span className="text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter bg-amber-100 text-amber-700 flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> Private
                                        </span>
                                    )}
                                </div>
                                <div className={`max-w-[75%] rounded-3xl text-sm font-medium leading-relaxed shadow-sm group relative overflow-hidden ${isMe
                                    ? 'bg-[#1a1a2e] text-white rounded-tr-sm'
                                    : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
                                    }`}>
                                    {(comment.referencedMaterialImage || findMaterialImage(comment.referencedMaterialId, comment.referencedMaterialName)) && (
                                        <div className="relative h-32 w-full overflow-hidden border-b border-gray-100/10 group/thumb">
                                            <img
                                                src={getImageUrl(comment.referencedMaterialImage || findMaterialImage(comment.referencedMaterialId, comment.referencedMaterialName))}
                                                alt={comment.referencedMaterialName}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-3">
                                                <span className="text-white text-[10px] font-black uppercase tracking-widest truncate">
                                                    {comment.referencedMaterialName}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="px-5 py-4">
                                        <p className="whitespace-pre-wrap">{comment.message}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">
                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-4">
                            {isArchitect && (
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={isInternal}
                                        onChange={(e) => setIsInternal(e.target.checked)}
                                        className="w-4 h-4 rounded-lg border-gray-200 text-[#d9a88a] focus:ring-[#d9a88a] transition-all cursor-pointer"
                                    />
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isInternal ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                        Private Internal Note
                                    </span>
                                </label>
                            )}
                        </div>

                        {/* Status Label for input context */}
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#d9a88a]">
                            Posting to: {filterSpaceId === 'all' || filterSpaceId === 'general' ? 'General Project' : getSpaceName(filterSpaceId)}
                        </div>
                    </div>

                    <div className="flex items-end gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={
                                    filterSpaceId === 'all' || filterSpaceId === 'general'
                                        ? "Add a general project comment..."
                                        : `Add a comment specifically for the ${getSpaceName(filterSpaceId)}...`
                                }
                                className={`w-full resize-none min-h-[60px] max-h-[200px] p-5 bg-gray-50 border border-transparent rounded-[24px] focus:bg-white focus:border-[#d9a88a] focus:ring-4 focus:ring-[#d9a88a]/5 outline-none text-sm font-bold text-gray-700 transition-all leading-relaxed placeholder:text-gray-400 scrollbar-none ${isInternal ? 'bg-amber-50/30' : ''}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!message.trim() || postMutation.isPending}
                            className={`h-[60px] w-[60px] flex items-center justify-center rounded-[24px] text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ${isInternal
                                ? 'bg-amber-500 shadow-amber-200/50 hover:bg-amber-600'
                                : 'bg-[#d9a88a] shadow-orange-100/50 hover:bg-[#c29377]'
                                }`}
                        >
                            {postMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
