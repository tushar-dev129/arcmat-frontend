"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import {
    ArrowDownToLine, ArrowRight, Bookmark, Check, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
    ExternalLink, Eye, FileText, Globe, Heart, ImageIcon, Instagram, Layers, Linkedin, Mail, MapPin, Phone, Play,
    Search, Send, Share2, ShieldCheck, Star, Upload, X, Youtube, Lock
} from "lucide-react";
import { useGetBrandById } from "@/hooks/useBrand";
import { useGetProducts } from "@/hooks/useProduct";
import Container from "@/components/ui/Container";
import { getBrandImageUrl, getImageUrl, getProductCategory, getProductName, getProductThumbnail } from "@/lib/productUtils";
import { toast } from "sonner";
import { brandService } from "@/services/brandService";
import { useAuth } from "@/hooks/useAuth";

const tabsLeft = [
    ["overview", "Overview"],
    ["projects", "Projects"],
    ["Categories", "Categories"],
    ["collections", "Collections"],
    ["products", "Products"],
];

const tabsRight = [
    ["catalogs", "Catalogs"],

    ["news", "News"],
    ["videos", "Video"],
    ["retailers", "Resellers"],
    ["contact", "Info"],
];

const resolveUrl = (value, folder = "brands") => {
    if (!value) return null;
    if (typeof value === "string" && value.startsWith("http")) return value;
    return getImageUrl(value, folder) || value;
};

const compact = (items) => [...new Set(items.filter(Boolean))];

const resolveStoredMedia = (value, folders = []) => {
    if (!value) return [];
    if (typeof value === "object") {
        const direct = value.secure_url || value.url || value.location;
        if (direct) return [direct];
        if (value.public_id) return resolveStoredMedia(value.public_id, folders);
    }
    if (typeof value !== "string") return [];

    const raw = value.trim();
    if (!raw) return [];
    if (/^(https?:|data:|blob:|\/)/i.test(raw)) return [raw];

    const clean = raw.replace(/^\/+/, "");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const s3Base = process.env.NEXT_PUBLIC_S3_BASE_URL || "https://arcmatv2.s3.ap-south-1.amazonaws.com";

    return compact([
        `${s3Base}/${clean}`,
        ...folders.map((folder) => getImageUrl(clean, folder)),
        ...folders.map((folder) => `${apiUrl}/public/uploads/${folder}/${clean}`),
        getImageUrl(clean),
    ]);
};

const resolvePartnerImages = (item, type) => {
    if (type === "contractor") {
        return resolveStoredMedia(item?.profileImage || item?.logo || item?.userId?.profile, ["contractors", "contractor", "userprofile", "profile"]);
    }
    return resolveStoredMedia(item?.profile || item?.retailerProfile?.profile || item?.retailerProfile?.logo || item?.logo, ["userprofile", "profile", "retailer", "retailers"]);
};

const defaultTheme = {
    name: "Bespoke",
    mode: "light",
    color: "#E6AE90",
    accent: "#333333",
    soft: "#f5f5f5",
    stone: "#888888",
};

const defaultHeroImage = "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2200&q=85";

const socialIcons = {
    instagram: Instagram,
    linkedin: Linkedin,
    linkdin: Linkedin,
    youtube: Youtube,
};

const normalizeExternalUrl = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
};

const getHostnameLabel = (value) => {
    try {
        return new URL(normalizeExternalUrl(value)).hostname.replace(/^www\./, "");
    } catch {
        return value;
    }
};

const inferSocialKey = (label, href = "") => {
    const haystack = `${label || ""} ${href || ""}`.toLowerCase();
    if (haystack.includes("instagram")) return "instagram";
    if (haystack.includes("linkedin") || haystack.includes("linkdin")) return "linkedin";
    if (haystack.includes("youtube") || haystack.includes("youtu.be")) return "youtube";
    return String(label || "").toLowerCase();
};

const parseSocialLink = (social) => {
    const raw = String(social || "").trim();
    const match = raw.match(/^([^:-]+?)\s*[-:]\s*(https?:\/\/.+|www\..+|[\w.-]+\.\w{2,}.+)$/i);
    if (match) {
        const label = match[1].trim();
        const href = normalizeExternalUrl(match[2]);
        return {
            key: inferSocialKey(label, href),
            label,
            href,
        };
    }
    if (/^(https?:\/\/|www\.|[\w.-]+\.\w{2,})/i.test(raw)) {
        const href = normalizeExternalUrl(raw);
        const label = getHostnameLabel(raw);
        return { key: inferSocialKey(label, href), label, href };
    }
    return { key: inferSocialKey(raw), label: raw, href: "" };
};

const format10DigitNumber = (num) => {
    if (!num) return "";
    const cleaned = String(num).replace(/\D/g, "");
    return cleaned.slice(-10);
};

const normalizedApiProduct = (item, index) => ({
    id: item?._id || item?.id || item?.override_id || `api-${index}`,
    name: getProductName(item),
    sku: item?.skucode || item?.sku || item?.productId?.sku || `ARC-${index + 1}`,
    category: getProductCategory(item),
    material: item?.material || item?.finish || item?.color || item?.productId?.material,
    image: getProductThumbnail(item),
    price: "Request info",
    createdAt: item?.createdAt || item?.productId?.createdAt || item?.updatedAt || item?.productId?.updatedAt || "",
    raw: item,
});

