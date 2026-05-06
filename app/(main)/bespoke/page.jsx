"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { useGetBrands } from "@/hooks/useBrand";
import { getBrandImageUrl } from "@/lib/productUtils";
import { ArrowRight, Building2, Loader2, Search, Sparkles } from "lucide-react";

const getBrandId = (brand) => brand?._id || brand?.id;

const BespokePage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: brandsData, isLoading } = useGetBrands({
        limit: 100,
        type: "frontend",
    });

    const brands = brandsData?.data || [];

    const filteredBrands = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return brands;

        return brands.filter((brand) => {
            const searchable = [
                brand?.name,
                brand?.description,
                brand?.country,
                brand?.website,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchable.includes(query);
        });
    }, [brands, searchTerm]);

    return (
        <main className="min-h-screen bg-[#f7f7f5]">
            <section className="bg-white border-b border-gray-200">
                <Container className="py-12 sm:py-16 lg:py-20">
                    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                        <div className="max-w-4xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#e09a74]/30 bg-[#fff7f2] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#b76b45]">
                                <Sparkles className="h-4 w-4" />
                                Bespoke brand library
                            </div>
                            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
                                Explore every brand through a dedicated project page.
                            </h1>
                            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-gray-600 sm:text-lg">
                                Browse brand cards, open the one you need, and review its story, catalogue, and available materials in one focused place.
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[#e09a74] shadow-sm">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-950">{brands.length || 0} brands</p>
                                    <p className="text-sm font-medium text-gray-500">Connected to bespoke pages</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <Container className="py-10 sm:py-14">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-950">Brand Cards</h2>
                        <p className="mt-1 text-sm font-medium text-gray-500">Click any card to open that brand's bespoke page.</p>
                    </div>
                    <div className="relative w-full md:max-w-sm">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search brands"
                            className="h-12 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm font-medium text-gray-800 outline-none transition focus:border-[#e09a74] focus:ring-4 focus:ring-[#e09a74]/10"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-gray-200 bg-white">
                        <Loader2 className="h-9 w-9 animate-spin text-[#e09a74]" />
                    </div>
                ) : filteredBrands.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredBrands.map((brand) => {
                            const brandId = getBrandId(brand);

                            return (
                                <Link
                                    key={brandId}
                                    href={`/bespoke/${brandId}`}
                                    className="group flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#e09a74]/50 hover:shadow-xl hover:shadow-gray-200/70"
                                >
                                    <div className="relative flex h-44 items-center justify-center border-b border-gray-100 bg-gray-50 p-8">
                                        <Image
                                            src={getBrandImageUrl(brand.logo)}
                                            alt={brand.name || "Brand logo"}
                                            fill
                                            className="object-contain p-8 transition duration-500 group-hover:scale-105"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <h3 className="line-clamp-2 text-lg font-bold leading-snug text-gray-950">
                                                {brand.name || "Untitled Brand"}
                                            </h3>
                                            <ArrowRight className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#e09a74]" />
                                        </div>
                                        <p className="line-clamp-3 text-sm font-medium leading-6 text-gray-500">
                                            {brand.description || "Open this bespoke page to explore the brand profile and catalogue."}
                                        </p>
                                        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                                            <span>{brand.country || "Global"}</span>
                                            <span className="text-[#b76b45]">View page</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                        <h3 className="text-lg font-bold text-gray-900">No brands found</h3>
                        <p className="mt-2 text-sm font-medium text-gray-500">Try a different search term.</p>
                    </div>
                )}
            </Container>
        </main>
    );
};

export default BespokePage;
