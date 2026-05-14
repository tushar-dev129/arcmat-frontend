"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { brandService } from '@/services/brandService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Calendar, User, MessageSquare, ChevronRight, Search, Sparkles, Clock, Globe, ChevronLeft, LayoutGrid, List } from 'lucide-react';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import useAuthStore from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Constants
const BRAND_PAGE_SIZE = 8;
const INQUIRY_PAGE_SIZE = 10;

// Reusable Components
const Field = ({ label, value, icon: Icon, href }) => (
    <div>
        <p className="text-[13px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1.5 ml-1">{label}</p>
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm text-[#2d3142] group/field hover:border-primary/30 transition-colors">
            {Icon && <Icon className="w-3.5 h-3.5 text-gray-300 group-hover/field:text-primary transition-colors shrink-0" />}
            {href ? (
                <a href={href} className="truncate hover:text-primary transition-colors font-semibold">
                    {value || '—'}
                </a>
            ) : (
                <span className="truncate font-medium">{value || '—'}</span>
            )}
        </div>
    </div>
);

const statusColor = (s) => {
    if (s === 'Pending') return 'bg-amber-50 text-amber-500 border-amber-100';
    if (s === 'Reviewed') return 'bg-blue-50 text-blue-500 border-blue-100';
    return 'bg-green-50 text-green-500 border-green-100';
};

const Pagination = ({ total, pageSize, current, onChange }) => {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <button
                onClick={() => onChange(Math.max(1, current - 1))}
                disabled={current === 1}
                className="p-2 rounded-xl bg-white border border-gray-100 text-gray-400 disabled:opacity-50 hover:bg-primary/5 hover:text-primary transition-all active:scale-90"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
                <span className="text-[13px] font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                    {current}
                </span>
                <span className="text-[13px] font-bold text-gray-400 px-1">OF</span>
                <span className="text-[13px] font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    {totalPages}
                </span>
            </div>
            <button
                onClick={() => onChange(Math.min(totalPages, current + 1))}
                disabled={current === totalPages}
                className="p-2 rounded-xl bg-white border border-gray-100 text-gray-400 disabled:opacity-50 hover:bg-primary/5 hover:text-primary transition-all active:scale-90"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};

const InquiryRow = ({ lead }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <>
            <tr className={clsx(
                "group hover:bg-gray-50/80 transition-colors border-b border-gray-50",
                isExpanded && "bg-gray-50/50"
            )}>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/10">
                            {lead.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm font-bold text-[#2d3142]">{lead.name || 'Anonymous'}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                        <a href={`mailto:${lead.email}`} className="text-xs text-gray-500 hover:text-primary transition-colors font-semibold truncate max-w-[180px]">{lead.email}</a>
                        <span className="text-[13px] text-gray-400 font-bold tracking-tight">{lead.phone || '—'}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="relative w-7 h-7 bg-white rounded-lg border border-gray-100 p-1 shrink-0 overflow-hidden flex items-center justify-center shadow-sm">
                            {lead.brandId?.logo ? (
                                <Image
                                    src={typeof lead.brandId.logo === 'string' ? lead.brandId.logo : (lead.brandId.logo.secure_url || lead.brandId.logo.url)}
                                    alt={lead.brandId.name}
                                    fill
                                    className="object-contain"
                                />
                            ) : (
                                <span className="text-primary font-bold text-[9px]">{lead.brandId?.name?.charAt(0)}</span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-gray-600 truncate max-w-[130px]">{lead.brandId?.name || 'Bespoke Provider'}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-gray-500 uppercase tracking-tighter">
                            {lead.createdAt ? format(new Date(lead.createdAt), 'dd MMM yyyy') : '—'}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold">{lead.createdAt ? format(new Date(lead.createdAt), 'HH:mm') : ''}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className={clsx(
                        "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-sm",
                        statusColor(lead.status || 'Pending')
                    )}>
                        {lead.status || 'Pending'}
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            title="View Message"
                            className={clsx(
                                "p-2 rounded-xl transition-all shadow-sm",
                                isExpanded ? "bg-primary text-white scale-110" : "bg-white border border-gray-100 text-gray-400 hover:border-primary/30 hover:text-primary"
                            )}
                        >
                            <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => window.location.href = `mailto:${lead.email}`}
                            title="Reply via Email"
                            className="p-2 bg-white border border-gray-100 text-primary rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm group/reply"
                        >
                            <Mail className="w-4 h-4 group-hover/reply:scale-110 transition-transform" />
                        </button>
                    </div>
                </td>
            </tr>
            <AnimatePresence>
                {isExpanded && (
                    <tr>
                        <td colSpan="6" className="px-6 py-0 border-b border-gray-100 bg-gray-50/30">
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="py-6 pl-16 pr-10">
                                    <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                            <Sparkles className="w-32 h-32 text-primary" />
                                        </div>

                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em] font-bold mb-1">Inquiry Details</p>
                                                <h5 className="text-sm font-bold text-[#2d3142]">Message from {lead.name}</h5>
                                            </div>
                                            {lead.location && (
                                                <div className="flex items-center gap-2 text-[13px] text-gray-500 font-bold uppercase tracking-wider bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                    <MapPin className="w-3.5 h-3.5 text-primary" />
                                                    {lead.location}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-50">
                                            <p className="text-sm text-[#2d3142] leading-relaxed italic font-serif">
                                                "{lead.query || 'No message provided'}"
                                            </p>
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={() => window.location.href = `mailto:${lead.email}`}
                                                className="px-6 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                                            >
                                                Reply to Inquiry
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </td>
                    </tr>
                )}
            </AnimatePresence>
        </>
    );
};

const LeadCard = ({ lead, index }) => {
    const [isCardExpanded, setIsCardExpanded] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300"
        >
            <div className="flex flex-col xl:flex-row">
                {/* Left Content */}
                <div className="flex-1 p-8 sm:p-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-[#fafafa] border border-gray-100 flex items-center justify-center text-primary font-bold text-xl">
                                {lead.name?.charAt(0) || '?'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#2d3142]">{lead.name || 'Anonymous'}</h3>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    <Clock className="w-3 h-3" />
                                    {lead.createdAt ? format(new Date(lead.createdAt), 'dd MMM yyyy • HH:mm') : 'Unknown Date'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={clsx(
                                "px-4 py-1.5 rounded-full text-[13px] font-bold uppercase tracking-widest border",
                                statusColor(lead.status || 'Pending')
                            )}>
                                {lead.status || 'Pending'}
                            </span>
                            <button
                                onClick={() => setIsCardExpanded(!isCardExpanded)}
                                className={clsx(
                                    "p-2 rounded-xl transition-all",
                                    isCardExpanded ? "bg-primary text-white rotate-180" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                )}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Field label="Email" icon={Mail} value={lead.email} href={`mailto:${lead.email}`} />
                        <Field label="Phone" icon={Phone} value={lead.phone} href={`tel:${lead.phone}`} />
                        <Field label="Location" icon={MapPin} value={lead.location} />
                    </div>

                    <AnimatePresence>
                        {isCardExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 border-t border-gray-50 space-y-2">
                                    <p className="text-[13px] text-gray-400 uppercase tracking-[0.2em] font-bold ml-1">Inquiry Message</p>
                                    <div className="bg-gray-50/50 border border-gray-100 rounded-[1.5rem] p-6 text-sm text-[#2d3142] leading-relaxed italic font-serif">
                                        "{lead.query || 'No message provided'}"
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Brand Panel */}
                <div className="xl:w-80 bg-[#fafafa] border-l border-gray-100 p-8 sm:p-10 flex flex-col">
                    <p className="text-[13px] text-gray-400 uppercase tracking-[0.3em] font-bold mb-6 text-center">Connected Brand</p>

                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-100 p-4 mb-4 overflow-hidden flex items-center justify-center transition-transform hover:scale-105 duration-300">
                            {lead.brandId?.logo ? (
                                <Image
                                    src={typeof lead.brandId.logo === 'string' ? lead.brandId.logo : (lead.brandId.logo.secure_url || lead.brandId.logo.url)}
                                    alt={lead.brandId.name}
                                    fill
                                    className="object-contain p-3"
                                />
                            ) : (
                                <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary font-bold text-3xl">
                                    {lead.brandId?.name?.charAt(0) || 'B'}
                                </div>
                            )}
                        </div>
                        <h4 className="text-sm font-bold text-[#2d3142] text-center">{lead.brandId?.name || 'Bespoke Provider'}</h4>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={() => window.location.href = `mailto:${lead.email}`}
                            className="w-full py-4 bg-primary/80 hover:bg-primary text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#2d3142]/10 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Reply via Email
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function BespokeConnectionsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'table' for brands
    const [inquiryViewMode, setInquiryViewMode] = useState('table'); // 'table' or 'cards' for inquiries
    const [brandSearch, setBrandSearch] = useState("");
    const [isSummaryOpen, setIsSummaryOpen] = useState(true);

    // Pagination State
    const [brandPage, setBrandPage] = useState(1);
    const [inquiryPage, setInquiryPage] = useState(1);

    const { user } = useAuthStore();

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await brandService.getBrandLeads();
            setLeads(response.data || []);
        } catch (error) {
            console.error('Error fetching brand leads:', error);
            toast.error('Failed to load inquiries');
        } finally {
            setLoading(false);
        }
    };

    // Derived State
    const brandStats = useMemo(() => {
        const stats = {};
        leads.forEach(lead => {
            const brandId = lead.brandId?._id || 'unknown';
            if (!stats[brandId]) {
                stats[brandId] = {
                    id: brandId,
                    name: lead.brandId?.name || 'Unknown Brand',
                    logo: lead.brandId?.logo,
                    count: 0
                };
            }
            stats[brandId].count++;
        });

        return Object.values(stats)
            .filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
            .sort((a, b) => b.count - a.count);
    }, [leads, brandSearch]);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.brandId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesBrand = selectedBrand ? (lead.brandId?._id === selectedBrand) : true;

            return matchesSearch && matchesBrand;
        });
    }, [leads, searchTerm, selectedBrand]);

    // Paginated Data
    const paginatedBrands = useMemo(() => {
        const start = (brandPage - 1) * BRAND_PAGE_SIZE;
        return brandStats.slice(start, start + BRAND_PAGE_SIZE);
    }, [brandStats, brandPage]);

    const paginatedLeads = useMemo(() => {
        const start = (inquiryPage - 1) * INQUIRY_PAGE_SIZE;
        return filteredLeads.slice(start, start + INQUIRY_PAGE_SIZE);
    }, [filteredLeads, inquiryPage]);

    // Reset pagination on search/filter
    useEffect(() => {
        setBrandPage(1);
    }, [brandSearch]);

    useEffect(() => {
        setInquiryPage(1);
    }, [searchTerm, selectedBrand]);

    return (
        <Container className="py-8 space-y-8">
            {/* HEADER SECTION */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif text-[#2d3142] flex items-center gap-3">
                        Bespoke Connections
                        <Sparkles className="w-5 h-5 text-primary" />
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Manage architectural inquiries from your bespoke collection pages.</p>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                    />
                </div>
            </header>

            {/* BRAND SUMMARY STATS */}
            {!loading && (
                <section className="bg-white/50 p-6 rounded-[2rem] border border-gray-100/50 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <button
                                onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                                className="flex items-center gap-3 group/header"
                            >
                                <h2 className="text-[13px] font-bold uppercase tracking-[0.3em] text-gray-400 ml-1 group-hover/header:text-primary transition-colors">Brand Performance</h2>
                                <div className={clsx(
                                    "p-1 rounded-md transition-all",
                                    isSummaryOpen ? "bg-primary/5 text-primary rotate-180" : "bg-gray-50 text-gray-400"
                                )}>
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isSummaryOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex flex-col sm:flex-row sm:items-center gap-4"
                                    >
                                        <div className="relative group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Search brands..."
                                                value={brandSearch}
                                                onChange={(e) => setBrandSearch(e.target.value)}
                                                className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all w-full sm:w-48"
                                            />
                                        </div>

                                        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                                            <button
                                                onClick={() => setViewMode('summary')}
                                                className={clsx(
                                                    "px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all",
                                                    viewMode === 'summary' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                                                )}
                                            >
                                                Quick Grid
                                            </button>
                                            <button
                                                onClick={() => setViewMode('table')}
                                                className={clsx(
                                                    "px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all",
                                                    viewMode === 'table' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                                                )}
                                            >
                                                Full List
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {selectedBrand && (
                            <button
                                onClick={() => setSelectedBrand(null)}
                                className="text-[13px] font-bold uppercase tracking-widest text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg"
                            >
                                Show All Inquiries
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {isSummaryOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                {viewMode === 'summary' ? (
                                    <>
                                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                            {paginatedBrands.map((stat) => (
                                                <button
                                                    key={stat.id}
                                                    onClick={() => setSelectedBrand(selectedBrand === stat.id ? null : stat.id)}
                                                    className={clsx(
                                                        "flex flex-col items-center p-4 rounded-3xl border transition-all min-w-[140px] group",
                                                        selectedBrand === stat.id
                                                            ? "bg-primary/5 border-primary shadow-lg shadow-primary/10"
                                                            : "bg-white border-gray-100 hover:border-primary/30"
                                                    )}
                                                >
                                                    <div className="relative w-12 h-12 mb-3 bg-white rounded-2xl border border-gray-50 p-2 shadow-sm overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110">
                                                        {stat.logo ? (
                                                            <Image
                                                                src={typeof stat.logo === 'string' ? stat.logo : (stat.logo.secure_url || stat.logo.url)}
                                                                alt={stat.name}
                                                                fill
                                                                className="object-contain p-1"
                                                            />
                                                        ) : (
                                                            <span className="text-primary font-bold">{stat.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-bold text-[#2d3142] mb-1 line-clamp-1">{stat.name}</span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-lg font-bold text-primary">{stat.count}</span>
                                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Leads</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <Pagination
                                            total={brandStats.length}
                                            pageSize={BRAND_PAGE_SIZE}
                                            current={brandPage}
                                            onChange={setBrandPage}
                                        />
                                    </>
                                ) : (
                                    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm p-1">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                                        <th className="px-6 py-4 text-[13px] font-bold uppercase tracking-widest text-gray-400">Brand Provider</th>
                                                        <th className="px-6 py-4 text-[13px] font-bold uppercase tracking-widest text-gray-400 text-center">Total Connections</th>
                                                        <th className="px-6 py-4 text-[13px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {paginatedBrands.map((stat) => (
                                                        <tr key={stat.id} className={clsx(
                                                            "group hover:bg-gray-50/50 transition-colors",
                                                            selectedBrand === stat.id && "bg-primary/5"
                                                        )}>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="relative w-10 h-10 bg-white rounded-xl border border-gray-100 p-1.5 shrink-0 overflow-hidden flex items-center justify-center">
                                                                        {stat.logo ? (
                                                                            <Image
                                                                                src={typeof stat.logo === 'string' ? stat.logo : (stat.logo.secure_url || stat.logo.url)}
                                                                                alt={stat.name}
                                                                                fill
                                                                                className="object-contain p-1"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-primary font-bold text-sm">{stat.name.charAt(0)}</span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-sm font-bold text-[#2d3142]">{stat.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-center">
                                                                    <span className="px-4 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest">
                                                                        {stat.count} INQUIRIES
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    onClick={() => setSelectedBrand(selectedBrand === stat.id ? null : stat.id)}
                                                                    className={clsx(
                                                                        "px-4 py-2 rounded-xl text-[13px] font-bold uppercase tracking-widest transition-all",
                                                                        selectedBrand === stat.id
                                                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                                            : "bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary"
                                                                    )}
                                                                >
                                                                    {selectedBrand === stat.id ? 'Viewing' : 'Filter Leads'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="pb-4">
                                            <Pagination
                                                total={brandStats.length}
                                                pageSize={BRAND_PAGE_SIZE}
                                                current={brandPage}
                                                onChange={setBrandPage}
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            )}

            {/* CONTENT AREA */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[13px] font-bold uppercase tracking-[0.3em] text-gray-400">
                        {selectedBrand ? "Filtered Inquiries" : "Recent Connections"}
                    </h2>

                    <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setInquiryViewMode('table')}
                            className={clsx(
                                "p-2 rounded-lg transition-all",
                                inquiryViewMode === 'table' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                            title="Table View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setInquiryViewMode('cards')}
                            className={clsx(
                                "p-2 rounded-lg transition-all",
                                inquiryViewMode === 'cards' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                            title="Card View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white h-24 rounded-3xl border border-gray-100 animate-pulse shadow-sm" />
                        ))}
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="bg-white py-24 rounded-3xl border border-gray-100 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
                            <MessageSquare className="w-8 h-8 text-gray-200" />
                        </div>
                        <h3 className="text-xl font-bold text-[#2d3142]">No inquiries yet</h3>
                        <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">Connections from your bespoke brand showcase will appear here.</p>
                    </div>
                ) : inquiryViewMode === 'table' ? (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-5 text-[13px] font-bold uppercase tracking-widest text-gray-400">Potential Client</th>
                                        <th className="px-6 py-5 text-[13px] font-bold uppercase tracking-widest text-gray-400">Contact Details</th>
                                        <th className="px-6 py-5 text-[13px] font-bold uppercase tracking-widest text-gray-400">Brand Context</th>
                                        <th className="px-6 py-5 text-[13px] font-bold uppercase tracking-widest text-gray-400">Date/Time</th>
                                        <th className="px-6 py-5 text-[13px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                                        <th className="px-6 py-5 text-[13px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedLeads.map((lead) => (
                                        <InquiryRow key={lead._id} lead={lead} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="pb-6">
                            <Pagination
                                total={filteredLeads.length}
                                pageSize={INQUIRY_PAGE_SIZE}
                                current={inquiryPage}
                                onChange={setInquiryPage}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence mode='popLayout'>
                            {paginatedLeads.map((lead, index) => (
                                <LeadCard key={lead._id} lead={lead} index={index} />
                            ))}
                        </AnimatePresence>

                        <Pagination
                            total={filteredLeads.length}
                            pageSize={INQUIRY_PAGE_SIZE}
                            current={inquiryPage}
                            onChange={setInquiryPage}
                        />
                    </div>
                )}
            </section>
        </Container>
    );
}