const nestedValue = (item, key) => item?.[key] || item?.productId?.[key] || item?.raw?.[key] || item?.raw?.productId?.[key];

const objectId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return String(value._id || value.id || "");
};

const deriveSolutionsFromProducts = (products, brandId) => {
    const bySubCategory = new Map();

    products.forEach((product) => {
        const source = product.raw || product;
        const subCategory = nestedValue(source, "subcategoryId");
        const subCategoryId = objectId(subCategory);
        if (!subCategoryId) return;

        const existing = bySubCategory.get(subCategoryId);
        const title = typeof subCategory === "object" ? subCategory.name : product.category;
        const categoryImage = typeof subCategory === "object" ? getImageUrl(subCategory.image, "category") : null;

        bySubCategory.set(subCategoryId, {
            id: subCategoryId,
            title: title || product.category || "Category",
            image: categoryImage || existing?.image || product.image,
            count: (existing?.count || 0) + 1,
            href: `/productlist?category=${subCategoryId}${brandId ? `&brands=${brandId}` : ""}`,
        });
    });

    return Array.from(bySubCategory.values());
};

const getVideoEmbedUrl = (item) => {
    const rawValue = String(item?.videoId || item?.url || "").trim();
    if (!rawValue) return "";

    try {
        const url = rawValue.startsWith("http") ? new URL(rawValue) : null;
        if (url) {
            const host = url.hostname.replace(/^www\./, "");
            if (host.includes("youtube.com")) {
                const id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop();
                return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : "";
            }
            if (host.includes("youtu.be")) {
                const id = url.pathname.split("/").filter(Boolean)[0];
                return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : "";
            }
            if (host.includes("vimeo.com")) {
                const id = url.pathname.split("/").filter(Boolean).pop();
                return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : "";
            }
            return rawValue;
        }
    } catch {
        // Fall through to treating it as an ID.
    }

    return `https://www.youtube.com/embed/${rawValue}?autoplay=1`;
};

const normalizeCollections = (collections = []) => normalizeMediaRows(collections).map((collection) => ({
    ...collection,
    description: collection.description || "",
    products: (collection.productIds || [])
        .filter((item) => item && typeof item === "object")
        .map(normalizedApiProduct),
}));

export default function BespokeBrandShowcase() {
    const { id } = useParams();
    const { data: brandData, isLoading: brandLoading } = useGetBrandById(id);
    const brand = brandData?.data;
    const { data: productsData, isLoading: productsLoading } = useGetProducts({ brandId: id, limit: 100, onlyRetailerProducts: 'true' });
    const [savedBrand, setSavedBrand] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [modal, setModal] = useState(null);
    const [loadingIntro, setLoadingIntro] = useState(true);
    const [showTopBtn, setShowTopBtn] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShowTopBtn(window.scrollY > 400);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const productPayload = productsData?.data?.data || productsData?.data || [];
    const template = useMemo(() => buildBrandPayload(brand, productPayload), [brand, productPayload]);
    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

    const visibleTabsLeft = useMemo(() => tabsLeft.filter(([key]) => {
        if (key === "projects") return template.projects?.length > 0;
        if (key === "products") return template.products?.length > 0;
        if (key === "Categories") return template.solutions?.length > 0;
        if (key === "collections") return template.collections?.length > 0;
        return true;
    }), [template]);

    const visibleTabsRight = useMemo(() => tabsRight.filter(([key]) => {
        if (key === "catalogs") return template.catalogs?.length > 0;
        if (key === "retailers") return template.partners?.length > 0;
        if (key === "news") return template.news?.length > 0;
        if (key === "videos") return template.videos?.length > 0;
        return true;
    }), [template]);

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
            { rootMargin: "-120px 0px -40% 0px", threshold: 0 }
        );
        [...visibleTabsLeft, ...visibleTabsRight].forEach(([key]) => {
            const node = document.getElementById(key);
            if (node) observer.observe(node);
        });
        return () => observer.disconnect();
    }, [loadingIntro, visibleTabsLeft, visibleTabsRight]);

    if (brandLoading || loadingIntro) {
        return <ShowcaseSkeleton />;
    }

    return (
        <main className="min-h-screen bg-white text-[#333] font-sans antialiased" style={{ "--brand-color": template.theme.color || "#E6AE90" }}>
            <motion.div className="fixed left-0 right-0 top-0 z-[100] h-[2px] origin-left bg-[var(--brand-color)]" style={{ scaleX: progress }} />

            {/* Premium Breadcrumb Header */}
            <div className="bg-white border-b border-gray-100/80 sticky top-0 z-[10]">
                <Container className="py-3.5">
                    <nav className="flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        <span className="h-3 w-[1px] bg-gray-200 mx-1" />
                        <Link href="/bespoke" className="flex items-center gap-1.5 hover:text-[var(--brand-color)] transition-colors group">
                            <ChevronLeft className="h-3.5 w-3.5 -ml-1 transition-transform group-hover:-translate-x-0.5" />
                            Bespoke Brands
                        </Link>
                        <span className="h-3 w-[1px] bg-gray-200 mx-1" />
                        <span className="text-gray-900 truncate max-w-[200px]">{template.hero.name}</span>
                    </nav>
                </Container>
            </div>

            <HeroSection template={template} savedBrand={savedBrand} setSavedBrand={setSavedBrand} setModal={setModal} />
            <StickyTabs activeTab={activeTab} setActiveTab={setActiveTab} tabsLeft={visibleTabsLeft} tabsRight={visibleTabsRight} />

            <Container className="pb-20">
                <OverviewSection template={template} />
                <ProjectShowcaseSection items={template.projects} brandName={template.hero.name} setModal={setModal} />
                <GallerySection items={template.gallery} brandName={template.hero.name} setModal={setModal} />
                <SolutionsSection items={template.solutions} brandName={template.hero.name} setModal={setModal} />
                <CollectionsSection items={template.collections} brandName={template.hero.name} setModal={setModal} />
                <ProductsSection products={template.products} brandName={template.hero.name} brandId={template.hero.brandId} productsLoading={productsLoading} setModal={setModal} />
                <CatalogSection items={template.catalogs} brandName={template.hero.name} setModal={setModal} />
                <NewsSection items={template.news} brandName={template.hero.name} setModal={setModal} />
                <VideoSection items={template.videos} brandName={template.hero.name} setModal={setModal} />
                <PartnerSection items={template.partners} brandName={template.hero.name} setModal={setModal} />
            </Container>

            <ContactSection template={template} />

            <AnimatePresence>
                {modal && <DetailModal key="detail-modal" modal={modal} onClose={() => setModal(null)} />}
                {showTopBtn && (
                    <motion.button
                        key="scroll-top-btn"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-color)] text-white shadow-lg transition-transform hover:scale-105"
                    >
                        <ChevronUp className="h-5 w-5" />
                    </motion.button>
                )}
            </AnimatePresence>
        </main>
    );
}

