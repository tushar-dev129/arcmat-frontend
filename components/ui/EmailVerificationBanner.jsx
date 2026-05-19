'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, X, ChevronDown, ChevronUp } from 'lucide-react';
import AddEmailVerification from '@/components/ui/AddEmailVerification';
import { useUser } from '@/hooks/useAuth';

/**
 * EmailVerificationBanner
 *
 * Shows a dismissible banner at the top of the dashboard if:
 *  - The user has no email, OR
 *  - The user has an email but it is not yet verified (isEmailVerified !== 1)
 *
 * Drop this into the dashboard layout or any page.
 */
export default function EmailVerificationBanner() {
    const { data: user } = useUser();
    const [dismissed, setDismissed] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Only show if user is loaded and email is missing or unverified
    if (!user) return null;
    const needsEmailVerification = !user.email || user.isEmailVerified !== 1;
    if (!needsEmailVerification || dismissed) return null;

    const hasPendingEmail = !!user.email && user.isEmailVerified !== 1;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full border-b border-amber-200 bg-amber-50"
            >
                {/* Banner row */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
                    <button
                        onClick={() => setExpanded((v) => !v)}
                        className="flex items-center gap-2.5 text-left flex-1 group"
                    >
                        <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-sm text-amber-800">
                            {hasPendingEmail
                                ? <>Your email <span className="font-semibold">{user.email}</span> is not verified yet. Click to verify.</>
                                : <>Add an email address to receive notifications and recover your account.</>
                            }
                        </span>
                        {expanded
                            ? <ChevronUp className="w-4 h-4 text-amber-500 shrink-0 ml-auto" />
                            : <ChevronDown className="w-4 h-4 text-amber-500 shrink-0 ml-auto group-hover:translate-y-0.5 transition-transform" />
                        }
                    </button>
                    <button
                        onClick={() => setDismissed(true)}
                        className="p-1 text-amber-400 hover:text-amber-600 transition-colors shrink-0"
                        title="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Expandable verification panel */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 pt-1 flex justify-start">
                                <AddEmailVerification
                                    compact
                                    onSuccess={() => {
                                        setExpanded(false);
                                        setTimeout(() => setDismissed(true), 2000);
                                    }}
                                    onDismiss={() => setExpanded(false)}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
}
