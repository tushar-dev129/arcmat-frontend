'use client';

import { useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useUIStore } from '@/store/useUIStore';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProduct, useDeleteProduct } from '@/hooks/useProduct';
import { toast } from 'sonner';
import { Trash2, Edit, X, ChevronDown, CheckCircle2 } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { getProductImageUrl } from '@/lib/productUtils';
import { useBulkApproveProducts } from '@/hooks/useProduct';
import clsx from 'clsx';

export default function BulkActionsBar({ products = [] }) {
  const {
    selectedProducts,
    clearSelection,
  } = useProductStore();
  const { user } = useAuth();
  const { openProductFormModal } = useUIStore();

  const [selectedAction, setSelectedAction] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const bulkApproveMutation = useBulkApproveProducts();

  // Strictly restricted to Admins and only visible when something is selected
  if (user?.role !== 'admin' || selectedProducts.length === 0) return null;

  const handleApply = async () => {
    if (!selectedAction) return;

    if (selectedAction === 'delete') {
      setIsDeleteConfirmOpen(true);
      return;
    }

    setIsPending(true);
    try {
      if (selectedAction === 'edit') {
        if (selectedProducts.length === 1) {
          const p = products.find(p => (p._id || p.id) === selectedProducts[0]);
          if (p) openProductFormModal(p);
        } else {
          toast.error('Select only one product to edit');
        }
      } else if (selectedAction === 'activate' || selectedAction === 'deactivate') {
        const newStatus = selectedAction === 'activate' ? 1 : 0;
        await Promise.all(
          selectedProducts.map(id =>
            updateProductMutation.mutateAsync({ id, data: { status: newStatus } })
          )
        );
        toast.success(
          `${selectedProducts.length} product${selectedProducts.length !== 1 ? 's' : ''} ${selectedAction === 'activate' ? 'activated' : 'deactivated'}`
        );
        clearSelection();
      }
    } catch {
      toast.error('Failed to complete some actions. Please try again.');
    } finally {
      setIsPending(false);
      setSelectedAction('');
    }
  };

  const handleConfirmDelete = async () => {
    setIsPending(true);
    try {
      await Promise.all(selectedProducts.map(id => deleteProductMutation.mutateAsync(id)));
      toast.success(`${selectedProducts.length} product${selectedProducts.length !== 1 ? 's' : ''} deleted`);
      clearSelection();
    } catch {
      toast.error('Failed to delete some products.');
    } finally {
      setIsPending(false);
      setSelectedAction('');
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <>
      {/* Sticky selection toolbar */}
      <div className="sticky top-0 z-30 mx-0 mb-0 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-orange-50/70 backdrop-blur-md text-[#2d3142] rounded-xl shadow-2xl shadow-orange-900/5 border border-primary/30">
          {/* Left: count + thumbnails + clear */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {products.filter(p => selectedProducts.includes(p._id || p.id)).slice(0, 3).map((p, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-white overflow-hidden shadow-sm">
                  <img src={getProductImageUrl((p.product_images || p.images)?.[0])} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none flex items-center gap-1.5 uppercase tracking-wider">
                <span className="text-primary">{selectedProducts.length}</span> Products Selected
              </span>
              <button
                onClick={clearSelection}
                className="mt-1 flex items-center gap-1 text-[10px] text-gray-400 hover:text-primary transition-colors font-bold uppercase tracking-widest text-left"
              >
                <X className="w-2.5 h-2.5" />
                Clear Selection
              </button>
            </div>
          </div>

          {/* Right: action picker + apply */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="appearance-none bg-white border border-primary/20 text-[#2d3142] text-[10px] font-bold rounded-xl px-5 py-3 pr-10 focus:outline-none focus:ring-4 focus:ring-orange-100 cursor-pointer transition-all shadow-sm group-hover:shadow-md uppercase tracking-widest"
              >
                <option value="">CHOOSE ACTION...</option>
                {selectedProducts.length === 1 && (
                  <option value="edit">EDIT PRODUCT</option>
                )}
                <option value="activate">SET ACTIVE</option>
                <option value="deactivate">SET INACTIVE</option>
                <option value="delete">DELETE PERMANENTLY</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
            </div>

            <button
              onClick={handleApply}
              disabled={!selectedAction || isPending}
              className="px-6 py-3 bg-primary text-white text-[10px] font-bold rounded-xl hover:bg-[#c2896a] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-orange-200 flex items-center gap-2 uppercase tracking-widest"
            >
              {isPending ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Apply Action
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => { setIsDeleteConfirmOpen(false); setSelectedAction(''); }}
        onConfirm={handleConfirmDelete}
        title="Delete Products"
        message={`Are you sure you want to permanently delete ${selectedProducts.length} product${selectedProducts.length !== 1 ? 's' : ''}? This cannot be undone.`}
        confirmText={isPending ? 'Deleting...' : 'Delete'}
        type="danger"
      />
    </>
  );
}
