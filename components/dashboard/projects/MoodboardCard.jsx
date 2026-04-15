'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
    const itemCount      = moodboard.canvasState?.filter(i => i.type === 'material').length || 0;
    const renderCount    = (moodboard?.customPhotos || []).filter(p => (p.tags || []).includes('Render')).length;
    const photoCount     = (moodboard?.customPhotos || []).filter(p => !(p.tags || []).includes('Render')).length;
    const hasContent     = itemCount + renderCount + photoCount > 0;

    // ── Preview grid images ────────────────────────────────────────────────
    const previewImages = (moodboard?.canvasState || [])
        .filter(item => item.type === 'material' && item.material)
        .slice(0, 4)
        .map(item => getProductThumbnail(item.material));

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
            className="bg-white rounded-[32px] border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:shadow-orange-50/20 transition-all duration-500 group relative flex flex-col h-full"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            style={{ outline: 'none' }}
        >
            {/* ── Export progress overlay ─────────────────────────────────── */}
            {isExporting && (
                <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-[3px] rounded-[32px] flex flex-col items-center justify-center gap-3 pointer-events-none">
                    <div className="relative">
                        <Loader2 className="w-9 h-9 text-[#d9a88a] animate-spin" />
                        <FolderArchive className="w-4 h-4 text-[#2d3142] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-xs font-bold text-[#2d3142] animate-pulse text-center px-4">
                        {exportStageLabel}
                    </p>
                    <p className="text-[10px] text-gray-400">Please don't close this window</p>
                </div>
            )}

            {/* ── Action Buttons (top-right) ──────────────────────────────── */}
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                {isArchitect && (
                    <>
                        {/* Consolidated Download Action */}
                        <div className="relative" ref={exportMenuRef}>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (hasContent) setShowExportMenu(!showExportMenu);
                                }}
                                disabled={isExporting || isCSVExporting}
                                className={`flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur shadow-sm rounded-xl transition-all border border-gray-100
                                    ${hasContent
                                        ? 'text-gray-500 hover:text-[#d9a88a] hover:bg-orange-50 hover:border-orange-100'
                                        : 'text-gray-200 cursor-not-allowed'}
                                    ${(isExporting || isCSVExporting) ? 'opacity-60 animate-pulse' : ''}`}
                                title={downloadTooltip}
                            >
                                {isExporting || isCSVExporting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                <span className="text-[11px] font-bold">Download</span>
                                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Download Dropdown Menu */}
                            {showExportMenu && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={handleDownloadZip}
                                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#d9a88a] flex items-center gap-2.5 transition-colors"
                                    >
                                        <FolderArchive className="w-4 h-4 text-orange-400" />
                                        <span>Full Export (ZIP)</span>
                                    </button>
                                    <button
                                        onClick={handleDownloadCSV}
                                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#d9a88a] flex items-center gap-2.5 transition-colors"
                                    >
                                        <FileText className="w-4 h-4 text-blue-400" />
                                        <span>Material List (CSV)</span>
                                    </button>
                                    <div className="px-4 py-2 mt-1 bg-gray-50/50 border-t border-gray-50">
                                        <p className="text-[9px] text-gray-400 leading-tight">
                                            ZIP includes Excel report, CSV, and all images.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Duplicate */}
                        <button
                            onClick={(e) => { e.preventDefault(); duplicateSpace(_id); }}
                            disabled={isDuplicating}
                            className="p-2 bg-white/80 backdrop-blur shadow-sm text-gray-400 hover:text-[#d9a88a] hover:bg-orange-50 rounded-xl transition-all disabled:opacity-50"
                            title="Duplicate space"
                            aria-label="Duplicate this space"
                        >
                            {isDuplicating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </button>

                        {/* Delete */}
                        <button
                            onClick={(e) => { e.preventDefault(); onDelete(_id); }}
                            className="p-2 bg-white/80 backdrop-blur shadow-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete space"
                            aria-label="Delete this space"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>

            {/* ── Image Grid Preview ──────────────────────────────────────── */}
            <div className="relative aspect-square mb-6 group/preview">
                <Link
                    href={`/dashboard/projects/${projectId}/moodboards/${_id}`}
                    className="absolute inset-0 rounded-[24px] overflow-hidden bg-gray-50 flex flex-col border border-gray-100 group-hover/preview:border-[#d9a88a]/20 transition-colors z-10"
                    onClick={() => useProjectStore.getState().setActiveMoodboard(_id, moodboard_name, projectId, '')}
                >
                    {typeof moodboard.coverImage === 'string' && moodboard.coverImage.trim() ? (
                        <div className="relative h-full w-full">
                            <Image
                                src={moodboard.coverImage.trim()}
                                alt="Cover"
                                fill
                                className="object-cover group-hover/preview:scale-110 transition-transform duration-700"
                            />
                        </div>
                    ) : (
                        <div className="h-full w-full grid grid-cols-2 grid-rows-2 gap-[2px]">
                            {previewImages.length > 0 ? (
                                <>
                                    {previewImages.length === 1 && (
                                        <div className="col-span-2 row-span-2 relative">
                                            {previewImages[0]?.trim() && (
                                                <Image src={previewImages[0].trim()} alt="" fill className="object-cover group-hover/preview:scale-110 transition-transform duration-700" />
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
                                        <div key={i} className="relative bg-white">
                                            {img?.trim() && <Image src={img.trim()} alt="" fill className="object-cover group-hover/preview:scale-110 transition-transform duration-700" />}
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="col-span-2 row-span-2 flex flex-col items-center justify-center gap-3 text-gray-200">
                                    <Layout className="w-10 h-10" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">No Items Added</span>
                                </div>
                            )}
                        </div>
                    )}
                </Link>

                {/* Content badge — shows item/render/photo counts */}
                {hasContent && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 z-20 opacity-0 group-hover/preview:opacity-100 transition-all duration-300 translate-y-1 group-hover/preview:translate-y-0">
                        {itemCount > 0 && (
                            <span className="text-[9px] font-bold bg-[#2d3142]/80 text-white backdrop-blur px-2 py-0.5 rounded-full">
                                {itemCount} item{itemCount !== 1 ? 's' : ''}
                            </span>
                        )}
                        {renderCount > 0 && (
                            <span className="text-[9px] font-bold bg-[#d9a88a]/90 text-white backdrop-blur px-2 py-0.5 rounded-full">
                                {renderCount} render{renderCount !== 1 ? 's' : ''}
                            </span>
                        )}
                        {photoCount > 0 && (
                            <span className="text-[9px] font-bold bg-white/80 text-gray-600 backdrop-blur px-2 py-0.5 rounded-full border border-gray-100">
                                {photoCount} photo{photoCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                )}

                {/* Cover Edit Button */}
                {isArchitect && (
                    <button
                        onClick={() => setIsCoverModalOpen(true)}
                        className="absolute top-4 left-4 p-2.5 bg-white/90 backdrop-blur text-gray-500 hover:text-[#d9a88a] rounded-xl shadow-lg opacity-0 translate-y-2 group-hover/preview:opacity-100 group-hover/preview:translate-y-0 transition-all duration-300 z-20"
                        title="Change Cover"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                )}

                {/* Design Desk floating button */}
                {(isArchitect || projectPrivacy?.showRenders) && (
                    <Link
                        href={`/dashboard/projects/${projectId}/moodboards/${_id}?tab=designDesk`}
                        className="absolute bottom-4 right-4 p-3 bg-white/95 backdrop-blur text-[#d9a88a] rounded-2xl shadow-xl opacity-0 translate-y-2 group-hover/preview:opacity-100 group-hover/preview:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95 z-20"
                        title="Open Design Desk"
                    >
                        <MonitorPlay className="w-5 h-5" />
                    </Link>
                )}
            </div>

            {/* ── Info Section ────────────────────────────────────────────── */}
            <div className="px-1 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="min-w-0 flex-1">
                        {isEditing ? (
                            <div className="flex items-center gap-2 mb-1">
                                <input
                                    autoFocus
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave();
                                        if (e.key === 'Escape') handleCancel();
                                    }}
                                    className="text-lg font-bold text-[#2d3142] w-full border-b-2 border-[#d9a88a] focus:outline-none bg-transparent"
                                />
                                <button onClick={handleSave} className="p-1 text-[#d9a88a]" title="Save">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button onClick={handleCancel} className="p-1 text-gray-400" title="Cancel">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group/name">
                                <h3 className="text-lg font-extrabold text-[#2d3142] truncate group-hover:text-[#d9a88a] transition-colors">
                                    {moodboard_name}
                                </h3>

                                {/* Notification badges */}
                                <div className="flex items-center gap-1.5 ml-1">
                                    {moodboard.unreadMessages > 0 && (
                                        <div
                                            className="flex items-center justify-center bg-red-50 text-red-600 rounded-full px-2 py-0.5 border border-red-100 shadow-sm"
                                            title={`${moodboard.unreadMessages} new message${moodboard.unreadMessages > 1 ? 's' : ''}`}
                                        >
                                            <MessageCircle className="w-3.5 h-3.5 mr-1" />
                                            <span className="text-xs font-bold leading-none">{moodboard.unreadMessages}</span>
                                        </div>
                                    )}
                                    {moodboard.pendingApprovals > 0 && (
                                        <div
                                            className="flex items-center justify-center bg-amber-50 text-amber-600 rounded-full px-2 py-0.5 border border-amber-100 shadow-sm"
                                            title={`${moodboard.pendingApprovals} pending approval${moodboard.pendingApprovals > 1 ? 's' : ''}`}
                                        >
                                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                            <span className="text-xs font-bold leading-none">{moodboard.pendingApprovals}</span>
                                        </div>
                                    )}
                                </div>

                                {isArchitect && (
                                    <button
                                        onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                                        className="p-1 text-gray-300 hover:text-[#d9a88a] transition-colors opacity-0 group-hover:opacity-100"
                                        title="Rename space"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Sub-line: item count breakdown */}
                        <p className="text-xs text-gray-400 font-bold tracking-tight">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            {renderCount > 0 && ` · ${renderCount} render${renderCount !== 1 ? 's' : ''}`}
                            {photoCount  > 0 && ` · ${photoCount} photo${photoCount !== 1 ? 's' : ''}`}
                            {' '}• ArcMat
                        </p>
                    </div>
                </div>

                {/* ── Estimated cost + CTAs ───────────────────────────────── */}
                <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                        {(isArchitect || projectPrivacy?.showPriceToClient) ? (
                            <>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">
                                    Estimated Cost
                                </span>
                                <div className="flex items-center gap-1 text-base font-black text-[#d9a88a]">
                                    <IndianRupee className="w-3.5 h-3.5" />
                                    {estimatedCostId?.costing?.toLocaleString('en-IN') || '0'}
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">
                                    Status
                                </span>
                                <div className="flex items-center gap-1 text-base font-black text-[#d9a88a]">
                                    Active Design
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {isArchitect && (
                            <Link
                                href="/productlist"
                                onClick={() => useProjectStore.getState().setActiveMoodboard(_id, moodboard_name, projectId, '')}
                                className="p-2.5 bg-[#fef7f2] text-[#d9a88a] hover:bg-[#d9a88a] hover:text-white rounded-xl transition-all"
                                title="Add Items"
                            >
                                <Plus className="w-5 h-5" />
                            </Link>
                        )}
                        <Link
                            href={`/dashboard/projects/${projectId}/moodboards/${_id}`}
                            className="p-2.5 bg-[#2d3142] text-white hover:bg-[#d9a88a] rounded-xl transition-all"
                            title="View Details"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* ── Keyboard shortcut hint (shown on card focus) ─────────── */}
                {isArchitect && hasContent && (
                    <p className="text-[9px] text-gray-300 text-right mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ctrl+D to download ZIP
                    </p>
                )}
            </div>

            {/* ── Cover selection modal ───────────────────────────────────── */}
            <CoverSelectionModal
                isOpen={isCoverModalOpen}
                onClose={() => setIsCoverModalOpen(false)}
                onSelect={handleCoverSelect}
                materials={moodboard.canvasState?.filter(i => i.type === 'material') || []}
                isUploading={isPending}
            />
        </div>
    );
}
