"use client";
import React from 'react';
import Header from "@/components/layouts/Header";
import Navbar from "@/components/navbar/navbar";
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const Footer = dynamic(() => import("@/components/layouts/Footer"), {
    ssr: true
});
export default function MainLayout({ children }) {
    const pathname = usePathname();
    const isProfilePage = pathname === '/profile';

    return (
        <>
            <Header />
            {!isProfilePage && <Navbar />}
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
        </>
    );
}
