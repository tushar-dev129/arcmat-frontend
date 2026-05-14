'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    useGetMyContractorProfile,
    useCreateContractorPortfolioItem,
    useDeleteContractorPortfolioItem
} from '@/hooks/useContractor';
import {
    Plus,
    Image as ImageIcon,
    Trash2,
    ExternalLink,
    Search,
    Filter,
    MoreVertical,
    Folder,
    X,
    Upload,
    MapPin,
    Loader2
} from 'lucide-react';
import { toast } from "@/components/ui/Toast";
import { getImageUrl } from "@/lib/productUtils";
import Link from 'next/link';

export default function PortfolioPage() {
    const { user } = useAuth();
    const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useGetMyContractorProfile(user?._id);
    const profile = profileData?.profile || profileData?.data?.profile;
    const portfolioItems = profileData?.portfolio || profileData?.data?.portfolio || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const createPortfolioMutation = useCreateContractorPortfolioItem();
    const deletePortfolioMutation = useDeleteContractorPortfolioItem();

    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        files: []
    });

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        setForm(prev => ({ ...prev, files: [...prev.files, ...selectedFiles] }));
    };

    const removeFile = (index) => {
        setForm(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!profile?._id) {
            toast.error("Please complete your profile first.");
            return;
        }

        if (!form.title) {
            toast.error("Project title is required.");
            return;
        }

        if (form.files.length === 0) {
            toast.error("Please upload at least one image.");
            return;
        }

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("location", form.location);
        form.files.forEach(file => {
            formData.append("files", file);
        });

        try {
            await createPortfolioMutation.mutateAsync({
                contractorId: profile._id,
                formData
            });
            toast.success("Project added to portfolio!");
            setIsModalOpen(false);
            setForm({ title: "", description: "", location: "", files: [] });
            refetchProfile();
        } catch (error) {
            toast.error(error.message || "Failed to add project");
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm("Are you sure you want to remove this project?")) return;

        try {
            await deletePortfolioMutation.mutateAsync(itemId);
            toast.success("Project removed");
            refetchProfile();
        } catch (error) {
            toast.error("Failed to remove project");
        }
    };

    if (profileLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Project Portfolio</h1>
                    <p className="text-gray-500 mt-1">Manage and showcase your best professional work.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-primary/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add New Project
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-3 md:p-2 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-2 md:gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none focus:ring-0 outline-none transition-all text-gray-700 font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="h-8 w-[1px] bg-gray-100 hidden md:block"></div>
                <button className="flex items-center gap-2 px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors">
                    <Filter className="w-5 h-5" />
                    Filter
                </button>
            </div>

            {/* Portfolio Grid */}
            {portfolioItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {portfolioItems.filter(item =>
                        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.location?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((item) => (
                        <div key={item._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 flex flex-col">
                            <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                                {item.images?.[0] ? (
                                    <img
                                        src={getImageUrl(item.images[0], "contractor-portfolio")}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                                        <ImageIcon className="w-16 h-16" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-red-500 transition-all border border-white/20"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                {item.location && (
                                    <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur rounded-full flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-gray-700 shadow-sm">
                                        <MapPin className="w-3 h-3 text-primary" />
                                        {item.location}
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{item.title}</h3>
                                <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed flex-1">{item.description}</p>
                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div className="flex -space-x-2">
                                        {item.images?.slice(0, 3).map((img, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                                                <img src={getImageUrl(img, "contractor-portfolio")} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                        {item.images?.length > 3 && (
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[13px] font-bold text-gray-400">
                                                +{item.images.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <Link href={`/projects/${item._id}`} className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                                        View Project <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white py-24 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform">
                        <Folder className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Your portfolio is empty</h3>
                    <p className="text-gray-500 max-w-sm mb-10 leading-relaxed">
                        Ready to shine? Upload your best projects to attract more clients and show off your expertise.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95"
                    >
                        <Plus className="w-6 h-6" />
                        Add Your First Project
                    </button>
                </div>
            )}

            {/* Add Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-y-auto animate-in zoom-in-95 fade-in duration-300">
                        <div className="p-6 md:p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add Portfolio Project</h2>
                                    <p className="text-sm text-gray-500 mt-1">Upload high-quality images of your work.</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Project Title *</label>
                                        <input
                                            required
                                            type="text"
                                            value={form.title}
                                            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
                                            placeholder="e.g. Modern Villa Renovation"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Location</label>
                                        <input
                                            type="text"
                                            value={form.location}
                                            onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
                                            placeholder="e.g. Bandra, Mumbai"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[120px] resize-none font-medium"
                                        placeholder="Describe the scope, materials used, and your role..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Upload Work</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full min-h-[160px] rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-white hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">Click to upload images</p>
                                        <p className="text-xs text-gray-400 mt-1">Select one or more project photos</p>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            multiple
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>

                                    {form.files.length > 0 && (
                                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                                            {form.files.map((file, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(idx)}
                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all border border-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={createPortfolioMutation.isPending}
                                        type="submit"
                                        className="flex-[2] bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {createPortfolioMutation.isPending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Publish Project"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
