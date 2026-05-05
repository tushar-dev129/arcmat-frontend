"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Briefcase, ChevronRight } from "lucide-react";

const ContractorCard = ({ contractor }) => {
    const {
        businessName,
        slug,
        tagline,
        profileImage,
        coverImage,
        location,
        experienceYears,
        isVerified,
        isTopRated,
        rating = 4.8, // Fallback for MVP
        reviewCount = 12 // Fallback for MVP
    } = contractor;

    // Helper to get image URL
    const getImageUrl = (img) => {
        if (!img) return "/images/placeholder-cover.jpg";
        return typeof img === 'string' ? img : img.url || "/images/placeholder-cover.jpg";
    };

    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden border border-[hsl(30,15%,90%)] hover:shadow-xl transition-all duration-500 flex flex-col h-full">
            {/* Cover Image Area */}
            <div className="relative h-40 w-full overflow-hidden">
                <Image
                    src={getImageUrl(coverImage)}
                    alt={businessName}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {isVerified && (
                        <span className="px-2 py-1 bg-blue-500/90 text-white text-[10px] font-bold rounded-md backdrop-blur-md flex items-center gap-1 shadow-lg">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                            VERIFIED
                        </span>
                    )}
                    {isTopRated && (
                        <span className="px-2 py-1 bg-[hsl(15,80%,65%)] text-white text-[10px] font-bold rounded-md backdrop-blur-md shadow-lg">
                            TOP RATED
                        </span>
                    )}
                </div>
            </div>

            {/* Profile Content */}
            <div className="relative px-5 pt-12 pb-6 flex-1 flex flex-col">
                {/* Profile Avatar Overlay */}
                <div className="absolute -top-10 left-5 h-20 w-20 rounded-xl bg-white p-1 shadow-xl border border-[hsl(30,15%,95%)] overflow-hidden">
                    <div className="relative h-full w-full rounded-lg overflow-hidden bg-gray-50">
                        <Image
                            src={getImageUrl(profileImage)}
                            alt={businessName}
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Rating Overlay */}
                <div className="absolute top-2 right-5 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-[hsl(30,15%,90%)] shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-gray-800">{rating}</span>
                    <span className="text-[10px] text-gray-400">({reviewCount})</span>
                </div>

                <div className="mt-2">
                    <h3 className="text-lg font-bold text-[hsl(20,10%,15%)] group-hover:text-[hsl(15,80%,55%)] transition-colors duration-300 truncate">
                        {businessName}
                    </h3>
                    <p className="text-xs text-[hsl(20,5%,45%)] mt-1 line-clamp-1 font-medium italic">
                        {tagline || "Providing premium bespoke services."}
                    </p>
                </div>

                {/* Info Grid */}
                <div className="mt-5 grid grid-cols-2 gap-3 pb-5 border-b border-dashed border-[hsl(30,15%,90%)]">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#ead4ce]/30 rounded-lg">
                            <MapPin className="w-3.5 h-3.5 text-[hsl(15,80%,60%)]" />
                        </div>
                        <span className="text-[11px] font-semibold text-[hsl(20,10%,30%)]">{location?.city || "Mumbai"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#ead4ce]/30 rounded-lg">
                            <Briefcase className="w-3.5 h-3.5 text-[hsl(15,80%,60%)]" />
                        </div>
                        <span className="text-[11px] font-semibold text-[hsl(20,10%,30%)]">{experienceYears || "5+"} Years Exp.</span>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Starts from</span>
                        <span className="text-sm font-bold text-[hsl(20,10%,15%)]">₹ 499 <span className="text-[10px] text-gray-400 font-normal">/ sqft</span></span>
                    </div>
                    <Link 
                        href={`/contractors/${slug}`}
                        className="flex items-center gap-1 px-4 py-2 bg-[hsl(20,10%,15%)] hover:bg-[hsl(15,80%,60%)] text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-lg shadow-black/10"
                    >
                        View Profile
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ContractorCard;