function buildBrandPayload(brand, apiProducts = []) {
    const bespoke = brand?.bespokePage || {};
    const allNormalizedProducts = apiProducts.map(normalizedApiProduct);
    const selectedProducts = (bespoke.selectedProductIds || [])
        .filter((item) => item && typeof item === "object")
        .map(normalizedApiProduct);

    // Diverse selection by category up to 12 products
    const selectedIds = new Set(selectedProducts.map(p => p.id));
    const result = [...selectedProducts];

    const remainingProducts = allNormalizedProducts.filter(p => !selectedIds.has(p.id));
    remainingProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const byCategory = new Map();
    remainingProducts.forEach(p => {
        const cat = p.category || "Uncategorized";
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat).push(p);
    });

    const keys = Array.from(byCategory.keys());
    let i = 0;
    while (result.length < 12 && keys.length > 0) {
        const key = keys[i % keys.length];
        const arr = byCategory.get(key);
        if (arr.length > 0) {
            result.push(arr.shift());
            i++;
        } else {
            keys.splice(i % keys.length, 1);
        }
    }
    const mergedProducts = result;
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
            brandId: brand?._id || brand?.id || "",
            location: bespoke.contact?.address || [brand?.shippingAddress?.city, brand?.shippingAddress?.state, brand?.country].filter(Boolean).join(", ") || "Global Headquarters",
            website: brand?.website || "",
            bannerType: "image",
            banner: heroImage || defaultHeroImage,
            logo: getBrandImageUrl(brand?.logo),
            tags: bespoke.tags?.length ? bespoke.tags : [],
        },
        overview: {
            title: bespoke.headline || `The ${brand?.name || "brand"} story`,
            body: bespoke.bio || brand?.description || "The history begins with craftsmen specializing in the processing of premium materials for furniture. Within a few years, production expanded with mirrors, light fixtures and accessories. The success achieved necessitates the expansion of the company.",
            extended: "",
            stats: [
                { label: "Products", value: String(allNormalizedProducts.length) },
                { label: "Retailers", value: String((bespoke.selectedRetailerIds || []).length) },
                { label: "Contractors", value: String((bespoke.selectedContractorIds || []).length) },
            ],
        },
        solutions: deriveSolutionsFromProducts(allNormalizedProducts, brand?._id || brand?.id),
        collections: normalizeCollections(bespoke.collections),
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
                images: resolvePartnerImages(item, "retailer"),
            })),
            ...(bespoke.selectedContractorIds || []).map((item, index) => ({
                id: item?._id || `contractor-${index}`,
                type: "contractor",
                name: item?.businessName || "Contractor",
                rating: 4.9,
                location: item?.location?.city || "India",
                category: "Contractor",
                verified: true,
                images: resolvePartnerImages(item, "contractor"),
                slug: item?.slug,
                href: item?.slug ? `/contractors/${item.slug}` : null,
            })),
        ],
        projects: (bespoke.projects || []).filter(p => p.title || p.mainImage).map((item, index) => ({
            ...item,
            id: `project-${index}`,
            mainImage: resolveUrl(item.mainImage, "brands"),
            gallery: (item.gallery || []).map(g => resolveUrl(g, "brands")).filter(Boolean)
        })),
        gallery: galleryMedia,
        news: normalizeMediaRows(bespoke.news),
        contact: {
            email: bespoke.contact?.email || brand?.userId?.email || "contact@example.com",
            phone: bespoke.contact?.phone || brand?.contact?.phone || brand?.userId?.mobile || "",
            whatsapp: bespoke.contact?.whatsapp || brand?.contact?.whatsapp || brand?.contact?.phone || brand?.userId?.mobile || "",
            website: brand?.website || bespoke.contact?.website || "",
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
            file: resolveUrl(item.file, "brands") || item.file,
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

            <Container>
                <div className="relative z-20 pb-8 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-8 w-full">
                        {/* Logo with negative margin overlap */}
                        <div className="relative -mt-16 sm:-mt-24 h-32 w-32 sm:h-44 sm:w-44 bg-white border border-gray-200 shadow-xl flex items-center justify-center p-3 rounded-3xl overflow-hidden shrink-0">
                            {template.hero.logo ? (
                                <Image src={template.hero.logo} alt="Logo" fill unoptimized className="object-contain p-6" />
                            ) : (
                                <span className="font-bold text-4xl tracking-tighter text-gray-400">{template.hero.name.charAt(0)}</span>
                            )}
                        </div>

                        {/* Name and Location with clear spacing */}
                        <div className="flex-1 pt-4 sm:pt-0">
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-700">{template.hero.name}</h1>
                            <p className="mt-1 flex items-center gap-2 text-[13px]  text-gray-500 font-semibold"><MapPin className="h-4 w-4 text-[var(--brand-color)]" /> {template.hero.location}</p>
                        </div>
                        <div className="flex items-center gap-2 pb-2 mt-4 sm:mt-0 w-full sm:w-auto">
                            <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} className="flex h-10 items-center justify-center gap-2 bg-[var(--brand-color)] hover:opacity-90 text-white px-5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all w-full sm:w-auto">
                                <Send className="h-3 w-3" /> Contact
                            </button>
                            <a href={template.hero.website} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 px-4 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors">
                                <ExternalLink className="h-3 w-3" /> Website
                            </a>
                            <button onClick={shareBrand} className="flex h-10 w-10 items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-colors">
                                <Share2 className="h-4 w-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}

