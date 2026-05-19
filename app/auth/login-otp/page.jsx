'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/Toast';

export default function LoginOtpDeprecatedPage() {
    const router = useRouter();

    useEffect(() => {
        toast.info('Login OTP has been removed. Please sign in with mobile number and password.', 'Flow Updated');
        router.replace('/auth/login');
    }, [router]);

    return null;
}

