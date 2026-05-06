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
import { ArrowUpRight, ImagePlus, Loader2, Plus, Save, Star, Trash2 } from "lucide-react";

const idOf = (item) => String(item?._id || item?.id || item || "");

const toggleId = (ids, value) => {
    const id = String(value);
    return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
};

const BespokeEditorPage = () => {
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

    // Seed local state once per brand (i.e. when the page first loads or switches brand).
    // After a save, we re-sync from the mutation response instead (see savePage below),
    // so the dep array stays a constant size — satisfying React's rules of hooks.
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
    }, [brand?._id]);

    const activeReviewCount = useMemo(
        () => reviews.filter((review) => review.name || review.comment).length,
        [reviews]
    );

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
        if (heroImage) formData.append("bespokeHeroImage", heroImage);
        galleryMedia.slice(0, Math.max(0, 8 - existingGalleryMedia.length)).forEach((file) => {
            formData.append("bespokeGalleryMedia", file);
        });

        try {
            const response = await updateBrand.mutateAsync({ id: brandId, data: formData });
            // Re-sync gallery from the server response so any removed images
            // stay gone without waiting for the useEffect to re-run.
            const savedBespoke = response?.data?.bespokePage || response?.bespokePage;
            if (savedBespoke) {
                setExistingGalleryMedia(
                    [...(savedBespoke.galleryMedia || []), ...(savedBespoke.customImage ? [savedBespoke.customImage] : [])].slice(0, 8)
                );
            }
            setHeroImage(null);
            setGalleryMedia([]);
            toast.success("Bespoke page updated");
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

    if (loading || brandLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-9 w-9 animate-spin text-[#e09a74]" />
            </div>
        );
    }

    if (!brand) {
        return (
            <Container className="py-10">
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
                    <h1 className="text-xl font-bold text-gray-900">Brand profile not found</h1>
                    <p className="mt-2 text-sm text-gray-500">Complete your brand profile before editing the bespoke page.</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-8">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-950">Bespoke Page Editor</h1>
                    <p className="mt-1 text-sm font-medium text-gray-500">Control the public bespoke page for {brand.name}.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href={`/bespoke/${brandId}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:border-[#e09a74] hover:text-[#e09a74]"
                    >
                        Preview
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={savePage}
                        disabled={updateBrand.isPending}
                        className="inline-flex items-center gap-2 rounded-full bg-[#e09a74] px-5 py-3 text-sm font-bold text-white hover:bg-[#c97f58] disabled:opacity-60"
                    >
                        {updateBrand.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Page
                    </button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    <section className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-gray-950">Story & Images</h2>
                            <label className="inline-flex items-center gap-2 text-sm font-bold text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={isPublished}
                                    onChange={(event) => setIsPublished(event.target.checked)}
                                    className="h-4 w-4 accent-[#e09a74]"
                                />
                                Published
                            </label>
                        </div>

                        <div className="grid gap-5">
                            <label className="block">
                                <span className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Headline</span>
                                <input
                                    value={headline}
                                    onChange={(event) => setHeadline(event.target.value)}
                                    placeholder={`${brand.name} bespoke materials for project-ready spaces`}
                                    className="mt-2 h-12 w-full rounded-lg border border-gray-200 px-4 text-sm font-medium outline-none focus:border-[#e09a74] focus:ring-4 focus:ring-[#e09a74]/10"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Bio</span>
                                <textarea
                                    value={bio}
                                    onChange={(event) => setBio(event.target.value)}
                                    rows={6}
                                    placeholder="Tell customers what this brand does best."
                                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium leading-6 outline-none focus:border-[#e09a74] focus:ring-4 focus:ring-[#e09a74]/10"
                                />
                            </label>

                            <div className="grid gap-4">
                                <ImageInput
                                    label="Hero Image"
                                    currentImage={bespoke.heroImage}
                                    file={heroImage}
                                    onChange={setHeroImage}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-gray-950">Brand Gallery</h2>
                            <p className="mt-1 text-sm font-medium text-gray-500">
                                Add 4 to 8 images or videos for a separate showcase section on the bespoke page.
                            </p>
                        </div>
                        <GalleryInput
                            existingMedia={existingGalleryMedia}
                            newMedia={galleryMedia}
                            onExistingChange={setExistingGalleryMedia}
                            onNewChange={setGalleryMedia}
                        />
                    </section>

                    <SelectionSection
                        title="Products To Show"
                        description="Pick the products that should appear first on the bespoke page."
                        isLoading={optionsLoading}
                        items={options.products || []}
                        selectedIds={selectedProducts}
                        onToggle={(id) => setSelectedProducts((current) => toggleId(current, id))}
                        renderItem={(product) => (
                            <OptionRow
                                image={getProductImageUrl(product.product_images?.[0])}
                                title={product.product_name}
                                subtitle={product.status === 1 ? "Active product" : "Inactive product"}
                            />
                        )}
                    />

                    <SelectionSection
                        title="Retailers To Display"
                        description="Retailers selected here will appear as official places to source this brand."
                        isLoading={optionsLoading}
                        items={options.retailers || []}
                        selectedIds={selectedRetailers}
                        onToggle={(id) => setSelectedRetailers((current) => toggleId(current, id))}
                        renderItem={(retailer) => (
                            <OptionRow
                                image={getImageUrl(retailer.profile, "userprofile")}
                                title={retailer.retailerProfile?.companyName || retailer.name}
                                subtitle={retailer.retailerProfile?.cityRegion || retailer.email}
                            />
                        )}
                    />

                    <SelectionSection
                        title="Contractors To Display"
                        description="Add trusted contractors or custom makers manually, or approve requests below."
                        isLoading={optionsLoading || requestsLoading}
                        items={contractorOptions}
                        selectedIds={selectedContractors}
                        onToggle={(id) => setSelectedContractors((current) => toggleId(current, id))}
                        renderItem={(contractor) => (
                            <OptionRow
                                image={getImageUrl(contractor.profileImage, "contractor")}
                                title={contractor.businessName}
                                subtitle={`${contractor.location?.city || "India"}${contractor.experienceYears ? `, ${contractor.experienceYears}+ years` : ""}`}
                            />
                        )}
                    />

                    <section className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-gray-950">Contractor Display Requests</h2>
                            <p className="mt-1 text-sm font-medium text-gray-500">
                                Contractors can ask to appear on this bespoke page. Approving a request adds them to the display list.
                            </p>
                        </div>
                        {requestsLoading ? (
                            <div className="flex h-24 items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-[#e09a74]" />
                            </div>
                        ) : contractorRequests.length > 0 ? (
                            <div className="space-y-3">
                                {contractorRequests.map((request) => {
                                    const contractor = request.contractorId;
                                    return (
                                        <div key={request._id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                <OptionRow
                                                    image={getImageUrl(contractor?.profileImage, "contractor")}
                                                    title={contractor?.businessName || "Contractor"}
                                                    subtitle={request.message || contractor?.tagline || "Requested display on this brand page"}
                                                />
                                                <div className="flex shrink-0 items-center gap-2">
                                                    <span className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${request.status === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : request.status === "rejected" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                                                        {request.status}
                                                    </span>
                                                    {request.status === "pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => decideContractorRequest(request, "approved")}
                                                                disabled={decideRequest.isPending}
                                                                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => decideContractorRequest(request, "rejected")}
                                                                disabled={decideRequest.isPending}
                                                                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:border-red-200 hover:text-red-600 disabled:opacity-60"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {request.status === "approved" && (
                                                        <button
                                                            onClick={() => decideContractorRequest(request, "rejected")}
                                                            disabled={decideRequest.isPending}
                                                            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:border-red-200 hover:text-red-600 disabled:opacity-60"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-medium text-gray-500">
                                No contractor requests yet.
                            </div>
                        )}
                    </section>
                </div>

                <aside className="space-y-6">
                    <section className="rounded-lg border border-gray-200 bg-white p-6">
                        <h2 className="text-lg font-bold text-gray-950">Page Summary</h2>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <SummaryPill label="Products" value={selectedProducts.length} />
                            <SummaryPill label="Retailers" value={selectedRetailers.length} />
                            <SummaryPill label="Contractors" value={selectedContractors.length} />
                            <SummaryPill label="Reviews" value={activeReviewCount} />
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-950">Reviews</h2>
                            <button
                                onClick={() => setReviews((current) => [...current, { name: "", role: "", rating: 5, comment: "" }])}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-[#e09a74] hover:text-[#e09a74]"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {reviews.map((review, index) => (
                                <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Review {index + 1}</span>
                                        <button
                                            onClick={() => setReviews((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            value={review.name || ""}
                                            onChange={(event) => setReviews((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))}
                                            placeholder="Customer name"
                                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#e09a74]"
                                        />
                                        <input
                                            value={review.role || ""}
                                            onChange={(event) => setReviews((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value } : item))}
                                            placeholder="Role or project"
                                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#e09a74]"
                                        />
                                        <select
                                            value={review.rating || 5}
                                            onChange={(event) => setReviews((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, rating: Number(event.target.value) } : item))}
                                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#e09a74]"
                                        >
                                            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
                                        </select>
                                        <textarea
                                            value={review.comment || ""}
                                            onChange={(event) => setReviews((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, comment: event.target.value } : item))}
                                            placeholder="Review text"
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#e09a74]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </Container>
    );
};

const ImageInput = ({ label, currentImage, file, onChange }) => {
    const preview = file ? URL.createObjectURL(file) : getImageUrl(currentImage, "brands");

    return (
        <label className="block rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
            <span className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                <ImagePlus className="h-4 w-4" />
                {label}
            </span>
            <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-white">
                {preview ? (
                    <Image src={preview} alt={label} fill className="object-cover" unoptimized />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm font-medium text-gray-400">No image</div>
                )}
            </div>
            <input type="file" accept="image/*" onChange={(event) => onChange(event.target.files?.[0] || null)} className="text-sm" />
        </label>
    );
};

const isVideoMedia = (media) => {
    const url = typeof media === "string" ? media : media?.secure_url || media?.url || media?.location || "";
    return /\.(mp4|webm|mov|avi)(\?|$)/i.test(url);
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
            <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <div>
                    <p className="text-sm font-bold text-gray-950">{totalCount} / 8 media selected</p>
                    <p className="text-xs font-medium text-gray-500">Recommended: at least 4 for a balanced showcase.</p>
                </div>
                <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${remainingSlots > 0 ? "bg-[#e09a74] text-white hover:bg-[#c97f58]" : "bg-gray-200 text-gray-400"}`}>
                    <ImagePlus className="h-4 w-4" />
                    Add Media
                    <input
                        type="file"
                        accept="image/*,video/mp4,video/webm,video/quicktime"
                        multiple
                        disabled={remainingSlots === 0}
                        onChange={(event) => addFiles(event.target.files)}
                        className="hidden"
                    />
                </label>
            </div>

            {totalCount > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {existingMedia.map((media, index) => {
                        const url = getImageUrl(media, "brands");
                        return (
                            <MediaTile
                                key={`${url}-${index}`}
                                url={url}
                                isVideo={isVideoMedia(media)}
                                onRemove={() => onExistingChange((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                            />
                        );
                    })}
                    {newMedia.map((file, index) => {
                        const url = URL.createObjectURL(file);
                        return (
                            <MediaTile
                                key={`${file.name}-${index}`}
                                url={url}
                                isVideo={file.type.startsWith("video/")}
                                onRemove={() => onNewChange((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-sm font-medium text-gray-500">
                    No gallery media yet.
                </div>
            )}
        </div>
    );
};

const MediaTile = ({ url, isVideo, onRemove }) => {
    const [confirming, setConfirming] = React.useState(false);

    return (
        <div className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            {isVideo ? (
                <video src={url} className="h-full w-full object-cover" muted playsInline />
            ) : (
                <Image src={url || "/Icons/arcmatlogo.svg"} alt="Gallery media" fill className="object-cover" unoptimized />
            )}

            {confirming ? (
                /* Confirmation overlay */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 backdrop-blur-sm">
                    <p className="text-xs font-bold text-white text-center px-2">Delete this image?</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { onRemove(); setConfirming(false); }}
                            className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 transition-colors"
                        >
                            Yes, Delete
                        </button>
                        <button
                            onClick={() => setConfirming(false)}
                            className="rounded-full bg-white/20 border border-white/40 px-3 py-1 text-xs font-bold text-white hover:bg-white/30 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                /* Initial Remove button — shows on hover */
                <button
                    onClick={() => setConfirming(true)}
                    className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-red-600 opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-red-600 hover:text-white"
                >
                    Remove
                </button>
            )}

            {isVideo && !confirming && (
                <span className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    Video
                </span>
            )}
        </div>
    );
};

const SelectionSection = ({ title, description, isLoading, items, selectedIds, onToggle, renderItem }) => (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h2 className="text-lg font-bold text-gray-950">{title}</h2>
                <p className="mt-1 text-sm font-medium text-gray-500">{description}</p>
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#b76b45]">{selectedIds.length} selected</span>
        </div>
        {isLoading ? (
            <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#e09a74]" />
            </div>
        ) : items.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                    const itemId = idOf(item);
                    const selected = selectedIds.includes(itemId);
                    return (
                        <button
                            key={itemId}
                            onClick={() => onToggle(itemId)}
                            className={`rounded-lg border p-3 text-left transition ${selected ? "border-[#e09a74] bg-[#fff7f2]" : "border-gray-200 bg-white hover:border-gray-300"}`}
                        >
                            {renderItem(item)}
                        </button>
                    );
                })}
            </div>
        ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-medium text-gray-500">No options available yet.</div>
        )}
    </section>
);

const OptionRow = ({ image, title, subtitle }) => {
    const [failed, setFailed] = useState(false);
    const isLogo = !image || image === "/Icons/arcmatlogo.svg";
    const initial = String(title || "A").trim().charAt(0).toUpperCase() || "A";

    return (
        <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-lg font-black text-gray-500">
                {!failed && !isLogo ? (
                    <Image 
                        src={image} 
                        alt={title || "Option"} 
                        fill 
                        className="object-cover" 
                        unoptimized 
                        onError={() => setFailed(true)}
                    />
                ) : (
                    <span>{initial}</span>
                )}
            </div>
            <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-950">{title || "Untitled"}</p>
                <p className="truncate text-xs font-medium text-gray-500">{subtitle || "Available"}</p>
            </div>
        </div>
    );
};

const SummaryPill = ({ label, value }) => (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-950">{value}</p>
    </div>
);

export default BespokeEditorPage;
