'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProductStore } from '@/store/useProductStore';
import { useUIStore } from '@/store/useUIStore';
import { useDeleteProduct, useUpdateProduct, useBulkDeleteProducts, useBulkApproveProducts } from '@/hooks/useProduct';
import { useGetCategories } from '@/hooks/useCategory';
import { useAuth } from '@/hooks/useAuth';
import { useLoader } from '@/context/LoaderContext';
import StatusBadge from '../ui/StatusBadge';
import { toast } from '../ui/Toast';
import clsx from 'clsx';
import Button from '../ui/Button';
import BulkUploadModal from './BulkUploadModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { getProductImageUrl } from '@/lib/productUtils';
import { Pencil, Trash2, Lock, Unlock, CheckSquare, Square, X } from 'lucide-react';


export default function VendorProductTable({ products = [] }) {
  const router = useRouter();
  const { vendorId } = useParams();
  const { user } = useAuth();
  const { setLoading } = useLoader();
  const isAdmin = user?.role === 'admin';
  const effectiveVendorId = vendorId || user?._id || user?.id;

  const deleteProductMutation = useDeleteProduct();
  const updateProductMutation = useUpdateProduct();
  const bulkDeleteMutation = useBulkDeleteProducts();
  const bulkApproveMutation = useBulkApproveProducts();

  const { selectedProducts, toggleSelection, setSelectedProducts, clearSelection } = useProductStore();

  // Select-all for current page
  const allSelected = products.length > 0 && products.every(p => selectedProducts.includes(p._id || p.id));
  const someSelected = products.some(p => selectedProducts.includes(p._id || p.id));

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all on this page
      const pageIds = products.map(p => p._id || p.id);
      setSelectedProducts(selectedProducts.filter(id => !pageIds.includes(id)));
    } else {
      // Add all on this page to selection
      const pageIds = products.map(p => p._id || p.id);
      const merged = [...new Set([...selectedProducts, ...pageIds])];
      setSelectedProducts(merged);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const handleDelete = (productId, productName) => {
    setProductToDelete({ id: productId, name: productName });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteProductMutation.mutateAsync(productToDelete.id);
      toast.success(`Product "${productToDelete.name}" deleted successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to delete product "${productToDelete.name}"`);
    } finally {
      setProductToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedProducts.length === 0) return;
    try {
      setLoading(true);
      await bulkApproveMutation.mutateAsync(selectedProducts);
      toast.success(`${selectedProducts.length} product(s) approved successfully`);
      clearSelection();
      setIsApproveModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve products');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    try {
      setLoading(true);
      await bulkDeleteMutation.mutateAsync(selectedProducts);
      toast.success(`${selectedProducts.length} product(s) deleted successfully`);
      clearSelection();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete products');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      confirmDeleteProduct();
    } else if (selectedProducts.length > 0) {
      handleBulkDelete();
    }
  };



  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      const isCurrentlyActive =
        currentStatus === true ||
        currentStatus === 1 ||
        currentStatus === '1' ||
        currentStatus === 'Active';

      const newStatus = isCurrentlyActive ? 0 : 1;
      await updateProductMutation.mutateAsync({ id: productId, data: { status: newStatus } });
      toast.success(
        newStatus === 0
          ? 'Product deactivated successfully'
          : 'Product activated successfully'
      );
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
      {/* Inline Bulk Actions Bar (Hidden for Admins as they use the primary top bar) */}
      {selectedProducts.length > 0 && !isAdmin && (
        <div className="sticky top-0 z-10 bg-indigo-50/80 backdrop-blur-md px-6 py-4 border-b border-indigo-100 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {products.filter(p => selectedProducts.includes(p._id || p.id)).slice(0, 3).map((p, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-white overflow-hidden shadow-sm">
                  <img src={getProductImageUrl((p.product_images || p.images)?.[0])} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-sm font-bold text-indigo-900 leading-none">
              {selectedProducts.length} <span className="text-indigo-600/70 font-bold uppercase tracking-widest text-[10px] ml-1">Products Selected</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsApproveModalOpen(true)}
                className="bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 font-bold rounded-xl px-4 py-2 transition-all active:scale-95"
              >
                Approve Selected
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setProductToDelete(null);
                setIsDeleteModalOpen(true);
              }}
              className="bg-red-500 text-white border-transparent hover:bg-red-600 font-bold rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg shadow-red-200 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </Button>
            <button
              onClick={() => clearSelection()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
              title="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                  checked={products.length > 0 && selectedProducts.length === products.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Unique Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Date Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const id = product._id || product.id;
              const images = product.product_images || product.images || [];
              const name = product.product_name || product.name;
              const isActive = product.status === 1 || product.status === 'Active' || product.isActive === true;
              const status = product.status ?? (isActive ? 'Active' : 'Inactive');
              const isSelected = selectedProducts.includes(id);

              return (
                <tr key={id} className={clsx("hover:bg-gray-50 transition-colors", selectedProducts.includes(id) && "bg-indigo-50/50")}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                      checked={selectedProducts.includes(id)}
                      onChange={() => toggleSelection(id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden">
                      {images?.[0] ? (
                        <img
                          src={getProductImageUrl(images?.[0])}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900 line-clamp-2 min-w-[150px]">
                      {name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                    {product.product_unique_id || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={isActive ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setLoading(true);
                        router.push(`/dashboard/products-list/${product.createdBy._id || effectiveVendorId}/edit/${id}`);
                      }}
                      className="p-2 text-primary hover:bg-orange-50 rounded-lg transition-all cursor-pointer"
                      title="Edit Product"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleToggleStatus(id, isActive)}
                        className={clsx(
                          "p-2 rounded-lg transition-all cursor-pointer",
                          isActive ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                        )}
                        title={isActive ? "Deactivate Product" : "Activate Product"}
                      >
                        {isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(id, name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-bold text-gray-900">
            No products
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Get started by adding your first product.
          </p>

          {/* 2. ADDED BULK UPLOAD BUTTON HERE */}
          {/* <div className="mt-6 flex justify-center gap-3">
            <Button
              onClick={() => openProductFormModal()}
              className="bg-[#d9a88a] text-white hover:bg-[#c99775] border-transparent shadow-sm px-4 py-2 flex items-center"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Prod
            </Button>

            <Button
              variant="outline"
              onClick={() => openBulkUploadModal()}
              className="shadow-sm px-4 py-2 bg-white flex items-center"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Bulk Upload
            </Button>
          </div> */}
        </div>
      )}
      <BulkUploadModal />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={productToDelete ? "Delete Product" : "Delete Selected Products"}
        message={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.name}"? This will also remove all its variants.`
            : `Are you sure you want to delete ${selectedProducts.length} selected product(s)? This will also remove all their variants.`
        }
        confirmText="Delete"
        type="danger"
      />

      <ConfirmationModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleBulkApprove}
        title="Approve Selected Products"
        message={`This will mark ${selectedProducts.length} product(s) as Active/Approved.`}
        confirmText="Approve"
        type="warning"
      />
    </div>
  );
}