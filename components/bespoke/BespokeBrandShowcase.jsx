"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import {
    ArrowDownToLine, ArrowRight, Bookmark, Check, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
    ExternalLink, Eye, FileText, Globe, Heart, Mail, MapPin, Play,
    Search, Send, Share2, ShieldCheck, Star, Upload, X, ImageIcon, Layers
} from "lucide-react";
import { useGetBrandById } from "@/hooks/useBrand";
import { useGetRetailerProducts } from "@/hooks/useProduct";
import { getBrandImageUrl, getImageUrl, getProductCategory, getProductName, getProductThumbnail } from "@/lib/productUtils";

const tabsLeft = [
    ["overview", "Overview"],
    ["products", "Products"],
    ["solutions", "Solutions"],
    ["collections", "Collections"],
];

const tabsRight = [
    ["catalogs", "Catalogs"],
    ["retailers", "Resellers"],
    ["news", "News"],
    ["videos", "Video"],
    ["badge", "Badge"],
    ["contact", "Info"],
];

const resolveUrl = (value, folder = "brands") => {
    if (!value) return null;
    if (typeof value === "string" && value.startsWith("http")) return value;
    return getImageUrl(value, folder) || value;
};

const defaultTheme = {
    name: "Bespoke",
    mode: "light",
    accent: "#333333",
    soft: "#f5f5f5",
    stone: "#888888",
};

const defaultHeroImage = "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2200&q=85";

const normalizedApiProduct = (item, index) => ({
    id: item?._id || item?.id || item?.override_id || `api-${index}`,
    name: getProductName(item),
    sku: item?.skucode || item?.sku || item?.productId?.sku || `ARC-${index + 1}`,
    category: getProductCategory(item),
    material: item?.material || item?.finish || item?.color || item?.productId?.material || "Architectural finish",
    image: getProductThumbnail(item),
    price: "Request info",
    raw: item,
});

const nestedValue = (item, key) => item?.[key] || item?.productId?.[key] || item?.raw?.[key] || item?.raw?.productId?.[key];

const objectId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return String(value._id || value.id || "");
};

const deriveSolutionsFromProducts = (products, brandId) => {
    const byThirdCategory = new Map();

    products.forEach((product) => {
        const source = product.raw || product;
        const thirdCategory = nestedValue(source, "subsubcategoryId");
        const thirdCategoryId = objectId(thirdCategory);
        if (!thirdCategoryId) return;

        const existing = byThirdCategory.get(thirdCategoryId);
        const title = typeof thirdCategory === "object" ? thirdCategory.name : product.category;
        const categoryImage = typeof thirdCategory === "object" ? getImageUrl(thirdCategory.image, "category") : null;

        byThirdCategory.set(thirdCategoryId, {
            id: thirdCategoryId,
            title: title || product.category || "Category",
            image: categoryImage || existing?.image || product.image,
            count: (existing?.count || 0) + 1,
            href: `/productlist?category=${thirdCategoryId}${brandId ? `&brands=${brandId}` : ""}`,
        });
    });

    return Array.from(byThirdCategory.values());
};

