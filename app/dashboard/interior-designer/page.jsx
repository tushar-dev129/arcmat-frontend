'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import ArchitectDashboard from '../architect/page';

export default function InteriorDesignerDashboardPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'architect') {
            router.replace('/dashboard');
            return;
        }
        if (user.professionalType !== 'Interior Designer') {
            router.replace('/dashboard/architect');
        }
    }, [user, router]);

    return <ArchitectDashboard />;
}

