"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { useAuth } from "@/hooks/useAuth";
import {
    useDecideContractorBespokeRequest,
    useGetBrandById,
    useGetBespokeOptions,
    useGetContractorBespokeRequests,
    useUpdateBrand
} from "@/hooks/useBrand";
import { getImageUrl, getProductImageUrl } from "@/lib/productUtils";
import { toast } from "@/components/ui/Toast";
import { ArrowUpRight, ImagePlus, Loader2, Plus, Save, Trash2, Layout, Image as ImageIcon, Briefcase, Box, Users, Star, MessageSquare } from "lucide-react";

// ---------------- Helper Functions ----------------

const idOf = (item) => String(item?._id || item?.id || item || "");

const toggleId = (ids, value) => {
    const id = String(value);
    return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
};

const emptySolution = () => ({ title: "", image: "", text: "" });
const emptyCollection = () => ({ title: "", image: "", materials: "", variants: "", specs: "" });
const emptyCatalog = () => ({ title: "", year: "", pages: "", featured: false, cover: "", file: null });
const emptyVideo = () => ({ title: "", provider: "youtube", videoId: "", poster: "", url: "" });
const emptyNews = () => ({ title: "", date: "", readTime: "", image: "", excerpt: "", body: "" });

const csvToArray = (value) => String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
const arrayToCsv = (value) => Array.isArray(value) ? value.join(", ") : String(value || "");
const withoutFileFields = ({ imageFile, coverFile, posterFile, fileUpload, ...item }) => item;
const appendCardFiles = (formData, fieldPrefix, items, fileKey) => {
    items.forEach((item, index) => {
        if (item?.[fileKey]) formData.append(`${fieldPrefix}_${index}`, item[fileKey]);
    });
};

