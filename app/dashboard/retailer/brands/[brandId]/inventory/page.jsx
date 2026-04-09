'use client';
import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Package, Search, ArrowLeft, Plus, Check, Info, Store, X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useGetBrandInventory, useUpsertProductOverride, useBulkAddInventory } from '@/hooks/useRetailer';
import { getProductImageUrl } from '@/lib/productUtils';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import Pagination from '@/components/ui/Pagination';

export default function BrandInventoryPage() {
    const params = useParams();
    const router = useRouter();
    const brandId = params.brandId;

    const searchParams = useSearchParams();
    const retailerIdFromParams = searchParams.get('retailerId');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: inventoryData, isLoading } = useGetBrandInventory(brandId, {
        retailerId: retailerIdFromParams,
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined
    });

    const products = inventoryData?.data?.data || [];
    const pagination = inventoryData?.data?.pagination;
    const brandInfo = products[0]?.brand;

    const upsertOverride = useUpsertProductOverride();
    const bulkAddMutation = useBulkAddInventory();

    const [selectedVariants, setSelectedVariants] = useState([]);
    const [isGlobalSelectAll, setIsGlobalSelectAll] = useState(false);
    const [excludedVariants, setExcludedVariants] = useState([]);

    const toggleSelectAll = () => {
        if (isGlobalSelectAll || selectedVariants.length > 0) {
            setIsGlobalSelectAll(false);
            setSelectedVariants([]);
            setExcludedVariants([]);
        } else {
            setIsGlobalSelectAll(true);
            setSelectedVariants([]);
            setExcludedVariants([]);
        }
    };

    const toggleVariant = (productId, variantId) => {
        if (isGlobalSelectAll) {
            setExcludedVariants(prev => {
                if (prev.includes(variantId)) return prev.filter(id => id !== variantId);
                return [...prev, variantId];
            });
        } else {
            setSelectedVariants(prev => {
                const exists = prev.find(v => v.variantId === variantId);
                if (exists) return prev.filter(v => v.variantId !== variantId);
                return [...prev, { productId, variantId }];
            });
        }
    };

    const handleBulkAdd = async () => {
        if (!isGlobalSelectAll && !selectedVariants.length) return;
        try {
            const result = await bulkAddMutation.mutateAsync({
                isGlobalSelectAll,
                brandId,
                search: searchTerm,
                excludedVariantIds: excludedVariants,
                variants: isGlobalSelectAll ? [] : selectedVariants.map(v => ({ productId: v.productId, variantId: v.variantId })),
                retailerId: retailerIdFromParams
            });
            toast.success(result?.message || `Successfully added products`);
            setIsGlobalSelectAll(false);
            setSelectedVariants([]);
            setExcludedVariants([]);
        } catch (error) {
            toast.error(error.message || 'Bulk add failed');
        }
    };

    const isAnySelected = isGlobalSelectAll || selectedVariants.length > 0;
    const selectionText = isGlobalSelectAll 
        ? (excludedVariants.length > 0 ? `All variants selected (except ${excludedVariants.length})` : 'All available brand inventory selected')
        : `${selectedVariants.length} variants selected`;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // { product, variant }
    const [formData, setFormData] = useState({
        mrp_price: '',
        selling_price: '',
        stock: ''
    });

    const openModal = (product, variant) => {
        setSelectedItem({ product, variant });
        setFormData({
            mrp_price: variant.mrp_price || '',
            selling_price: variant.selling_price || '',
            stock: variant.stock || ''
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.mrp_price || !formData.selling_price) {
            toast.error('Price fields are mandatory');
            return;
        }

        try {
            const result = await upsertOverride.mutateAsync({
                productId: selectedItem.product._id,
                variantId: selectedItem.variant._id,
                mrp_price: Number(formData.mrp_price),
                selling_price: Number(formData.selling_price),
                stock: formData.stock !== '' ? Number(formData.stock) : null,
                isActive: true,
                retailerId: retailerIdFromParams
            });
            toast.success(result?.message || `${selectedItem.product.product_name} updated in inventory`);
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.message || 'Failed to add product');
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto relative pb-24">
            {isAnySelected && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-gray-800 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom">
                    <span className="font-bold text-sm whitespace-nowrap">
                        <span className="text-[#e09a74] mr-1">{isGlobalSelectAll ? 'Global' : selectedVariants.length}</span> {selectionText}
                    </span>
                    <Button 
                        onClick={handleBulkAdd}
                        isLoading={bulkAddMutation.isPending}
                        className="bg-[#e09a74] hover:bg-[#d08a64] text-white text-xs font-black uppercase tracking-widest !p-2.5 !rounded-full shrink-0"
                    >
                        Add Selected
                    </Button>
                    <button 
                        onClick={() => { setIsGlobalSelectAll(false); setSelectedVariants([]); setExcludedVariants([]); }}
                        className="p-1 hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
                        title="Clear selection"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            )}
            {/* Breadcrumb / Back */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Brands
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 p-2 flex items-center justify-center shadow-sm overflow-hidden">
                        {brandInfo?.logo ? (
                            <img src={brandInfo.logo} alt={brandInfo.name} className="w-full h-full object-contain" />
                        ) : (
                            <Store className="w-8 h-8 text-gray-200" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {brandInfo?.name || 'Brand'} Inventory
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Browse and select products to resell in your store.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search brand products..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-12 pr-4 py-3 border border-gray-100 rounded-xl outline-none focus:border-[#e09a74] text-sm"
                    />
                </div>
                <div className="text-sm font-medium text-gray-400 px-4 py-2 bg-gray-50 rounded-lg">
                    {pagination?.totalItems || 0} Products available
                </div>
            </div>

            {/* Product Table */}
            {isLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-24 w-full bg-gray-50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Package className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">No products found</h3>
                    <p className="text-gray-500 mt-2">This brand doesn&apos;t have any active products for selection yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-widest font-black">
                                <th className="px-6 py-4 font-bold min-w-[300px]">Product Info</th>
                                <th className="px-6 py-4 font-bold min-w-[350px]">
                                    <div className="flex items-center justify-between">
                                        <span>Available Variants & Actions</span>
                                        {products.flatMap(p => p.variants).filter(v => !v.isAdded).length > 0 && (
                                            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors shadow-sm normal-case">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded text-[#e09a74] border-gray-300 focus:ring-[#e09a74]"
                                                    checked={isGlobalSelectAll || (selectedVariants.length > 0 && selectedVariants.length === products.flatMap(p => p.variants).filter(v => !v.isAdded).length)}
                                                    onChange={toggleSelectAll}
                                                />
                                                <span className="text-xs font-bold text-gray-700 tracking-normal">Select All</span>
                                            </label>
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map(product => (
                                <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 relative">
                                                {getProductImageUrl(product.product_images?.[0] || product.images?.[0]) ? (
                                                    <img
                                                        src={getProductImageUrl(product.product_images?.[0] || product.images?.[0])}
                                                        alt={product.product_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-900 line-clamp-1">{product.product_name}</h3>
                                                    {product.categoryId?.name && (
                                                        <span className="shrink-0 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[9px] font-bold tracking-wider uppercase">
                                                            {product.categoryId?.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                    {product.description ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 80) + '...' : 'No description available.'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="space-y-2">
                                            {product.variants?.map(variant => {
                                                const isSelected = isGlobalSelectAll 
                                                    ? !excludedVariants.includes(variant._id) 
                                                    : selectedVariants.some(v => v.variantId === variant._id);

                                                return (
                                                <div key={variant._id} className={clsx(
                                                    "flex flex-wrap items-center justify-between p-3 rounded-xl border shadow-sm transition-all gap-4",
                                                    isSelected ? "bg-[#e09a74]/5 border-[#e09a74]/30" : "bg-white border-gray-100 hover:border-[#e09a74]/30"
                                                )}>
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <input 
                                                            type="checkbox"
                                                            disabled={variant.isAdded}
                                                            checked={variant.isAdded ? false : isSelected}
                                                            onChange={() => toggleVariant(product._id, variant._id)}
                                                            className="w-4 h-4 rounded text-[#e09a74] border-gray-300 focus:ring-[#e09a74] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-bold text-gray-900 truncate">
                                                                {variant.variant_name || 'Standard Variant'}
                                                            </p>
                                                            <div className="text-[10px] text-gray-500 font-mono mt-0.5 flex items-center gap-2">
                                                                <span>SKU: {variant.skucode || 'N/A'}</span>
                                                                <span className="text-gray-300">•</span>
                                                                <span className="text-gray-900 font-bold">₹{variant.selling_price?.toLocaleString() || '0'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => openModal(product, variant)}
                                                        disabled={upsertOverride.isPending || variant.isAdded}
                                                        className={clsx(
                                                            "px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shrink-0",
                                                            variant.isAdded
                                                                ? "bg-green-50 text-green-600 border-green-100 cursor-not-allowed"
                                                                : "bg-white text-[#e09a74] border-gray-200 shadow-sm hover:bg-[#e09a74] hover:text-white hover:border-[#e09a74]"
                                                        )}
                                                        title={variant.isAdded ? "Already in Inventory" : "Add to My Inventory"}
                                                    >
                                                        {variant.isAdded ? (
                                                            <><Check className="w-3.5 h-3.5" /> Added</>
                                                        ) : (
                                                            <><Plus className="w-3.5 h-3.5" /> Add</>
                                                        )}
                                                    </button>
                                                </div>
                                            )})}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination?.totalPages > 1 && (
                <div className="py-8 border-t border-gray-50">
                    <Pagination
                        currentPage={pagination.currentPage || 1}
                        totalPages={pagination.totalPages}
                        pageSize={pagination.limit}
                        totalItems={pagination.totalItems}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Add to Inventory Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Add to Inventory</h2>
                                    <p className="text-gray-500 text-sm mt-1">Set your custom pricing and stock.</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl mb-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 overflow-hidden shrink-0">
                                    <img
                                        src={getProductImageUrl(selectedItem?.variant?.variant_images?.[0] || selectedItem?.product?.product_images?.[0])}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">
                                        {selectedItem?.product?.product_name}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-mono">
                                        {selectedItem?.variant?.variant_name || 'Standard Variant'}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">
                                        MRP (Maximum Retail Price)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                        <input
                                            type="number"
                                            required
                                            value={formData.mrp_price}
                                            onChange={e => setFormData({ ...formData, mrp_price: e.target.value })}
                                            placeholder="Enter MRP"
                                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#e09a74] focus:bg-white transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">
                                        Your Selling Price
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                        <input
                                            type="number"
                                            required
                                            value={formData.selling_price}
                                            onChange={e => setFormData({ ...formData, selling_price: e.target.value })}
                                            placeholder="Enter Selling Price"
                                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#e09a74] focus:bg-white transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">
                                        Initial Stock Quantity (Max: {selectedItem?.variant?.stock || 0})
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        // max={selectedItem?.variant?.stock || 0}
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                        placeholder="Enter Stock"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#e09a74] focus:bg-white transition-all text-sm font-bold"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 rounded-xl h-12"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        isLoading={upsertOverride.isPending}
                                        className="flex-1 text-white rounded-xl h-12 bg-[#e09a74] hover:bg-[#d08963]"
                                    >
                                        Confirm & Add
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
