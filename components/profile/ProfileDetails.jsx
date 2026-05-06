import React from 'react';
import { Edit } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getBrandImageUrl } from '@/lib/productUtils';


const ProfileDetails = ({ brand, onEdit }) => {
    if (!brand) return null;

    const formatAddress = (addr) => {
        if (!addr) return "N/A";
        if (typeof addr === 'string') return addr;

        const parts = [
            addr.first_name && addr.last_name ? `${addr.first_name} ${addr.last_name}` : null,
            addr.address1,
            addr.address2,
            addr.city,
            addr.state,
            addr.country,
            addr.pincode ? `PIN: ${addr.pincode}` : null
        ].filter(Boolean);

        return parts.length > 0 ? parts.join(', ') : "N/A";
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-32 h-32 shrink-0 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center p-2 relative overflow-hidden">
                        {brand.logo ? (
                            <img
                                src={getBrandImageUrl(brand.logo)}
                                alt={brand.name}
                                className="w-full h-full object-contain rounded-lg"
                            />
                        ) : (

                            <span className="text-3xl font-bold text-gray-300">
                                {brand.name?.charAt(0) || 'B'}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-bold text-gray-900">{brand.name}</h2>
                            </div>
                            <p className="text-gray-500 flex items-center gap-2 text-sm">
                                {brand.country}
                            </p>
                        </div>

                        {brand.website && (
                            <a
                                href={brand.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex text-primary hover:underline text-sm"
                            >
                                {brand.website}
                            </a>
                        )}

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-gray-600 text-sm leading-relaxed">
                            {brand.description || "No description added."}
                        </div>
                    </div>
                </div>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 text-primary hover:text-[#d08963] font-medium transition-colors shrink-0"
                >
                    <Edit size={18} />
                    <span className="hidden sm:inline cursor-pointer">Edit Profile</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Shipping Address</h4>
                    <p className="text-gray-600 text-sm">{formatAddress(brand.shippingAddress)}</p>
                </div>
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Billing Address</h4>
                    <p className="text-gray-600 text-sm">{formatAddress(brand.billingAddress)}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;
