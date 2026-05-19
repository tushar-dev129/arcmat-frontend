'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';
import clsx from 'clsx';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = 'danger'
}) {
    if (!isOpen) return null;

    const iconColors = {
        danger: 'text-red-600 bg-red-100',
        warning: 'text-amber-600 bg-amber-100',
        info: 'text-blue-600 bg-blue-100'
    };

    const confirmButtonStyles = {
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        warning: 'bg-amber-600 hover:bg-amber-700 text-white',
        info: 'bg-blue-600 hover:bg-blue-700 text-white'
    };

    return (
        <div className="fixed inset-0 z-600 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={clsx("p-3 rounded-full shrink-0", iconColors[type])}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="text-sm font-semibold cursor-pointer hover:text-gray-500"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                        }}
                        className={clsx("text-sm font-semibold py-2 px-4 cursor-pointer", confirmButtonStyles[type])}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
