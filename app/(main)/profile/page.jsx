"use client";
import React, { useState } from 'react';
import Container from '@/components/ui/Container';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/dashboard/sidebar/Sidebar';
import BasicInfoCard from '@/components/profile/BasicInfoCard';
import ChangePasswordCard from '@/components/profile/ChangePasswordCard';
import BusinessProfileTab from '@/components/profile/BusinessProfileTab';
import RetailerProfileTab from '@/components/profile/RetailerProfileTab';
import { User, Building2, Lock, MapPin, Store, Settings2, ShieldCheck } from 'lucide-react';
import AddressList from '@/components/profile/AddressList';
import Footer from '@/components/layouts/Footer';
import clsx from 'clsx';

const ProfilePage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('basic');

    const isBrandRole = user?.role === 'brand' || user?.role === 'custom_maker';
    const isRetailerRole = user?.role === 'retailer';

    const tabs = [
        { id: 'basic', label: 'Identity', icon: User, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'address', label: 'Addresses', icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-50' },
        ...(isBrandRole ? [{ id: 'business', label: 'Business', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50' }] : []),
        ...(isRetailerRole ? [{ id: 'retailer', label: 'Retailer', icon: Store, color: 'text-indigo-500', bg: 'bg-indigo-50' }] : []),
        { id: 'password', label: 'Security', icon: Lock, color: 'text-red-500', bg: 'bg-red-50' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#fafafa]">
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 overflow-y-auto py-12 px-4 sm:px-8">
                    <Container>
                        <div className="max-w-5xl mx-auto">
                            {/* Header Section */}
                            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-2">
                                 
                                    <h1 className="text-4xl font-bold text-gray-700 tracking-tight">Account Dashboard</h1>
                                    <p className="text-gray-500 font-medium max-w-md">Manage your personal profile, delivery addresses, and security preferences.</p>
                                </div>

                               
                            </div>

                            {/* Premium Tab Navigation */}
                            <div className="flex flex-wrap justify-start gap-2 bg-gray-100/50 p-2 rounded-2xl mb-12 border border-gray-100/50 ">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={clsx(
                                                "flex items-center gap-3 px-6 py-2 rounded-2xl text-sm font-semibold transition-all duration-300 group whitespace-nowrap",
                                                isActive
                                                    ? 'bg-white text-gray-900 shadow-lg shadow-gray-200/50 ring-1 ring-gray-100'
                                                    : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                                                isActive ? tab.bg + ' ' + tab.color : ''
                                            )}>
                                                <Icon size={16} strokeWidth={2.5} />
                                            </div>
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab Content with Animation */}
                            <div className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                                {activeTab === 'basic' && <BasicInfoCard user={user} />}
                                {activeTab === 'address' && <AddressList />}
                                {activeTab === 'business' && isBrandRole && <BusinessProfileTab />}
                                {activeTab === 'retailer' && isRetailerRole && <RetailerProfileTab />}
                                {activeTab === 'password' && <ChangePasswordCard />}
                            </div>
                        </div>
                    </Container>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
