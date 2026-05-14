"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Briefcase, ChevronRight, ShieldCheck, Star } from "lucide-react";

import { useGetCategoryTree } from "@/hooks/useCategory";

const ContractorCard = ({ contractor }) => {
    const { data: categoriesResponse } = useGetCategoryTree({ categoryType: 'contractor_service' });
    const categories = categoriesResponse?.data || categoriesResponse || [];

    const {
        businessName,
        slug,
        tagline,
        profileImage,
        location,
        experienceYears,
        isVerified,
        isTopRated,
        categoryId,
        otherCategoryName,
        rating = 4.8,
        reviewCount = 12
    } = contractor;

    const getCategoryName = () => {
        if (categoryId === 'other') return otherCategoryName || "Other";
        if (typeof categoryId === 'object' && categoryId?.name) return categoryId.name;
        if (typeof categoryId === 'string') {
            const found = categories.find(c => c._id === categoryId);
            return found ? found.name : null;
        }
        return null;
    };
    const primaryCategory = getCategoryName();

    const getProfileImageUrl = (img) => {
        if (!img || img === 'undefined' || img === 'null') return "/Icons/arcmatlogo.svg";
        const url = typeof img === 'string' ? img : img.url || img.secure_url;
        if (!url || url === 'undefined' || url === 'null') return "/Icons/arcmatlogo.svg";
        return url;
    };

    return (
        <div className="group relative bg-white rounded-2xl border border-[hsl(30,15%,88%)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">

            {/* Top accent line */}
            <div className="h-1 w-full bg-gradient-to-r from-[hsl(24,49%,70%)] via-[hsl(30,50%,85%)] to-[hsl(24,49%,70%)]" />

            {/* Profile image + identity block */}
            <div className="flex flex-col items-center pt-7 pb-5 px-5 text-center">

                {/* Avatar with ring */}
                <div className="relative mb-4">
                    <div className="h-20 w-20 rounded-full ring-4 ring-[hsl(30,15%,90%)] group-hover:ring-[hsl(24,49%,85%)] transition-all duration-300 overflow-hidden bg-gray-100 shadow-lg">
                        <div className="relative h-full w-full">
                            <Image
                                src={getProfileImageUrl(profileImage)}
                                alt={businessName}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                    </div>
                    {isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 shadow-md ring-2 ring-white">
                            <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                    )}
                </div>

                {/* Name */}
                <h3 className="text-[15px] font-bold text-[hsl(20,10%,12%)] group-hover:text-[hsl(24,49%,50%)] transition-colors duration-300 leading-tight">
                    {businessName}
                </h3>

                {/* Tagline */}
                <p className="text-[11px] text-[hsl(20,5%,50%)] mt-1 line-clamp-1 italic px-2">
                    {tagline || "Providing premium bespoke services."}
                </p>

                {/* Badges row */}
                <div className="flex items-center gap-2 mt-3">
                    {isTopRated && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 text-[13px] font-bold rounded-full">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            TOP RATED
                        </span>
                    )}
                    {primaryCategory && (
                        <span className="px-2.5 py-0.5 bg-[hsl(24,49%,97%)] border border-[hsl(24,49%,88%)] text-[hsl(24,49%,45%)] text-[13px] font-semibold rounded-full">
                            {primaryCategory}
                        </span>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="mx-5 border-t border-dashed border-[hsl(30,15%,88%)]" />

            {/* Info row */}
            <div className="flex items-center justify-around px-5 py-4">
                <div className="flex items-center gap-1.5">
                    <div className="p-1.5 bg-[hsl(24,49%,97%)] rounded-lg">
                        <MapPin className="w-3 h-3 text-[hsl(24,49%,65%)]" />
                    </div>
                    <span className="text-[11px] font-semibold text-[hsl(20,10%,30%)]">
                        {location?.city || "Mumbai"}
                    </span>
                </div>

                <div className="w-px h-6 bg-[hsl(30,15%,88%)]" />

                <div className="flex items-center gap-1.5">
                    <div className="p-1.5 bg-[hsl(24,49%,97%)] rounded-lg">
                        <Briefcase className="w-3 h-3 text-[hsl(24,49%,65%)]" />
                    </div>
                    <span className="text-[11px] font-semibold text-[hsl(20,10%,30%)]">
                        {experienceYears || "5+"} Yrs Exp.
                    </span>
                </div>
            </div>

            {/* CTA */}
            <div className="px-5 pb-5 mt-auto">
                <Link
                    href={`/contractors/${slug}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-[#c99775] text-white text-[11px] font-medium rounded-xl transition-all duration-300 shadow-md shadow-primary/20 active:scale-95"
                >
                    View Profile
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </div>
    );
};

export default ContractorCard;