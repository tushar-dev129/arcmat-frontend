"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
    useGetMyContractorProfile, 
    useCreateContractorProfile, 
    useUpdateContractorProfile,
    useUploadContractorImage,
    useCreateContractorPortfolioItem,
    useDeleteContractorPortfolioItem
} from "@/hooks/useContractor";
import { HARDCODED_CATEGORIES } from "@/constants/contractorCategories";
import { getImageUrl } from "@/lib/productUtils";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import clsx from "clsx";
import { 
    User, 
    MapPin, 
    Phone, 
    Mail, 
    Globe, 
    Briefcase, 
    Users, 
    Calendar, 
    MessageSquare,
    Save,
    Edit3,
    CheckCircle2,
    Plus,
    X,
    Eye,
    EyeOff,
    MessageCircle,
    Info,
    Camera,
    Loader2,
    Image as ImageIcon,
    Film,
    Trash2,
    Upload
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import Image from "next/image";

export default function MarketplaceProfilePage() {
    const { user } = useAuth();
    const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useGetMyContractorProfile(user?._id);
    const createMutation = useCreateContractorProfile();
    const updateMutation = useUpdateContractorProfile();
    const uploadMutation = useUploadContractorImage();
    const createPortfolioMutation = useCreateContractorPortfolioItem();
    const deletePortfolioMutation = useDeleteContractorPortfolioItem();

    const categories = HARDCODED_CATEGORIES;

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        businessName: "",
        tagline: "",
        overview: "",
        profileImage: null,
        categoryId: "",
        subcategoryId: "",
        experienceYears: "",
        teamSize: "",
        contact: {
            phone: "",
            whatsapp: "",
            email: "",
            website: ""
        },
        location: {
            city: "",
            state: "",
            country: "India"
        },
        serviceAreas: [],
        visibility: "public"
    });

    const [newArea, setNewArea] = useState("");
    const [portfolioForm, setPortfolioForm] = useState({
        title: "",
        description: "",
        location: "",
        files: []
    });

    const profile = profileData?.profile || profileData?.data?.profile;
    const portfolio = profileData?.portfolio || profileData?.data?.portfolio || [];

    useEffect(() => {
        if (profile) {
            setFormData({
                businessName: profile.businessName || "",
                tagline: profile.tagline || "",
                overview: profile.overview || "",
                profileImage: profile.profileImage || null,
                categoryId: profile.categoryId?._id || profile.categoryId || "",
                subcategoryId: profile.subcategoryId?._id || profile.subcategoryId || "",
                experienceYears: profile.experienceYears || "",
                teamSize: profile.teamSize || "",
                contact: {
                    phone: profile.contact?.phone || "",
                    whatsapp: profile.contact?.whatsapp || "",
                    email: profile.contact?.email || "",
                    website: profile.contact?.website || ""
                },
                location: {
                    city: profile.location?.city || "",
                    state: profile.location?.state || "",
                    country: profile.location?.country || "India"
                },
                serviceAreas: profile.serviceAreas || [],
                visibility: profile.visibility || "public"
            });
        } else if (user) {
            // Pre-fill with existing user data if profile doesn't exist
            setFormData(prev => ({
                ...prev,
                businessName: user.name || prev.businessName,
                contact: {
                    ...prev.contact,
                    phone: user.mobile || user.phone || prev.contact.phone,
                    email: user.email || prev.contact.email,
                },
                location: {
                    ...prev.location,
                    city: user.city || user.location?.city || prev.location.city,
                    state: user.state || user.location?.state || prev.location.state,
                }
            }));
        }
    }, [profile, user]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);
        formData.append("userId", user?._id);

        try {
            const response = await uploadMutation.mutateAsync(formData);
            const uploadedImage = response.data?.image || response.image;
            setFormData(prev => ({ ...prev, profileImage: uploadedImage }));
            toast.success("Image uploaded!");
        } catch (error) {
            toast.error("Upload failed");
        }
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Auto-capitalize first letter for city and state
        if (name === "location.city" || name === "location.state") {
            value = value.charAt(0).toUpperCase() + value.slice(1);
        }

        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddArea = () => {
        if (newArea.trim() && !formData.serviceAreas.includes(newArea.trim())) {
            setFormData(prev => ({
                ...prev,
                serviceAreas: [...prev.serviceAreas, newArea.trim()]
            }));
            setNewArea("");
        }
    };

    const handleRemoveArea = (area) => {
        setFormData(prev => ({
            ...prev,
            serviceAreas: prev.serviceAreas.filter(a => a !== area)
        }));
    };

    const handlePortfolioFileChange = (e) => {
        const files = Array.from(e.target.files);
        setPortfolioForm(prev => ({
            ...prev,
            files: [...prev.files, ...files]
        }));
    };

    const handleRemovePortfolioFile = (index) => {
        setPortfolioForm(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };

    const handleAddPortfolio = async () => {
        if (!portfolioForm.title || portfolioForm.files.length === 0) {
            toast.error("Please add a title and at least one image");
            return;
        }

        const data = new FormData();
        data.append("title", portfolioForm.title);
        data.append("description", portfolioForm.description);
        data.append("location", portfolioForm.location);
        portfolioForm.files.forEach(file => {
            data.append("images", file);
        });

        try {
            await createPortfolioMutation.mutateAsync({
                contractorId: profile._id,
                formData: data
            });
            toast.success("Project added to portfolio!");
            setPortfolioForm({ title: "", description: "", location: "", files: [] });
            await refetchProfile();
        } catch (error) {
            toast.error(error.message || "Could not add portfolio item");
        }
    };

    const handleDeletePortfolio = async (itemId) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            await deletePortfolioMutation.mutateAsync(itemId);
            toast.success("Project removed");
            await refetchProfile();
        } catch (error) {
            toast.error(error.message || "Could not remove portfolio work");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.profileImage) {
            toast.error("Please upload a profile image/logo");
            return;
        }

        try {
            if (profile) {
                // Update
                await updateMutation.mutateAsync({ 
                    id: profile._id, 
                    data: formData 
                });
                toast.success("Profile updated successfully!");
                await refetchProfile();
                setIsEditing(false);
            } else {
                // Create
                await createMutation.mutateAsync({
                    ...formData,
                    userId: user?._id,
                    providerType: "contractor"
                });
                toast.success("Profile created successfully!");
                const { data: newData } = await refetchProfile();
                if (newData) {
                    setIsEditing(false);
                }
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong");
        }
    };

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(15,80%,65%)]" />
            </div>
        );
    }

    if (!profile && !isEditing) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200 shadow-sm">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-10 h-10 text-[hsl(15,80%,65%)]" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Your Marketplace Presence</h2>
                    <p className="text-gray-500 mt-3 max-w-md mx-auto">
                        You haven't set up your professional profile yet. Create it now to start appearing in the Arcmat Marketplace and receiving leads.
                    </p>
                    <Button 
                        onClick={() => setIsEditing(true)}
                        className="mt-8 px-10 py-4 bg-[hsl(15,80%,65%)] hover:bg-[hsl(15,80%,55%)] text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                    >
                        <Plus className="w-5 h-5" />
                        Create Marketplace Profile
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Marketplace Profile</h1>
                    <p className="text-gray-500 mt-1">Manage how your business appears to architects and clients.</p>
                </div>
                <div className="flex items-center gap-3">
                    {!isEditing ? (
                        <Button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:border-[hsl(15,80%,65%)] hover:text-[hsl(15,80%,65%)] rounded-xl font-bold transition-all shadow-sm"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit Profile
                        </Button>
                    ) : (
                        <>
                            <Button 
                                type="button"
                                onClick={() => {
                                    if (profile) setIsEditing(false);
                                    else window.location.href = "/dashboard/contractor";
                                }}
                                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold transition-all text-sm"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => {
                                    document.getElementById('profile-form').requestSubmit();
                                }}
                                loading={createMutation.isPending || updateMutation.isPending}
                                className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
                            >
                                <Save className="w-4 h-4" />
                                {profile ? "Save" : "Create"}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <form id="profile-form" onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Logo Section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6 md:gap-8 relative">
                    {!isEditing && (
                        <div className="absolute top-4 right-4 md:top-6 md:right-8">
                            <div className={clsx(
                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                formData.visibility === 'public' 
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                    : "bg-gray-50 text-gray-400 border-gray-100"
                            )}>
                                {formData.visibility === 'public' ? (
                                    <>
                                        <Eye className="w-3 h-3" />
                                        Public
                                    </>
                                ) : (
                                    <>
                                        <EyeOff className="w-3 h-3" />
                                        Private
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="relative group">
                        <div className={clsx(
                            "w-28 h-28 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-gray-50 border-2 border-dashed flex items-center justify-center overflow-hidden relative transition-colors",
                            isEditing && !formData.profileImage ? "border-red-200 bg-red-50" : "border-gray-200"
                        )}>
                            {(getImageUrl(formData.profileImage, 'contractors') || formData.profileImage?.secure_url) ? (
                                <img 
                                    src={getImageUrl(formData.profileImage, 'contractors') || formData.profileImage?.secure_url} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover block"
                                />
                            ) : (
                                <User className="w-10 h-10 md:w-12 md:h-12 text-gray-300" />
                            )}
                            
                            {isEditing && (
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-bold uppercase tracking-widest text-center px-2">
                                    <Camera className="w-5 h-5 md:w-6 md:h-6 mb-1" />
                                    Change Logo
                                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                </label>
                            )}

                            {uploadMutation.isPending && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-[hsl(15,80%,65%)] animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">{formData.businessName || "Business Name"}</h3>
                        <p className="text-sm md:text-base text-gray-500 mb-4">{formData.tagline || "Your professional tagline will appear here"}</p>
                        
                        {!isEditing && (
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                                {formData.contact?.email && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 text-xs font-semibold text-gray-600">
                                        <Mail className="w-3.5 h-3.5 text-primary" />
                                        {formData.contact.email}
                                    </div>
                                )}
                                {formData.experienceYears && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 text-xs font-semibold text-gray-600">
                                        <Briefcase className="w-3.5 h-3.5 text-primary" />
                                        {formData.experienceYears} Years Experience
                                    </div>
                                )}
                            </div>
                        )}

                        {isEditing && (
                            <p className="text-[10px] md:text-xs text-gray-400 mt-2 flex items-center justify-center sm:justify-start gap-1">
                                <Info className="w-3 h-3" />
                                Recommended: Square image, 512x512px
                            </p>
                        )}
                    </div>
                </div>

                {/* Basic Information */}
                <Section title="Basic Information" icon={User}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Business Name" required={isEditing}>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] focus:ring-1 focus:ring-[hsl(15,80%,65%)] outline-none transition-all"
                                    placeholder="e.g. Skyline Constructions"
                                />
                            ) : (
                                <div className="text-lg font-semibold text-gray-900">{formData.businessName}</div>
                            )}
                        </Field>

                        <Field label="Short Tagline" required={isEditing}>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    name="tagline"
                                    value={formData.tagline}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] focus:ring-1 focus:ring-[hsl(15,80%,65%)] outline-none transition-all"
                                    placeholder="e.g. Expert interior and exterior renovations"
                                />
                            ) : (
                                <div className="text-gray-700 italic">{formData.tagline || "No tagline added"}</div>
                            )}
                        </Field>

                        <Field label="Primary Category" required={isEditing}>
                            {isEditing ? (
                                <select 
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] focus:ring-1 focus:ring-[hsl(15,80%,65%)] outline-none transition-all bg-white"
                                >
                                    <option value="">Select Category</option>
                                    {categories?.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="inline-flex items-center px-3 py-1 bg-orange-50 text-[hsl(15,80%,60%)] rounded-full text-sm font-bold border border-orange-100">
                                    {categories.find(c => c._id === formData.categoryId)?.name || profile?.categoryId?.name || "Uncategorized"}
                                </div>
                            )}
                        </Field>

                        <Field label="Subcategory" required={isEditing}>
                            {isEditing ? (
                                <select 
                                    name="subcategoryId"
                                    value={formData.subcategoryId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] focus:ring-1 focus:ring-[hsl(15,80%,65%)] outline-none transition-all bg-white"
                                >
                                    <option value="">Select Subcategory</option>
                                    {categories?.find(cat => cat._id === formData.categoryId)?.children?.map(sub => (
                                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="text-gray-700">
                                    {categories.find(c => c._id === formData.categoryId)?.children?.find(s => s._id === formData.subcategoryId)?.name || profile?.subcategoryId?.name || "None"}
                                </div>
                            )}
                        </Field>
                    </div>

                    {isEditing && (
                        <div className="mt-8 border-t border-gray-100 pt-8">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-primary" />
                                Profile Visibility
                            </h3>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                                    className={clsx(
                                        "flex-1 flex items-center justify-center gap-3 p-4 py-3 rounded-2xl border-2 transition-all",
                                        formData.visibility === 'public' 
                                            ? "border-primary bg-primary/5 text-primary font-bold shadow-sm" 
                                            : "border-gray-100 text-gray-400 hover:border-gray-200"
                                    )}
                                >
                                    <Eye className="w-5 h-5" />
                                    Public Profile
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, visibility: 'private' }))}
                                    className={clsx(
                                        "flex-1 flex items-center justify-center gap-3 p-4 py-3 rounded-2xl border-2 transition-all",
                                        formData.visibility === 'private' 
                                            ? "border-[hsl(20,10%,15%)] bg-gray-50 text-[hsl(20,10%,15%)] font-bold shadow-sm" 
                                            : "border-gray-100 text-gray-400 hover:border-gray-200"
                                    )}
                                >
                                    <EyeOff className="w-5 h-5" />
                                    Private Profile
                                </button>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-3 ml-1 font-medium italic">
                                {formData.visibility === 'public' 
                                    ? "Anyone can see your profile and projects in the marketplace." 
                                    : "Your profile will be hidden from the public marketplace listing."}
                            </p>
                        </div>
                    )}
                </Section>

                {/* About Section */}
                <Section title="About & Experience" icon={Info}>
                    <div className="space-y-6">
                        <Field label="Service Description" required={isEditing}>
                            {isEditing ? (
                                <textarea 
                                    name="overview"
                                    value={formData.overview}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] focus:ring-1 focus:ring-[hsl(15,80%,65%)] outline-none transition-all resize-none"
                                    placeholder="Describe your services, specializations, and what makes you unique..."
                                />
                            ) : (
                                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{formData.overview || "No description provided"}</div>
                            )}
                        </Field>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Years of Experience" icon={Calendar} required={isEditing}>
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        name="experienceYears"
                                        value={formData.experienceYears}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] outline-none transition-all"
                                        placeholder="e.g. 10"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {formData.experienceYears ? `${formData.experienceYears} Years` : "Not specified"}
                                    </div>
                                )}
                            </Field>

                            <Field label="Team Size" icon={Users} required={isEditing}>
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        name="teamSize"
                                        value={formData.teamSize}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] outline-none transition-all"
                                        placeholder="e.g. 25"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        {formData.teamSize ? `${formData.teamSize} Professionals` : "Not specified"}
                                    </div>
                                )}
                            </Field>
                        </div>
                    </div>
                </Section>

                {/* Contact Details */}
                <Section title="Contact Details" icon={Phone}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Phone Number" icon={Phone} required={isEditing}>
                            {isEditing ? (
                                <input 
                                    type="tel" 
                                    name="contact.phone"
                                    value={formData.contact.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] outline-none transition-all"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                    <Phone className="w-4 h-4" />
                                    {formData.contact.phone || "Not added"}
                                </div>
                            )}
                        </Field>

                        <Field label="WhatsApp Number" icon={MessageCircle}>
                            {isEditing ? (
                                <input 
                                    type="tel" 
                                    name="contact.whatsapp"
                                    value={formData.contact.whatsapp}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] outline-none transition-all"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                    <MessageCircle className="w-4 h-4" />
                                    {formData.contact.whatsapp || "Not added"}
                                </div>
                            )}
                        </Field>

                        <Field label="Email Address" icon={Mail} required={isEditing}>
                            {isEditing ? (
                                <input 
                                    type="email" 
                                    name="contact.email"
                                    value={formData.contact.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] outline-none transition-all"
                                    placeholder="business@example.com"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                    <Mail className="w-4 h-4" />
                                    {formData.contact.email || "Not added"}
                                </div>
                            )}
                        </Field>

                        <Field label="Website" icon={Globe}>
                            {isEditing ? (
                                <input 
                                    type="url" 
                                    name="contact.website"
                                    value={formData.contact.website}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] outline-none transition-all"
                                    placeholder="https://www.example.com"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                    <Globe className="w-4 h-4" />
                                    {formData.contact.website || "Not added"}
                                </div>
                            )}
                        </Field>
                    </div>
                </Section>

                {/* Location Section */}
                <Section title="Location & Service Areas" icon={MapPin}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="City" required={isEditing}>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        name="location.city"
                                        value={formData.location.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] outline-none transition-all"
                                        placeholder="e.g. Mumbai"
                                    />
                                ) : (
                                    <div className="text-gray-900 font-medium">{formData.location.city || "Not specified"}</div>
                                )}
                            </Field>

                            <Field label="State" required={isEditing}>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        name="location.state"
                                        value={formData.location.state}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] outline-none transition-all"
                                        placeholder="e.g. Maharashtra"
                                    />
                                ) : (
                                    <div className="text-gray-900 font-medium">{formData.location.state || "Not specified"}</div>
                                )}
                            </Field>
                        </div>
                    </div>
                </Section>
            </form>
        </div>
    );
}

function Section({ title, icon: Icon, children }) {
    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-orange-50 rounded-xl">
                    <Icon className="w-5 h-5 text-[hsl(15,80%,65%)]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function Field({ label, icon: Icon, required, children }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
                {required && <span className="text-primary">*</span>}
            </label>
            {children}
        </div>
    );
}
