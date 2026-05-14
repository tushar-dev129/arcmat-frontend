"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    useGetMyContractorProfile,
    useCreateContractorProfile,
    useUpdateContractorProfile,
    useUploadContractorImage,
    useCreateContractorPortfolioItem,
    useDeleteContractorPortfolioItem
} from "@/hooks/useContractor";
import { useGetCategoryTree } from "@/hooks/useCategory";
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
    Upload,
    ChevronDown,
    Clock
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import Image from "next/image";

const DAYS = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
];

const defaultWorkingHours = {
    monday: { from: "10:00", to: "19:00", isClosed: false },
    tuesday: { from: "10:00", to: "19:00", isClosed: false },
    wednesday: { from: "10:00", to: "19:00", isClosed: false },
    thursday: { from: "10:00", to: "19:00", isClosed: false },
    friday: { from: "10:00", to: "19:00", isClosed: false },
    saturday: { from: "10:00", to: "19:00", isClosed: false },
    sunday: { from: "10:00", to: "19:00", isClosed: true }
};

const formatTime = (timeStr) => {
    if (!timeStr || timeStr === "--:--") return "--:--";
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

const ComboboxInput = ({ value, onChange, options, placeholder, disabled, restricted }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!value || restricted) {
            setFilteredOptions(options);
        } else {
            setFilteredOptions(options.filter(opt => opt.toLowerCase().includes(value.toLowerCase())));
        }
    }, [value, options, restricted]);

    const handleInput = (val) => {
        onChange(val);
        setIsOpen(true);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    value={value}
                    onChange={(e) => !restricted && handleInput(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={restricted}
                    className={clsx(
                        "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none pr-10",
                        restricted && "cursor-pointer"
                    )}
                    autoComplete="off"
                    onClick={() => restricted && setIsOpen(!isOpen)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown className={clsx("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                </div>
            </div>
            {isOpen && filteredOptions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-auto py-1 animate-in fade-in zoom-in-95 duration-200">
                    {filteredOptions.map((opt, i) => (
                        <li
                            key={i}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                onChange(opt);
                                setIsOpen(false);
                            }}
                            className="px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default function MarketplaceProfilePage() {
    const { user } = useAuth();
    const { data: categoriesResponse, isLoading: isCategoriesLoading } = useGetCategoryTree({ categoryType: 'contractor_service' });
    // Handle all possible API response shapes: { data: [...] }, { data: { data: [...] } }, or []
    const categories = Array.isArray(categoriesResponse?.data)
        ? categoriesResponse.data
        : Array.isArray(categoriesResponse?.data?.data)
            ? categoriesResponse.data.data
            : Array.isArray(categoriesResponse)
                ? categoriesResponse
                : [];


    const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useGetMyContractorProfile(user?._id);
    const createMutation = useCreateContractorProfile();
    const updateMutation = useUpdateContractorProfile();
    const uploadMutation = useUploadContractorImage();
    const createPortfolioMutation = useCreateContractorPortfolioItem();
    const deletePortfolioMutation = useDeleteContractorPortfolioItem();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        businessName: "",
        tagline: "",
        overview: "",
        profileImage: null,
        categoryId: "",
        subcategoryId: "",
        subcategoryIds: [],
        otherCategoryName: "",
        otherSubcategoryName: "",
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
        visibility: "public",
        availability: {
            status: "available",
            workingHours: defaultWorkingHours
        }
    });

    // Recursively search for the "Find Contractors" root in the whole tree
    const contractorGroups = useMemo(() => {
        if (!categories || categories.length === 0) return [];

        const findRoot = (nodes) => {
            if (!Array.isArray(nodes)) return null;
            for (const node of nodes) {
                const name = node.name?.toLowerCase();
                const slug = node.slug?.toLowerCase();
                if (slug === 'find-contractors' || name === 'find contractors' || slug === 'contractors' || name === 'contractors') {
                    return node;
                }
                if (node.children?.length) {
                    const found = findRoot(node.children);
                    if (found) return found;
                }
            }
            return null;
        };

        const root = findRoot(categories);
        // If we found a clear root with children, use those
        if (root && root.children?.length > 0) return root.children;

        // If categories is a single item that contains children, it might be the root itself
        if (categories.length === 1 && categories[0].children?.length > 0) {
            return categories[0].children;
        }

        // Otherwise, return all categories provided by the API
        return categories;
    }, [categories]);

    const selectedGroup = useMemo(() => {
        return contractorGroups.find(c => c._id === formData.categoryId);
    }, [contractorGroups, formData.categoryId]);

    const [newArea, setNewArea] = useState("");
    const [attributes, setAttributes] = useState([{ key: '', value: '' }]);

    const handleAttributeChange = (index, field, value) => {
        const newAttrs = [...attributes];
        newAttrs[index][field] = value;
        setAttributes(newAttrs);
    };

    const addAttribute = () => setAttributes([...attributes, { key: '', value: '' }]);
    const removeAttribute = (index) => setAttributes(attributes.filter((_, i) => i !== index));

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
                subcategoryIds: profile.subcategoryIds || [],
                otherCategoryName: profile.otherCategoryName || "",
                otherSubcategoryName: profile.otherSubcategoryName || "",
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
                visibility: profile.visibility || "public",
                availability: {
                    status: profile.availability?.status || "available",
                    workingHours: profile.availability?.workingHours || defaultWorkingHours
                }
            });

            // Hydrate attributes from existing categories
            const mainCat = contractorGroups.find(c => c._id === (profile.categoryId?._id || profile.categoryId));
            if (mainCat) {
                const initialAttrs = [];
                const subIds = profile.subcategoryIds || [];

                if (subIds.length > 0) {
                    subIds.forEach(subId => {
                        const sub = mainCat.children?.find(s => s._id === subId);
                        initialAttrs.push({ key: mainCat.name, value: sub ? sub.name : '' });
                    });
                }

                if (profile.otherSubcategoryName) {
                    initialAttrs.push({ key: mainCat.name, value: profile.otherSubcategoryName });
                }

                if (initialAttrs.length > 0) {
                    setAttributes(initialAttrs);
                } else if (mainCat) {
                    setAttributes([{ key: mainCat.name, value: '' }]);
                }
            }
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

        if (formData.contact.phone && !/^\d{10}$/.test(formData.contact.phone)) {
            toast.error("Please provide a valid 10-digit phone number");
            return;
        }

        if (formData.contact.whatsapp && !/^\d{10}$/.test(formData.contact.whatsapp)) {
            toast.error("Please provide a valid 10-digit WhatsApp number");
            return;
        }

        // Map attributes back to flat structure for backend compatibility
        const finalFormData = { ...formData };
        if (attributes.length > 0 && attributes[0].key) {
            const firstAttr = attributes[0];
            const category = contractorGroups.find(g => g.name === firstAttr.key);
            if (category) {
                finalFormData.categoryId = category._id;

                const subIds = [];
                let otherSubNames = [];

                attributes.forEach(attr => {
                    const sub = category.children?.find(s => s.name === attr.value);
                    if (sub) {
                        subIds.push(sub._id);
                    } else if (attr.value) {
                        otherSubNames.push(attr.value);
                    }
                });

                finalFormData.subcategoryIds = subIds;
                finalFormData.otherSubcategoryName = otherSubNames.join(", ");
            }
        }

        try {
            if (profile) {
                // Update
                await updateMutation.mutateAsync({
                    id: profile._id,
                    data: finalFormData
                });
                toast.success("Profile updated successfully!");
                await refetchProfile();
                setIsEditing(false);
            } else {
                // Create
                await createMutation.mutateAsync({
                    ...finalFormData,
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
                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold  tracking-widest border",
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
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[13px] font-bold  tracking-widest text-center px-2">
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
                            <p className="text-[13px] md:text-xs text-gray-400 mt-2 flex items-center justify-center sm:justify-start gap-1">
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

                        <Field className="md:col-span-2" label="Categories & Subcategories" required={isEditing}>
                            {isEditing ? (
                                <div className="space-y-3 mt-2">
                                    {attributes.slice(0, 1).map((attr, idx) => {
                                        const group = contractorGroups.find(g => g.name === attr.key);
                                        const subOptions = group?.children?.map(s => s.name) || [];

                                        return (
                                            <div key={idx} className="flex gap-4 animate-in fade-in duration-500">
                                                <div className="flex-1">
                                                    <ComboboxInput
                                                        value={attr.key}
                                                        onChange={(val) => {
                                                            handleAttributeChange(0, 'key', val);
                                                            handleAttributeChange(0, 'value', ''); // Clear subcategory on category change
                                                        }}
                                                        options={contractorGroups.map(g => g.name)}
                                                        placeholder="Select Primary Category"
                                                        restricted={true}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <ComboboxInput
                                                        value={attr.value}
                                                        onChange={(val) => handleAttributeChange(0, 'value', val)}
                                                        options={subOptions}
                                                        placeholder="Select or Type Specific Service"
                                                        disabled={!attr.key}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}

                                </div>
                            ) : (
                                <div className="space-y-1 mt-1">
                                    {attributes.length > 0 && attributes[0].key ? (
                                        attributes.map((attr, idx) => (
                                            <div key={idx} className=" flex-wrap grid-cols-2 grid items-baseline gap-2">
                                                <span className="text-base font-semibold text-gray-900 ">{attr.key}</span>
                                                <span className="text-base font-semibold text-gray-900">{attr.value}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-gray-400 italic text-sm">No specializations added</div>
                                    )}
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
                                        {formData.teamSize ? `${formData.teamSize} Professionals` : "Not specified"}
                                    </div>
                                )}
                            </Field>
                        </div>
                    </div>
                </Section>

                {/* Working Hours */}
                <Section title="Working Hours" icon={Clock}>
                    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b  border-gray-100">
                            <div className="col-span-3 text-[13px] font-bold text-gray-400  tracking-widest">Day</div>
                            <div className="col-span-9 text-[13px]  font-bold text-gray-400   tracking-widest">Timing</div>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {DAYS.map((day) => {
                                const hours = formData.availability.workingHours[day.id];
                                return (
                                    <div key={day.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white transition-colors group">
                                        <div className="col-span-3">
                                            <span className={clsx(
                                                "text-sm font-bold",
                                                hours.isClosed ? "text-gray-300" : "text-gray-900"
                                            )}>
                                                {day.label}
                                            </span>
                                        </div>
                                        <div className="col-span-6">
                                            {isEditing ? (
                                                !hours.isClosed ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="time"
                                                            value={hours.from}
                                                            onChange={(e) => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    availability: {
                                                                        ...prev.availability,
                                                                        workingHours: {
                                                                            ...prev.availability.workingHours,
                                                                            [day.id]: { ...hours, from: e.target.value }
                                                                        }
                                                                    }
                                                                }));
                                                            }}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-primary transition-all shadow-sm"
                                                        />
                                                        <span className="text-gray-300">-</span>
                                                        <input
                                                            type="time"
                                                            value={hours.to}
                                                            onChange={(e) => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    availability: {
                                                                        ...prev.availability,
                                                                        workingHours: {
                                                                            ...prev.availability.workingHours,
                                                                            [day.id]: { ...hours, to: e.target.value }
                                                                        }
                                                                    }
                                                                }));
                                                            }}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-primary transition-all shadow-sm"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-300 italic font-medium">Holiday / Closed</div>
                                                )
                                            ) : (
                                                <div className={clsx(
                                                    "text-sm font-medium",
                                                    hours.isClosed ? "text-gray-300 italic" : "text-gray-900"
                                                )}>
                                                    {hours.isClosed ? "Closed" : `${formatTime(hours.from)} - ${formatTime(hours.to)}`}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-span-3 flex justify-end">
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            availability: {
                                                                ...prev.availability,
                                                                workingHours: {
                                                                    ...prev.availability.workingHours,
                                                                    [day.id]: { ...hours, isClosed: !hours.isClosed }
                                                                }
                                                            }
                                                        }));
                                                    }}
                                                    className={clsx(
                                                        "px-3 py-1.5 rounded-lg text-[13px] font-bold  tracking-wider border transition-all",
                                                        hours.isClosed
                                                            ? "bg-red-50 text-red-500 border-red-100 hover:bg-red-100"
                                                            : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                                    )}
                                                >
                                                    {hours.isClosed ? "Closed" : "Open"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
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
                                    maxLength="10"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] outline-none transition-all"
                                    placeholder="10-digit phone number"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-gray-900 font-medium">
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
                                    maxLength="10"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[hsl(15,80%,65%)] outline-none transition-all"
                                    placeholder="10-digit WhatsApp number"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-gray-900 font-medium">
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
                            <Field label="City" icon={MapPin} required={isEditing}>
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

                            <Field label="State" icon={MapPin} required={isEditing}>
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

function Field({ label, icon: Icon, required, children, className }) {
    return (
        <div className={clsx("space-y-2", className)}>
            <label className="text-xs font-bold  tracking-widest text-gray-400 flex items-center gap-2">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
                {required && <span className="text-primary">*</span>}
            </label>
            {children}
        </div>
    );
}
