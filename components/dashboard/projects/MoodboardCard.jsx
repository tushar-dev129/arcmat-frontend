'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    Layout, IndianRupee, ArrowRight, Trash2, Plus, Edit2, Check, X,
    MonitorPlay, Camera, Copy, Download, FileText, MessageCircle, AlertCircle,
    Loader2, FolderArchive, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import useProjectStore from '@/store/useProjectStore';
import { useUpdateMoodboard, useDuplicateMoodboard } from '@/hooks/useMoodboard';
import { getProductThumbnail } from '@/lib/productUtils';
import { toast } from 'sonner';
import CoverSelectionModal from './CoverSelectionModal';
import { exportMoodboardToZip, exportMoodboardToCSV } from '@/lib/exportUtils';
import { moodboardService } from '@/services/moodboardService';
import { useGetCategoryTree } from '@/hooks/useCategory';

// ─────────────────────────────────────────────────────────────────────────────
// Export progress label shown while downloading
// ─────────────────────────────────────────────────────────────────────────────
const EXPORT_STAGES = [
    '📊 Building Excel…',
    '📄 Building CSV…',
    '🖼 Fetching images…',
    '🎨 Fetching renders…',
    '📦 Compressing…',
];

function useExportStage(isExporting) {
    const [stageIdx, setStageIdx] = useState(0);

    useEffect(() => {
        if (!isExporting) {
            setStageIdx(0);
            return;
        }
        const interval = setInterval(() => {
            setStageIdx((prev) => (prev + 1) % EXPORT_STAGES.length);
        }, 1800);
        return () => clearInterval(interval);
    }, [isExporting]);

    return EXPORT_STAGES[stageIdx];
}

