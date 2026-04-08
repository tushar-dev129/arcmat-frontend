"use client";

import Link from "next/link";
import { cn } from "./utils";

export const MegaMenuSidebar = ({ categories, hoveredCategory, setHoveredCategory, itemName, parentCategoryId }) => {
    return (
        <div className="w-[320px] bg-[#f3e8e3] py-4 shrink-0">
            <h3 className="text-xl font-bold mb-6 px-6 text-[hsl(20,10%,15%)]">{itemName}</h3>
            <ul className="space-y-0">
                {categories?.map((category) => {
                    const categoryId = category.id || category._id;
                    const href = categoryId ? `/productlist?category=${categoryId}` : "/productlist";

                    return (
                        <li key={category.name}>
                            <Link
                                href={href}
                                className={cn(
                                    "w-full flex items-center justify-between px-6 py-3 text-[15px] transition-colors duration-150",
                                    hoveredCategory === category.name
                                        ? "bg-[#ead4ce] text-[hsl(20,10%,15%)] font-bold shadow-sm"
                                        : "hover:bg-[#ead4ce]/50 text-[hsl(20,10%,15%)]/80"
                                )}
                                onMouseEnter={() => setHoveredCategory(category.name)}
                            >
                                <span>{category.name}</span>
                                {category.hasSubmenu && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={cn(
                                            "transition-transform duration-200",
                                            hoveredCategory === category.name ? "rotate-90 opacity-100" : "opacity-40"
                                        )}
                                    >
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