function StickyTabs({ activeTab, setActiveTab, tabsLeft, tabsRight }) {
    return (
        <nav className=" bg-white/95 backdrop-blur-md border-b border-gray-200">
            <Container className="flex flex-col sm:flex-row justify-between">
                <div className="flex overflow-x-auto no-scrollbar sm:gap-6 gap-4">
                    {tabsLeft.map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setActiveTab(key);
                                document.getElementById(key)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className={`relative shrink-0 py-4 text-[14px] font-semibold tracking-wide transition-colors ${activeTab === key ? "text-black" : "text-gray-500 hover:text-black"}`}
                        >
                            {label}
                            {activeTab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--brand-color)]" />}
                        </button>
                    ))}
                </div>
                <div className="hidden sm:flex overflow-x-auto no-scrollbar gap-8">
                    {tabsRight.map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setActiveTab(key);
                                document.getElementById(key)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className={`relative shrink-0 py-4 text-[14px] font-semibold tracking-wide transition-colors ${activeTab === key ? "text-black" : "text-gray-500 hover:text-black"}`}
                        >
                            {label}
                            {activeTab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--brand-color)]" />}
                        </button>
                    ))}
                </div>
            </Container>
        </nav>
    );
}

function OverviewSection({ template }) {
    const [open, setOpen] = useState(false);
    const hasExtended = Boolean(template.overview.extended?.trim());

    return (
        <section id="overview" className="scroll-mt-32 pt-8 pb-12 border-b border-gray-200">
            <div className="w-full">
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-gray-800">
                    {template.overview.body}
                    {hasExtended && !open && (
                        <button onClick={() => setOpen(true)} className="ml-2 font-bold text-[var(--brand-color)] hover:opacity-80 uppercase tracking-widest text-[11px]">
                            ... read more
                        </button>
                    )}
                </p>
                {hasExtended && open && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
                        <p className="text-[13px] sm:text-[14px] leading-relaxed text-gray-800">
                            {template.overview.extended}
                        </p>
                        <button onClick={() => setOpen(false)} className="mt-4 text-[11px] font-bold text-[var(--brand-color)] hover:opacity-80 uppercase tracking-widest flex items-center gap-1">
                            <ChevronUp className="h-3 w-3" /> Show less
                        </button>
                    </motion.div>
                )}
            </div>
        </section>
    );
}

