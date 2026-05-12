'use client';

import React from 'react';
import { useGetCategoryRequests } from '@/hooks/useContractor';
import Container from '@/components/ui/Container';
import RoleGuard from '@/components/auth/RoleGuard';
import { AlertCircle, ArrowRight, Briefcase, Calendar, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function CategoryRequestsPage() {
    const { data: requestsResponse, isLoading, error } = useGetCategoryRequests();
    const requests = requestsResponse?.data || [];

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <RoleGuard allowedRoles={['admin']}>
            <Container className="py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Category Requests</h1>
                    <p className="text-gray-500 font-medium">New categories and specializations suggested by contractors.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {requests.length > 0 ? (
                        requests.map((request) => (
                            <div key={request._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100 shadow-sm">
                                            <Briefcase className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{request.businessName}</h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(request.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100">
                                                    <Info className="w-3 h-3" /> PENDING REVIEW
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 max-w-md">
                                        <div className="space-y-3">
                                            {request.requestedCategory && (
                                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <span className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">New Category Suggestion</span>
                                                    <p className="text-sm font-bold text-gray-800">"{request.requestedCategory}"</p>
                                                </div>
                                            )}
                                            {request.requestedSubcategories && (
                                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <span className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">New Specialization Suggestion</span>
                                                    <p className="text-sm font-bold text-gray-800">"{request.requestedSubcategories}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Link 
                                            href="/dashboard/categories"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-primary/20 group/btn"
                                        >
                                            Add Officially
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-[40px] p-20 border border-dashed border-gray-200 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">No Pending Requests</h3>
                            <p className="text-gray-400 max-w-sm font-medium">All contractor category suggestions have been processed or none have been submitted yet.</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 bg-blue-50 rounded-3xl p-8 border border-blue-100 flex items-start gap-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                        <AlertCircle className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-blue-900 mb-2">Admin Instructions</h4>
                        <ul className="text-sm text-blue-800/80 space-y-2 font-medium list-disc ml-4">
                            <li>Review the suggestions above from contractors who selected "Others".</li>
                            <li>To add a suggested category, go to <strong>Category Management</strong> and create it with the type <strong>"Contractor Service"</strong>.</li>
                            <li>Once officially added, the contractor can update their profile to select the official category.</li>
                        </ul>
                    </div>
                </div>
            </Container>
        </RoleGuard>
    );
}
