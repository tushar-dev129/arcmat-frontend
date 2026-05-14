"use client";

import { useState, use, useEffect } from "react";
import { useGetContractorBySlug, useCreateContractorLead } from "@/hooks/useContractor";
import Container from "@/components/ui/Container";
import { getImageUrl } from "@/lib/productUtils";
import clsx from "clsx";
import Image from "next/image";
import {
    Star,
    MapPin,
    Briefcase,
    CheckCircle2,
    MessageSquare,
    Share2,
    Heart,
    Calendar,
    ChevronLeft,
    Image as ImageIcon,
    Play,
    Lock,
    Phone,
    Mail,
    Globe,
    MessageCircle,
    Clock
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toast";
import { useGetCategoryTree } from "@/hooks/useCategory";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const formatTime = (timeStr) => {
    if (!timeStr || timeStr === "--:--" || timeStr === "") return null;
    try {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    } catch (e) {
        return timeStr;
    }
};

const DAYS = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
];

export default function ContractorProfilePage({ params }) {
    const { slug } = use(params);
    const { data: contractorResponse, isLoading, error } = useGetContractorBySlug(slug);
    const createLeadMutation = useCreateContractorLead();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const { data: categoriesResponse } = useGetCategoryTree({ categoryType: 'contractor_service' });
    const categories = categoriesResponse?.data || categoriesResponse || [];

    const [leadForm, setLeadForm] = useState({
        name: "",
        phone: "",
        requirement: "",
        location: ""
    });
    const [showContactInfo, setShowContactInfo] = useState(false);

    // Pre-fill form with logged-in user's details
    useEffect(() => {
        if (user) {
            setLeadForm(prev => ({
                ...prev,
                name: user.name || prev.name,
                phone: user.mobile || user.phone || prev.phone,
                location: user.city || user.location?.city || prev.location,
            }));
        }
    }, [user]);

    // Helper to find category by ID in a nested tree
    const findCategoryInTree = (tree, id) => {
        if (!tree || !id) return null;
        for (const node of tree) {
            if (String(node._id) === String(id)) return node;
            if (node.children) {
                const found = findCategoryInTree(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;

    const contractor = contractorResponse?.data || contractorResponse;

    if (error || !contractor) return <div className="min-h-screen flex items-center justify-center">Profile not found.</div>;

    const handleSubmitLead = async (e) => {
        e.preventDefault();
        // Guard: require login to submit
        if (!isAuthenticated) {
            toast.error("Please log in to send an inquiry.");
            router.push("/auth/login");
            return;
        }
        if (leadForm.phone && !/^\d{10}$/.test(leadForm.phone)) {
            toast.error("Please provide a valid 10-digit phone number");
            return;
        }
        try {
            await createLeadMutation.mutateAsync({
                contractorId: contractor._id,
                ...leadForm
            });
            toast.success("Inquiry sent successfully!");
            setLeadForm({ name: "", phone: "", requirement: "", location: "" });
        } catch (err) {
            toast.error("Failed to send inquiry.");
        }
    };

    return (
        <main className="bg-[hsl(30,20%,98%)] min-h-screen pb-20">
            {/* Navigation Bar */}
            <div className="bg-white border-b border-[hsl(30,15%,90%)] sticky top-0 z-40">
                <Container>
                    <div className="flex items-center justify-between py-4">
                        <Link href="/contractors" className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-primary transition-all">
                            <ChevronLeft className="w-4 h-4" />
                            Back to Contractors
                        </Link>
                        {/* <div className="flex items-center gap-4">
                            <button className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                                <Share2 className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                                <Heart className="w-4 h-4 text-gray-500" />
                            </button>
                        </div> */}
                    </div>
                </Container>
            </div>

            {/* Hero Section */}
            <section className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-white via-orange-50/20 to-white">
                {contractor.coverImage && (
                    <Image
                        src={getImageUrl(contractor.coverImage, "contractors")}
                        alt={contractor.businessName}
                        fill
                        className="object-cover opacity-60"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(30,20%,98%)] via-transparent to-transparent" />
            </section>

            <Container className="-mt-16 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Sidebar: Profile & Stats (4/12) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-3xl p-6 border border-[hsl(30,15%,90%)] shadow-sm text-center">
                            <div className="relative h-40 w-40 mx-auto rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gray-50 mb-6">
                                <Image
                                    src={getImageUrl(contractor.profileImage, "contractors") || "/Icons/arcmatlogo.svg"}
                                    alt={contractor.businessName}
                                    fill
                                    className={clsx(
                                        "transition-all duration-300",
                                        (contractor.profileImage && contractor.profileImage !== 'undefined' && contractor.profileImage !== 'null')
                                            ? "object-cover"
                                            : "object-contain p-8 opacity-30 grayscale"
                                    )}
                                />
                            </div>
                            <h1 className="text-2xl font-semibold text-gray-900 mb-1">{contractor.businessName}</h1>
                            {contractor.isVerified && (
                                <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-medium border border-blue-100 mb-4">
                                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                                </div>
                            )}
                            <p className="text-gray-500 font-medium text-sm italic px-4">"{contractor.tagline || "Providing premium bespoke services."}"</p>

                            <div className="mt-8 pt-8 border-t border-gray-50 space-y-4 text-left">
                                
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                                        <Briefcase className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-400 font-medium">Experience</span>
                                        <span className="text-sm font-semibold text-gray-800">{contractor.experienceYears || "5+"} Years</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-400 font-medium">Rating</span>
                                        <span className="text-sm font-semibold text-gray-800">4.8 / 5.0</span>
                                    </div>
                                </div>
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
                                    className="w-full py-3.5 bg-primary text-white rounded-2xl text-sm font-medium hover:bg-[#c99775] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    <Phone className="w-4 h-4" />
                                    {showContactInfo ? "Hide Contact" : "Contact Info"}
                                </button>

                                {showContactInfo && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 animate-fade-in text-left">
                                        {(contractor.contact?.phone || contractor.userId?.mobile) && (
                                            <div className="flex items-center gap-4">
                                                <Phone className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-semibold text-gray-800">+91 {contractor.contact?.phone || contractor.userId?.mobile}</span>
                                            </div>
                                        )}
                                        {(contractor.contact?.email || contractor.userId?.email) && (
                                            <div className="flex items-center gap-4">
                                                <Mail className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-semibold text-gray-800 break-all">{contractor.contact?.email || contractor.userId?.email}</span>
                                            </div>
                                        )}
                                        {contractor.contact?.whatsapp && (
                                            <div className="flex items-center gap-4">
                                                <MessageCircle className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-semibold text-gray-800">+91 {contractor.contact.whatsapp}</span>
                                            </div>
                                        )}
                                        {contractor.contact?.website && (
                                            <div className="flex items-center gap-4">
                                                <Globe className="w-4 h-4 text-primary" />
                                                <a href={contractor.contact.website.startsWith('http') ? contractor.contact.website : `https://${contractor.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-800 hover:underline break-all">
                                                    {contractor.contact.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        )}
                                        {contractor.location?.city && (
                                            <div className="flex items-center gap-4">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-semibold text-gray-800">{contractor.location.city}, {contractor.location.state}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Expertise Card */}
                        <div className="bg-white rounded-3xl p-6 border border-[hsl(30,15%,90%)] shadow-sm space-y-6">
                            <div className="space-y-2">
                                <span className="block text-[10px] text-gray-400 font-medium">Primary Category</span>
                                <div className="inline-flex items-center px-4 py-2 bg-primary/5 text-primary rounded-xl text-sm font-semibold border border-primary/10">
                                    {contractor.categoryId === 'other'
                                        ? contractor.otherCategoryName
                                        : (typeof contractor.categoryId === 'object'
                                            ? (contractor.categoryId.name || "Professional")
                                            : (findCategoryInTree(categories, contractor.categoryId)?.name || "Professional"))}
                                </div>
                            </div>

                            {(contractor.subcategoryIds?.length > 0 || contractor.subcategoryId) && (
                                <div className="space-y-2">
                                    <span className="block text-[10px] text-gray-400 font-medium">Specializations</span>
                                    <div className="flex flex-wrap gap-2">
                                        {contractor.subcategoryId && !contractor.subcategoryIds?.includes(contractor.subcategoryId) && (
                                            <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold border border-gray-100">
                                                {findCategoryInTree(categories, contractor.categoryId)?.children?.find(s => s._id === contractor.subcategoryId)?.name || "General"}
                                            </span>
                                        )}
                                        {contractor.subcategoryIds?.map(subId => {
                                            if (subId === "other_sub") return (
                                                <span key={subId} className="px-3 py-1.5 bg-primary/5 text-primary rounded-lg text-xs font-semibold border border-primary/10">
                                                    Other: {contractor.otherSubcategoryName}
                                                </span>
                                            );
                                            let subName = null;
                                            const catId = typeof contractor.categoryId === 'object' ? contractor.categoryId._id : contractor.categoryId;
                                            const group = findCategoryInTree(categories, catId);
                                            if (group) subName = group.children?.find(s => s._id === subId)?.name;
                                            return subName ? (
                                                <span key={subId} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold border border-gray-100">
                                                    {subName}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Content Column (8/12) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* About Section */}
                        <div className="bg-white rounded-3xl p-8 border border-[hsl(30,15%,90%)] shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                About the Professional
                            </h2>
                            <div className="text-gray-600 leading-relaxed prose prose-slate max-w-none">
                                {contractor.overview ? (
                                    <p className="whitespace-pre-line">{contractor.overview}</p>
                                ) : (
                                    <p className="italic text-gray-400">No professional summary provided yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Working Hours Section */}
                        {contractor.availability?.workingHours && (
                            <div className="bg-white rounded-3xl p-8 border border-[hsl(30,15%,90%)] shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                                    Working Hours
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    {DAYS.map(day => {
                                        const hours = contractor.availability.workingHours[day.id];
                                        if (!hours || (!hours.from && !hours.to && !hours.isClosed)) return null;

                                        return (
                                            <div key={day.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                                <span className="text-sm font-medium text-gray-500">{day.label}</span>
                                                <div className="flex items-center gap-2">
                                                    {hours.isClosed ? (
                                                        <span className="px-2.5 py-0.5 bg-red-50 text-red-500 rounded-full text-[10px] font-bold tracking-wider border border-red-100">CLOSED</span>
                                                    ) : (
                                                        <span className="text-sm font-bold text-gray-800">
                                                            {formatTime(hours.from)} - {formatTime(hours.to)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Portfolio Section */}
                        <div className="bg-white rounded-3xl p-8 border border-[hsl(30,15%,90%)] shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                                    Portfolio & Projects
                                </h2>
                                <span className="px-3 py-1 bg-orange-50 text-primary rounded-full text-[10px] font-semibold border border-orange-100">
                                    {contractor.portfolio?.length || 0} PROJECTS
                                </span>
                            </div>

                            {contractor.portfolio && contractor.portfolio.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {contractor.portfolio.map((item, idx) => (
                                        <Link href={`/projects/${item._id}`} key={idx} className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 block">
                                            {item.images?.[0] ? (
                                                <Image
                                                    src={getImageUrl(item.images[0], "contractor-portfolio") || "/images/placeholder-project.jpg"}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="h-full bg-gray-50 flex items-center justify-center">
                                                    <ImageIcon className="w-10 h-10 text-gray-200" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 translate-y-2 group-hover:translate-y-0">
                                                <h4 className="text-white font-semibold text-lg">{item.title}</h4>
                                                <p className="text-orange-200 text-[10px] font-medium mt-1 uppercase tracking-wider">{item.location || item.projectType || "Project"}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 font-medium text-sm">No portfolio items added yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Inquiry Form Card */}
                        <div className="bg-white rounded-3xl p-8 border border-[hsl(30,15%,90%)] shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110" />

                            <div className="relative z-10">
                                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Get a Quote</h3>
                                <p className="text-gray-500 text-sm mb-8 font-medium">Send your requirements and get a callback from <span className="text-primary font-semibold">{contractor.businessName}</span>.</p>

                                <form onSubmit={handleSubmitLead} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-medium text-gray-400">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:bg-white transition-all text-sm font-semibold text-gray-800"
                                            placeholder="e.g. John Doe"
                                            value={leadForm.name}
                                            onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-medium text-gray-400">Mobile Number</label>
                                        <input
                                            type="tel"
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:bg-white transition-all text-sm font-semibold text-gray-800"
                                            placeholder="10-digit Mobile Number"
                                            maxLength="10"
                                            value={leadForm.phone}
                                            onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-medium text-gray-400">Your Location</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:bg-white transition-all text-sm font-semibold text-gray-800"
                                            placeholder="City, Pincode"
                                            value={leadForm.location}
                                            onChange={(e) => setLeadForm({ ...leadForm, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-medium text-gray-400">Requirement Details</label>
                                        <textarea
                                            rows="4"
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:bg-white transition-all text-sm font-semibold text-gray-800 resize-none"
                                            placeholder="Describe what you need..."
                                            value={leadForm.requirement}
                                            onChange={(e) => setLeadForm({ ...leadForm, requirement: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={createLeadMutation.isPending}
                                            className="w-full py-5 bg-primary hover:bg-[#c99775] disabled:bg-gray-300 text-white font-medium text-sm rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-[0.98]"
                                        >
                                            {isAuthenticated ? (
                                                <MessageSquare className="w-4 h-4" />
                                            ) : (
                                                <Lock className="w-4 h-4" />
                                            )}
                                            {createLeadMutation.isPending ? "Sending..." : isAuthenticated ? "Submit Inquiry" : "Login to Submit"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    );
}
