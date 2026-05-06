"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/cards/ProductCard";
import { useGetBrandById } from "@/hooks/useBrand";
import { useGetRetailerProducts } from "@/hooks/useProduct";
import { getBrandImageUrl, getImageUrl } from "@/lib/productUtils";
import { ArrowLeft, ArrowRight, Briefcase, ChevronLeft, ChevronRight, Globe, Loader2, MapPin, Package, ShieldCheck, Star, Store } from "lucide-react";

const idOf = (item) => String(item?._id || item?.id || item || "");

const BespokeBrandPage = () => {
    const { id } = useParams();
    const { data: brandData, isLoading: brandLoading } = useGetBrandById(id);
    const brand = brandData?.data;
    const bespoke = brand?.bespokePage || {};

    const { data: productsData, isLoading: productsLoading } = useGetRetailerProducts({
        brand: id,
        limit: 100,
    });

    const products = productsData?.data?.data || productsData?.data || [];
    const selectedProductIds = (bespoke.selectedProductIds || []).map(idOf).filter(Boolean);
    const visibleProducts = selectedProductIds.length > 0
        ? products.filter((product) => selectedProductIds.includes(idOf(product)))
        : products.slice(0, 12);
    const retailers = bespoke.selectedRetailerIds || [];
    const contractors = bespoke.selectedContractorIds || [];
    const reviews = bespoke.reviews || [];
    const totalProducts = selectedProductIds.length || productsData?.data?.pagination?.totalItems || products.length;
    const heroImage = getImageUrl(bespoke.heroImage, "brands");
    const galleryMedia = [...(bespoke.galleryMedia || []), ...(bespoke.customImage ? [bespoke.customImage] : [])].slice(0, 8);

    if (brandLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
                <Loader2 className="h-10 w-10 animate-spin text-[#e09a74]" />
            </main>
        );
    }

    if (!brand) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-950">Brand not found</h1>
                    <p className="mt-2 text-sm font-medium text-gray-500">This bespoke brand page is not available.</p>
                    <Link href="/bespoke" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e09a74] px-6 py-3 text-sm font-bold text-white">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Bespoke
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f7f7f5] pb-16">
            {heroImage && (
                <section className="relative h-[260px] overflow-hidden bg-gray-950 sm:h-[360px] lg:h-[460px]">
                    <Image
                        src={heroImage}
                        alt={`${brand.name} bespoke hero`}
                        fill
                        className="object-cover"
                        unoptimized
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <Container className="relative flex h-full items-end pb-8 sm:pb-10">
                        <div className="max-w-3xl text-white">
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/75">Bespoke brand page</p>
                            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                                {bespoke.headline || brand.name}
                            </h1>
                        </div>
                    </Container>
                </section>
            )}

            <section className="relative overflow-hidden border-b border-gray-200 bg-white">
                <Container className="relative py-8 sm:py-12">
                    <Link href="/bespoke" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-[#e09a74]">
                        <ArrowLeft className="h-4 w-4" />
                        All bespoke brands
                    </Link>

                    <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-center">
                        <div className="relative flex aspect-square items-center justify-center rounded-lg border border-gray-200 bg-white p-10 shadow-sm">
                            <Image
                                src={getBrandImageUrl(brand.logo)}
                                alt={brand.name || "Brand logo"}
                                fill
                                className="object-contain p-10"
                                unoptimized
                                priority
                            />
                        </div>

                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                                <ShieldCheck className="h-4 w-4" />
                                Bespoke brand page
                            </div>
                            {!heroImage && (
                                <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
                                    {bespoke.headline || brand.name}
                                </h1>
                            )}
                            <p className="mt-5 max-w-3xl text-base font-medium leading-7 text-gray-600 sm:text-lg">
                                {bespoke.bio || brand.description || "Explore this brand's curated materials, catalogue presence, and project-ready products from ArcMat."}
                            </p>

                            <div className="mt-7 flex flex-wrap gap-3">
                                {brand.website && (
                                    <a
                                        href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-[#e09a74] hover:text-[#e09a74]"
                                    >
                                        <Globe className="h-4 w-4" />
                                        Visit website
                                    </a>
                                )}
                                <Link
                                    href={`/productlist?brand=${id}`}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#e09a74] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c97f58]"
                                >
                                    View catalogue
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <Container className="py-10 sm:py-14">
                {galleryMedia.length > 0 && (
                    <BrandShowcase galleryMedia={galleryMedia} brandName={brand.name} />
                )}

                {(retailers.length > 0 || contractors.length > 0) && (
                    <section className="mb-12 grid gap-6 lg:grid-cols-2">
                        {retailers.length > 0 && (
                            <PartnerPanel
                                icon={Store}
                                title="Retailers"
                                items={retailers}
                                renderItem={(retailer) => ({
                                    image: getImageUrl(retailer.profile, "userprofile") || "/Icons/arcmatlogo.svg",
                                    title: retailer.retailerProfile?.companyName || retailer.name,
                                    subtitle: retailer.retailerProfile?.cityRegion || retailer.email,
                                })}
                            />
                        )}
                        {contractors.length > 0 && (
                            <PartnerPanel
                                icon={Briefcase}
                                title="Contractors & Makers"
                                items={contractors}
                                renderItem={(contractor) => ({
                                    image: getImageUrl(contractor.profileImage, "contractor") || "/Icons/arcmatlogo.svg",
                                    title: contractor.businessName,
                                    subtitle: `${contractor.location?.city || "India"}${contractor.experienceYears ? `, ${contractor.experienceYears}+ years` : ""}`,
                                    href: contractor.slug ? `/contractors/${contractor.slug}` : null,
                                })}
                            />
                        )}
                    </section>
                )}

                <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_320px] lg:items-end">
                    <div>
                        <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-950">
                            <Package className="h-6 w-6 text-[#e09a74]" />
                            Brand Products
                        </h2>
                        <p className="mt-2 text-sm font-medium text-gray-500">
                            Products connected to this bespoke brand page.
                        </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white px-5 py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Catalogue items</p>
                        <p className="mt-1 text-2xl font-bold text-gray-950">{totalProducts}</p>
                    </div>
                </div>

                {productsLoading ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="aspect-[3/4] animate-pulse rounded-lg border border-gray-200 bg-white" />
                        ))}
                    </div>
                ) : visibleProducts.length > 0 ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {visibleProducts.map((product) => (
                                <ProductCard key={product._id || product.id || product.override_id} product={product} />
                            ))}
                        </div>
                        {totalProducts > visibleProducts.length && (
                            <div className="flex justify-center">
                                <Link
                                    href={`/productlist?brand=${id}`}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#e09a74] bg-white px-7 py-3 text-sm font-bold text-[#b76b45] transition hover:bg-[#e09a74] hover:text-white"
                                >
                                    Show all products
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                        <Package className="mx-auto h-11 w-11 text-gray-300" />
                        <h3 className="mt-4 text-lg font-bold text-gray-900">No products listed yet</h3>
                        <p className="mt-2 text-sm font-medium text-gray-500">This brand can still use this page as its bespoke profile.</p>
                    </div>
                )}

                {reviews.length > 0 && (
                    <section className="mt-14">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-950">Customer Reviews</h2>
                            <p className="mt-2 text-sm font-medium text-gray-500">Feedback curated by the brand.</p>
                        </div>
                        <div className="grid gap-5 md:grid-cols-3">
                            {reviews.map((review, index) => (
                                <div key={index} className="rounded-lg border border-gray-200 bg-white p-6">
                                    <div className="mb-4 flex gap-1 text-amber-400">
                                        {Array.from({ length: Math.min(5, Math.max(1, Number(review.rating) || 5)) }).map((_, starIndex) => (
                                            <Star key={starIndex} className="h-4 w-4 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-sm font-medium leading-6 text-gray-600">"{review.comment}"</p>
                                    <div className="mt-5 border-t border-gray-100 pt-4">
                                        <p className="font-bold text-gray-950">{review.name}</p>
                                        {review.role && <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">{review.role}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </Container>
        </main>
    );
};

const PartnerPanel = ({ icon: Icon, title, items, renderItem }) => (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-gray-950">
            <Icon className="h-5 w-5 text-[#e09a74]" />
            {title}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => {
                const display = renderItem(item);
                const content = (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <PartnerAvatar image={display.image} title={display.title || title} />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-950">{display.title}</p>
                            <p className="flex items-center gap-1 truncate text-xs font-medium text-gray-500">
                                <MapPin className="h-3 w-3" />
                                {display.subtitle}
                            </p>
                        </div>
                    </div>
                );

                return display.href ? (
                    <Link key={idOf(item)} href={display.href} className="block hover:opacity-90">
                        {content}
                    </Link>
                ) : (
                    <div key={idOf(item)}>{content}</div>
                );
            })}
        </div>
    </section>
);

const PartnerAvatar = ({ image, title }) => {
    const [failed, setFailed] = useState(false);
    const initial = String(title || "A").trim().charAt(0).toUpperCase() || "A";

    return (
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-lg font-black text-gray-500">
            {!failed && image ? (
                <Image
                    src={image}
                    alt={title || "Partner"}
                    fill
                    className="object-contain p-1.5"
                    unoptimized
                    onError={() => setFailed(true)}
                />
            ) : (
                <span>{initial}</span>
            )}
        </div>
    );
};

const BrandShowcase = ({ galleryMedia, brandName }) => {
    const scrollRef = useRef(null);
    const canScroll = galleryMedia.length > 3;

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const amount = Math.round(scrollRef.current.clientWidth * 0.85);
        scrollRef.current.scrollBy({
            left: direction === "left" ? -amount : amount,
            behavior: "smooth",
        });
    };

    return (
        <section className="mb-12">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-950">Brand Showcase</h2>
                    <p className="mt-2 text-sm font-medium text-gray-500">Images and videos curated by the brand.</p>
                </div>
                {canScroll && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-[#e09a74] hover:text-[#e09a74]"
                            aria-label="Previous showcase media"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-[#e09a74] hover:text-[#e09a74]"
                            aria-label="Next showcase media"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            <div
                ref={scrollRef}
                className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
            >
                {galleryMedia.map((media, index) => (
                    <ShowcaseTile
                        key={index}
                        media={media}
                        brandName={brandName}
                        featured={index === 0}
                    />
                ))}
            </div>
        </section>
    );
};

const isVideoMedia = (media) => {
    const url = typeof media === "string" ? media : media?.secure_url || media?.url || media?.location || "";
    return /\.(mp4|webm|mov|avi)(\?|$)/i.test(url);
};

const ShowcaseTile = ({ media, brandName, featured }) => {
    const url = getImageUrl(media, "brands");
    const isVideo = isVideoMedia(media);

    return (
        <div className={`relative h-[260px] shrink-0 snap-start overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm sm:h-[320px] ${featured ? "w-[88%] sm:w-[560px] lg:w-[640px]" : "w-[82%] sm:w-[360px] lg:w-[400px]"}`}>
            {isVideo ? (
                <video src={url} className="h-full w-full object-cover" controls muted playsInline />
            ) : (
                <Image src={url || "/Icons/arcmatlogo.svg"} alt={`${brandName} showcase`} fill className="object-cover" unoptimized />
            )}
            {isVideo && (
                <span className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
                    Video
                </span>
            )}
        </div>
    );
};

export default BespokeBrandPage;
