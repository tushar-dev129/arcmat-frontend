"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import { useAuth } from "@/hooks/useAuth";
import { useGetMyContractorProfile, useGetContractorLeads, useGetContractorStats } from "@/hooks/useContractor";
import { 
    Users, 
    MessageSquare, 
    TrendingUp, 
    Star, 
    ChevronRight, 
    AlertCircle,
    CheckCircle2,
    Briefcase,
    Clock,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function ContractorDashboard() {
    const { user } = useAuth();
    const { data: profileResponse } = useGetMyContractorProfile(user?._id);
    const contractor = profileResponse?.data?.profile || profileResponse?.profile;
    
    const { data: leadsResponse, isLoading: leadsLoading } = useGetContractorLeads(contractor?._id);
    const leads = leadsResponse?.data || leadsResponse || [];

    const { data: statsResponse } = useGetContractorStats(user?._id);
    const dynamicStats = statsResponse?.data || statsResponse;
    
    // Dynamic Profile Completion Calculation
    const calculateCompletion = () => {
        if (!contractor) return 0;
        let score = 0;
        const total = 8;
        
        if (contractor.businessName) score++;
        if (contractor.tagline) score++;
        if (contractor.overview) score++;
        if (contractor.profileImage) score++;
        if (contractor.categoryId) score++;
        if (contractor.location?.city) score++;
        if (contractor.contact?.phone) score++;
        if (profileResponse?.data?.portfolio?.length > 0) score++;
        
        return Math.round((score / total) * 100);
    };

    const profileCompletion = calculateCompletion();

    const stats = [
        { label: "Active Leads", value: dynamicStats?.activeLeads?.toString() || "0", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Profile Views", value: dynamicStats?.profileViews?.toString() || "0", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Avg Rating", value: dynamicStats?.avgRating?.toString() || "0.0", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Jobs Completed", value: dynamicStats?.jobsCompleted?.toString() || "0", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    return (
        <div className="p-8 space-y-8">
            {/* Header & Profile Strength */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(20,10%,15%)]">Contractor Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome  {user?.name || "Professional"}. Here's what's happening with your business.</p>
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-[280px]">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={150.8} strokeDashoffset={150.8 - (150.8 * profileCompletion) / 100} className="text-[hsl(15,80%,60%)] transition-all duration-1000" strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-xs font-bold text-gray-900">{profileCompletion}%</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Strength</p>
                        <Link href="/dashboard/contractor/profile" className="text-sm font-bold text-[hsl(15,80%,60%)] hover:underline mt-0.5 inline-block">
                            {profileCompletion < 100 ? "Improve profile" : "Profile is strong"} →
                        </Link>
                    </div>
                </div>
            </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live</span>
                        </div>
                        <h4 className="text-3xl font-bold text-gray-900">{stat.value}</h4>
                        <p className="text-sm font-medium text-gray-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Leads */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-[hsl(15,80%,60%)]" />
                            Recent Inquiries
                        </h2>
                        <Link href="/dashboard/contractor/leads" className="text-sm font-bold text-[hsl(15,80%,60%)] hover:underline">View All</Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {leadsLoading ? (
                            <div className="p-12 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : leads.length > 0 ? (
                            leads.slice(0, 5).map((lead) => (
                                <Link key={lead._id} href="/dashboard/contractor/leads" className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {lead.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{lead.name} <span className="text-xs font-normal text-gray-400 ml-2">via {lead.location}</span></h4>
                                            <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">"{lead.requirement}"</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-gray-400">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[hsl(15,80%,60%)] group-hover:translate-x-1 transition-all inline-block mt-2" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="font-bold text-gray-900">No leads yet</h3>
                                <p className="text-sm text-gray-500 mt-1 max-w-xs">Complete your profile to start receiving business inquiries.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance & Tips */}
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Growth Tips
                        </h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                    <Briefcase className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-gray-900">
                                        {(profileResponse?.data?.portfolio?.length || 0) < 5 
                                            ? `Add ${5 - (profileResponse?.data?.portfolio?.length || 0)} more projects` 
                                            : "Keep updating your portfolio"}
                                    </h5>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {(profileResponse?.data?.portfolio?.length || 0) < 5 
                                            ? "Contractors with 5+ projects get 40% more visibility."
                                            : "Regularly adding new work keeps you at the top of search results."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-gray-900">
                                        {contractor?.responseTime ? "Maintain your response time" : "Set your response time"}
                                    </h5>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Fast replies increase your booking conversion rate by up to 2x.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#ead4ce]/20 to-white rounded-3xl p-6 border border-[#ead4ce]/30 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-[hsl(20,10%,15%)]">Need help?</h3>
                            <p className="text-sm text-gray-500 mt-2 mb-6">Our partner success team is here to help you grow your business.</p>
                            <Link href="/dashboard/help" className="text-sm font-bold text-[hsl(15,80%,60%)] flex items-center gap-2">
                                Contact Support <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
