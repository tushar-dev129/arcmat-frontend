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
            <ol className="flex items-center space-x-1 sm:space-x-1">


                {items.map((item, index) => (
                    <li key={index} className="flex items-center space-x-1 sm:space-x-1">
                        {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                        {index === items.length - 1 ? (
                            <span
                                className="text-md sm:text-xl font-semibold text-primary  tracking-wider whitespace-nowrap"
                                aria-current="page"
                            >
                                {item.label}
                            </span>
                        ) : (
                            <button
                                onClick={() => item.onClick && item.onClick()}
                                className="text-md sm:text-xl font-semibold text-primary hover:opacity-80 transition-opacity tracking-wider whitespace-nowrap cursor-pointer"
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
