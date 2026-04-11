'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import useAuthStore from '@/store/useAuthStore';
import useProjectStore from '@/store/useProjectStore';
import { useGetProjects } from '@/hooks/useProject';
import { useGetAllMoodboards } from '@/hooks/useMoodboard';
import { useGetMySampleRequests } from '@/hooks/useSampleRequest';
import { useGetNotifications, useMarkNotificationRead } from '@/hooks/useNotification';
import { useGetMyRetailerRequests } from '@/hooks/useRetailerRequest';
import CreateProjectModal from '@/components/dashboard/sidebar/CreateProjectModal';
import Container from '@/components/ui/Container';
import {
    FolderOpen, Plus, Bell, Package, MessageCircle, ArrowRight,
    Clock, CheckCircle2, AlertCircle, Layers, ChevronRight,
    TrendingUp, Calendar, MapPin, User, Zap, BarChart3,
    Circle, Activity
} from 'lucide-react';
import { getImageUrl } from '@/lib/productUtils';

// ─── Phase Config ──────────────────────────────────────────────────────────────
const PHASES = [
    { label: 'Concept Design',       index: 0, color: '#a78bfa', bg: '#f5f3ff' },
    { label: 'Design Development',   index: 1, color: '#60a5fa', bg: '#eff6ff' },
    { label: 'Material Specification', index: 2, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Construction',         index: 3, color: '#f97316', bg: '#fff7ed' },
    { label: 'Completed',            index: 4, color: '#10b981', bg: '#f0fdf4' },
];

const STATUS_COLORS = {
    'Active':    { dot: '#10b981', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    'On hold':   { dot: '#f59e0b', badge: 'bg-amber-50 text-amber-700 border-amber-100' },
    'Completed': { dot: '#10b981', badge: 'bg-blue-50 text-blue-700 border-blue-100' },
    'Canceled':  { dot: '#ef4444', badge: 'bg-red-50 text-red-700 border-red-100' },
    'Archived':  { dot: '#9ca3af', badge: 'bg-gray-100 text-gray-500 border-gray-200' },
};

// ─── Phase Progress Bar ────────────────────────────────────────────────────────
function PhaseProgressBar({ phase }) {
    const current = PHASES.find(p => p.label === phase) || PHASES[0];
    const pct = Math.round(((current.index + 1) / PHASES.length) * 100);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Phase Progress</span>
                <span className="text-[10px] font-black" style={{ color: current.color }}>{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: current.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
            <div className="flex mt-2 gap-0.5">
                {PHASES.map((p, i) => (
                    <div
                        key={p.label}
                        className={clsx('flex-1 h-1 rounded-full transition-all duration-500', i <= current.index ? '' : 'bg-gray-100')}
                        style={i <= current.index ? { backgroundColor: p.color } : {}}
                        title={p.label}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Radial Donut Chart ────────────────────────────────────────────────────────
function DonutChart({ data, size = 120, strokeWidth = 14 }) {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const total = data.reduce((s, d) => s + d.value, 0) || 1;

    let cumulative = 0;
    const segments = data.map(d => {
        const pct = d.value / total;
        const dash = pct * circ;
        const gap = circ - dash;
        const offset = -(cumulative * circ);
        cumulative += pct;
        return { ...d, dash, gap, offset };
    });

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
            {segments.map((seg, i) => (
                <motion.circle
                    key={i}
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${seg.dash} ${seg.gap}`}
                    strokeDashoffset={seg.offset}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${circ}` }}
                    animate={{ strokeDasharray: `${seg.dash} ${seg.gap}` }}
                    transition={{ duration: 1, delay: i * 0.15, ease: 'easeOut' }}
                />
            ))}
        </svg>
    );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, bg, href }) {
    const inner = (
        <motion.div
            whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
            className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-3 h-full transition-all cursor-pointer"
        >
            <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg, color }}>
                    <Icon className="w-5 h-5" />
                </div>
                {href && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
            <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                <h3 className="text-3xl font-black text-gray-900 leading-none mt-0.5">{value}</h3>
                {sub && <p className="text-xs text-gray-400 mt-1 font-medium">{sub}</p>}
            </div>
        </motion.div>
    );

    return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Project Row Card ──────────────────────────────────────────────────────────
function ProjectRowCard({ project, allBoards }) {
    const phase = project.phase || 'Concept Design';
    const status = project.status || 'Active';
    const phaseConfig = PHASES.find(p => p.label === phase) || PHASES[0];
    const statusConfig = STATUS_COLORS[status] || STATUS_COLORS['Active'];
    const projectBoards = allBoards.filter(b => {
        const bProjId = b.projectId?._id || b.projectId;
        return String(bProjId) === String(project._id);
    });
    const unread = project.unreadMessages || 0;

    return (
        <motion.div
            whileHover={{ x: 4 }}
            className="group"
        >
            <Link
                href={`/dashboard/projects/${project._id}/moodboards`}
                onClick={() => useProjectStore.getState().setActiveProject(project._id, project.projectName)}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all"
            >
                {/* Cover / Avatar */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                    {getImageUrl(project.coverImage) ? (
                        <Image src={getImageUrl(project.coverImage)} alt="" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: phaseConfig.bg }}>
                            <FolderOpen className="w-5 h-5" style={{ color: phaseConfig.color }} />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{project.projectName}</h4>
                        {unread > 0 && (
                            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                                {unread > 9 ? '9+' : unread}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {project.clientName && (
                            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5">
                                <User className="w-2.5 h-2.5" /> {project.clientName}
                            </span>
                        )}
                        {project.location?.city && (
                            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5">
                                <span className="text-gray-200">·</span>
                                <MapPin className="w-2.5 h-2.5" /> {project.location.city}
                            </span>
                        )}
                    </div>
                </div>

                {/* Phase badge */}
                <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
                    <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ backgroundColor: phaseConfig.bg, color: phaseConfig.color, borderColor: `${phaseConfig.color}30` }}
                    >
                        {phase}
                    </span>
                    <span className={clsx('text-[9px] font-bold px-2 py-0.5 rounded-full border', statusConfig.badge)}>
                        {status}
                    </span>
                </div>

                {/* Spaces count */}
                <div className="hidden md:flex flex-col items-center shrink-0 ml-2">
                    <span className="text-lg font-black text-gray-800">{projectBoards.length}</span>
                    <span className="text-[9px] font-bold text-gray-400 tracking-wide uppercase">Spaces</span>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
            </Link>
        </motion.div>
    );
}

// ─── Notification Item ─────────────────────────────────────────────────────────
function NotificationItem({ notification, onMarkRead }) {
    const isUnread = !notification.isRead;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className={clsx(
                'flex items-start gap-3 p-3 rounded-xl transition-colors',
                isUnread ? 'bg-amber-50/60 border border-amber-100/80' : 'bg-gray-50/50'
            )}
        >
            <div className={clsx('w-2 h-2 rounded-full mt-1.5 shrink-0', isUnread ? 'bg-amber-500' : 'bg-gray-200')} />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 leading-snug">{notification.message || notification.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                </p>
            </div>
            {isUnread && (
                <button
                    onClick={() => onMarkRead(notification._id)}
                    className="text-[9px] font-bold text-amber-600 hover:text-amber-800 whitespace-nowrap shrink-0 transition-colors"
                >
                    Mark read
                </button>
            )}
        </motion.div>
    );
}

// ─── Main Architect Dashboard ──────────────────────────────────────────────────
export default function ArchitectDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirect if not architect
    useEffect(() => {
        if (mounted && user && user.role !== 'architect') {
            router.replace('/dashboard');
        }
    }, [mounted, user, router]);

    // ─── Data Fetching ────────────────────────────────────────────────────
    const { data: projectsData, isLoading: projectsLoading } = useGetProjects({ enabled: mounted && !!user });
    const { data: boardsData } = useGetAllMoodboards();
    const { data: samplesData } = useGetMySampleRequests();
    const { data: notificationsData } = useGetNotifications();
    const { data: retailerRequestsData } = useGetMyRetailerRequests();
    const markReadMutation = useMarkNotificationRead();

    // ─── Derived Data ─────────────────────────────────────────────────────
    const projects = projectsData?.data || [];
    const allBoards = boardsData?.data || [];
    const samples = samplesData?.data || [];
    const notifications = notificationsData?.data || [];
    const retailerRequests = retailerRequestsData?.data || [];

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const pendingSamples = samples.filter(s => s.status === 'Pending' || s.status === 'pending');
    const activeProjects = projects.filter(p => (p.status || 'Active') === 'Active');
    const completedProjects = projects.filter(p => p.phase === 'Completed' || p.status === 'Completed');
    const recentProjects = [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6);

    // Phase distribution
    const phaseDistribution = useMemo(() => {
        return PHASES.map(p => ({
            label: p.label,
            value: projects.filter(proj => (proj.phase || 'Concept Design') === p.label).length,
            color: p.color,
        }));
    }, [projects]);

    // Status distribution
    const statusDistribution = useMemo(() => {
        const statuses = ['Active', 'On hold', 'Completed', 'Canceled', 'Archived'];
        return statuses.map(s => ({
            label: s,
            value: projects.filter(p => (p.status || 'Active') === s).length,
            color: STATUS_COLORS[s]?.dot || '#9ca3af',
        }));
    }, [projects]);

    const totalBoards = allBoards.length;
    const totalUnreadMsg = projects.reduce((sum, p) => sum + (p.unreadMessages || 0), 0);
    const pendingRetailerReqs = retailerRequests.filter(r => r.status === 'Pending' || r.status === 'pending').length;

    // Completion rate
    const completionRate = projects.length > 0 ? Math.round((completedProjects.length / projects.length) * 100) : 0;

    const firstName = user?.name?.split(' ')[0] || 'Architect';

    if (!mounted) return null;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                    <div>
                        <p className="text-sm font-bold text-[#d9a88a] uppercase tracking-widest mb-1">{greeting} 👋</p>
                        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{firstName}</h1>
                        <p className="text-gray-400 text-sm font-medium mt-1">
                            {activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''} · {totalBoards} design spaces
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-[#2d3142] hover:bg-[#1e2130] text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                </motion.div>

                {/* ── Stat Cards ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <StatCard icon={FolderOpen}  label="Total Projects"  value={projects.length}         sub={`${activeProjects.length} active`}         color="#6366f1" bg="#eef2ff" href="/dashboard/projects" />
                    <StatCard icon={Layers}       label="Design Spaces"   value={totalBoards}             sub="Across all projects"                       color="#d9a88a" bg="#fef7f2" href="/dashboard/boards" />
                    <StatCard icon={Package}      label="Sample Requests" value={samples.length}          sub={`${pendingSamples.length} pending`}        color="#f59e0b" bg="#fffbeb" href="/dashboard/sample-requests" />
                    <StatCard icon={Bell}         label="Notifications"   value={unreadNotifications.length} sub="Unread alerts"                         color="#ef4444" bg="#fef2f2" />
                </motion.div>

                {/* ── Main 2-column grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── LEFT column (2/3) ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Recent Projects */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-50">
                                <div className="flex items-center gap-2">
                                    <FolderOpen className="w-5 h-5 text-[#d9a88a]" />
                                    <h2 className="text-lg font-black text-gray-900">Your Projects</h2>
                                </div>
                                <Link href="/dashboard/projects" className="text-xs font-bold text-[#d9a88a] hover:text-[#c89675] flex items-center gap-1 transition-colors">
                                    View All <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="p-4">
                                {projectsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin w-8 h-8 rounded-full border-b-2 border-[#d9a88a]" />
                                    </div>
                                ) : recentProjects.length > 0 ? (
                                    <div className="space-y-1">
                                        {recentProjects.map(project => (
                                            <ProjectRowCard key={project._id} project={project} allBoards={allBoards} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-14">
                                        <div className="w-16 h-16 bg-[#fef7f2] rounded-3xl flex items-center justify-center mx-auto mb-4">
                                            <FolderOpen className="w-8 h-8 text-[#d9a88a]" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">No projects yet</h3>
                                        <p className="text-sm text-gray-400 mb-6">Create your first project to get started</p>
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="inline-flex items-center gap-2 bg-[#2d3142] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-[#1e2130]"
                                        >
                                            <Plus className="w-4 h-4" /> New Project
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Phase Progress Overview */}
                        {projects.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
                            >
                                <div className="flex items-center gap-2 mb-6">
                                    <Activity className="w-5 h-5 text-[#d9a88a]" />
                                    <h2 className="text-lg font-black text-gray-900">Phase Distribution</h2>
                                    <span className="text-xs text-gray-400 font-medium ml-1">(across {projects.length} project{projects.length !== 1 ? 's' : ''})</span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    {/* Donut */}
                                    <div className="relative shrink-0">
                                        <DonutChart data={phaseDistribution.filter(d => d.value > 0)} size={140} strokeWidth={16} />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-3xl font-black text-gray-900">{completionRate}%</span>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Complete</span>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="flex-1 w-full space-y-3">
                                        {phaseDistribution.map(p => {
                                            const pct = projects.length > 0 ? Math.round((p.value / projects.length) * 100) : 0;
                                            return (
                                                <div key={p.label} className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs font-bold text-gray-700 truncate">{p.label}</span>
                                                            <span className="text-xs font-black ml-2 shrink-0" style={{ color: p.color }}>{p.value}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className="h-full rounded-full"
                                                                style={{ backgroundColor: p.color }}
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pct}%` }}
                                                                transition={{ duration: 0.7, ease: 'easeOut' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Project Status Summary */}
                        {projects.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="grid grid-cols-2 sm:grid-cols-5 gap-3"
                            >
                                {statusDistribution.map(s => (
                                    <div
                                        key={s.label}
                                        className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-1 shadow-sm"
                                    >
                                        <span className="text-2xl font-black text-gray-900">{s.value}</span>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">{s.label}</span>
                                        <div className="w-6 h-1 rounded-full mt-1" style={{ backgroundColor: s.color }} />
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* Sample Requests Widget */}
                        {samples.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                            >
                                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-amber-500" />
                                        <h2 className="text-lg font-black text-gray-900">Sample Requests</h2>
                                    </div>
                                    <Link href="/dashboard/sample-requests" className="text-xs font-bold text-[#d9a88a] hover:text-[#c89675] flex items-center gap-1 transition-colors">
                                        View All <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {samples.slice(0, 5).map(req => {
                                        const sStatus = req.status || 'Pending';
                                        const sColor = sStatus === 'Delivered' ? 'text-emerald-600 bg-emerald-50' : sStatus === 'Dispatched' ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50';
                                        return (
                                            <div key={req._id} className="flex items-center gap-4 px-6 py-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                                    <Package className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 truncate">
                                                        {req.productId?.product_name || 'Product Sample'}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-medium">
                                                        {req.projectId?.projectName || 'Project'}
                                                    </p>
                                                </div>
                                                <span className={clsx('text-[10px] font-black px-2.5 py-1 rounded-full', sColor)}>
                                                    {sStatus}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* ── RIGHT column (1/3) ── */}
                    <div className="space-y-6">

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-gradient-to-br from-[#2d3142] to-[#1a1f33] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#d9a88a]/10 rounded-full" />
                            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-5">
                                    <Zap className="w-4 h-4 text-[#d9a88a]" />
                                    <h2 className="text-sm font-black uppercase tracking-widest text-[#d9a88a]">Quick Actions</h2>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { label: 'New Project', href: null, action: () => setIsCreateModalOpen(true), icon: Plus },
                                        { label: 'Browse Products', href: '/productlist', icon: Package },
                                        { label: 'My Spaces', href: '/dashboard/boards', icon: Layers },
                                        { label: 'Sample Requests', href: '/dashboard/sample-requests', icon: Package },
                                        { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
                                    ].map(item => (
                                        item.href ? (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                                            >
                                                <item.icon className="w-4 h-4 text-[#d9a88a]" />
                                                <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{item.label}</span>
                                                <ChevronRight className="w-3.5 h-3.5 text-white/20 ml-auto group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
                                            </Link>
                                        ) : (
                                            <button
                                                key={item.label}
                                                onClick={item.action}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#d9a88a]/20 hover:bg-[#d9a88a]/30 transition-all group"
                                            >
                                                <item.icon className="w-4 h-4 text-[#d9a88a]" />
                                                <span className="text-sm font-bold text-white">{item.label}</span>
                                                <ChevronRight className="w-3.5 h-3.5 text-[#d9a88a]/50 ml-auto group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        )
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Notifications Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-gray-600" />
                                    <h2 className="text-sm font-black text-gray-900">Notifications</h2>
                                    {unreadNotifications.length > 0 && (
                                        <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                                            {unreadNotifications.length}
                                        </span>
                                    )}
                                </div>
                                <Link href="/dashboard/notifications" className="text-[10px] font-bold text-[#d9a88a] hover:text-[#c89675] transition-colors">
                                    View All
                                </Link>
                            </div>
                            <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                                <AnimatePresence>
                                    {notifications.length > 0 ? (
                                        notifications.slice(0, 8).map(n => (
                                            <NotificationItem
                                                key={n._id}
                                                notification={n}
                                                onMarkRead={(id) => markReadMutation.mutate(id)}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-xs font-bold">No notifications</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Retailer Contacts */}
                        {pendingRetailerReqs > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <Link
                                    href="/dashboard/retailer-contacts"
                                    className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                        <MessageCircle className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-900">Retailer Contacts</p>
                                        <p className="text-xs text-orange-500 font-bold">{pendingRetailerReqs} pending response{pendingRetailerReqs !== 1 ? 's' : ''}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                                </Link>
                            </motion.div>
                        )}

                        {/* Activity Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-gray-500" />
                                <h2 className="text-sm font-black text-gray-900">Portfolio Summary</h2>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: 'Active Projects',     value: activeProjects.length,      color: '#10b981' },
                                    { label: 'Total Spaces',        value: totalBoards,                 color: '#d9a88a' },
                                    { label: 'Unread Messages',     value: totalUnreadMsg,              color: totalUnreadMsg > 0 ? '#ef4444' : '#9ca3af' },
                                    { label: 'Pending Samples',     value: pendingSamples.length,       color: pendingSamples.length > 0 ? '#f59e0b' : '#9ca3af' },
                                    { label: 'Completion Rate',     value: `${completionRate}%`,        color: '#6366f1' },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-500">{item.label}</span>
                                        <span className="text-sm font-black" style={{ color: item.color }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
