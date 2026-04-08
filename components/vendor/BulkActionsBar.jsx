'use client';

import { useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useUIStore } from '@/store/useUIStore';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProduct, useDeleteProduct } from '@/hooks/useProduct';
import { toast } from 'sonner';
import { Trash2, CheckCircle, XCircle, Edit, X, ChevronDown } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

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

  // Not visible until something is selected
  if (selectedProducts.length === 0) return null;

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
      <div className="sticky top-0 z-30 mx-0 mb-0">
        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[#2d3142] text-white rounded-t-lg shadow-lg">
          {/* Left: count + clear */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-black bg-white/20 px-3 py-1 rounded-full">
              {selectedProducts.length} selected
            </span>
            <button
              onClick={clearSelection}
              className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors font-bold"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>

          {/* Right: action picker + apply */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="appearance-none bg-white/10 border border-white/20 text-white text-sm font-bold rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
              >
                <option value="" className="text-gray-900">Choose action...</option>
                {selectedProducts.length === 1 && (
                  <option value="edit" className="text-gray-900">✏️ Edit Product</option>
                )}
                <option value="activate" className="text-gray-900">✅ Set Active</option>
                <option value="deactivate" className="text-gray-900">🔒 Set Inactive</option>
                <option value="delete" className="text-gray-900">🗑️ Delete Selected</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/70 pointer-events-none" />
            </div>

            <button
              onClick={handleApply}
              disabled={!selectedAction || isPending}
              className="px-5 py-2 bg-[#d9a88a] text-white text-sm font-black rounded-xl hover:bg-[#c2896a] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isPending ? 'Working...' : 'Apply'}
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