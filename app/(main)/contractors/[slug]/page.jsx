"use client";

import { useState } from "react";
import { useGetContractorBySlug, useCreateContractorLead } from "@/hooks/useContractor";
import Container from "@/components/ui/Container";
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
import { toast } from "react-hot-toast";

export default function ContractorProfilePage({ params }) {
    const { slug } = params;
    const { data: contractor, isLoading, error } = useGetContractorBySlug(slug);
    const createLeadMutation = useCreateContractorLead();

    const [leadForm, setLeadForm] = useState({
        name: "",
        phone: "",
        requirement: "",
        location: ""
    });

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;
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
                        <Link href="/contractors" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[hsl(15,80%,60%)] transition-all">
                            <ChevronLeft className="w-4 h-4" />
                            Back to Network
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
                    src={contractor.coverImage?.url || "/images/placeholder-cover.jpg"} 
                    alt={contractor.businessName}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </section>

            <Container className="-mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Profile Info */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-8 border border-[hsl(30,15%,90%)] shadow-sm">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Profile Image */}
                                <div className="relative h-32 w-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-50 flex-shrink-0">
                                    <Image 
                                        src={contractor.profileImage?.url || "/images/placeholder-profile.jpg"} 
                                        alt={contractor.businessName}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-[hsl(20,10%,15%)]">{contractor.businessName}</h1>
                                        {contractor.isVerified && (
                                            <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">
                                                <CheckCircle2 className="w-3 h-3" /> VERIFIED
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 font-medium text-lg mb-6">{contractor.tagline || "Professional Contractor & Bespoke Maker"}</p>
                                    
                                    <div className="flex flex-wrap gap-6">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-[hsl(15,80%,60%)]" />
                                            <div>
                                                <span className="block text-xs text-gray-400 font-bold uppercase">Location</span>
                                                <span className="text-sm font-bold">{contractor.location?.city}, {contractor.location?.state}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-[hsl(15,80%,60%)]" />
                                            <div>
                                                <span className="block text-xs text-gray-400 font-bold uppercase">Experience</span>
                                                <span className="text-sm font-bold">{contractor.experienceYears || "5+"} Years</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                            <div>
                                                <span className="block text-xs text-gray-400 font-bold uppercase">Rating</span>
                                                <span className="text-sm font-bold">4.8 / 5.0</span>
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
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-[hsl(20,10%,15%)] flex items-center gap-2">
                                        <div className="w-1 h-6 bg-[hsl(15,80%,60%)] rounded-full" />
                                        Portfolio & Projects
                                    </h2>
                                    <span className="text-sm font-bold text-[hsl(15,80%,60%)]">{contractor.portfolio?.length || 0} Projects</span>
                                </div>
                                
                                {contractor.portfolio && contractor.portfolio.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {contractor.portfolio.map((item, idx) => (
                                            <div key={idx} className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer border border-gray-100">
                                                <Image 
                                                    src={item.images?.[0]?.url || "/images/placeholder-project.jpg"} 
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                                                    <h4 className="text-white font-bold text-lg">{item.title}</h4>
                                                    <p className="text-gray-300 text-xs mt-1">{item.projectType || "Residential Project"}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-2xl py-20 flex flex-col items-center border border-dashed border-gray-200">
                                        <ImageIcon className="w-12 h-12 text-gray-300 mb-4" />
                                        <p className="text-gray-400 font-medium">No portfolio items added yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Inquiry Form & Quick Info */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                            
                            {/* Lead Form */}
                            <div className="bg-[hsl(20,10%,15%)] rounded-3xl p-8 border border-white/5 shadow-2xl text-white">
                                <h3 className="text-2xl font-bold mb-2">Get a Quote</h3>
                                <p className="text-gray-400 text-sm mb-8">Send your requirements and get a callback from {contractor.businessName}.</p>
                                
                                <form onSubmit={handleSubmitLead} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[hsl(15,80%,65%)] transition-all text-sm"
                                            placeholder="John Doe"
                                            value={leadForm.name}
                                            onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Mobile Number</label>
                                        <input 
                                            type="tel" 
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[hsl(15,80%,65%)] transition-all text-sm"
                                            placeholder="+91 98765 43210"
                                            value={leadForm.phone}
                                            onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Your Location</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[hsl(15,80%,65%)] transition-all text-sm"
                                            placeholder="City, Pincode"
                                            value={leadForm.location}
                                            onChange={(e) => setLeadForm({...leadForm, location: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Requirement Details</label>
                                        <textarea 
                                            rows="4" 
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[hsl(15,80%,65%)] transition-all text-sm resize-none"
                                            placeholder="Describe what you need..."
                                            value={leadForm.requirement}
                                            onChange={(e) => setLeadForm({...leadForm, requirement: e.target.value})}
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={createLeadMutation.isPending}
                                        className="w-full py-4 bg-[hsl(15,80%,65%)] hover:bg-[hsl(15,80%,70%)] disabled:bg-gray-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[hsl(15,80%,65%)]/20"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        {createLeadMutation.isPending ? "Sending..." : "Submit Inquiry"}
                                    </button>
                                </form>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-white rounded-3xl p-8 border border-[hsl(30,15%,90%)] shadow-sm">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Service Overview</h4>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">Starting Price</span>
                                        <span className="text-sm font-bold text-[hsl(20,10%,15%)]">₹ {contractor.pricing?.startingPrice || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">Response Time</span>
                                        <span className="text-sm font-bold text-green-600">Under 2 Hours</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">Languages</span>
                                        <span className="text-sm font-bold text-[hsl(20,10%,15%)]">Hindi, English</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </Container>
        </main>
    );
}
