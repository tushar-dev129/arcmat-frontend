'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDeleteMoodboard } from '@/hooks/useMoodboard';
import { useGetProject, useCompleteProject, useMarkNotificationsRead } from '@/hooks/useProject';
import { useAuth } from '@/hooks/useAuth';
import MoodboardCard from '@/components/dashboard/projects/MoodboardCard';
import CreateMoodboardModal from '@/components/dashboard/projects/CreateMoodboardModal';
import InviteClientModal from '@/components/dashboard/projects/InviteClientModal';
import PrivacySettingsModal from '@/components/dashboard/projects/PrivacySettingsModal';
import ProjectDiscussionModal from '@/components/dashboard/projects/ProjectDiscussionModal';
import ProjectDiscussionTab from '@/components/dashboard/projects/ProjectDiscussionTab';
import ProjectAnalyticsPanel from '@/components/dashboard/projects/ProjectAnalyticsPanel';
import {
    Loader2, Plus, ArrowLeft, Layout, Search, ChevronDown, Filter, Shield,
    MessageCircle, CheckCircle, BarChart3,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import Container from '@/components/ui/Container';
import { toast } from 'sonner';

export default function MoodboardsPage() {
    const { projectId } = useParams();
    const router = useRouter();

    // ── modal state ──────────────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen]           = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [moodboardToDelete, setMoodboardToDelete] = useState(null);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('spaces'); // 'spaces' | 'analytics' | 'discussion'

    // ── filter/sort state ────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery]         = useState('');
    const [sortBy, setSortBy]                   = useState('newest');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

    const { user } = useAuth();
    const isArchitect = user?.role === 'architect';
    const isContractor = user?.professionalType === 'Contractor / Builder';

    useEffect(() => {
        if (isContractor) {
            toast.error('Contractors do not have access to Spaces.');
            router.push('/dashboard/projects');
        }
    }, [isContractor, router]);

    const { data: projectData, isLoading: projectLoading } = useGetProject(projectId, { includeSpaces: true });
    const deleteMutation    = useDeleteMoodboard();
    const completeMutation  = useCompleteProject();
    const { mutate: markNotificationsRead } = useMarkNotificationsRead();

    const project   = projectData?.data;
    const moodboards = project?.moodboards || [];

    // Mark project-level notifications read on enter
    useEffect(() => {
        if (projectId && user) {
            markNotificationsRead({ id: projectId });
        }
    }, [projectId, user, markNotificationsRead]);

    // ── unread badge for chat FAB ────────────────────────────────────────────
    const unreadMessages = project?.unreadMessages || 0;

    // ── handlers ─────────────────────────────────────────────────────────────
    const handleDeleteClick   = (id) => { setMoodboardToDelete(id); setIsDeleteModalOpen(true); };
    const handleConfirmDelete = async () => {
        if (moodboardToDelete) {
            deleteMutation.mutate(moodboardToDelete);
            setIsDeleteModalOpen(false);
        }
    };
    const handleConfirmComplete = async () => {
        completeMutation.mutate(projectId, {
            onSuccess: () => setIsCompleteModalOpen(false),
        });
    };

    // ── filtered + sorted spaces ──────────────────────────────────────────────
    const filteredMoodboards = moodboards
        .filter((mb) => {
            if (!isArchitect && project?.privacyControls) {
                const { showMoodboards, showMaterials, showRenders } = project.privacyControls;
                if (!showMoodboards && !showMaterials && !showRenders) return false;
            }
            return mb.moodboard_name?.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'name')   return a.moodboard_name.localeCompare(b.moodboard_name);
            return 0;
        });

    // ── loading state ─────────────────────────────────────────────────────────
    if (projectLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-[#d9a88a] animate-spin mb-4" />
                <p className="text-gray-400 font-bold">Loading spaces...</p>
            </div>
        );
    }

    return (
        <Container className="py-8">
            {/* ── Top bar ───────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <button
                    onClick={() => router.push('/dashboard/projects')}
                    className="flex items-center gap-2 text-gray-400 hover:text-[#d9a88a] font-bold transition-colors group shrink-0"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Projects
                </button>

                {isArchitect && (
                    <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar w-full md:w-auto">
                        <Button
                            onClick={() => setIsPrivacyModalOpen(true)}
                            className="bg-white border text-gray-700 px-4 sm:px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-[11px] sm:text-sm whitespace-nowrap shrink-0"
                        >
                            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d9a88a]" />
                            Client Settings
                        </Button>
                        <Button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="bg-[#2d3142] hover:bg-white hover:text-[#2d3142] border border-[#2d3142] text-white px-4 sm:px-5 py-3 rounded-2xl font-bold flex items-center gap-2 text-[11px] sm:text-sm whitespace-nowrap shrink-0"
                        >
                            Invite Client
                        </Button>
                        {project?.status !== 'Completed' && (
                            <Button
                                onClick={() => setIsCompleteModalOpen(true)}
                                disabled={completeMutation.isPending}
                                className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white px-4 sm:px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all text-[11px] sm:text-sm disabled:opacity-50 whitespace-nowrap shrink-0"
                            >
                                {completeMutation.isPending
                                    ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                    : <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                Mark Complete
                            </Button>
                        )}
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#d9a88a] hover:bg-white hover:text-[#d9a88a] border border-[#d9a88a] text-white px-4 sm:px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-100 text-[11px] sm:text-sm whitespace-nowrap shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            New Space
                        </Button>
                    </div>
                )}
            </div>

            {/* ── Project header ────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#fef7f2] flex items-center justify-center">
                            <Layout className="w-5 h-5 text-[#d9a88a]" />
                        </div>
                        <h1 className="text-3xl font-black text-[#2d3142] tracking-tight">
                            {project?.projectName} <span className="text-[#d9a88a]">Spaces</span>
                        </h1>
                        {project?.status === 'Completed' && (
                            <span className="text-xs font-black px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Completed
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 font-medium ml-1">
                        Conceptual designs and project estimations.
                    </p>
                </div>

                {/* search + sort UI is now managed inside the 'Spaces' tab section below */}
            </div>

            {/* ── Tab Navigation ───────────────────────────────────────── */}
            <div className="flex items-center gap-2 mb-10 border-b border-gray-100 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                {[
                    { id: 'spaces', label: 'All Spaces', icon: Layout },
                    { id: 'analytics', label: 'Project Analytics', icon: BarChart3 },
                    { id: 'discussion', label: 'Messages', icon: MessageCircle },
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    const hasUnread = tab.id === 'discussion' && unreadMessages > 0;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all relative whitespace-nowrap ${
                                isActive 
                                    ? 'border-[#1a1a2e] text-[#1a1a2e]' 
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <tab.icon className={`w-4 h-4 ${isActive ? 'text-[#d9a88a]' : ''}`} />
                            {tab.label}
                            {hasUnread && (
                                <span className="flex items-center justify-center bg-red-500 text-white text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full ml-1.5 animate-pulse">
                                    {unreadMessages}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab Content ───────────────────────────────────────────── */}
            <div className="space-y-6">
                
                {/* SPACES TAB */}
                {activeTab === 'spaces' && (
                    <>
                        {/* Search and Sort controls moved here for clarity */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                           <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search spaces..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 w-48 focus:ring-2 focus:ring-[#d9a88a]/20 transition-all outline-none"
                                    />
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                        className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-500 hover:text-[#d9a88a] transition-all"
                                    >
                                        <Filter className="w-4 h-4" />
                                        {sortBy === 'newest' ? 'Newest' : 'Name'}
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isSortDropdownOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-40 bg-white shadow-2xl rounded-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                            <button
                                                onClick={() => { setSortBy('newest'); setIsSortDropdownOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors ${sortBy === 'newest' ? 'text-[#d9a88a] bg-[#fef7f2]' : 'text-gray-500 hover:bg-gray-50'}`}
                                            >Newest</button>
                                            <button
                                                onClick={() => { setSortBy('name'); setIsSortDropdownOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors ${sortBy === 'name' ? 'text-[#d9a88a] bg-[#fef7f2]' : 'text-gray-500 hover:bg-gray-50'}`}
                                            >Name</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Space grid */}
                        {filteredMoodboards.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {filteredMoodboards.map((mb) => (
                                    <MoodboardCard
                                        key={mb._id}
                                        moodboard={mb}
                                        projectId={projectId}
                                        onDelete={handleDeleteClick}
                                        isArchitect={isArchitect}
                                        projectPrivacy={project?.privacyControls}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200 text-center">
                                <div className="w-24 h-24 bg-[#fef7f2] rounded-3xl flex items-center justify-center mb-8">
                                    <Layout className="w-12 h-12 text-[#d9a88a]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#2d3142] mb-3">
                                    {searchQuery ? 'No matching spaces' : 'No spaces yet'}
                                </h3>
                                <p className="text-gray-400 font-medium max-w-sm mx-auto mb-10">
                                    {searchQuery
                                        ? `We couldn't find any spaces matching "${searchQuery}"`
                                        : 'Start by creating your first space to organize your design ideas and costs.'}
                                </p>
                                {!searchQuery && isArchitect && (
                                    <Button
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-[#d9a88a] text-white px-10 py-4 rounded-2xl font-black"
                                    >
                                        Create Your First Space
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* ANALYTICS TAB */}
                {activeTab === 'analytics' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ProjectAnalyticsPanel
                            project={project}
                            moodboards={moodboards}
                            isArchitect={isArchitect}
                        />
                    </div>
                )}

                {/* DISCUSSION TAB */}
                {activeTab === 'discussion' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ProjectDiscussionTab 
                            projectId={projectId}
                            projectName={project?.projectName}
                            moodboards={moodboards}
                        />
                    </div>
                )}
            </div>



            {/* ── Modals ────────────────────────────────────────────────── */}
            <CreateMoodboardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projectId={projectId}
            />

            <InviteClientModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                projectId={projectId}
                projectName={project?.projectName}
            />

            <PrivacySettingsModal
                isOpen={isPrivacyModalOpen}
                onClose={() => setIsPrivacyModalOpen(false)}
                project={project}
            />



            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Space"
                message="Are you sure you want to delete this space and its associated costs? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />

            <ConfirmationModal
                isOpen={isCompleteModalOpen}
                onClose={() => setIsCompleteModalOpen(false)}
                onConfirm={handleConfirmComplete}
                title="Complete Project"
                message="Are you sure you want to finalize this project? All current materials across all spaces will be marked as 'Specified' and the project phase will be updated to Completed."
                confirmText={completeMutation.isPending ? 'Completing...' : 'Complete Project'}
                type="primary"
            />
        </Container>
    );
}