function SolutionsSection({ items, brandName }) {
    if (items.length === 0) return null;
    return (
        <Section id="Categories" title={`Categories`}>
            <HorizontalRail>
                {items.map((item) => (
                    <Link key={item.id} href={item.href} className="group flex flex-col h-[280px] w-[260px] shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden text-center hover:shadow-md hover:border-gray-300 transition-all">
                        <div className="relative h-[190px] w-full bg-[#f4f4f4] overflow-hidden">
                            {item.image && <Image src={item.image} alt={item.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                        </div>
                        <div className="flex flex-col items-center justify-center flex-1 px-4">
                            <p className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">{item.title}</p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500">{item.count} products</p>
                        </div>
                    </Link>
                ))}
            </HorizontalRail>
        </Section>
    );
}

function ProjectShowcaseSection({ items, brandName, setModal }) {
    if (!items || items.length === 0) return null;

    return (
        <Section id="projects" title={`Featured Projects`}>
            <HorizontalRail>
                {items.map((project, idx) => (
                    <button key={project.id || idx} onClick={() => setModal({ type: "project", ...project })} className="group block w-[320px] sm:w-[500px] h-[240px] sm:h-[350px] shrink-0 overflow-hidden bg-black rounded-lg relative shadow-sm hover:shadow-lg transition-all text-left">
                        {project.mainImage && <Image src={project.mainImage} alt={project.title || "Project"} fill unoptimized loading="lazy" className="object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105 duration-700" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h3 className="text-xl font-serif font-medium mb-3">{project.title || "Featured Project"}</h3>
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-white">
                                <span>View Details</span> <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
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
        <Section id="collections" title={`Collections ${brandName}`}>
            <HorizontalRail>
                {items.map((item) => (
                    <button key={item.id} onClick={() => setModal({ type: "collection", ...item })} className="group flex flex-col h-[280px] w-[260px] shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden text-center hover:shadow-md hover:border-gray-300 transition-all">
                        <div className="relative h-[190px] w-full bg-[#f9f9f9] overflow-hidden">
                            {item.image && <Image src={item.image} alt={item.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                        </div>
                        <div className="flex flex-col items-center justify-center flex-1 px-4">
                            <p className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">{item.title}</p>
                            {item.products?.length > 0 && <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500">{item.products.length} products</p>}
                        </div>
                    </button>
                ))}
            </HorizontalRail>
        </Section>
    );
}

function ProductsSection({ products, brandName, brandId, productsLoading, setModal }) {
    const allProductsHref = brandId ? `/productlist?brands=${brandId}` : "/productlist";
    return (
        <Section id="products" title={`Products ${brandName}`} action="VIEW ALL PRODUCTS" actionHref={allProductsHref}>
            {productsLoading ? (
                <div className="flex gap-4 overflow-x-hidden">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[360px] w-[280px] animate-pulse bg-gray-100 rounded-lg" />)}</div>
            ) : products.length === 0 ? (
                <EmptyNote title="No products found" />
            ) : (
                <HorizontalRail>
                    {products.slice(0, 12).map((item, idx) => (
                        <div key={`${idx}-${item.id}`} className="group relative flex flex-col w-[280px] shrink-0 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all overflow-hidden">
                            <div className="relative h-[250px] w-full bg-[#f2f2f2] flex items-center justify-center cursor-pointer" onClick={() => setModal({ type: "product", ...item })}>
                                <Image src={item.image} alt={item.name} fill unoptimized className="object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex flex-col flex-1 p-5">
                                <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-1">{brandName}</p>
                                <h3 className="text-[14px] font-medium text-gray-900 leading-snug line-clamp-2 py-1 ">{item.name}</h3>
                                <p className="text-[12px] text-gray-500 mb-4 capitalize">{item.material} {item.category}</p>
                                <button onClick={() => setModal({ type: "inquiry", ...item })} className="mt-auto flex h-10 w-full items-center justify-center gap-2 bg-[var(--brand-color)] hover:bg-black text-white rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors">
                                    Request Info <ArrowRight className="h-3 w-3" />
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
        <Section id="catalogs" title={`Catalogs ${brandName}`}>
            <HorizontalRail>
                {items.map((item) => (
                    <button key={item.id} onClick={() => setModal({ type: "catalog", ...item })} className="group relative w-[220px] shrink-0 text-left bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-gray-300 transition-all">
                        <div className="relative h-[270px] w-full bg-gray-100 rounded-[2px] overflow-hidden">
                            {item.cover && <Image src={item.cover} alt={item.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                            <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-[13px] font-bold uppercase tracking-widest rounded-[2px]">PDF</div>
                        </div>
                        <div className="mt-4 px-1">
                            <p className="text-[13px] font-bold text-gray-900 line-clamp-2">{item.title}</p>
                            <p className="mt-1 text-[11px] text-gray-500 uppercase tracking-widest font-semibold">{item.year || "Catalog"} • {item.pages || "Multiple"} Pgs</p>
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
        <Section id="news" title={`News ${brandName}`}>
            <div className="grid gap-6 md:grid-cols-3">
                {items.map((item) => (
                    <button key={item.id} onClick={() => setModal({ type: "article", ...item })} className="group text-left flex flex-col">
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 rounded-sm">
                            {item.image && <Image src={item.image} alt={item.title} fill unoptimized className="object-cover" />}
                            <div className="absolute bottom-2 left-2 bg-[#333] text-white px-2 py-1 text-[13px] font-bold rounded-sm flex items-center gap-1.5">
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
                    <button key={item.id} onClick={() => setModal({ type: "video", ...item })} className="group flex flex-col w-[300px] shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-white text-left hover:shadow-md transition-all">
                        <div className="relative h-[170px] w-full bg-black overflow-hidden">
                            {item.poster && <Image src={item.poster} alt={item.title} fill unoptimized className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white text-white bg-black/30 backdrop-blur-sm group-hover:scale-110 transition-transform">
                                    <Play className="h-5 w-5 fill-current ml-1" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 h-[90px]">
                            <p className="text-[13px] font-medium leading-relaxed text-gray-800 line-clamp-2">{item.title}</p>
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
        <Section id="gallery" title={`Gallery ${brandName}`}>
            <HorizontalRail>
                {items.map((item) => (
                    <button key={item.id} onClick={() => setModal({ type: "image", ...item })} className="block w-[320px] sm:w-[500px] h-[240px] sm:h-[350px] shrink-0 overflow-hidden bg-gray-100 rounded-lg relative border border-gray-200 hover:shadow-md transition-all group">
                        <Image src={item.image} alt={item.category || "Gallery"} fill unoptimized loading="lazy" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </button>
                ))}
            </HorizontalRail>
        </Section>
    );
}

function PartnerSection({ items, brandName, setModal }) {
    if (items.length === 0) return null;
    return (
        <Section id="retailers" title={`Retailers ${brandName}`}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-5 flex gap-4 bg-white hover:border-gray-300 hover:shadow-md transition-all">
                        {item.href ? (
                            <Link href={item.href} className="relative h-16 w-16 bg-gray-50 border border-gray-100 rounded-lg shrink-0 overflow-hidden">
                                <Image src={item.images?.[0] || "/Icons/arcmatlogo.svg"} alt={item.name} fill unoptimized className="object-contain p-2" />
                            </Link>
                        ) : (
                            <div className="relative h-16 w-16 bg-gray-50 border border-gray-100 rounded-lg shrink-0 overflow-hidden">
                                <Image src={item.images?.[0] || "/Icons/arcmatlogo.svg"} alt={item.name} fill unoptimized className="object-contain p-2" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            {item.href ? (
                                <Link href={item.href}>
                                    <h3 className="text-[14px] font-bold text-gray-900 truncate hover:text-[var(--brand-color)] transition-colors">{item.name}</h3>
                                </Link>
                            ) : (
                                <h3 className="text-[14px] font-bold text-gray-900 truncate">{item.name}</h3>
                            )}
                            <p className="text-[12px] text-gray-500 mt-1">{item.location}</p>
                            <div className="flex items-center gap-2 mt-2 mb-3">
                                <span className="text-[13px] uppercase font-bold text-gray-400 tracking-widest">{item.category}</span>
                                {item.verified && <ShieldCheck className="h-3.5 w-3.5 text-green-600" />}
                            </div>
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-[var(--brand-color)] text-gray-700 hover:text-white rounded-lg border border-gray-200 hover:border-[var(--brand-color)] text-[13px] font-bold uppercase tracking-widest transition-colors"
                                >
                                    Contact Partner <ArrowRight className="h-3 w-3" />
                                </Link>
                            ) : (
                                <button
                                    onClick={() => setModal({ type: "partner", ...item })}
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-[var(--brand-color)] text-gray-700 hover:text-white rounded-lg border border-gray-200 hover:border-[var(--brand-color)] text-[13px] font-bold uppercase tracking-widest transition-colors"
                                >
                                    Contact Partner <ArrowRight className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
}

// function ReviewSection({ items, brandName }) {
//     if (items.length === 0) return null;
//     return (
//         <Section id="reviews" title={`Customer Endorsements`}>
//             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                 {items.map((item, index) => (
//                     <div key={index} className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
//                         <div className="flex gap-1 mb-4">
//                             {Array.from({ length: 5 }).map((_, i) => (
//                                 <Star key={i} className={`h-4 w-4 ${i < (item.rating || 5) ? "fill-[#eab308] text-[#eab308]" : "fill-gray-200 text-gray-200"}`} />
//                             ))}
//                         </div>
//                         <p className="text-[14px] leading-relaxed text-gray-700 italic mb-6 flex-1">"{item.comment}"</p>
//                         <div>
//                             <p className="text-[13px] font-bold text-gray-900">{item.name}</p>
//                             {item.role && <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 mt-1">{item.role}</p>}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </Section>
//     );
// }

function ContactSection({ template }) {
    const [loading, setLoading] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
        query: ""
    });
    const [showContactInfo, setShowContactInfo] = useState(false);

    // Pre-fill form with logged-in user's data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.mobile || user.phone || prev.phone,
                location: user.city || user.location?.city || prev.location,
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Guard: require login to submit
        if (!isAuthenticated) {
            toast.error("Please log in to send an inquiry.");
            router.push("/auth/login");
            return;
        }
        setLoading(true);
        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            toast.error("Please provide a valid 10-digit phone number");
            setLoading(false);
            return;
        }
        try {
            await brandService.createBrandQuery(template.hero.brandId, formData);
            toast.success("Query submitted successfully! We will contact you soon.");
            setFormData({ name: "", email: "", phone: "", location: "", query: "" });
        } catch (error) {
            console.error("Query submission failed:", error);
            toast.error(error.response?.data?.message || "Failed to submit query. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const socials = Array.isArray(template.contact.socials) ? template.contact.socials.filter(Boolean).map(parseSocialLink) : [];

    return (
        <section id="contact" className="w-full bg-[#fafafa] py-24 border-t border-gray-100">
            <Container>
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left Side: Form */}
                    <div className="bg-white p-8 sm:p-12 rounded-lg shadow-sm border border-gray-200 order-2 lg:order-1">
                        <div className="mb-8">
                            <h2 className="text-3xl font-serif text-[#333]">Send a Query</h2>
                            <p className="text-gray-600 mt-2">Interested in {template.hero.name}? Fill out the form below and we'll get back to you.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold uppercase tracking-wider text-gray-400 ml-1">Full Name</label>
                                    <input required name="name" value={formData.name} onChange={handleChange} type="text" placeholder="John Doe" className="w-full h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-[var(--brand-color)] focus:ring-1 focus:ring-[var(--brand-color)] outline-none transition-all text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold uppercase tracking-wider text-gray-400 ml-1">Email Address</label>
                                    <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="john@example.com" className="w-full h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-[var(--brand-color)] focus:ring-1 focus:ring-[var(--brand-color)] outline-none transition-all text-sm" />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold uppercase tracking-wider text-gray-400 ml-1">Phone Number</label>
                                    <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="10-digit Phone Number" maxLength="10" className="w-full h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-[var(--brand-color)] focus:ring-1 focus:ring-[var(--brand-color)] outline-none transition-all text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold uppercase tracking-wider text-gray-400 ml-1">Location</label>
                                    <input required name="location" value={formData.location} onChange={handleChange} type="text" placeholder="Mumbai, India" className="w-full h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-[var(--brand-color)] focus:ring-1 focus:ring-[var(--brand-color)] outline-none transition-all text-sm" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-bold uppercase tracking-wider text-gray-400 ml-1">Your Query</label>
                                <textarea required name="query" value={formData.query} onChange={handleChange} rows="4" placeholder="How can we help you?" className="w-full p-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-[var(--brand-color)] focus:ring-1 focus:ring-[var(--brand-color)] outline-none transition-all text-sm resize-none"></textarea>
                            </div>

                            <button disabled={loading} type="submit" className="w-full h-12 bg-[var(--brand-color)] hover:bg-black text-white rounded-lg font-bold uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3">
                                {loading ? "Sending..." : isAuthenticated ? "Submit Inquiry" : "Login to Submit"}
                                {!loading && (isAuthenticated ? <Send className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />)}
                            </button>
                        </form>
                    </div>

                    {/* Right Side: Attractive Content */}
                    <div className="lg:sticky lg:top-32 space-y-12 order-1 lg:order-2">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--brand-color)]">Connect with Brand</p>
                            <h2 className="mt-4 text-4xl sm:text-5xl font-serif text-[#333] leading-tight">Get in touch with {template.hero.name}</h2>
                            <p className="mt-6 text-gray-600 leading-relaxed max-w-md text-sm sm:text-base">Our team and global partners are ready to assist you with catalogs, technical specifications, and customized project solutions.</p>
                        </div>

                        <div className="grid gap-6">
                            <ContactDetail icon={<MapPin className="h-5 w-5" />} label="Headquarters" value={template.contact.address} />
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        toast.info("Please login to view contact details");
                                        router.push("/auth/login");
                                    } else {
                                        setShowContactInfo(!showContactInfo);
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-white text-gray-800 border-2 border-gray-900 rounded-2xl font-bold transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
                                style={{ borderColor: 'var(--brand-color)', color: '#4a4a4a' }}
                            >
                                <Phone className="w-4 h-4" />
                                {showContactInfo ? "Hide Contact" : "Show Contact"}
                            </button>

                            {showContactInfo && (
                                <div className="mt-6 p-6 bg-[#f8f9fa] rounded-3xl border border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    {template.contact.phone && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <Phone className="w-4 h-4 text-[#d9a88a]" style={{ color: 'var(--brand-color)' }} />
                                            </div>
                                            <span className="text-[15px] font-bold text-gray-700">
                                                +91 {format10DigitNumber(template.contact.phone)}
                                            </span>
                                        </div>
                                    )}
                                    {template.contact.email && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <Mail className="w-4 h-4 text-[#d9a88a]" style={{ color: 'var(--brand-color)' }} />
                                            </div>
                                            <span className="text-[15px] font-bold text-gray-700">{template.contact.email}</span>
                                        </div>
                                    )}
                                    {template.contact.whatsapp && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <MessageCircle className="w-4 h-4 text-[#d9a88a]" style={{ color: 'var(--brand-color)' }} />
                                            </div>
                                            <span className="text-[15px] font-bold text-gray-700">
                                                +91 {format10DigitNumber(template.contact.whatsapp)}
                                            </span>
                                        </div>
                                    )}
                                    {template.contact.website && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <Globe className="w-4 h-4 text-[#d9a88a]" style={{ color: 'var(--brand-color)' }} />
                                            </div>
                                            <a href={template.contact.website.startsWith('http') ? template.contact.website : `https://${template.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-[15px] font-bold text-gray-700 hover:underline">
                                                {template.contact.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    )}
                                    {template.contact.address && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <MapPin className="w-4 h-4 text-[#d9a88a]" style={{ color: 'var(--brand-color)' }} />
                                            </div>
                                            <span className="text-[15px] font-bold text-gray-700">{template.contact.address}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {socials.length > 0 && (
                            <div className="pt-8 border-t border-gray-200">
                                <p className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-5">Social Channels</p>
                                <div className="flex flex-wrap gap-3">
                                    {socials.map((social, i) => {
                                        const Icon = socialIcons[social.key] || Globe;
                                        return (
                                            <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-[11px] font-bold text-gray-700 hover:border-[var(--brand-color)] hover:text-[var(--brand-color)] hover:shadow-sm transition-all">
                                                <Icon className="h-4 w-4 text-[var(--brand-color)]" />
                                                {social.label}
                                            </a>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </section>
    );
}

function ContactDetail({ icon, label, value }) {
    return (
        <div className="flex items-start gap-5 group">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-gray-100 text-[var(--brand-color)] shadow-sm group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[13px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                <p className="mt-1 text-[15px] font-medium text-[#333] truncate">{value || "Available on request"}</p>
            </div>
        </div>
    );
}
// ---------------- Helper Components ----------------

function Section({ id, title, action, actionHref, children }) {
    return (
        <section id={id} className="scroll-mt-32 pt-16">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-[24px] sm:text-[28px] font-medium text-[#333] font-serif">{title}</h2>
                {action && actionHref && (
                    <Link href={actionHref} className="h-10 px-5 border border-gray-200 bg-white text-[11px] font-bold text-gray-600 uppercase tracking-widest rounded-lg hover:border-[var(--brand-color)] hover:text-[var(--brand-color)] transition-colors flex items-center justify-center">
                        {action}
                    </Link>
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
    const image = modal.image || modal.cover || modal.poster || modal.images?.[0];
    const catalogFileUrl = modal.type === "catalog" ? (resolveUrl(modal.file, "brands") || modal.url) : null;
    const videoEmbedUrl = isVideo ? getVideoEmbedUrl(modal) : "";
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
                            {videoEmbedUrl ? (
                                <iframe title={modal.title} src={videoEmbedUrl} className="h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                            ) : (
                                <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold uppercase tracking-[0.14em] text-white/70">
                                    Add a YouTube or Vimeo URL for this video.
                                </div>
                            )}
                        </div>
                    ) : image && modal.type !== "project" ? (
                        <div className="relative h-[300px] sm:h-[400px] w-full bg-gray-50 mb-8 rounded-sm overflow-hidden border border-gray-200">
                            <Image src={image} alt={modal.title || "Detail"} fill unoptimized className="object-contain" />
                        </div>
                    ) : null}
                    {modal.type === "project" && (() => {
                        const validGallery = (modal.gallery || []).filter(Boolean);
                        const count = validGallery.length;
                        return (
                            <div className="mb-8">
                                <div className={`grid gap-1 md:gap-2 p-1 md:p-2 bg-gray-50 rounded-sm mb-6 ${count === 0 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                                    <div className={`${count === 0 ? 'md:col-span-3' : 'md:col-span-2'} relative aspect-[4/3] md:aspect-auto md:h-[400px] w-full bg-gray-200 overflow-hidden`}>
                                        {modal.mainImage && (
                                            <Image src={modal.mainImage} alt={modal.title || "Project Main"} fill unoptimized className="object-cover" />
                                        )}
                                    </div>
                                    {count > 0 && (
                                        <div className={`grid gap-1 md:gap-2 h-auto md:h-[400px] ${count === 1 ? 'grid-cols-1 grid-rows-1' :
                                            count === 2 ? 'grid-cols-1 grid-rows-2' :
                                                count === 3 ? 'grid-cols-2 grid-rows-2' :
                                                    'grid-cols-2 grid-rows-2'
                                            }`}>
                                            {validGallery.map((img, i) => (
                                                <div key={i} className={`relative w-full h-full aspect-square md:aspect-auto bg-gray-200 overflow-hidden ${count === 3 && i === 0 ? 'col-span-2' : ''}`}>
                                                    <Image src={img} alt={`Gallery ${i}`} fill unoptimized className="object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {modal.price && (
                                    <div className="inline-block bg-gray-50 border border-gray-200 px-6 py-3 rounded-sm mb-4">
                                        <p className="text-[13px] font-bold uppercase tracking-widest text-gray-500 mb-1">Project Value</p>
                                        <p className="text-lg font-bold text-black">
                                            {String(modal.price).includes('₹') || String(modal.price).includes('$')
                                                ? modal.price
                                                : `₹ ${modal.price}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                    <h2 className="text-2xl sm:text-3xl font-serif font-medium">{modal.title || modal.name}</h2>
                    <p className="mt-4 text-[14px] leading-relaxed text-gray-600 whitespace-pre-wrap">{modal.overview || modal.description || modal.text || modal.excerpt || modal.material || "Additional project details."}</p>
                    {catalogFileUrl && (
                        <div className="mt-6 flex flex-wrap gap-3">
                            <a
                                href={catalogFileUrl}
                                download
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[var(--brand-color)] hover:opacity-90 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition-all"
                            >
                                <ArrowDownToLine className="h-4 w-4" />
                                Download PDF
                            </a>

                        </div>
                    )}
                    {modal.type === "collection" && modal.products?.length > 0 && (
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Products in this collection</h3>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {modal.products.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => window.location.assign(`/productdetails/${product.id}`)}
                                        className="group rounded-sm border border-gray-200 bg-white p-3 text-left transition hover:border-gray-400"
                                    >
                                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                                            <Image src={product.image} alt={product.name} fill unoptimized className="object-cover transition duration-500 group-hover:scale-105" />
                                        </div>
                                        <p className="mt-3 text-[13px] font-bold text-black">{product.name}</p>
                                        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-gray-400">{product.sku}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function ShowcaseSkeleton() {
    return (
        <main className="min-h-screen bg-white">
            <div className="h-[350px] w-full animate-pulse bg-gray-100" />
            <Container className="mt-10">
                <div className="h-10 w-full animate-pulse bg-gray-100 mb-8" />
                <div className="flex gap-4"><div className="h-64 w-[260px] animate-pulse bg-gray-100" /><div className="h-64 w-[260px] animate-pulse bg-gray-100" /></div>
            </Container>
        </main>
    );
}
