"use client";

import React, { useEffect, useState } from 'react';
import { brandService } from '@/services/brandService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Calendar, User, MessageSquare, ChevronRight, Search, Sparkles, Clock, Globe } from 'lucide-react';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import useAuthStore from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

const Field = ({ label, value, icon: Icon, href }) => (
    <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1.5 ml-1">{label}</p>
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

export default function BespokeConnectionsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

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

    const filteredLeads = leads.filter(lead => 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.brandId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusColor = (s) => {
        if (s === 'Pending') return 'bg-amber-50 text-amber-500 border-amber-100';
        if (s === 'Reviewed') return 'bg-blue-50 text-blue-500 border-blue-100';
        return 'bg-green-50 text-green-500 border-green-100';
    };

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

            {/* CONTENT AREA */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white h-48 rounded-3xl border border-gray-100 animate-pulse shadow-sm" />
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
            ) : (
                <div className="space-y-6">
                    <AnimatePresence mode='popLayout'>
                        {filteredLeads.map((lead, index) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                key={lead._id} 
                                className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300"
                            >
                                <div className="flex flex-col xl:flex-row">
                                    {/* Left Content */}
                                    <div className="flex-1 p-8 sm:p-10">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-[#fafafa] border border-gray-100 flex items-center justify-center text-primary font-black text-xl">
                                                    {lead.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-[#2d3142]">{lead.name}</h3>
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        {format(new Date(lead.createdAt), 'dd MMM yyyy • HH:mm')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor(lead.status || 'Pending')}`}>
                                                    {lead.status || 'Pending'}
                                                </span>
                                                {isAdmin && (
                                                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-100">
                                                        Admin View
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            <Field label="Email" icon={Mail} value={lead.email} href={`mailto:${lead.email}`} />
                                            <Field label="Phone" icon={Phone} value={lead.phone} href={`tel:${lead.phone}`} />
                                            <Field label="Location" icon={MapPin} value={lead.location} />
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold ml-1">Inquiry Message</p>
                                            <div className="bg-gray-50/50 border border-gray-100 rounded-[1.5rem] p-6 text-sm text-[#2d3142] leading-relaxed italic font-serif">
                                                "{lead.query}"
                                            </div>
                                        </div>
                                    </div>

                                    {/* Brand Panel */}
                                    <div className="xl:w-80 bg-[#fafafa] border-l border-gray-100 p-8 sm:p-10 flex flex-col">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold mb-6 text-center">Connected Brand</p>
                                        
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
                                                    <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary font-black text-3xl">
                                                        {lead.brandId?.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="text-sm font-bold text-[#2d3142] text-center">{lead.brandId?.name || 'Bespoke Provider'}</h4>
                                        </div>

                                        <div className="mt-8">
                                            <button 
                                                onClick={() => window.location.href = `mailto:${lead.email}`}
                                                className="w-full py-4 bg-primary/80 hover:bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#2d3142]/10 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                Reply via Email
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </Container>
    );
}