export default function BespokeBrandShowcase() {
    const { id } = useParams();
    const { data: brandData, isLoading: brandLoading } = useGetBrandById(id);
    const brand = brandData?.data;
    const { data: productsData, isLoading: productsLoading } = useGetRetailerProducts({ brand: id, limit: 100 });
    const [savedBrand, setSavedBrand] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [modal, setModal] = useState(null);
    const [loadingIntro, setLoadingIntro] = useState(true);

    const productPayload = productsData?.data?.data || productsData?.data || [];
    const template = useMemo(() => buildBrandPayload(brand, productPayload), [brand, productPayload]);
    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

    useEffect(() => {
        const timer = window.setTimeout(() => setLoadingIntro(false), 500);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible?.target?.id) setActiveTab(visible.target.id);
            },
            { rootMargin: "-15% 0px -80% 0px", threshold: [0, 0.2] }
        );
        [...tabsLeft, ...tabsRight].forEach(([key]) => {
            const node = document.getElementById(key);
            if (node) observer.observe(node);
        });
        return () => observer.disconnect();
    }, [loadingIntro]);

    if (brandLoading || loadingIntro) {
        return <ShowcaseSkeleton />;
    }

    return (
        <main className="min-h-screen bg-white text-[#333] font-sans antialiased">
            <motion.div className="fixed left-0 right-0 top-0 z-[100] h-[2px] origin-left bg-black" style={{ scaleX: progress }} />
            
            <HeroSection template={template} savedBrand={savedBrand} setSavedBrand={setSavedBrand} setModal={setModal} />
            <StickyTabs activeTab={activeTab} />

            <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 pb-20">
                <OverviewSection template={template} />
                <GallerySection items={template.gallery} brandName={template.hero.name} setModal={setModal} />
                <SolutionsSection items={template.solutions} brandName={template.hero.name} setModal={setModal} />
                <CollectionsSection items={template.collections} brandName={template.hero.name} setModal={setModal} />
                <ProductsSection products={template.products} brandName={template.hero.name} productsLoading={productsLoading} setModal={setModal} />
                <CatalogSection items={template.catalogs} brandName={template.hero.name} setModal={setModal} />
                <NewsSection items={template.news} brandName={template.hero.name} setModal={setModal} />
                <VideoSection items={template.videos} brandName={template.hero.name} setModal={setModal} />
                <PartnerSection items={template.partners} brandName={template.hero.name} setModal={setModal} />
                <ContactSection template={template} />
            </div>

            <PremiumFooter template={template} />

            <AnimatePresence>
                {modal && <DetailModal modal={modal} onClose={() => setModal(null)} />}
            </AnimatePresence>
        </main>
    );
}

function buildBrandPayload(brand, apiProducts = []) {
    const bespoke = brand?.bespokePage || {};
    const selectedProducts = (bespoke.selectedProductIds || [])
        .filter((item) => item && typeof item === "object")
        .map(normalizedApiProduct);
    const mergedProducts = selectedProducts.length ? selectedProducts : apiProducts.map(normalizedApiProduct).slice(0, 12);
    const heroImage = resolveUrl(bespoke.heroImage, "brands") || resolveUrl(brand?.banner || brand?.coverImage, "brand") || defaultHeroImage;
    const galleryMedia = [...(bespoke.galleryMedia || []), ...(bespoke.customImage ? [bespoke.customImage] : [])]
        .filter(Boolean)
        .map((media, index) => ({ id: `media-${index}`, category: "Brand", image: resolveUrl(media, "brands") }))
        .filter((media) => media.image);

    return {
        theme: { ...defaultTheme, ...(bespoke.theme || {}) },
        hero: {
            eyebrow: bespoke.headline || "Bespoke brand page",
            name: brand?.name || "Premium Brand",
            location: brand?.country || "Cerreto Guidi / Italy",
            website: brand?.website || "",
            bannerType: "image",
            banner: heroImage || defaultHeroImage,
            logo: getBrandImageUrl(brand?.logo),
            tags: bespoke.tags?.length ? bespoke.tags : [],
        },
        overview: {
            title: bespoke.headline || `The ${brand?.name || "brand"} story`,
            body: bespoke.bio || brand?.description || "The history begins with craftsmen specializing in the processing of premium materials for furniture. Within a few years, production expanded with mirrors, light fixtures and accessories. The success achieved necessitates the expansion of the company.",
            extended: "Driven by material excellence, this showcase provides immediate access to catalogs, verified partners, and bespoke solutions. The brand has established itself globally with a strong commitment to architectural integration and innovative design.",
            stats: [
                { label: "Products", value: String(mergedProducts.length) },
                { label: "Retailers", value: String((bespoke.selectedRetailerIds || []).length) },
                { label: "Contractors", value: String((bespoke.selectedContractorIds || []).length) },
            ],
        },
        solutions: normalizeMediaRows(bespoke.solutions),
        collections: normalizeMediaRows(bespoke.collections),
        products: mergedProducts,
        catalogs: normalizeMediaRows(bespoke.catalogs),
        videos: normalizeMediaRows(bespoke.videos),
        partners: [
            ...(bespoke.selectedRetailerIds || []).map((item, index) => ({
                id: item?._id || `retailer-${index}`,
                type: "retailer",
                name: item?.retailerProfile?.companyName || item?.name || "Retail Partner",
                rating: 4.8,
                location: item?.retailerProfile?.cityRegion || "India",
                category: "Retailer",
                verified: true,
                image: getImageUrl(item?.profile, "userprofile") || "/Icons/arcmatlogo.svg",
            })),
            ...(bespoke.selectedContractorIds || []).map((item, index) => ({
                id: item?._id || `contractor-${index}`,
                type: "contractor",
                name: item?.businessName || "Contractor",
                rating: 4.9,
                location: item?.location?.city || "India",
                category: "Contractor",
                verified: true,
                image: getImageUrl(item?.profileImage, "contractor") || "/Icons/arcmatlogo.svg",
            })),
        ],
        reviews: (bespoke.reviews || []).filter((review) => review?.name || review?.comment || review?.text),
        gallery: galleryMedia,
        news: normalizeMediaRows(bespoke.news),
        contact: {
            email: bespoke.contact?.email || brand?.userId?.email || "contact@example.com",
            phone: bespoke.contact?.phone || "",
            address: bespoke.contact?.address || brand?.shippingAddress?.city || brand?.country || "Global Headquarters",
            socials: bespoke.contact?.socials || [],
        },
    };
}

