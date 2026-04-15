import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import clsx from 'clsx';

/**
 * Reusable Breadcrumb component with premium styling.
 * @param {Array} items - Array of { label, onClick, href }
 * @param {string} className - Optional container styling
 */
const Breadcrumb = ({ items, className }) => {
    if (!items || items.length === 0) return null;

    return (
        <nav className={clsx("flex overflow-x-auto no-scrollbar py-2", className)} aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 sm:space-x-3">
                
                
                {items.map((item, index) => (
                    <li key={index} className="flex items-center space-x-2 sm:space-x-3">
                        {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                        {index === items.length - 1 ? (
                            <span 
                                className="text-xs sm:text-sm font-black text-[#e09a74] uppercase tracking-widest whitespace-nowrap"
                                aria-current="page"
                            >
                                {item.label}
                            </span>
                        ) : (
                            <button
                                onClick={() => item.onClick && item.onClick()}
                                className="text-xs sm:text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest whitespace-nowrap cursor-pointer"
                            >
                                {item.label}
                            </button>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
