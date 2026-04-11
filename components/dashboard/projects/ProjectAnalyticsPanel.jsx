'use client';

import { useState, useMemo } from 'react';
import {
    ChevronDown, TrendingUp, Layers, IndianRupee,
    CheckCircle2, Clock, AlertTriangle, BarChart2,
    PackageCheck, Users,
} from 'lucide-react';

// ─── constants ────────────────────────────────────────────────────────────────

const PHASES = [
    'Concept Design',
    'Design Development',
    'Material Specification',
    'Construction',
    'Completed',
];

const PHASE_LABELS = [
    'Concept',
    'Design Dev',
    'Material Spec',
    'Construction',
    'Complete',
];

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Count items exactly as the export/overview tab does.
 *
 * NOTE: In the moodboard LIST view (from useGetProject), `estimatedCostId.products`
 * is NOT populated — only `estimatedCostId.costing` comes through.
 * We fall back to `productMetadata` keys (which ARE populated) so item counts
 * are always accurate without needing a per-space full fetch.
 *
 *   - Products  : estimatedCostId.products (full fetch) OR productMetadata keys (list view)
 *   - Photos    : customPhotos where tag !== 'Render'
 *   - Rows      : customRows
 *   - Renders   : customPhotos where tag === 'Render'
 */
function getSpaceItems(mb) {
    // estimatedCostId.products is only populated on full moodboard fetch
    const estimatedProducts = mb?.estimatedCostId?.products || [];
    // productMetadata keys are always available from the list view
    const metaKeys = Object.keys(mb?.productMetadata || {});

    // Use whichever source has more data
    const products = estimatedProducts.length > 0
        ? estimatedProducts
        : metaKeys.map(id => ({ _id: id })); // minimal stub — enough for counting

    const allPhotos  = mb?.customPhotos || [];
    const photos     = allPhotos.filter(p => !(p.tags || []).includes('Render'));
    const renders    = allPhotos.filter(p => (p.tags || []).includes('Render'));
    const customRows = mb?.customRows || [];

    return { products, photos, renders, customRows };
}

function computeStats(project, moodboards) {
    const isCompleted = project?.status === 'Completed';

    // Phase index (0-4)
    const phaseIdx = Math.max(0, PHASES.indexOf(project?.phase || 'Concept Design'));

    let totalProducts   = 0;
    let totalPhotos     = 0;
    let totalCustomRows = 0;
    let totalRenders    = 0;
    let specifiedItems  = 0;
    let pendingApprovals = 0;

    for (const mb of moodboards) {
        const { products, photos, renders, customRows } = getSpaceItems(mb);

        totalProducts   += products.length;
        totalPhotos     += photos.length;
        totalCustomRows += customRows.length;
        totalRenders    += renders.length;

        const statusMap = mb?.productMetadata || {};
        for (const p of products) {
            const meta = statusMap[p._id];
            if (typeof meta === 'object' && meta?.status === 'Specified') specifiedItems++;
        }

        pendingApprovals += mb?.pendingApprovals || 0;
    }

    const totalItems = totalProducts + totalPhotos + totalCustomRows;

    const totalCost = moodboards.reduce(
        (sum, mb) => sum + (Number(mb?.estimatedCostId?.costing) || 0),
        0
    );

    // ── Phase-as-matrix: each phase = 20% of total progress ──────────────────
    //   Concept Design       → 20%
    //   Design Development   → 40%
    //   Material Specification → 60%
    //   Construction         → 80%
    //   Completed            → 100%
    const pct = isCompleted ? 100 : (phaseIdx + 1) * 20;

    return {
        pct,
        phaseIdx,
        totalSpaces: moodboards.length,
        totalItems,
        totalProducts,
        totalPhotos,
        totalCustomRows,
        totalRenders,
        specifiedItems,
        pendingApprovals,
        totalCost,
        isCompleted,
    };
}

// ─── sub-components ───────────────────────────────────────────────────────────

/** Animated SVG progress ring */
function ProgressRing({ pct, size = 88, stroke = 7 }) {
    const r   = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    const color = pct === 100
        ? '#38a169'
        : pct >= 60
        ? '#d9a88a'
        : pct >= 30
        ? '#d9a88a'
        : '#d9a88a';

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f0f0" strokeWidth={stroke} />
                {/* Progress */}
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-[#2d3142] leading-none">{pct}%</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Done</span>
            </div>
        </div>
    );
}

