"use client";

import { useAuth } from "@/hooks/useAuth";
import { useGetMyContractorProfile, useGetContractorLeads } from "@/hooks/useContractor";
import {
    MessageSquare,
    Calendar,
    MapPin,
    Phone,
    User as UserIcon,
    ChevronRight,
    Search,
    Filter,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import StatusBadge from "@/components/ui/StatusBadge";

export default function ContractorLeadsPage() {
    const { user } = useAuth();
    const { data: profileResponse, isLoading: profileLoading } = useGetMyContractorProfile(user?._id);
    const contractor = profileResponse?.data?.profile || profileResponse?.profile;

    const { data: leadsResponse, isLoading: leadsLoading } = useGetContractorLeads(contractor?._id);
    const leads = leadsResponse?.data || leadsResponse || [];

    if (profileLoading || leadsLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/dashboard/contractor" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-4 h-4 text-gray-500" />
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Leads & Inquiries</h1>
                    </div>
                    <p className="text-gray-500">Manage and respond to your potential customers.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-primary transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                        <Filter className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-widest text-gray-400">Date</th>
                                <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-widest text-gray-400">Requester</th>
                                <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-widest text-gray-400">Location</th>
                                <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-widest text-gray-400">Requirement</th>
                                <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {leads.length > 0 ? (
                                leads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{format(new Date(lead.createdAt), 'dd MMM yyyy')}</span>
                                                <span className="text-[13px] text-gray-400 font-bold uppercase">{format(new Date(lead.createdAt), 'hh:mm a')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {lead.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{lead.name}</span>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Phone className="w-3 h-3" />
                                                        {lead.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                {lead.location}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm text-gray-600 max-w-xs line-clamp-2 leading-relaxed">
                                                {lead.requirement}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={lead.status} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 rounded-lg hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all group-hover:text-primary">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <MessageSquare className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">No leads found</h3>
                                            <p className="text-sm text-gray-500 mt-1">You haven't received any inquiries yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination Mock */}
                {leads.length > 0 && (
                    <div className="px-8 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">Showing {leads.length} leads</span>
                        <div className="flex items-center gap-2">
                            <button disabled className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-400 bg-white">Prev</button>
                            <button disabled className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-400 bg-white">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
