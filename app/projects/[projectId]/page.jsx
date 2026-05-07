'use client';

import { use, useState } from 'react';
import { useGetPortfolioItemById } from '@/hooks/useContractor';
import { 
    MapPin, 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    ArrowLeft,
    Phone,
    MessageCircle,
    Share2,
    CheckCircle2,
    Clock,
    Briefcase
} from 'lucide-react';
import { getImageUrl } from "@/lib/productUtils";
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

export default function ProjectDetailsPage({ params }) {
    const { projectId } = use(params);
    const { data: projectResponse, isLoading, error } = useGetPortfolioItemById(projectId);
    const project = projectResponse?.data || projectResponse;
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <Container className="py-20 text-center">
                <div className="max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Project Not Found</h2>
                    <p className="text-gray-500 mb-8">The project you're looking for doesn't exist or has been removed.</p>
                    <Link href="/contractors">
                        <Button className="bg-primary text-white px-8 py-3 rounded-xl font-bold">
                            Explore Contractors
                        </Button>
                    </Link>
                </div>
            </Container>
        );
    }

    const nextImage = () => {
        setActiveImageIndex((prev) => (prev + 1) % project.images.length);
    };

    const prevImage = () => {
        setActiveImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
    };

    return (
        <div className="bg-gray-50/50 min-h-screen pb-20">
            {/* Top Bar / Navigation */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-md bg-white/80">
                <Container className="py-4 flex items-center justify-between">
                    <Link href={`/contractors/${project.contractorId?.slug || ''}`} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Profile
                    </Link>
                    <div className="flex items-center gap-3">
                        <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </Container>
            </div>

            <Container className="py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    {/* Left Column: Visuals */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                        <div className="relative aspect-[16/10] bg-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl group">
                            {project.images?.length > 0 ? (
                                <img 
                                    src={getImageUrl(project.images[activeImageIndex], "contractor-portfolio")} 
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Briefcase className="w-20 h-20 text-gray-200" />
                                </div>
                            )}

                            {project.images?.length > 1 && (
                                <>
                                    <button 
                                        onClick={prevImage}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button 
                                        onClick={nextImage}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                    
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                                        {project.images.map((_, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeImageIndex ? 'bg-white w-4' : 'bg-white/40'}`} 
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {project.images?.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {project.images.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 transition-all border-2 ${idx === activeImageIndex ? 'border-primary ring-4 ring-primary/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={getImageUrl(img, "contractor-portfolio")} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Info */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                                    {project.projectType || 'Portfolio Project'}
                                </div>
                                {project.location && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        <MapPin className="w-3 h-3" />
                                        {project.location}
                                    </div>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-6">
                                {project.title}
                            </h1>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                {project.description}
                            </p>
                        </div>

                        {/* Project Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                <Calendar className="w-5 h-5 text-primary mb-3" />
                                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Completed</div>
                                <div className="text-sm font-bold text-gray-900">
                                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                <Clock className="w-5 h-5 text-primary mb-3" />
                                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Duration</div>
                                <div className="text-sm font-bold text-gray-900">{project.duration || 'N/A'}</div>
                            </div>
                        </div>

                        {/* Contractor Card */}
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Built By</div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                                    <img 
                                        src={getImageUrl(project.contractorId?.profileImage, 'contractors')} 
                                        alt={project.contractorId?.businessName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-gray-900 leading-tight mb-1">
                                        {project.contractorId?.businessName}
                                    </h3>
                                    <Link href={`/contractors/${project.contractorId?.slug}`} className="text-sm font-bold text-primary hover:underline">
                                        View Professional Profile
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <a href={`tel:${project.contractorId?.contact?.phone}`} className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-bold transition-all hover:bg-gray-800 active:scale-95">
                                    <Phone className="w-4 h-4" />
                                    Call Professional
                                </a>
                                <a 
                                    href={`https://wa.me/${project.contractorId?.contact?.whatsapp?.replace(/[^0-9]/g, '')}`} 
                                    target="_blank" 
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white rounded-2xl font-bold transition-all hover:opacity-90 active:scale-95"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp
                                </a>
                            </div>
                        </div>

                        {/* Materials/Tags if any */}
                        {project.materials?.length > 0 && (
                            <div>
                                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Materials & Services</div>
                                <div className="flex flex-wrap gap-2">
                                    {project.materials.map((m, i) => (
                                        <div key={i} className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 shadow-sm">
                                            {m}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
