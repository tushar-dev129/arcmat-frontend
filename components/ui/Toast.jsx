'use client';

import { toast as sonnerToast } from 'sonner';
import CustomToast from './CustomToast';

export const toast = {
  success: (message, title) =>
    sonnerToast.custom((t) => (
      <CustomToast t={t} message={message} title={title} type="success" />
    )),
  error: (message, title) => {
    // Silence Access Denied toasts for customers to prevent UX friction (Hard Silence requested)
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user?.role === 'customer' && (
          message?.toLowerCase()?.includes('access denied') || 
          message?.toLowerCase()?.includes('insufficient permissions')
        )) {
          console.warn('[Toast Silenced] Suppressed Permission Error for Customer:', message);
          return null;
        }
      } catch (err) {
        console.error('Error in toast suppression check:', err);
      }
    }

    return sonnerToast.custom((t) => (
      <CustomToast t={t} message={message} title={title} type="error" />
    ));
  },
  warning: (message, title) =>
    sonnerToast.custom((t) => (
      <CustomToast t={t} message={message} title={title} type="warning" />
    )),
  info: (message, title) =>
    sonnerToast.custom((t) => (
      <CustomToast t={t} message={message} title={title} type="info" />
    )),
  ...sonnerToast,
};

export default function Toast() {
  return null;
}