/** Phase step bar */
function PhaseSteps({ phaseIdx, isCompleted }) {
    const active = isCompleted ? PHASES.length - 1 : phaseIdx;
    return (
        <div className="flex items-center gap-0 w-full">
            {PHASES.map((phase, i) => {
                const done    = i < active;
                const current = i === active;
                const last    = i === PHASES.length - 1;
                return (
                    <div key={phase} className="flex items-center flex-1 min-w-0">
                        {/* Node */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                                done || (isCompleted && current)
                                    ? 'bg-[#d9a88a] border-[#d9a88a]'
                                    : current
                                    ? 'bg-white border-[#d9a88a] shadow-md shadow-orange-100'
                                    : 'bg-gray-100 border-gray-200'
                            }`}>
                                {done || (isCompleted && current) ? (
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                ) : current ? (
                                    <div className="w-2 h-2 rounded-full bg-[#d9a88a]" />
                                ) : null}
                            </div>
                            <span className={`text-[8px] font-bold text-center leading-tight w-12 ${
                                current ? 'text-[#d9a88a]' : done ? 'text-gray-500' : 'text-gray-300'
                            }`}>
                                {PHASE_LABELS[i]}
                            </span>
                        </div>
                        {/* Connector */}
                        {!last && (
                            <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all ${
                                done ? 'bg-[#d9a88a]' : 'bg-gray-150'
                            }`} style={{ background: done ? '#d9a88a' : '#e5e7eb' }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/** Single stat card */
function StatCard({ icon: Icon, label, value, sub, color = 'orange', warn = false }) {
    const colorMap = {
        orange: 'bg-[#fef7f2] text-[#d9a88a]',
        green:  'bg-green-50 text-green-600',
        red:    'bg-red-50 text-red-500',
        blue:   'bg-blue-50 text-blue-600',
        slate:  'bg-slate-50 text-slate-600',
    };
    return (
        <div className={`flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border ${
            warn ? 'border-red-100' : 'border-gray-100'
        } shadow-sm hover:shadow-md transition-shadow min-w-0`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5 truncate">
                    {label}
                </p>
                <p className={`text-lg font-black leading-none ${warn ? 'text-red-500' : 'text-[#2d3142]'}`}>
                    {value}
                </p>
                {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ProjectAnalyticsPanel({ project, moodboards = [], isArchitect }) {
    const [collapsed, setCollapsed] = useState(!isArchitect);

    const stats = useMemo(
        () => computeStats(project, moodboards),
        [project, moodboards]
    );

    const statusLabel = stats.isCompleted
        ? 'Completed'
        : stats.pct >= 75
        ? 'Almost Done'
        : stats.pct >= 40
        ? 'In Progress'
        : 'Getting Started';

    const statusColor = stats.isCompleted
        ? 'text-green-600 bg-green-50 border-green-100'
        : stats.pct >= 40
        ? 'text-amber-700 bg-amber-50 border-amber-100'
        : 'text-blue-600 bg-blue-50 border-blue-100';

    return (
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm mb-10 overflow-hidden transition-all duration-300">
            {/* ── Header row ──────────────────────────────────────────────── */}
            <button
                onClick={() => setCollapsed(c => !c)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors"
                aria-expanded={!collapsed}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#fef7f2] flex items-center justify-center">
                        <BarChart2 className="w-4 h-4 text-[#d9a88a]" />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-extrabold text-[#2d3142] text-sm">Project Progress</span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${statusColor}`}>
                            {statusLabel}
                        </span>
                        {stats.pendingApprovals > 0 && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-red-50 border-red-100 text-red-500 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {stats.pendingApprovals} pending {stats.pendingApprovals === 1 ? 'approval' : 'approvals'}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-[#d9a88a]">{stats.pct}%</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
                </div>
            </button>

            {/* ── Collapsible body ────────────────────────────────────────── */}
            <div className={`transition-all duration-300 ease-in-out ${collapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[500px] opacity-100'}`}>
                <div className="px-6 pb-6 space-y-6">
                    {/* Row 1: ring + phase stepper */}
                    <div className="flex items-start gap-6">
                        {/* Progress ring */}
                        <div className="flex flex-col items-center gap-2 shrink-0">
                            <ProgressRing pct={stats.pct} />
                            {stats.isCompleted && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    ✓ Complete
                                </span>
                            )}
                        </div>

                        {/* Phase stepper */}
                        <div className="flex-1 min-w-0 pt-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                Current Phase
                            </p>
                            <PhaseSteps phaseIdx={stats.phaseIdx} isCompleted={stats.isCompleted} />

                            {/* Progress bar */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                        Overall completion
                                    </span>
                                    <span className="text-[10px] font-black text-[#d9a88a]">{stats.pct}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                            stats.isCompleted ? 'bg-green-500' : 'bg-linear-to-r from-[#d9a88a] to-[#e8b898]'
                                        }`}
                                        style={{ width: `${stats.pct}%` }}
                                    />
                                </div>
                                {!stats.isCompleted && isArchitect && (
                                    <p className="text-[10px] text-gray-400 mt-1.5">
                                        Mark project as <span className="font-bold text-green-600">Completed</span> to reach 100%
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: stat cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard
                            icon={Layers}
                            label="Total Spaces"
                            value={stats.totalSpaces}
                            sub={`${stats.totalProducts} product${stats.totalProducts !== 1 ? 's' : ''}${stats.totalPhotos > 0 ? ` · ${stats.totalPhotos} photo${stats.totalPhotos !== 1 ? 's' : ''}` : ''}${stats.totalCustomRows > 0 ? ` · ${stats.totalCustomRows} row${stats.totalCustomRows !== 1 ? 's' : ''}` : ''}`}
                            color="slate"
                        />
                        <StatCard
                            icon={PackageCheck}
                            label="Materials Specified"
                            value={`${stats.specifiedItems}/${stats.totalProducts}`}
                            sub={stats.totalProducts > 0 ? `${Math.round((stats.specifiedItems / stats.totalProducts) * 100)}% of products specified` : 'No products added yet'}
                            color={stats.specifiedItems === stats.totalProducts && stats.totalProducts > 0 ? 'green' : 'orange'}
                        />
                        <StatCard
                            icon={Users}
                            label="Pending Approvals"
                            value={stats.pendingApprovals}
                            sub={stats.pendingApprovals === 0 ? 'All approved ✓' : 'Client approval needed'}
                            color={stats.pendingApprovals > 0 ? 'red' : 'green'}
                            warn={stats.pendingApprovals > 0}
                        />
                        {(isArchitect) && (
                            <StatCard
                                icon={IndianRupee}
                                label="Est. Project Cost"
                                value={`₹${stats.totalCost.toLocaleString('en-IN')}`}
                                sub="across all spaces"
                                color="blue"
                            />
                        )}
                        {!isArchitect && (
                            <StatCard
                                icon={TrendingUp}
                                label="Project Status"
                                value={project?.status || 'Active'}
                                sub={project?.phase || 'Concept Design'}
                                color="blue"
                            />
                        )}
                    </div>

                    {/* Row 3: per-space breakdown (architect only) */}
                    {isArchitect && moodboards.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                Space-by-Space Breakdown
                            </p>
                            <div className="space-y-2">
                                {moodboards.map((mb) => {
                                    const { products, photos, customRows } = getSpaceItems(mb);
                                    const statusMap = mb?.productMetadata || {};

                                    // Only products can be 'Specified' (matches export tab logic)
                                    const specified = products.filter(p => {
                                        const meta = statusMap[p._id];
                                        return typeof meta === 'object' && meta?.status === 'Specified';
                                    }).length;

                                    const totalSpaceItems = products.length + photos.length + customRows.length;
                                    const specPct = products.length > 0
                                        ? Math.round((specified / products.length) * 100)
                                        : 0;
                                    const cost    = Number(mb?.estimatedCostId?.costing) || 0;
                                    const pending = mb?.pendingApprovals || 0;

                                    return (
                                        <div key={mb._id} className="flex items-center gap-3 bg-gray-50/60 rounded-2xl px-4 py-2.5">
                                            <div className="w-2 h-2 rounded-full bg-[#d9a88a] shrink-0" />
                                            <span className="text-sm font-bold text-[#2d3142] truncate flex-1 min-w-0">
                                                {mb.moodboard_name}
                                            </span>
                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className="text-[11px] text-gray-400 font-bold w-20 text-right">
                                                    {products.length}p
                                                    {photos.length > 0 ? ` · ${photos.length}ph` : ''}
                                                    {customRows.length > 0 ? ` · ${customRows.length}r` : ''}
                                                </span>
                                                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#d9a88a] rounded-full transition-all duration-700"
                                                        style={{ width: `${specPct}%` }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-black text-[#d9a88a] w-8">{specPct}%</span>
                                                {pending > 0 && (
                                                    <span className="text-[10px] bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded-full border border-red-100">
                                                        {pending} ⏳
                                                    </span>
                                                )}
                                                <span className="text-[11px] text-gray-400 font-bold w-20 text-right">
                                                    ₹{cost.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
