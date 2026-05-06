"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Briefcase, ChevronRight, Mail, Phone } from "lucide-react";
import clsx from "clsx";

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
        contact,
        rating = 4.8,
        reviewCount = 12
    } = contractor;

    // Helper to get image URL
    const getImageUrl = (img, type = "cover") => {
        if (!img) {
            if (type === "cover") return "/Icons/arcmatlogo.svg";
            return "/images/placeholder-profile.jpg";
        }
        
        // Handle different image object structures
        const url = typeof img === 'string' ? img : img.url || img.secure_url;
        
        if (!url) {
            if (type === "cover") return "/Icons/arcmatlogo.svg";
            return "/images/placeholder-profile.jpg";
        }
        
        return url;
    };

    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden border border-[hsl(30,15%,90%)] hover:shadow-xl transition-all duration-500 flex flex-col h-full">
            {/* Cover Image Area */}
            <div className={clsx(
                "relative h-40 w-full overflow-hidden",
                !coverImage && "bg-gray-50 flex items-center justify-center p-8"
            )}>
                <Image
                    src={getImageUrl(coverImage, "cover")}
                    alt={businessName}
                    fill={!!coverImage}
                    width={!coverImage ? 120 : undefined}
                    height={!coverImage ? 120 : undefined}
                    className={clsx(
                        "transition-transform duration-700 group-hover:scale-110",
                        coverImage ? "object-cover" : "object-contain opacity-20 grayscale"
                    )}
                />
                {coverImage && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />}
                
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
                            src={getImageUrl(profileImage, "profile")}
                            alt={businessName}
                            fill
                            className="object-cover"
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

                {/* Info Grid - Updated with Email and Phone */}
                <div className="mt-5 grid grid-cols-1 gap-3 pb-5 border-b border-dashed border-[hsl(30,15%,90%)]">
                    <div className="flex items-center justify-between">
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

                    <div className="space-y-2.5 mt-1">
                        {contact?.email && (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Mail className="w-3.5 h-3.5 text-primary opacity-70" />
                                <span className="text-[11px] font-medium truncate">{contact.email}</span>
                            </div>
                        )}
                        {contact?.phone && (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Phone className="w-3.5 h-3.5 text-primary opacity-70" />
                                <span className="text-[11px] font-medium">{contact.phone}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="mt-auto pt-4 flex items-center justify-end">
                    <Link 
                        href={`/contractors/${slug}`}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary/90 hover:bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 shadow-lg shadow-black/10 active:scale-95"
                    >
                        View Profile
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ContractorCard;