const NAV_LINKS = [
    { id: "story", label: "Story & Hero", icon: <Layout className="w-4 h-4" /> },
    { id: "gallery", label: "Brand Gallery", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "content", label: "Showcase Content", icon: <Briefcase className="w-4 h-4" /> },
    { id: "products", label: "Products", icon: <Box className="w-4 h-4" /> },
    { id: "network", label: "Network", icon: <Users className="w-4 h-4" /> },
    { id: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
    { id: "requests", label: "Requests", icon: <MessageSquare className="w-4 h-4" /> },
];

export default function BespokeEditorPage() {
    const { user, loading } = useAuth();
    const brandLookupId = user?.role === "brand" ? user?._id : user?.selectedBrands?.[0]?._id;
    const { data: brandData, isLoading: brandLoading } = useGetBrandById(brandLookupId);
    const brand = brandData?.data;
    const brandId = brand?._id;

    const { data: optionsData, isLoading: optionsLoading } = useGetBespokeOptions(brandId);
    const { data: contractorRequestsData, isLoading: requestsLoading } = useGetContractorBespokeRequests({
        brandId,
        enabled: !!brandId,
    });
    const updateBrand = useUpdateBrand();
    const decideRequest = useDecideContractorBespokeRequest();

    const options = optionsData?.data || {};
    const contractorRequests = contractorRequestsData?.data || [];
    const bespoke = brand?.bespokePage || {};

    const [activeSection, setActiveSection] = useState("story");
    const [headline, setHeadline] = useState("");
    const [bio, setBio] = useState("");
    const [isPublished, setIsPublished] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedRetailers, setSelectedRetailers] = useState([]);
    const [selectedContractors, setSelectedContractors] = useState([]);
    const [reviews, setReviews] = useState([{ name: "", role: "", rating: 5, comment: "" }]);
    const [heroImage, setHeroImage] = useState(null);
    const [existingGalleryMedia, setExistingGalleryMedia] = useState([]);
    const [galleryMedia, setGalleryMedia] = useState([]);
    const [tags, setTags] = useState("");
    const [contact, setContact] = useState({ email: "", phone: "", address: "", socials: "" });
    const [solutions, setSolutions] = useState([]);
    const [collections, setCollections] = useState([]);
    const [catalogs, setCatalogs] = useState([]);
    const [videos, setVideos] = useState([]);
    const [news, setNews] = useState([]);

    // Fix for Dashboard Layout `overflow-y-auto` breaking sticky positioning
    useEffect(() => {
        const mainEl = document.querySelector('main');
        if (mainEl) {
            mainEl.style.overflow = 'visible';
        }
        return () => {
            if (mainEl) mainEl.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        if (!brand) return;
        setHeadline(bespoke.headline || "");
        setBio(bespoke.bio || brand.description || "");
        setIsPublished(bespoke.isPublished !== false);
        setSelectedProducts((bespoke.selectedProductIds || []).map(idOf).filter(Boolean));
        setSelectedRetailers((bespoke.selectedRetailerIds || []).map(idOf).filter(Boolean));
        setSelectedContractors((bespoke.selectedContractorIds || []).map(idOf).filter(Boolean));
        setReviews((bespoke.reviews?.length ? bespoke.reviews : [{ name: "", role: "", rating: 5, comment: "" }]));
        setExistingGalleryMedia([...(bespoke.galleryMedia || []), ...(bespoke.customImage ? [bespoke.customImage] : [])].slice(0, 8));
        setTags(arrayToCsv(bespoke.tags || []));
        setContact({
            email: bespoke.contact?.email || "",
            phone: bespoke.contact?.phone || "",
            address: bespoke.contact?.address || "",
            socials: arrayToCsv(bespoke.contact?.socials || [])
        });
        setSolutions((bespoke.solutions || []).map((item) => ({ ...emptySolution(), ...item })));
        setCollections((bespoke.collections || []).map((item) => ({
            ...emptyCollection(),
            ...item,
            materials: arrayToCsv(item.materials),
            variants: arrayToCsv(item.variants),
            specs: arrayToCsv(item.specs)
        })));
        setCatalogs((bespoke.catalogs || []).map((item) => ({ ...emptyCatalog(), ...item })));
        setVideos((bespoke.videos || []).map((item) => ({ ...emptyVideo(), ...item })));
        setNews((bespoke.news || []).map((item) => ({ ...emptyNews(), ...item })));
    }, [brand?._id]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const visible = entries.find((entry) => entry.isIntersecting);
            if (visible) setActiveSection(visible.target.id);
        }, { rootMargin: "-20% 0px -60% 0px" });

        NAV_LINKS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [brand]);

    const activeReviewCount = useMemo(() => reviews.filter((review) => review.name || review.comment).length, [reviews]);

    const contractorOptions = useMemo(() => {
        const optionMap = new Map();
        (options.contractors || []).forEach((contractor) => {
            const contractorId = idOf(contractor);
            if (contractorId) optionMap.set(contractorId, contractor);
        });
        (bespoke.selectedContractorIds || []).forEach((contractor) => {
            const contractorId = idOf(contractor);
            if (contractorId && typeof contractor === "object") optionMap.set(contractorId, contractor);
        });
        contractorRequests.forEach((request) => {
            const contractor = request.contractorId;
            const contractorId = idOf(contractor);
            if (contractorId && typeof contractor === "object") optionMap.set(contractorId, contractor);
        });
        return Array.from(optionMap.values());
    }, [options.contractors, bespoke.selectedContractorIds, contractorRequests]);

    const savePage = async () => {
        if (!brandId) return;

        const formData = new FormData();
        formData.append("bespokeHeadline", headline);
        formData.append("bespokeBio", bio);
        formData.append("bespokeIsPublished", String(isPublished));
        formData.append("bespokeSelectedProductIds", JSON.stringify(selectedProducts));
        formData.append("bespokeSelectedRetailerIds", JSON.stringify(selectedRetailers));
        formData.append("bespokeSelectedContractorIds", JSON.stringify(selectedContractors));
        formData.append("bespokeReviews", JSON.stringify(reviews));
        formData.append("bespokeExistingGalleryMedia", JSON.stringify(existingGalleryMedia));
        formData.append("bespokeTags", JSON.stringify(csvToArray(tags)));
        formData.append("bespokeContact", JSON.stringify({ ...contact, socials: csvToArray(contact.socials) }));
        formData.append("bespokeSolutions", JSON.stringify(solutions.map(({ imageFile, ...item }) => item)));
        formData.append("bespokeCollections", JSON.stringify(collections.map((item) => ({
            ...withoutFileFields(item),
            materials: csvToArray(item.materials),
            variants: csvToArray(item.variants),
            specs: csvToArray(item.specs)
        }))));
        formData.append("bespokeCatalogs", JSON.stringify(catalogs.map(withoutFileFields)));
        formData.append("bespokeVideos", JSON.stringify(videos.map(withoutFileFields)));
        formData.append("bespokeNews", JSON.stringify(news.map(withoutFileFields)));
        appendCardFiles(formData, "bespokeSolutionImage", solutions, "imageFile");
        appendCardFiles(formData, "bespokeCollectionImage", collections, "imageFile");
        appendCardFiles(formData, "bespokeCatalogCover", catalogs, "coverFile");
        appendCardFiles(formData, "bespokeCatalogFile", catalogs, "fileUpload");
        appendCardFiles(formData, "bespokeVideoPoster", videos, "posterFile");
        appendCardFiles(formData, "bespokeNewsImage", news, "imageFile");
        if (heroImage) formData.append("bespokeHeroImage", heroImage);
        galleryMedia.slice(0, Math.max(0, 8 - existingGalleryMedia.length)).forEach((file) => {
            formData.append("bespokeGalleryMedia", file);
        });

        try {
            const response = await updateBrand.mutateAsync({ id: brandId, data: formData });
            const savedBespoke = response?.data?.bespokePage || response?.bespokePage;
            if (savedBespoke) {
                setExistingGalleryMedia(
                    [...(savedBespoke.galleryMedia || []), ...(savedBespoke.customImage ? [savedBespoke.customImage] : [])].slice(0, 8)
                );
            }
            setHeroImage(null);
            setGalleryMedia([]);
            toast.success("Bespoke page updated successfully.");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Could not update bespoke page");
        }
    };

    const decideContractorRequest = async (request, status) => {
        try {
            await decideRequest.mutateAsync({ brandId, requestId: request._id, status });
            const contractorId = idOf(request.contractorId);
            if (status === "approved" && contractorId) {
                setSelectedContractors((current) => current.includes(contractorId) ? current : [...current, contractorId]);
            }
            if (status === "rejected" && contractorId) {
                setSelectedContractors((current) => current.filter((id) => id !== contractorId));
            }
            toast.success(status === "approved" ? "Contractor added to bespoke page" : "Contractor removed from bespoke page");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Could not update request");
        }
    };

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (loading || brandLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-gray-50/30">
                <Loader2 className="h-9 w-9 animate-spin text-black" />
            </div>
        );
    }

    if (!brand) {
        return (
            <Container className="py-10">
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                    <h1 className="text-xl font-bold text-gray-900">Brand profile not found</h1>
                    <p className="mt-2 text-sm text-gray-500">Complete your core brand profile before configuring the bespoke page.</p>
                </div>
            </Container>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] pb-24 text-gray-900 font-sans">
            {/* Sticky Header */}
            <div className="sticky top-[64px] z-40 bg-white border-b border-gray-200 shadow-sm">
                <Container>
                    <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black">Bespoke Editor</h1>
                            <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">Managing <span className="font-bold text-black">{brand.name}</span></p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Link href={`/bespoke/${brandId}`} target="_blank" className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:border-black hover:text-black transition-colors">
                                Preview <ArrowUpRight className="h-4 w-4" />
                            </Link>
                            <button onClick={savePage} disabled={updateBrand.isPending} className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-md bg-black px-6 py-2 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors shadow-md">
                                {updateBrand.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </Container>
            </div>

            <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
                <div className="flex flex-col lg:flex-row gap-10 items-start relative">
                    
                    {/* Sticky Navigation Sidebar */}
                    <div className="hidden lg:block sticky top-[160px] w-[240px] shrink-0 self-start z-10">
                        <nav className="flex flex-col max-h-[calc(100vh-180px)] overflow-y-auto no-scrollbar pb-10">
                            <div className="space-y-1 pr-6 border-r border-gray-200 py-2">
                                {NAV_LINKS.map((link) => (
                                    <button
                                        key={link.id}
                                        onClick={() => scrollTo(link.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-bold transition-colors ${activeSection === link.id ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-100 hover:text-black"}`}
                                    >
                                        {link.icon}
                                        {link.label}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="mt-8 pr-6 space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Metrics</h3>
                                <div className="grid grid-cols-2 gap-2 pl-4">
                                    <div className="bg-white border border-gray-200 rounded-md p-3 shadow-sm text-center">
                                        <p className="text-xl font-bold text-black">{selectedProducts.length}</p>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Products</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-md p-3 shadow-sm text-center">
                                        <p className="text-xl font-bold text-black">{activeReviewCount}</p>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Reviews</p>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0 w-full space-y-12">
                        
                        {/* Section 1: Story & Hero */}
                        <SectionContainer id="story" title="Story & Hero" description="The primary messaging and branding visible at the top of the showcase.">
                            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                                <div>
                                    <h4 className="text-sm font-bold text-black">Visibility Status</h4>
                                    <p className="text-xs text-gray-500 mt-1">When published, the bespoke page is accessible publicly.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                </label>
                            </div>

                            <div className="grid gap-6">
                                <TextInput label="Headline Banner" value={headline} onChange={setHeadline} placeholder="Premium architectural finishes for modern spaces" />
                                <TextareaInput label="Brand Story (Bio)" value={bio} onChange={setBio} placeholder="Describe the history and expertise..." />
                                <ImageInput label="Hero Image Cover" currentImage={bespoke.heroImage} file={heroImage} onChange={setHeroImage} />
                            </div>
                        </SectionContainer>

                        {/* Section 2: Gallery */}
                        <SectionContainer id="gallery" title="Brand Gallery" description="Add up to 8 high-quality images to construct the immersive gallery reel.">
                            <GalleryInput existingMedia={existingGalleryMedia} newMedia={galleryMedia} onExistingChange={setExistingGalleryMedia} onNewChange={setGalleryMedia} />
                        </SectionContainer>

                        {/* Section 3: Showcase Content */}
                        <SectionContainer id="content" title="Showcase Modules" description="Populate the bespoke rails for Collections, Catalogs, and News.">
                            <div className="grid gap-8">
                                <div className="grid gap-4 sm:grid-cols-2 bg-gray-50 p-5 rounded-lg border border-gray-200">
                                    <h4 className="sm:col-span-2 text-sm font-bold text-black mb-2">General Metadata</h4>
                                    <TextInput label="Tags" value={tags} onChange={setTags} placeholder="Bathrooms, Stone" helper="Comma separated" />
                                    <TextInput label="Social Links" value={contact.socials} onChange={(v) => setContact((c) => ({ ...c, socials: v }))} placeholder="Instagram, LinkedIn" helper="Comma separated" />
                                    <TextInput label="Contact Email" value={contact.email} onChange={(v) => setContact((c) => ({ ...c, email: v }))} placeholder="studio@brand.com" />
                                    <TextInput label="Phone Number" value={contact.phone} onChange={(v) => setContact((c) => ({ ...c, phone: v }))} placeholder="+1..." />
                                    <div className="sm:col-span-2">
                                        <TextInput label="Headquarters Address" value={contact.address} onChange={(v) => setContact((c) => ({ ...c, address: v }))} placeholder="City, Country" />
                                    </div>
                                </div>

                                <EditableList title="Solutions" items={solutions} setItems={setSolutions} createItem={emptySolution}>
                                    {(item, update) => (
                                        <>
                                            <TextInput label="Solution Name" value={item.title} onChange={(v) => update("title", v)} placeholder="Washbasins" />
                                            <CardFileInput label="Thumbnail Image" accept="image/*" currentFile={item.imageFile} currentMedia={item.image} onChange={(f) => update("imageFile", f)} />
                                        </>
                                    )}
                                </EditableList>

                                <EditableList title="Collections" items={collections} setItems={setCollections} createItem={emptyCollection}>
                                    {(item, update) => (
                                        <>
                                            <TextInput label="Collection Name" value={item.title} onChange={(v) => update("title", v)} placeholder="Indigo" />
                                            <CardFileInput label="Cover Image" accept="image/*" currentFile={item.imageFile} currentMedia={item.image} onChange={(f) => update("imageFile", f)} />
                                            <TextInput label="Materials" value={item.materials} onChange={(v) => update("materials", v)} placeholder="Stone, Brass" helper="Comma separated" />
                                            <TextInput label="Variants" value={item.variants} onChange={(v) => update("variants", v)} placeholder="Wall-mounted" helper="Comma separated" />
                                        </>
                                    )}
                                </EditableList>

                                <EditableList title="Catalogs (PDFs)" items={catalogs} setItems={setCatalogs} createItem={emptyCatalog}>
                                    {(item, update) => (
                                        <>
                                            <TextInput label="Catalog Name" value={item.title} onChange={(v) => update("title", v)} placeholder="2026 Collection" />
                                            <TextInput label="Year" value={item.year} onChange={(v) => update("year", v)} placeholder="2026" />
                                            <CardFileInput label="Cover Thumbnail" accept="image/*" currentFile={item.coverFile} currentMedia={item.cover} onChange={(f) => update("coverFile", f)} />
                                            <CardFileInput label="PDF Document" accept="application/pdf" currentFile={item.fileUpload} currentMedia={item.file} onChange={(f) => update("fileUpload", f)} />
                                        </>
                                    )}
                                </EditableList>

                                <EditableList title="Videos" items={videos} setItems={setVideos} createItem={emptyVideo}>
                                    {(item, update) => (
                                        <>
                                            <TextInput label="Video Title" value={item.title} onChange={(v) => update("title", v)} placeholder="Brand Overview" />
                                            <TextInput label="YouTube ID" value={item.videoId} onChange={(v) => update("videoId", v)} placeholder="ysz5S6PUM-U" helper="ID only, not full URL" />
                                            <div className="sm:col-span-2">
                                                <CardFileInput label="Custom Poster (Optional)" accept="image/*" currentFile={item.posterFile} currentMedia={item.poster} onChange={(f) => update("posterFile", f)} />
                                            </div>
                                        </>
                                    )}
                                </EditableList>

                                <EditableList title="News & Articles" items={news} setItems={setNews} createItem={emptyNews}>
                                    {(item, update) => (
                                        <>
                                            <TextInput label="Article Title" value={item.title} onChange={(v) => update("title", v)} placeholder="Salone del Mobile" />
                                            <TextInput label="Publish Date" value={item.date} onChange={(v) => update("date", v)} placeholder="April 2026" />
                                            <CardFileInput label="Thumbnail" accept="image/*" currentFile={item.imageFile} currentMedia={item.image} onChange={(f) => update("imageFile", f)} />
                                            <TextareaInput label="Excerpt" value={item.excerpt} onChange={(v) => update("excerpt", v)} placeholder="Short summary..." />
                                        </>
                                    )}
                                </EditableList>
                            </div>
                        </SectionContainer>

                        {/* Section 4: Products */}
                        <div id="products">
                            <SelectionSection title="Featured Products" description="Select the core products to anchor the top of your product grid." isLoading={optionsLoading} items={options.products || []} selectedIds={selectedProducts} onToggle={(id) => setSelectedProducts((c) => toggleId(c, id))} renderItem={(product) => (
                                <OptionRow image={getProductImageUrl(product.product_images?.[0])} title={product.product_name} subtitle={product.status === 1 ? "Active" : "Inactive"} />
                            )} />
                        </div>

                        {/* Section 5: Network */}
                        <div id="network" className="space-y-12">
                            <SelectionSection title="Official Retailers" description="Highlight certified resellers to direct customer traffic." isLoading={optionsLoading} items={options.retailers || []} selectedIds={selectedRetailers} onToggle={(id) => setSelectedRetailers((c) => toggleId(c, id))} renderItem={(retailer) => (
                                <OptionRow image={getImageUrl(retailer.profile, "userprofile")} title={retailer.retailerProfile?.companyName || retailer.name} subtitle={retailer.retailerProfile?.cityRegion || retailer.email} />
                            )} />

                            <SelectionSection title="Trusted Contractors" description="Curate a list of approved makers who successfully implement your products." isLoading={optionsLoading || requestsLoading} items={contractorOptions} selectedIds={selectedContractors} onToggle={(id) => setSelectedContractors((c) => toggleId(c, id))} renderItem={(contractor) => (
                                <OptionRow image={getImageUrl(contractor.profileImage, "contractor")} title={contractor.businessName} subtitle={`${contractor.location?.city || "India"}`} />
                            )} />
                        </div>

                        {/* Section 6: Reviews */}
                        <SectionContainer id="reviews" title="Customer Endorsements" description="Manually input high-value reviews or testimonials to display.">
                            <div className="space-y-4">
                                {reviews.map((review, index) => (
                                    <div key={index} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md relative group">
                                        <button onClick={() => setReviews((c) => c.filter((_, i) => i !== index))} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <div className="grid gap-4 sm:grid-cols-2 mb-4 pr-8">
                                            <TextInput label="Reviewer Name" value={review.name} onChange={(v) => setReviews((c) => c.map((item, i) => i === index ? { ...item, name: v } : item))} placeholder="John Doe" />
                                            <TextInput label="Role / Company" value={review.role} onChange={(v) => setReviews((c) => c.map((item, i) => i === index ? { ...item, role: v } : item))} placeholder="Lead Architect" />
                                        </div>
                                        <TextareaInput label="Review Text" value={review.comment} onChange={(v) => setReviews((c) => c.map((item, i) => i === index ? { ...item, comment: v } : item))} placeholder="Working with this brand was incredible..." />
                                    </div>
                                ))}
                                <button onClick={() => setReviews((c) => [...c, { name: "", role: "", rating: 5, comment: "" }])} className="w-full py-4 rounded-lg border-2 border-dashed border-gray-300 text-sm font-bold text-gray-500 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2 bg-gray-50">
                                    <Plus className="h-4 w-4" /> Add Review
                                </button>
                            </div>
                        </SectionContainer>

                        {/* Section 7: Requests */}
                        <SectionContainer id="requests" title="Contractor Inbound Requests" description="Contractors applying to feature on your bespoke page.">
                            {requestsLoading ? (
                                <div className="flex h-24 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-black" /></div>
                            ) : contractorRequests.length > 0 ? (
                                <div className="grid gap-4">
                                    {contractorRequests.map((request) => {
                                        const contractor = request.contractorId;
                                        return (
                                            <div key={request._id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <OptionRow image={getImageUrl(contractor?.profileImage, "contractor")} title={contractor?.businessName || "Contractor"} subtitle={request.message || "Requested display"} />
                                                <div className="flex items-center gap-2">
                                                    {request.status === "pending" && (
                                                        <>
                                                            <button onClick={() => decideContractorRequest(request, "rejected")} className="px-4 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">Reject</button>
                                                            <button onClick={() => decideContractorRequest(request, "approved")} className="px-4 py-2 text-xs font-bold text-white bg-black rounded-md hover:bg-gray-800 transition-colors">Approve</button>
                                                        </>
                                                    )}
                                                    {request.status !== "pending" && (
                                                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-500 rounded-full">{request.status}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center text-sm font-medium text-gray-500">
                                    No pending requests.
                                </div>
                            )}
                        </SectionContainer>

                    </div>
                </div>
            </div>
        </div>
    );
}

// ---------------- UI Components ----------------

const SectionContainer = ({ id, title, description, children }) => (
    <section id={id} className="scroll-mt-36">
        <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-black">{title}</h2>
            {description && <p className="mt-1 text-sm font-medium text-gray-500">{description}</p>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            {children}
        </div>
    </section>
);

const TextInput = ({ label, value, onChange, placeholder, helper }) => (
    <label className="block w-full">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">{label}</span>
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-11 rounded-md border border-gray-300 px-4 text-sm font-medium text-black placeholder:text-gray-400 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white" />
        {helper && <p className="mt-1.5 text-[11px] font-medium text-gray-400">{helper}</p>}
    </label>
);

const TextareaInput = ({ label, value, onChange, placeholder, helper }) => (
    <label className="block w-full">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">{label}</span>
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className="w-full rounded-md border border-gray-300 p-4 text-sm font-medium text-black placeholder:text-gray-400 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white resize-y" />
        {helper && <p className="mt-1.5 text-[11px] font-medium text-gray-400">{helper}</p>}
    </label>
);

const ImageInput = ({ label, currentImage, file, onChange }) => {
    const preview = file ? URL.createObjectURL(file) : getImageUrl(currentImage, "brands");
    return (
        <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">{label}</span>
            <div className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-black hover:bg-gray-100 transition-colors aspect-[21/9] sm:aspect-[4/1] flex items-center justify-center">
                {preview ? (
                    <>
                        <Image src={preview} alt={label} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" unoptimized />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs font-bold text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">Change Image</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <ImagePlus className="w-6 h-6" />
                        <span className="text-xs font-bold">Click to upload</span>
                    </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0] || null)} className="hidden" />
            </div>
        </label>
    );
};

const CardFileInput = ({ label, accept, currentFile, currentMedia, onChange }) => {
    const preview = currentFile ? URL.createObjectURL(currentFile) : (accept?.includes("image") ? getImageUrl(currentMedia, "brands") : null);
    const existingName = typeof currentMedia === "string" ? currentMedia : currentMedia?.originalname || currentMedia?.key;
    return (
        <label className="block w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block flex justify-between">
                {label}
                {currentFile && <button type="button" onClick={(e) => { e.preventDefault(); onChange(null); }} className="text-red-500 hover:text-red-700">Clear</button>}
            </span>
            <div className="relative flex items-center gap-4 p-3 rounded-md border border-gray-300 bg-white hover:border-black transition-colors cursor-pointer group">
                <div className="h-12 w-16 bg-gray-100 rounded flex items-center justify-center shrink-0 overflow-hidden relative border border-gray-200">
                    {preview ? <Image src={preview} alt={label} fill className="object-cover" unoptimized /> : <ImageIcon className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-black truncate">{currentFile?.name || existingName || "No file selected"}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Click to browse files</p>
                </div>
                <input type="file" accept={accept} onChange={(e) => onChange(e.target.files?.[0] || null)} className="hidden" />
            </div>
        </label>
    );
};

const GalleryInput = ({ existingMedia, newMedia, onExistingChange, onNewChange }) => {
    const totalCount = existingMedia.length + newMedia.length;
    const remainingSlots = Math.max(0, 8 - totalCount);
    const addFiles = (files) => {
        const accepted = Array.from(files || []).slice(0, remainingSlots);
        onNewChange((current) => [...current, ...accepted].slice(0, 8 - existingMedia.length));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h4 className="text-sm font-bold text-black">{totalCount} / 8 slots used</h4>
                    <p className="text-xs text-gray-500 mt-0.5">High-res landscape images work best.</p>
                </div>
                <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-colors ${remainingSlots > 0 ? "bg-black text-white hover:bg-gray-800 shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                    <Plus className="w-4 h-4" /> Add Media
                    <input type="file" accept="image/*,video/mp4" multiple disabled={remainingSlots === 0} onChange={(e) => addFiles(e.target.files)} className="hidden" />
                </label>
            </div>
            {totalCount > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {existingMedia.map((media, i) => <MediaTile key={i} url={getImageUrl(media, "brands")} isVideo={typeof media === "string" && /\.(mp4|webm|mov|avi)(\?|$)/i.test(media)} onRemove={() => onExistingChange((c) => c.filter((_, idx) => idx !== i))} />)}
                    {newMedia.map((file, i) => <MediaTile key={i} url={URL.createObjectURL(file)} isVideo={file.type.startsWith("video/")} onRemove={() => onNewChange((c) => c.filter((_, idx) => idx !== i))} />)}
                </div>
            ) : (
                <div className="py-16 border-2 border-dashed border-gray-200 rounded-lg text-center bg-gray-50">
                    <ImageIcon className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-bold text-gray-400">Empty Gallery</p>
                </div>
            )}
        </div>
    );
};

const MediaTile = ({ url, isVideo, onRemove }) => {
    return (
        <div className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 border border-gray-200 shadow-sm">
            {isVideo ? <video src={url} className="h-full w-full object-cover" muted playsInline /> : <Image src={url || "/Icons/arcmatlogo.svg"} alt="Media" fill className="object-cover" unoptimized />}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <button onClick={(e) => { e.preventDefault(); onRemove(); }} className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-red-700 shadow-sm">Remove</button>
            </div>
            {isVideo && <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider">Video</span>}
        </div>
    );
};

const EditableList = ({ title, items, setItems, createItem, children }) => (
    <div className="mt-8 border-t border-gray-200 pt-8">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-black">{title} <span className="text-xs font-medium text-gray-400 ml-2">({items.length})</span></h3>
            <button type="button" onClick={() => setItems((c) => [...c, createItem()])} className="flex items-center gap-1.5 text-xs font-bold text-black hover:text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md transition-colors"><Plus className="w-3.5 h-3.5" /> Add New</button>
        </div>
        {items.length > 0 ? (
            <div className="grid gap-6">
                {items.map((item, index) => (
                    <div key={index} className="relative rounded-lg border border-gray-200 bg-white p-5 shadow-sm group">
                        <div className="absolute top-4 right-4 z-10">
                            <button type="button" onClick={() => setItems((c) => c.filter((_, i) => i !== index))} className="p-1.5 rounded-md bg-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 pr-12">
                            {children(item, (key, value) => setItems((c) => c.map((it, i) => i === index ? { ...it, [key]: value } : it)))}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50"><p className="text-sm font-bold text-gray-400">No items added yet</p></div>
        )}
    </div>
);

const SelectionSection = ({ title, description, isLoading, items, selectedIds, onToggle, renderItem }) => (
    <SectionContainer id={title.toLowerCase().split(" ")[0]} title={title} description={description}>
        <div className="mb-4 flex items-center justify-end">
            <span className="text-[11px] font-bold uppercase tracking-wider text-black bg-gray-100 px-3 py-1 rounded-full">{selectedIds.length} currently active</span>
        </div>
        {isLoading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-black" /></div>
        ) : items.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                    const itemId = idOf(item);
                    const selected = selectedIds.includes(itemId);
                    return (
                        <button key={itemId} onClick={() => onToggle(itemId)} className={`group rounded-lg border p-3 text-left transition-all ${selected ? "border-black bg-gray-50 shadow-[0_0_0_1px_rgba(0,0,0,1)]" : "border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50"}`}>
                            <div className="flex items-center justify-between">
                                {renderItem(item)}
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ml-2 shrink-0 ${selected ? "border-black bg-black" : "border-gray-300"}`}>
                                    {selected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        ) : (
            <div className="py-12 border-2 border-dashed border-gray-200 rounded-lg text-center bg-gray-50"><p className="text-sm font-bold text-gray-400">No directory options available</p></div>
        )}
    </SectionContainer>
);

const OptionRow = ({ image, title, subtitle }) => {
    const [failed, setFailed] = useState(false);
    return (
        <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white border border-gray-200 text-lg font-bold text-gray-400 shadow-sm">
                {!failed && image && image !== "/Icons/arcmatlogo.svg" ? <Image src={image} alt={title} fill className="object-cover" unoptimized onError={() => setFailed(true)} /> : <span>{title?.charAt(0) || "A"}</span>}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-black">{title || "Untitled"}</p>
                <p className="truncate text-[11px] font-medium text-gray-500 mt-0.5">{subtitle || "Available"}</p>
            </div>
        </div>
    );
};
