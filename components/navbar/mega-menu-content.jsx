"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "./utils";

export const MegaMenuContent = ({ activeCategory, hoveredCategory, image, categoryData }) => {
    return (
        <div className="flex-1 bg-[#ead4ce] p-8 flex justify-between gap-12 min-w-[600px]">
            <div
                key={hoveredCategory}
                className="flex-1 animate-fade-in flex flex-col"
            >
                <Link 
                    href={activeCategory?.id ? `/productlist?category=${activeCategory.id}` : "/productlist"}
                    className="block group/title"
                >
                    <h3 className="text-xl font-bold mb-6 text-[hsl(20,10%,15%)] group-hover/title:text-[hsl(20,10%,45%)] transition-colors">
                        {activeCategory?.name}
                    </h3>
                </Link>

                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                    {activeCategory?.links?.map((column, colIndex) => (
                        <ul key={colIndex} className="space-y-3">
                            {column.map((link) => {
                                const linkCategoryData = categoryData?.children?.find(
                                    child => child.name === link
                                );
                                const categoryId = linkCategoryData?._id || linkCategoryData?.id || '';

                                return (
                                    <li key={link}>
                                        <Link
                                            href={categoryId ? `/productlist?category=${categoryId}` : "/productlist"}
                                            className="text-sm text-[hsl(20,10%,15%)]/80 hover:text-[hsl(20,10%,15%)] transition-colors block font-normal"
                                        >
                                            {link}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    ))}
                </div>
            </div>

            {/* Featured image area */}
            <div className="w-[250px] shrink-0 hidden lg:block self-start">
                <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden shadow-md bg-white">
                    <Image
                        key={image || hoveredCategory} // Force re-mount when image changes to prevent stuck state
                        src={image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop"}
                        alt={activeCategory?.name || "Featured Category"}
                        fill
                        priority // Load immediately as it's a high-visibility LCP element
                        className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, 200px"
                    />
                </div>
            </div>
        </div>
    );
};
