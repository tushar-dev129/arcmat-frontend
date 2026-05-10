"use client";

import { useState, use } from "react";
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
    Play
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toast";

export default function ContractorProfilePage({ params }) {
    const { slug } = use(params);
    const { data: contractorResponse, isLoading, error } = useGetContractorBySlug(slug);
    const createLeadMutation = useCreateContractorLead();

    const [leadForm, setLeadForm] = useState({
        name: "",
        phone: "",
        requirement: "",
        location: ""
    });

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;

    const contractor = contractorResponse?.data || contractorResponse;

    if (error || !contractor) return <div className="min-h-screen flex items-center justify-center">Profile not found.</div>;

    const handleSubmitLead = async (e) => {
        e.preventDefault();
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
                        <Link href="/contractors" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-all">
                            <ChevronLeft className="w-4 h-4" />
                            Back 
                        </Link>
                        <div className="flex items-center gap-4">
                            <button className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                                <Share2 className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                                <Heart className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Hero Section */}
            <section className="relative h-80 w-full overflow-hidden">
                <Image 
                    src={getImageUrl(contractor.coverImage, "contractors") || "/Icons/arcmatlogo.svg"} 
                    alt={contractor.businessName}
                    fill
                    className="p-10 object-contain opacity-20 grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
            </section>

            <Container className="-mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Profile Info */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-8 border border-[hsl(30,15%,90%)] shadow-sm">
                            <div className="flex flex-col md:flex-row gap-8 items-start pb-8 border-b border-gray-100">
                                {/* Profile Image */}
                                <div className="relative h-32 w-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-gray-50 flex-shrink-0">
                                    <Image 
                                        src={getImageUrl(contractor.profileImage, "contractors") || "/Icons/arcmatlogo.svg"} 
                                        alt={contractor.businessName}
                                        fill
                                        className={clsx(
                                            "transition-all duration-300",
                                            (contractor.profileImage && contractor.profileImage !== 'undefined' && contractor.profileImage !== 'null') 
                                                ? "object-cover" 
                                                : "object-contain p-6 opacity-30 grayscale"
                                        )}
                                    />
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-black text-gray-900">{contractor.businessName}</h1>
                                        {contractor.isVerified && (
                                            <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-blue-100">
                                                <CheckCircle2 className="w-3 h-3" /> VERIFIED
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 font-bold text-lg mb-8 italic">"{contractor.tagline || "Providing premium bespoke services."}"</p>
                                    
                                    <div className="flex flex-wrap gap-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                                                <MapPin className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <span className="block text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Location</span>
                                                <span className="text-sm font-bold text-gray-800">{contractor.location?.city || "Mumbai"}, {contractor.location?.state || "Maharashtra"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                                                <Briefcase className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <span className="block text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Experience</span>
                                                <span className="text-sm font-bold text-gray-800">{contractor.experienceYears || "5+"} Years</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                            </div>
                                            <div>
                                                <span className="block text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Rating</span>
                                                <span className="text-sm font-bold text-gray-800">4.8 / 5.0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About Section */}
                            <div className="mt-12">
                                <h2 className="text-xl font-bold text-[hsl(20,10%,15%)] mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-[hsl(15,80%,60%)] rounded-full" />
                                    About the Professional
                                </h2>
                                <div className="text-gray-600 leading-relaxed space-y-4">
                                    <p>{contractor.overview || "No overview provided."}</p>
                                </div>
                            </div>

                            {/* Portfolio Preview */}
                            <div className="mt-12">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                        <div className="w-1.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
                                        Portfolio & Projects
                                    </h2>
                                    <span className="px-4 py-1.5 bg-orange-50 text-primary rounded-full text-xs font-black uppercase tracking-widest border border-orange-100">
                                        {contractor.portfolio?.length || 0} Projects
                                    </span>
                                </div>
                                
                                {contractor.portfolio && contractor.portfolio.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {contractor.portfolio.map((item, idx) => (
                                            <Link href={`/projects/${item._id}`} key={idx} className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 block">
                                                {item.images?.[0] ? (
                                                    <Image 
                                                        src={getImageUrl(item.images[0], "contractor-portfolio") || "/images/placeholder-project.jpg"} 
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : item.videos?.[0] ? (
                                                    <video
                                                        src={item.videos[0]}
                                                        className="w-full h-full object-cover"
                                                        controls
                                                    />
                                                ) : (
                                                    <div className="h-full bg-gray-50 flex items-center justify-center">
                                                        <ImageIcon className="w-12 h-12 text-gray-300" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0">
                                                    <h4 className="text-white font-black text-xl">{item.title}</h4>
                                                    <p className="text-orange-200 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{item.location || item.projectType || "Portfolio Project"}</p>
                                                    {item.description && (
                                                        <p className="text-gray-300 text-sm mt-3 line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl py-24 flex flex-col items-center border border-dashed border-gray-200">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No portfolio items added yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Inquiry Form */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            
                            {/* Lead Form */}
                            <div className="bg-white rounded-2xl p-4 md:p-5 border-2 border-primary/10 shadow-2xl shadow-primary/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110" />
                                
                                <div className="relative z-10">
                                    <h3 className="text-3xl font-black text-gray-900 mb-2">Get a Quote</h3>
                                    <p className="text-gray-500 text-sm mb-10 font-medium leading-relaxed">Send your requirements and get a callback from <span className="text-primary font-black">{contractor.businessName}</span>.</p>
                                    
                                    <form onSubmit={handleSubmitLead} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Full Name</label>
                                            <input 
                                                type="text" 
                                                required
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold text-gray-800"
                                                placeholder="e.g. John Doe"
                                                value={leadForm.name}
                                                onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Mobile Number</label>
                                            <input 
                                                type="tel" 
                                                required
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold text-gray-800"
                                                placeholder="+91 XXXXX XXXXX"
                                                value={leadForm.phone}
                                                onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Your Location</label>
                                            <input 
                                                type="text" 
                                                required
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold text-gray-800"
                                                placeholder="City, Pincode"
                                                value={leadForm.location}
                                                onChange={(e) => setLeadForm({...leadForm, location: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Requirement Details</label>
                                            <textarea 
                                                rows="4" 
                                                required
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold text-gray-800 resize-none"
                                                placeholder="Describe what you need..."
                                                value={leadForm.requirement}
                                                onChange={(e) => setLeadForm({...leadForm, requirement: e.target.value})}
                                            />
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={createLeadMutation.isPending}
                                            className="w-full py-5 bg-primary hover:bg-[hsl(15,80%,55%)] disabled:bg-gray-300 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-[0.98]"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            {createLeadMutation.isPending ? "Sending..." : "Submit Inquiry"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </Container>
        </main>
    );
}