function normalizeMediaRows(rows = []) {
    return rows
        .filter((item) => item?.title || item?.image || item?.cover || item?.poster)
        .map((item, index) => ({
            ...item,
            id: item?._id || item?.id || `row-${index}`,
            image: resolveUrl(item.image, "brands") || item.image,
            cover: resolveUrl(item.cover, "brands") || item.cover,
            poster: resolveUrl(item.poster, "brands") || item.poster,
        }));
}

function HeroSection({ template, savedBrand, setSavedBrand, setModal }) {
    const shareBrand = async () => {
        const shareData = { title: template.hero.name, text: template.overview.body, url: window.location.href };
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard?.writeText(window.location.href);
            setModal({ type: "notice", title: "Link copied", text: "The brand page URL is ready to share." });
        }
    };

    return (
        <section className="relative w-full">
            <div className="relative h-[250px] sm:h-[350px] lg:h-[450px] w-full bg-[#f4f4f4]">
                {template.hero.bannerType === "video" ? (
                    <video src={template.hero.banner} className="h-full w-full object-cover" autoPlay muted loop playsInline />
                ) : (
                    <Image src={template.hero.banner} alt={`${template.hero.name} banner`} fill priority unoptimized className="object-cover" />
                )}
            </div>
            
            <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between relative -mt-16 sm:-mt-20 z-10 pb-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 w-full">
                        <div className="relative h-28 w-28 sm:h-36 sm:w-36 bg-white border border-gray-200 shadow-sm flex items-center justify-center p-3 rounded-md overflow-hidden shrink-0">
                            {template.hero.logo ? (
                                <Image src={template.hero.logo} alt="Logo" fill unoptimized className="object-contain p-4" />
                            ) : (
                                <span className="font-bold text-3xl tracking-tighter text-gray-400">{template.hero.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="flex-1 pb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">{template.hero.name}</h1>
                            <p className="mt-1 flex items-center gap-1 text-[11px] uppercase tracking-wider text-gray-500 font-semibold"><MapPin className="h-3 w-3" /> {template.hero.location}</p>
                        </div>
                        <div className="flex items-center gap-2 pb-2 mt-4 sm:mt-0 w-full sm:w-auto">
                            <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} className="flex h-10 items-center justify-center gap-2 bg-[#2c2c2c] hover:bg-black text-white px-5 rounded-[4px] text-[11px] font-bold uppercase tracking-widest transition-colors w-full sm:w-auto">
                                <Send className="h-3 w-3" /> Contact
                            </button>
                            <a href={template.hero.website} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 px-4 rounded-[4px] text-[11px] font-bold uppercase tracking-widest transition-colors">
                                <ExternalLink className="h-3 w-3" /> Website
                            </a>
                            <button onClick={shareBrand} className="flex h-10 w-10 items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 rounded-[4px] transition-colors">
                                <Share2 className="h-4 w-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function StickyTabs({ activeTab }) {
    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
            <div className="mx-auto flex flex-col sm:flex-row justify-between max-w-[1240px] px-4 sm:px-6 lg:px-8">
                <div className="flex overflow-x-auto no-scrollbar sm:gap-6 gap-4">
                    {tabsLeft.map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => document.getElementById(key)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                            className={`relative shrink-0 py-4 text-[12px] font-bold tracking-wide transition-colors ${activeTab === key ? "text-black" : "text-gray-500 hover:text-black"}`}
                        >
                            {label}
                            {activeTab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />}
                        </button>
                    ))}
                </div>
                <div className="hidden sm:flex overflow-x-auto no-scrollbar gap-6">
                    {tabsRight.map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => document.getElementById(key)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                            className={`relative shrink-0 py-4 text-[11px] font-bold tracking-wide uppercase transition-colors ${activeTab === key ? "text-black" : "text-gray-500 hover:text-black"}`}
                        >
                            {label}
                            {activeTab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}

function OverviewSection({ template }) {
    const [open, setOpen] = useState(false);
    return (
        <section id="overview" className="scroll-mt-32 pt-8 pb-12 border-b border-gray-200">
            <div className="max-w-[1240px]">
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-gray-800">
                    {template.overview.body}
                    {!open && (
                        <button onClick={() => setOpen(true)} className="ml-2 font-bold text-black hover:underline">
                            ... more
                        </button>
                    )}
                </p>
                {open && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
                        <p className="text-[13px] sm:text-[14px] leading-relaxed text-gray-800">
                            {template.overview.extended}
                        </p>
                        <button onClick={() => setOpen(false)} className="mt-2 text-[12px] font-bold text-gray-500 hover:text-black uppercase tracking-wider">
                            Show less
                        </button>
                    </motion.div>
                )}
            </div>
        </section>
    );
}

function SolutionsSection({ items, brandName, setModal }) {
    if (items.length === 0) return null;
    return (
        <Section id="solutions" title={`Solutions ${brandName}`} action="ALL SOLUTIONS">
            <HorizontalRail>
                {items.map((item) => (
                    <button key={item.id} onClick={() => setModal({ type: "solution", ...item })} className="group flex flex-col h-[280px] w-[260px] shrink-0 bg-white border border-gray-200 rounded-sm overflow-hidden text-center hover:border-gray-400 transition-colors">
                        <div className="relative h-[190px] w-full bg-[#f4f4f4] overflow-hidden">
                            {item.image && <Image src={item.image} alt={item.title} fill unoptimized className="object-cover" />}
                        </div>
                        <div className="flex items-center justify-center h-[90px] px-4">
                            <p className="text-[13px] font-semibold text-gray-800">{item.title}</p>
                        </div>
                    </button>
                ))}
            </HorizontalRail>
        </Section>
    );
}

function CollectionsSection({ items, brandName, setModal }) {
    if (items.length === 0) return null;
    return (
        <Section id="collections" title={`Collections ${brandName}`} action="ALL COLLECTIONS">
            <HorizontalRail>
                {items.map((item) => (
                    <button key={item.id} onClick={() => setModal({ type: "collection", ...item })} className="group flex flex-col h-[280px] w-[260px] shrink-0 bg-white border border-gray-200 rounded-sm overflow-hidden text-center hover:border-gray-400 transition-colors">
                        <div className="relative h-[190px] w-full bg-[#f9f9f9] overflow-hidden p-2">
                            {item.image && <Image src={item.image} alt={item.title} fill unoptimized className="object-cover" />}
                        </div>
                        <div className="flex items-center justify-center h-[90px] px-4">
                            <p className="text-[13px] font-semibold text-gray-800">{item.title}</p>
                        </div>
                    </button>
                ))}
            </HorizontalRail>
        </Section>
    );
}

function ProductsSection({ products, brandName, productsLoading, setModal }) {
    return (
        <Section id="products" title={`Products ${brandName}`} action="VIEW ALL PRODUCTS">
            {productsLoading ? (
                <div className="flex gap-4 overflow-x-hidden">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[360px] w-[280px] animate-pulse bg-gray-100 rounded-sm" />)}</div>
            ) : products.length === 0 ? (
                <EmptyNote title="No products found" />
            ) : (
                <HorizontalRail>
                    {products.map((item) => (
                        <div key={item.id} className="group relative flex flex-col w-[280px] shrink-0">
                            <div className="relative h-[280px] w-full bg-[#f2f2f2] rounded-sm overflow-hidden flex items-center justify-center p-6 cursor-pointer" onClick={() => setModal({ type: "product", ...item })}>
                                <Image src={item.image} alt={item.name} fill unoptimized className="object-cover mix-blend-multiply" />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="pt-4 pb-2">
                                <p className="text-[11px] font-bold text-gray-900 mb-1">{brandName}</p>
                                <h3 className="text-[13px] text-gray-700 leading-snug line-clamp-2 min-h-[38px]">{item.name} - {item.material} {item.category}</h3>
                                <button onClick={() => setModal({ type: "inquiry", ...item })} className="mt-3 text-[12px] font-semibold text-[#e13c3c] hover:underline">
                                    Request info
                                </button>
                            </div>
                        </div>
                    ))}
                </HorizontalRail>
            )}
        </Section>
    );
}

function CatalogSection({ items, brandName, setModal }) {
    if (items.length === 0) return null;
    return (
        <Section id="catalogs" title={`Catalogs ${brandName}`} action="VIEW ALL">
            <HorizontalRail>
                {items.map((item) => (
                    <button key={item.id} onClick={() => setModal({ type: "catalog", ...item })} className="group relative w-[220px] shrink-0 text-left">
                        <div className="relative h-[310px] w-full bg-black rounded-sm shadow-md overflow-hidden border border-gray-200">
                            {item.cover && <Image src={item.cover} alt={item.title} fill unoptimized className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />}
                            <div className="absolute top-4 right-0 bg-[#f05050] text-white px-3 py-1 text-[10px] font-bold uppercase rounded-l-sm shadow-sm">PDF</div>
                        </div>
                        <div className="mt-4">
                            <p className="text-[12px] font-medium text-gray-800 line-clamp-2">{item.title}</p>
                            <p className="mt-1 text-[11px] text-gray-500">{item.year || "Catalog"} ({item.pages || "Multiple"} pages)</p>
                        </div>
                    </button>
                ))}
            </HorizontalRail>
        </Section>
    );
}

function NewsSection({ items, brandName, setModal }) {
    if (items.length === 0) return null;
    return (
        <Section id="news" title={`News ${brandName}`} action="SEE ALL NEWS">
            <div className="grid gap-6 md:grid-cols-3">
                {items.map((item) => (
                    <button key={item.id} onClick={() => setModal({ type: "article", ...item })} className="group text-left flex flex-col">
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 rounded-sm">
                            {item.image && <Image src={item.image} alt={item.title} fill unoptimized className="object-cover" />}
                            <div className="absolute bottom-2 left-2 bg-[#333] text-white px-2 py-1 text-[10px] font-bold rounded-sm flex items-center gap-1.5">
                                <ImageIcon className="h-3 w-3" /> {item.readTime ? parseInt(item.readTime) : "4"}
                            </div>
                        </div>
                        <div className="mt-4 flex-1">
                            <h3 className="text-[16px] font-serif leading-snug text-[#222] group-hover:text-blue-600 transition-colors">{item.title}</h3>
                            <p className="mt-2 text-[13px] leading-relaxed text-gray-500 line-clamp-3">{item.excerpt}</p>
                        </div>
                    </button>
                ))}
            </div>
        </Section>
    );
}

function VideoSection({ items, brandName, setModal }) {
    if (items.length === 0) return null;
    return (
        <Section id="videos" title={`Video ${brandName}`}>
            <HorizontalRail>
                {items.map((item) => (
                    <button key={item.id} onClick={() => setModal({ type: "video", ...item })} className="group flex flex-col w-[300px] shrink-0 border border-gray-200 rounded-sm overflow-hidden bg-white text-left">
                        <div className="relative h-[170px] w-full bg-black overflow-hidden">
                            {item.poster && <Image src={item.poster} alt={item.title} fill unoptimized className="object-cover opacity-80" />}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white text-white bg-black/30 backdrop-blur-sm group-hover:scale-110 transition-transform">
                                    <Play className="h-5 w-5 fill-current ml-1" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 h-[90px]">
                            <p className="text-[11px] font-medium leading-relaxed text-gray-600 line-clamp-3">{item.title}</p>
                        </div>
                    </button>
                ))}
            </HorizontalRail>
        </Section>
    );
}

function GallerySection({ items, brandName, setModal }) {
    if (items.length === 0) return null;

    return (
        <Section id="gallery" title={`Gallery ${brandName}`} action="VIEW ALL">
            <HorizontalRail>
                {items.map((item) => (
                    <button key={item.id} onClick={() => setModal({ type: "image", ...item })} className="block w-[320px] sm:w-[500px] h-[240px] sm:h-[350px] shrink-0 overflow-hidden bg-gray-100 rounded-sm relative border border-gray-200 hover:shadow-md transition-shadow group">
                        <Image src={item.image} alt={item.category || "Gallery"} fill unoptimized loading="lazy" className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </button>
                ))}
            </HorizontalRail>
        </Section>
    );
}

function PartnerSection({ items, brandName, setModal }) {
    if (items.length === 0) return null;
    return (
        <Section id="retailers" title={`Retailers ${brandName}`} action="VIEW MAP">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-sm p-4 flex gap-4 bg-white hover:border-gray-400 transition-colors">
                        <div className="relative h-16 w-16 bg-gray-50 border border-gray-100 rounded-sm shrink-0 overflow-hidden">
                            <Image src={item.image} alt={item.name} fill unoptimized className="object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[13px] font-bold text-gray-900 truncate">{item.name}</h3>
                            <p className="text-[12px] text-gray-500 mt-1">{item.location}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] uppercase font-bold text-gray-400">{item.category}</span>
                                {item.verified && <ShieldCheck className="h-3 w-3 text-green-600" />}
                            </div>
                            <button onClick={() => setModal({ type: "partner", ...item })} className="mt-3 text-[11px] font-bold text-blue-600 uppercase hover:underline">Contact</button>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
}

function ContactSection({ template }) {
    const [submitted, setSubmitted] = useState(false);
    const submit = (event) => {
        event.preventDefault();
        setSubmitted(true);
    };

    return (
        <section id="contact" className="mt-16 pt-16 border-t border-gray-200">
            <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-serif text-gray-900">Contact {template.hero.name}</h2>
                <p className="mt-2 text-sm text-gray-500">For inquiries, catalogs, and customized solutions.</p>
                
                <div className="mt-8">
                    {submitted ? (
                        <div className="p-8 bg-green-50 border border-green-200 rounded-sm text-green-800">
                            <Check className="h-8 w-8 mx-auto mb-2" />
                            <h3 className="font-bold text-lg">Inquiry Sent</h3>
                            <p className="text-sm mt-1">The brand team will contact you shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="grid gap-4 text-left">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <input required placeholder="Name" className="h-12 border border-gray-300 rounded-sm px-4 text-sm focus:border-black outline-none" />
                                <input required type="email" placeholder="Email" className="h-12 border border-gray-300 rounded-sm px-4 text-sm focus:border-black outline-none" />
                            </div>
                            <textarea required placeholder="Message" className="h-32 border border-gray-300 rounded-sm p-4 text-sm focus:border-black outline-none resize-none" />
                            <button className="h-12 bg-[#2c2c2c] text-white text-[11px] font-bold uppercase tracking-wider rounded-sm hover:bg-black transition-colors">
                                Send Message
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}

function PremiumFooter({ template }) {
    return (
        <footer className="border-t border-gray-200 bg-gray-50 py-12">
            <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{template.hero.name}</h2>
                        <p className="text-xs text-gray-500 mt-1">Powered by ArcMat</p>
                    </div>
                    <div className="flex gap-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <span className="hover:text-black cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-black cursor-pointer">Terms of Service</span>
                        <span className="hover:text-black cursor-pointer">Cookies</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ---------------- Helper Components ----------------

function Section({ id, title, action, children }) {
    return (
        <section id={id} className="scroll-mt-32 pt-16">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-[20px] font-medium text-[#333] font-serif">{title}</h2>
                {action && (
                    <button className="h-9 px-4 border border-gray-300 bg-white text-[10px] font-bold text-gray-600 uppercase tracking-wider rounded-[2px] hover:bg-gray-50 transition-colors">
                        {action}
                    </button>
                )}
            </div>
            {children}
        </section>
    );
}

function EmptyNote({ title }) {
    return (
        <div className="py-12 border border-dashed border-gray-300 text-center rounded-sm bg-gray-50">
            <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
    );
}

function HorizontalRail({ children }) {
    const ref = useRef(null);

    const move = (direction) => {
        ref.current?.scrollBy({ left: direction * Math.round(ref.current.clientWidth * 0.8), behavior: "smooth" });
    };

    return (
        <div className="relative group/rail flex items-center -mx-4 sm:-mx-8">
            <button onClick={() => move(-1)} className="shrink-0 h-10 w-10 flex items-center justify-center bg-white text-gray-400 hover:text-black z-10 hidden sm:flex"><ChevronLeft className="h-6 w-6" /></button>
            <div ref={ref} className="no-scrollbar flex overflow-x-auto gap-4 py-2 px-4 sm:px-0 scroll-smooth flex-1">
                {children}
            </div>
            <button onClick={() => move(1)} className="shrink-0 h-10 w-10 flex items-center justify-center bg-white text-gray-400 hover:text-black z-10 hidden sm:flex"><ChevronRight className="h-6 w-6" /></button>
        </div>
    );
}

function DetailModal({ modal, onClose }) {
    const isVideo = modal.type === "video";
    const image = modal.image || modal.cover || modal.poster;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
            <motion.div initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-sm bg-white text-[#333] shadow-2xl flex flex-col">
                <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{modal.type}</p>
                    <button onClick={onClose} className="text-gray-500 hover:text-black"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 sm:p-10 flex-1">
                    {isVideo ? (
                        <div className="aspect-video w-full bg-black mb-8 rounded-sm overflow-hidden">
                            <iframe title={modal.title} src={`https://www.youtube.com/embed/${modal.videoId}?autoplay=1`} className="h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                        </div>
                    ) : image ? (
                        <div className="relative h-[300px] sm:h-[400px] w-full bg-gray-50 mb-8 rounded-sm overflow-hidden border border-gray-200">
                            <Image src={image} alt={modal.title || "Detail"} fill unoptimized className="object-contain" />
                        </div>
                    ) : null}
                    <h2 className="text-2xl sm:text-3xl font-serif font-medium">{modal.title || modal.name}</h2>
                    <p className="mt-4 text-[14px] leading-relaxed text-gray-600">{modal.text || modal.excerpt || modal.material || "Additional product details and specifications."}</p>
                </div>
            </motion.div>
        </div>
    );
}

function ShowcaseSkeleton() {
    return (
        <main className="min-h-screen bg-white">
            <div className="h-[350px] w-full animate-pulse bg-gray-100" />
            <div className="mx-auto max-w-[1240px] px-8 mt-10">
                <div className="h-10 w-full animate-pulse bg-gray-100 mb-8" />
                <div className="flex gap-4"><div className="h-64 w-[260px] animate-pulse bg-gray-100" /><div className="h-64 w-[260px] animate-pulse bg-gray-100" /></div>
            </div>
        </main>
    );
}
