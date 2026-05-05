"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import { useAuth } from "@/hooks/useAuth";
import { 
    Users, 
    MessageSquare, 
    TrendingUp, 
    Star, 
    ChevronRight, 
    AlertCircle,
    CheckCircle2,
    Briefcase,
    Clock
} from "lucide-react";
import Link from "next/link";

export default function ContractorDashboard() {
    const { user } = useAuth();
    const [profileCompletion, setProfileCompletion] = useState(65); // Mock completion

    const stats = [
        { label: "Active Leads", value: "12", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Profile Views", value: "1.2k", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Avg Rating", value: "4.8", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Jobs Completed", value: "45", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[hsl(20,10%,15%)]">Contractor Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome  {user?.name || "Professional"}. Here's what's happening with your business.</p>
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
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#ead4ce]/30 flex items-center justify-center text-[hsl(15,80%,60%)] font-bold">
                                        JD
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">John Doe <span className="text-xs font-normal text-gray-400 ml-2">via Modular Kitchen</span></h4>
                                        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">"Looking for a quote for a 2BHK renovation in Mumbai..."</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-gray-400">2h ago</div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[hsl(15,80%,60%)] group-hover:translate-x-1 transition-all inline-block mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Empty State Mock */}
                    {false && (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="font-bold text-gray-900">No leads yet</h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-xs">Complete your profile to start receiving business inquiries.</p>
                        </div>
                    )}
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
                                    <h5 className="text-sm font-bold text-gray-900">Add 3 more projects</h5>
                                    <p className="text-xs text-gray-500 mt-1">Contractors with 5+ projects get 40% more visibility.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-gray-900">Reduce response time</h5>
                                    <p className="text-xs text-gray-500 mt-1">Fast replies increase your booking conversion rate.</p>
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

function ArrowRight(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
