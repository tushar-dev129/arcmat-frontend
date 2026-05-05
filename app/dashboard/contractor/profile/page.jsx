"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
    useGetMyContractorProfile, 
    useCreateContractorProfile, 
    useUpdateContractorProfile,
    useUploadContractorImage
} from "@/hooks/useContractor";
import { useGetCategoryTree } from "@/hooks/useCategory";
import { getImageUrl } from "@/lib/productUtils";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
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
    MessageCircle,
    Info,
    Camera,
    Loader2
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import Image from "next/image";

export default function MarketplaceProfilePage() {
    const { user } = useAuth();
    const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useGetMyContractorProfile(user?._id);
    const { data: categoriesData } = useGetCategoryTree();
    const createMutation = useCreateContractorProfile();
    const updateMutation = useUpdateContractorProfile();
    const uploadMutation = useUploadContractorImage();

    const categories = (categoriesData?.data || categoriesData) || [];

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
        serviceAreas: []
    });

    const [newArea, setNewArea] = useState("");

    const profile = profileData?.profile || profileData?.data?.profile;

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
                serviceAreas: profile.serviceAreas || []
            });
        }
    }, [profile]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);
        formData.append("userId", user?._id);

        try {
            const response = await uploadMutation.mutateAsync(formData);
            setFormData(prev => ({ ...prev, profileImage: response.image }));
            toast.success("Image uploaded!");
        } catch (error) {
            toast.error("Upload failed");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (profile) {
                // Update
                await updateMutation.mutateAsync({ 
                    id: profile._id, 
                    data: formData 
                });
                toast.success("Profile updated successfully!");
                setIsEditing(false);
            } else {
                // Create
                await createMutation.mutateAsync({
                    ...formData,
                    userId: user?._id,
                    providerType: "contractor"
                });
                toast.success("Profile created successfully!");
                refetchProfile();
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
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Marketplace Profile</h1>
                    <p className="text-gray-500 mt-1">Manage how your business appears to architects and clients.</p>
                </div>
                {!isEditing && (
                    <Button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:border-[hsl(15,80%,65%)] hover:text-[hsl(15,80%,65%)] rounded-xl font-bold transition-all shadow-sm"
                    >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                    </Button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Logo Section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6 md:gap-8">
                    <div className="relative group">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative">
                            {(getImageUrl(formData.profileImage, 'contractors') || formData.profileImage?.secure_url) ? (
                                <img 
                                    src={getImageUrl(formData.profileImage, 'contractors') || formData.profileImage?.secure_url} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover block"
                                    onError={(e) => {
                                        console.error("Image load error:", e);
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <User className={`w-10 h-10 md:w-12 md:h-12 text-gray-300 ${(getImageUrl(formData.profileImage, 'contractors') || formData.profileImage?.secure_url) ? 'hidden' : 'flex'}`} />
                            
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
                        <p className="text-sm md:text-base text-gray-500">{formData.tagline || "Your professional tagline will appear here"}</p>
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
                                    {profile?.categoryId?.name || "Uncategorized"}
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
                                <div className="text-gray-700">{profile?.subcategoryId?.name || "None"}</div>
                            )}
                        </Field>
                    </div>
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
                            <Field label="Years of Experience" icon={Calendar}>
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        name="experienceYears"
                                        value={formData.experienceYears}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] focus:ring-1 focus:ring-[hsl(15,80%,65%)] outline-none transition-all"
                                        placeholder="e.g. 10"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {formData.experienceYears ? `${formData.experienceYears} Years` : "Not specified"}
                                    </div>
                                )}
                            </Field>

                            <Field label="Team Size" icon={Users}>
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        name="teamSize"
                                        value={formData.teamSize}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] focus:ring-1 focus:ring-[hsl(15,80%,65%)] outline-none transition-all"
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
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] focus:ring-1 focus:ring-[hsl(15,80%,65%)] outline-none transition-all"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            ) : (
                                <a href={`tel:${formData.contact.phone}`} className="flex items-center gap-2 text-blue-600 hover:underline font-medium">
                                    <Phone className="w-4 h-4" />
                                    {formData.contact.phone || "Not added"}
                                </a>
                            )}
                        </Field>

                        <Field label="WhatsApp Number" icon={MessageCircle}>
                            {isEditing ? (
                                <input 
                                    type="tel" 
                                    name="contact.whatsapp"
                                    value={formData.contact.whatsapp}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] focus:ring-1 focus:ring-[hsl(15,80%,65%)] outline-none transition-all"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            ) : (
                                <a 
                                    href={`https://wa.me/${formData.contact.whatsapp?.replace(/[^0-9]/g, '')}`} 
                                    target="_blank"
                                    className="flex items-center gap-2 text-emerald-600 hover:underline font-medium"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    {formData.contact.whatsapp || "Not added"}
                                </a>
                            )}
                        </Field>

                        <Field label="Email Address" icon={Mail} required={isEditing}>
                            {isEditing ? (
                                <input 
                                    type="email" 
                                    name="contact.email"
                                    value={formData.contact.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] focus:ring-1 focus:ring-[hsl(15,80%,65%)] outline-none transition-all"
                                    placeholder="business@example.com"
                                />
                            ) : (
                                <a href={`mailto:${formData.contact.email}`} className="flex items-center gap-2 text-blue-600 hover:underline font-medium">
                                    <Mail className="w-4 h-4" />
                                    {formData.contact.email || "Not added"}
                                </a>
                            )}
                        </Field>

                        <Field label="Website" icon={Globe}>
                            {isEditing ? (
                                <input 
                                    type="url" 
                                    name="contact.website"
                                    value={formData.contact.website}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] focus:ring-1 focus:ring-[hsl(15,80%,65%)] outline-none transition-all"
                                    placeholder="https://www.example.com"
                                />
                            ) : (
                                <a 
                                    href={formData.contact.website} 
                                    target="_blank" 
                                    className="flex items-center gap-2 text-blue-600 hover:underline font-medium"
                                >
                                    <Globe className="w-4 h-4" />
                                    {formData.contact.website || "Not added"}
                                </a>
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
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] focus:ring-1 focus:ring-[hsl(15,80%,65%)] outline-none transition-all"
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
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] focus:ring-1 focus:ring-[hsl(15,80%,65%)] outline-none transition-all"
                                        placeholder="e.g. Maharashtra"
                                    />
                                ) : (
                                    <div className="text-gray-900 font-medium">{formData.location.state || "Not specified"}</div>
                                )}
                            </Field>
                        </div>

                        <Field label="Specific Service Areas">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input 
                                            type="text" 
                                            value={newArea}
                                            onChange={(e) => setNewArea(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArea())}
                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] outline-none transition-all text-sm md:text-base"
                                            placeholder="Add a location (e.g. Bandra, South Mumbai)"
                                        />
                                        <Button 
                                            type="button"
                                            onClick={handleAddArea}
                                            className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all text-sm md:text-base"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.serviceAreas.map(area => (
                                            <span key={area} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                                                {area}
                                                <button type="button" onClick={() => handleRemoveArea(area)} className="hover:text-red-500 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {formData.serviceAreas.length > 0 ? (
                                        formData.serviceAreas.map(area => (
                                            <span key={area} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium border border-gray-100">
                                                {area}
                                            </span>
                                        ))
                                    ) : (
                                        <div className="text-gray-500 italic">No specific service areas added</div>
                                    )}
                                </div>
                            )}
                        </Field>
                    </div>
                </Section>

                {/* Submit / Action Bar */}
                {isEditing && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
                        <Container>
                            <div className="flex items-center justify-end gap-3 md:gap-4 max-w-5xl mx-auto">
                                <Button 
                                    type="button"
                                    onClick={() => {
                                        if (profile) setIsEditing(false);
                                        else window.location.href = "/dashboard/contractor";
                                    }}
                                    className="flex-1 sm:flex-none px-4 md:px-8 py-2.5 md:py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl md:rounded-2xl font-bold transition-all text-sm md:text-base"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit"
                                    loading={createMutation.isPending || updateMutation.isPending}
                                    className="flex-1 sm:flex-none px-4 md:px-10 py-2.5 md:py-3 bg-[hsl(15,80%,65%)] hover:bg-[hsl(15,80%,55%)] text-white rounded-xl md:rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    <Save className="w-4 h-4" />
                                    {profile ? "Save" : "Create"}
                                </Button>
                            </div>
                        </Container>
                    </div>
                )}
            </form>
        </div>
    );
}

function Section({ title, icon: Icon, children }) {
    return (
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white shadow-sm flex items-center justify-center text-[hsl(15,80%,65%)]">
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-900">{title}</h3>
            </div>
            <div className="p-5 md:p-8">
                {children}
            </div>
        </div>
    );
}

function Field({ label, children, required, icon }) {
    return (
        <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {children}
            </div>
        </div>
    );
}
