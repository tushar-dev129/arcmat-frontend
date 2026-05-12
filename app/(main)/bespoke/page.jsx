"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Pagination from "@/components/ui/Pagination";
import { useGetBrands } from "@/hooks/useBrand";
import { useGetCategoryTree } from "@/hooks/useCategory";
import { useDebounce } from "@/hooks/useDebounce";
import { getBrandImageUrl } from "@/lib/productUtils";
import { ArrowRight, Building2, Loader2, Sparkles, Filter, LayoutGrid, ShoppingBag } from "lucide-react";
import BespokeFilterSidebar from "@/components/bespoke/BespokeFilterSidebar";
import RoleGuard from "@/components/auth/RoleGuard";


const getBrandId = (brand) => brand?._id || brand?.id;

const BespokePage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [selectedSubSubcategory, setSelectedSubSubcategory] = useState("");
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [sortBy, setSortBy] = useState("Featured");
    const [brandType, setBrandType] = useState("custom_maker"); // 'custom_maker' or 'brand'

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Reset page to 1 when search term, sort, or brand type changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm, sortBy, brandType]);

    // Scroll to top when filters or page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page, selectedCategory, selectedSubcategory, selectedSubSubcategory]);

    const { data: treeDataRaw } = useGetCategoryTree({ ownerType: brandType });
    const treeData = useMemo(() => {
        return Array.isArray(treeDataRaw?.data) ? treeDataRaw.data : (Array.isArray(treeDataRaw) ? treeDataRaw : []);
    }, [treeDataRaw]);

    const { data: brandsData, isLoading } = useGetBrands({
        type: "frontend",
        ownerType: brandType,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedSubcategory && { subcategoryId: selectedSubcategory }),
        ...(selectedSubSubcategory && { subsubcategoryId: selectedSubSubcategory }),
    });

    const allBrands = brandsData?.data || [];

    // Apply Sorting
    const sortedBrands = useMemo(() => {
        let sorted = [...allBrands];
        if (sortBy === "A - Z") {
            sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        } else if (sortBy === "Newest") {
            sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        } else if (sortBy === "Featured") {
            sorted.sort((a, b) => {
                if (a.showOnHomepage && !b.showOnHomepage) return -1;
                if (!a.showOnHomepage && b.showOnHomepage) return 1;
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });
        }
        return sorted;
    }, [allBrands, sortBy]);

    // Apply Pagination
    const totalItems = sortedBrands.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const paginatedBrands = sortedBrands.slice((page - 1) * limit, page * limit);

    const handleFilterChange = (catId, subcatId, subsubcatId) => {
        setSelectedCategory(catId);
        setSelectedSubcategory(subcatId);
        setSelectedSubSubcategory(subsubcatId);
        setPage(1);
    };

    return (
        <RoleGuard>
            <main className="min-h-screen ">
                <Container className="py-4 sm:py-4">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Sidebar Filters */}
                        <BespokeFilterSidebar
                            treeData={treeData}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            selectedCategory={selectedCategory}
                            selectedSubcategory={selectedSubcategory}
                            selectedSubSubcategory={selectedSubSubcategory}
                            onFilterChange={handleFilterChange}
                            isMobileOpen={isMobileFiltersOpen}
                            setIsMobileOpen={setIsMobileFiltersOpen}
                        />

                        {/* Main Content Area */}
                        <div className="flex-1 w-full min-w-0 min-h-[calc(100vh-200px)]">
                            {/* Header above brand grid */}
                            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">

                                {/* Brand Type Toggle */}
                                <div className="flex p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl border border-gray-200/50 w-fit">
                                    <button
                                        onClick={() => setBrandType("custom_maker")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${brandType === "custom_maker"
                                            ? "bg-white text-[#b76b45] shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        <Sparkles className={`h-4 w-4 ${brandType === "custom_maker" ? "text-[#b76b45]" : "text-gray-400"}`} />
                                        Bespoke Brands
                                    </button>
                                    <button
                                        onClick={() => setBrandType("brand")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${brandType === "brand"
                                            ? "bg-white text-[#b76b45] shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        <Building2 className={`h-4 w-4 ${brandType === "brand" ? "text-[#b76b45]" : "text-gray-400"}`} />
                                        All Brands
                                    </button>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 ml-auto">
                                    {/* Mobile/Tablet Controls Wrapper */}
                                    <div className="flex items-center gap-3 lg:hidden">
                                        <button
                                            onClick={() => setIsMobileFiltersOpen(true)}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-colors"
                                        >
                                            <Filter className="h-4 w-4" />
                                            Filters
                                        </button>

                                        {/* Mobile Sorting Button */}
                                        <div className="flex-1 sm:hidden relative flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                                            <span>Sort: {sortBy === "A - Z" ? "A-Z" : sortBy}</span>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            >
                                                <option value="Featured">Featured</option>
                                                <option value="Newest">Newest</option>
                                                <option value="A - Z">A - Z</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Sorting Dropdown (Tablet & Desktop) */}
                                    <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                                        <span>Sort by:</span>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer transition-colors"
                                        >
                                            <option value="Featured">Featured</option>
                                            <option value="Newest">Newest</option>
                                            <option value="A - Z">A - Z</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Brand Grid */}
                            {isLoading ? (
                                <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-gray-200 bg-white">
                                    <Loader2 className="h-9 w-9 animate-spin text-primary" />
                                </div>
                            ) : totalItems > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                                        {paginatedBrands.map((brand) => {
                                            const brandId = getBrandId(brand);

                                            return (

                                                <Link
                                                    key={brandId}

                                                    href={`/bespoke/${brandId}`}
                                                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#ed8b4e] hover:shadow-[0_12px_40px_rgba(183,107,69,0.18)]"
                                                >
                                                    {/* Top accent bar */}
                                                    <div className="h-[3px] w-full bg-gradient-to-r from-[#b76b45] to-[#ffffff]" />

                                                    {brand.ownerType === 'custom_maker' && (
                                                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6AE90] shadow-sm">
                                                            <Sparkles className="h-2.5 w-2.5 text-white fill-white" />
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-white">Bespoke</span>
                                                        </div>
                                                    )}

                                                    {/* Image */}
                                                    <div className="relative flex h-[120px] items-center justify-center bg-[#ffffff]">
                                                        <Image
                                                            src={getBrandImageUrl(brand.logo)}
                                                            alt={brand.name || "Brand logo"}
                                                            fill
                                                            className="object-contain p-8 transition duration-700 group-hover:scale-105"
                                                            unoptimized
                                                        />

                                                    </div>

                                                    {/* Body */}
                                                    <div className="flex flex-1 flex-col p-4 pt-5">
                                                        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-gray-950 transition duration-300 group-hover:text-[#b76b45]">
                                                            {brand.name || "Untitled Brand"}
                                                        </h3>
                                                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
                                                            {brand.description ||
                                                                "Explore curated collections, premium materials, and immersive brand experiences."}
                                                        </p>

                                                        {/* Meta */}
                                                        <div className="mt-3.5 flex items-center justify-between border-t border-gray-100 pt-3">
                                                            <span className="text-xs text-gray-400">{brand.country || "Global"}</span>
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d9b8a3] text-[#b76b45] transition duration-300 group-hover:bg-[#fff6f1]">
                                                                <ArrowRight className="h-3.5 w-3.5 transition duration-300 group-hover:translate-x-0.5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    {totalItems > 0 && (
                                        <div className="mt-10 overflow-hidden rounded-lg !border-t border-gray-100 bg-white ">
                                            <Pagination
                                                currentPage={page}
                                                totalPages={totalPages}
                                                pageSize={limit}
                                                onPageChange={setPage}
                                                onPageSizeChange={(newSize) => { setLimit(newSize); setPage(1); }}
                                                totalItems={totalItems}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                                    <h3 className="text-lg font-bold text-gray-900">No brands found</h3>
                                    <p className="mt-2 text-sm font-medium text-gray-500">Try adjusting your filters or search term.</p>
                                </div>
                            )}


                        </div>
                    </div>
                </Container>
            </main>
        </RoleGuard>
    );

};

export default BespokePage;