// ─────────────────────────────────────────────────────────────────────────────
// MoodboardCard
// ─────────────────────────────────────────────────────────────────────────────
export default function MoodboardCard({ moodboard, projectId, onDelete, isArchitect, projectPrivacy }) {
    const { _id, moodboard_name, estimatedCostId } = moodboard;

    const [isEditing, setIsEditing]           = useState(false);
    const [editName, setEditName]             = useState(moodboard_name);
    const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
    const [isExporting, setIsExporting]       = useState(false);
    const [isCSVExporting, setIsCSVExporting] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const { mutate: updateMoodboard, isPending } = useUpdateMoodboard();
    const { mutate: duplicateSpace, isPending: isDuplicating } = useDuplicateMoodboard();

    // Fetch category tree to get the 2nd category for redirect
    const { data: treeDataRaw } = useGetCategoryTree();
    const defaultCategoryId = useMemo(() => {
        const tree = Array.isArray(treeDataRaw?.data) ? treeDataRaw.data : (Array.isArray(treeDataRaw) ? treeDataRaw : []);
        if (tree.length >= 2) return tree[1]._id || tree[1].id;
        if (tree.length >= 1) return tree[0]._id || tree[0].id;
        return 'All';
    }, [treeDataRaw]);

    const exportStageLabel = useExportStage(isExporting);
    const exportMenuRef = useRef(null);

    // ── Click outside to close download menu ─────────────────────────────
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Item counts (derived from existing data — no extra fetch) ──────────
    const itemCount      = moodboard.estimatedCostId?.productIds?.length || moodboard.canvasState?.filter(i => i.type === 'material').length || 0;
    const renderCount    = (moodboard?.customPhotos || []).filter(p => (p.tags || []).includes('Render')).length;
    const photoCount     = (moodboard?.customPhotos || []).filter(p => !(p.tags || []).includes('Render')).length;
    const hasContent     = itemCount + renderCount + photoCount > 0;

    // ── Preview grid images ────────────────────────────────────────────────
    const previewImages = useMemo(() => {
        const fromCanvas = (moodboard?.canvasState || [])
            .filter(item => item.type === 'material' && item.material)
            .map(item => getProductThumbnail(item.material));

        const fromSpace = (moodboard?.estimatedCostId?.productIds || [])
            .map(p => getProductThumbnail(p));

        // Filter out nulls/undefined and get unique values
        const combined = Array.from(new Set([...fromCanvas, ...fromSpace])).filter(img => typeof img === 'string' && img.trim() !== '');
        return combined.slice(0, 4);
    }, [moodboard]);

    // ── Keyboard shortcut: Ctrl+D / Cmd+D when card is focused ────────────
    const handleKeyDown = useCallback((e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            if (isArchitect && !isExporting) {
                handleDownloadZip({ preventDefault: () => {}, stopPropagation: () => {} });
            }
        }
        if (e.key === 'Escape') setShowExportMenu(false);
    }, [isArchitect, isExporting]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Handlers: Rename ───────────────────────────────────────────────────
    const handleSave = () => {
        if (!editName.trim()) {
            toast.error('Space name cannot be empty');
            return;
        }
        if (editName === moodboard_name) {
            setIsEditing(false);
            return;
        }
        updateMoodboard(
            { id: _id, data: { moodboard_name: editName } },
            { onSuccess: () => setIsEditing(false) }
        );
    };

    const handleCancel = () => {
        setEditName(moodboard_name);
        setIsEditing(false);
    };

    // ── Handlers: Cover ────────────────────────────────────────────────────
    const handleCoverSelect = (selection) => {
        const formData = new FormData();
        if (selection.type === 'file') {
            formData.append('coverImage', selection.file);
        } else {
            formData.append('coverImage', selection.url);
        }
        updateMoodboard(
            { id: _id, data: formData },
            {
                onSuccess: () => {
                    toast.success('Cover image updated');
                    setIsCoverModalOpen(false);
                },
            }
        );
    };

    // ── Handlers: ZIP download ─────────────────────────────────────────────
    const handleDownloadZip = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowExportMenu(false);

        if (!hasContent) {
            toast.error('This space has no items to export yet');
            return;
        }

        try {
            setIsExporting(true);

            const response      = await moodboardService.getMoodboardById(_id);
            const fullMoodboard = response?.data;

            if (!fullMoodboard) {
                toast.error('Failed to load space data');
                return;
            }

            await exportMoodboardToZip(fullMoodboard, fullMoodboard.projectId);
        } catch (error) {
            console.error('[MoodboardCard] ZIP export failed:', error);
            toast.error('Failed to export space — please try again');
        } finally {
            setIsExporting(false);
        }
    };

    // ── Handlers: CSV quick-download ───────────────────────────────────────
    const handleDownloadCSV = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowExportMenu(false);

        if (!hasContent) {
            toast.error('This space has no items to export');
            return;
        }

        try {
            setIsCSVExporting(true);
            const response      = await moodboardService.getMoodboardById(_id);
            const fullMoodboard = response?.data;

            if (!fullMoodboard) {
                toast.error('Failed to load space data');
                return;
            }

            await exportMoodboardToCSV(fullMoodboard, fullMoodboard.projectId);
        } catch (error) {
            console.error('[MoodboardCard] CSV export failed:', error);
            toast.error('Failed to export CSV');
        } finally {
            setIsCSVExporting(false);
        }
    };

    // ── Tooltip for download button ────────────────────────────────────────
    const downloadTooltip = hasContent
        ? `Download ZIP\n${itemCount} item${itemCount !== 1 ? 's' : ''}${renderCount ? ` · ${renderCount} render${renderCount !== 1 ? 's' : ''}` : ''}${photoCount ? ` · ${photoCount} photo${photoCount !== 1 ? 's' : ''}` : ''}\n(Excel + CSV + Images)`
        : 'No items to export yet';

    return (
        <div
            className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 group relative flex flex-col h-full overflow-hidden"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            style={{ outline: 'none' }}
        >
            {/* ── Export progress overlay ─────────────────────────────────── */}
            {isExporting && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-[4px] rounded-[32px] flex flex-col items-center justify-center gap-4 pointer-events-none transition-all">
                    <div className="relative">
                        <Loader2 className="w-8 h-8 text-[#d9a88a] animate-spin" />
                        <FolderArchive className="w-4 h-4 text-[#2d3142] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[11px] font-bold text-[#2d3142] tracking-tight">{exportStageLabel}</p>
                </div>
            )}

            {/* ── Action Buttons (top-right) ──────────────────────────────── */}
            <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300 z-20">
                {isArchitect && (
                    <>
                        <div className="relative" ref={exportMenuRef}>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (hasContent) setShowExportMenu(!showExportMenu);
                                }}
                                disabled={isExporting || isCSVExporting}
                                className={`flex items-center gap-1.5 px-3 py-2 bg-white shadow-sm rounded-xl transition-all border border-gray-100
                                    ${hasContent
                                        ? 'text-gray-500 hover:text-[#d9a88a] hover:bg-orange-50 active:scale-95'
                                        : 'text-gray-200 cursor-not-allowed'}
                                    ${(isExporting || isCSVExporting) ? 'opacity-60' : ''}`}
                            >
                                {isExporting || isCSVExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                <span className="text-[10px] font-bold uppercase tracking-wider">Export</span>
                                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showExportMenu && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-50 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={handleDownloadZip}
                                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-[#fef7f2] hover:text-[#d9a88a] flex items-center gap-3 transition-colors"
                                    >
                                        <FolderArchive className="w-4 h-4 text-orange-400" />
                                        <span>Full Archive (ZIP)</span>
                                    </button>
                                    <button
                                        onClick={handleDownloadCSV}
                                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-[#fef7f2] hover:text-[#d9a88a] flex items-center gap-3 transition-colors"
                                    >
                                        <FileText className="w-4 h-4 text-blue-400" />
                                        <span>Material List (CSV)</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={(e) => { e.preventDefault(); duplicateSpace(_id); }}
                            disabled={isDuplicating}
                            className="p-2.5 bg-white shadow-sm text-gray-400 hover:text-[#d9a88a] hover:bg-orange-50 rounded-xl transition-all border border-gray-100 active:scale-90"
                            title="Duplicate"
                        >
                            {isDuplicating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                            onClick={(e) => { e.preventDefault(); onDelete(_id); }}
                            className="p-2.5 bg-white shadow-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100 active:scale-90"
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </>
                )}
            </div>

            {/* ── Image Grid Preview ──────────────────────────────────────── */}
            <div className="relative aspect-[4/3] mb-6 group/preview">
                <Link
                    href={`/dashboard/projects/${projectId}/moodboards/${_id}`}
                    className="absolute inset-0 rounded-[24px] overflow-hidden bg-gray-50 flex flex-col border border-gray-100 group-hover/preview:border-[#d9a88a]/30 transition-all duration-500 z-10"
                    onClick={() => useProjectStore.getState().setActiveMoodboard(_id, moodboard_name, projectId, '', false)}
                >
                    {typeof moodboard.coverImage === 'string' && moodboard.coverImage.trim() ? (
                        <div className="relative h-full w-full">
                            <Image
                                src={moodboard.coverImage.trim()}
                                alt="Cover"
                                fill
                                className="object-cover group-hover/preview:scale-105 transition-transform duration-700 ease-out"
                            />
                        </div>
                    ) : (
                        <div className="h-full w-full grid grid-cols-2 grid-rows-2 gap-[2px] bg-white">
                            {previewImages.length > 0 ? (
                                <>
                                    {previewImages.length === 1 && (
                                        <div className="col-span-2 row-span-2 relative">
                                            {previewImages[0]?.trim() && (
                                                <Image src={previewImages[0].trim()} alt="" fill className="object-cover group-hover/preview:scale-105 transition-transform duration-700" />
                                            )}
                                        </div>
                                    )}
                                    {previewImages.length === 2 && (
                                        <>
                                            <div className="row-span-2 relative">{previewImages[0]?.trim() && <Image src={previewImages[0].trim()} alt="" fill className="object-cover group-hover/preview:scale-105 transition-transform duration-700" />}</div>
                                            <div className="row-span-2 relative">{previewImages[1]?.trim() && <Image src={previewImages[1].trim()} alt="" fill className="object-cover group-hover/preview:scale-105 transition-transform duration-700" />}</div>
                                        </>
                                    )}
                                    {previewImages.length === 3 && (
                                        <>
                                            <div className="row-span-2 relative">{previewImages[0]?.trim() && <Image src={previewImages[0].trim()} alt="" fill className="object-cover group-hover/preview:scale-105 transition-transform duration-700" />}</div>
                                            <div className="relative">{previewImages[1]?.trim() && <Image src={previewImages[1].trim()} alt="" fill className="object-cover group-hover/preview:scale-105 transition-transform duration-700" />}</div>
                                            <div className="relative">{previewImages[2]?.trim() && <Image src={previewImages[2].trim()} alt="" fill className="object-cover group-hover/preview:scale-105 transition-transform duration-700" />}</div>
                                        </>
                                    )}
                                    {previewImages.length >= 4 && previewImages.slice(0, 4).map((img, i) => (
                                        <div key={i} className="relative">
                                            {img?.trim() && <Image src={img.trim()} alt="" fill className="object-cover group-hover/preview:scale-105 transition-transform duration-700" />}
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="col-span-2 row-span-2 flex flex-col items-center justify-center gap-3 text-gray-200 bg-gray-50">
                                    <Layout className="w-8 h-8 opacity-20" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Empty Space</span>
                                </div>
                            )}
                        </div>
                    )}
                </Link>

                {/* Badges */}
                {hasContent && (
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 z-20 opacity-0 group-hover/preview:opacity-100 transition-all duration-300">
                        {itemCount > 0 && (
                            <div className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm border border-gray-100">
                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">{itemCount} Specified</span>
                            </div>
                        )}
                        {renderCount > 0 && (
                            <div className="bg-[#d9a88a]/90 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm">
                                <span className="text-[9px] font-bold text-white uppercase tracking-wider">{renderCount} Renders</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
                    {isArchitect && (
                        <button
                            onClick={() => setIsCoverModalOpen(true)}
                            className="p-2.5 bg-white shadow-lg text-gray-500 hover:text-[#d9a88a] rounded-xl opacity-0 translate-y-2 group-hover/preview:opacity-100 group-hover/preview:translate-y-0 transition-all duration-300"
                            title="Set Cover"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    )}
                    {(isArchitect || projectPrivacy?.showRenders) && (
                        <Link
                            href={`/dashboard/projects/${projectId}/moodboards/${_id}?tab=designDesk`}
                            className="p-3 bg-[#2d3142] text-white hover:bg-[#d9a88a] rounded-xl shadow-lg opacity-0 translate-y-2 group-hover/preview:opacity-100 group-hover/preview:translate-y-0 transition-all duration-300 hover:scale-105 active:scale-95"
                            title="Open Studio"
                        >
                            <MonitorPlay className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>

            {/* ── Info Section ────────────────────────────────────────────── */}
            <div className="px-1 flex flex-col flex-1">
                <div className="mb-5">
                    {isEditing ? (
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                            <input
                                autoFocus
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave();
                                    if (e.key === 'Escape') handleCancel();
                                }}
                                className="text-base font-bold text-[#2d3142] w-full bg-transparent outline-none px-1"
                            />
                            <div className="flex gap-1 shrink-0">
                                <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button onClick={handleCancel} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between gap-3 group/name">
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold text-[#2d3142] group-hover:text-[#d9a88a] transition-colors truncate">
                                    {moodboard_name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ArcMat Original</span>
                                    {moodboard.unreadMessages > 0 && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    )}
                                </div>
                            </div>
                            {isArchitect && (
                                <button
                                    onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                                    className="p-1 text-gray-300 hover:text-[#d9a88a] transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ─────────────────────────────────────────────── */}
                <div className="mt-auto pt-5 flex items-center justify-between border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">
                            Estimated Cost
                        </span>
                        {(isArchitect || projectPrivacy?.showPriceToClient) ? (
                            <div className="flex items-center gap-1 text-xl font-bold text-[#2d3142] tracking-tight">
                                <IndianRupee className="w-3.5 h-3.5 text-[#d9a88a]" />
                                {estimatedCostId?.costing?.toLocaleString('en-IN') || '0'}
                            </div>
                        ) : (
                            <span className="text-[10px] font-bold text-[#d9a88a] uppercase tracking-wider">Active Project</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2.5">
                        {isArchitect && (
                            <Link
                                href={`/productlist?category=${defaultCategoryId}`}
                                onClick={() => useProjectStore.getState().setActiveMoodboard(_id, moodboard_name, projectId, '', false)}
                                className="w-10 h-10 bg-[#fef7f2] text-[#d9a88a] hover:bg-[#d9a88a] hover:text-white rounded-xl transition-all flex items-center justify-center active:scale-90"
                                title="Add Items"
                            >
                                <Plus className="w-5 h-5" />
                            </Link>
                        )}
                        <Link
                            href={`/dashboard/projects/${projectId}/moodboards/${_id}`}
                            className="w-10 h-10 bg-[#2d3142] text-white hover:bg-[#d9a88a] rounded-xl transition-all flex items-center justify-center shadow-lg shadow-gray-200 active:scale-90"
                            title="View Details"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
