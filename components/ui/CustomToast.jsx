'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-primary" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-sky-500" />,
};

const CustomToast = ({ t, message, title, type = 'success' }) => {
    return (
        <div className="pointer-events-auto flex w-[350px] sm:w-[400px] max-w-[90vw] bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden transition-all duration-300">
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                    <div className="shrink-0 pt-0.5">
                        {icons[type] || icons.success}
                    </div>
                    <div className="ml-3 flex-1">
                        {title && (
                            <p className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">
                                {title}
                            </p>
                        )}
                        <p className="text-xs font-medium text-gray-500 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex border-l border-gray-100">
                <button
                    onClick={() => sonnerToast.dismiss(t)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default CustomToast;
