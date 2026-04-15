'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductForm from '@/components/vendor/ProductForm';
import { useGetProduct, useUpdateProduct } from '@/hooks/useProduct';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/Toast';
import Container from '@/components/ui/Container';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
    const router = useRouter();
    const { vendorId, productId } = useParams();
    const { user } = useAuth();

    const { data: productResponse, isLoading, error } = useGetProduct(productId);
    const updateProductMutation = useUpdateProduct();
    const product = productResponse?.data?.data?.data || productResponse?.data?.data || productResponse?.data;
    const effectiveVendorId = vendorId || user?._id || user?.id;

    const handleUpdateProduct = async (formData) => {
        try {
            await updateProductMutation.mutateAsync({ id: productId, data: formData });
            toast.success('Product updated successfully!');
            router.push(user?.role === 'admin' ? `/dashboard/products-list` : `/dashboard/products-list/${effectiveVendorId}`);
        } catch (error) {
            const msg = error.response?.data?.message?.message || error.message || 'Failed to update product';
            toast.error(msg);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-[#e09a74] animate-spin" />
                <p className="text-gray-500 font-medium">Fetching product data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Container className="py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
                <p className="text-gray-500 mb-8">The product you are trying to edit doesn't exist or you don't have permission.</p>
                <Link href={user?.role === 'admin' ? `/dashboard/products-list` : `/dashboard/products-list/${effectiveVendorId}`} className="text-[#e09a74] font-bold hover:underline">
                    Back to Product List
                </Link>
            </Container>
        );
    }

    return (
        <Container className="py-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href={user?.role === 'admin' ? `/dashboard/products-list` : `/dashboard/products-list/${effectiveVendorId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                    <p className="text-sm text-gray-500">Update basic info and manage variants for "{product?.product_name}".</p>
                </div>
            </div>

            <ProductForm
                initialData={product}
                onSubmit={handleUpdateProduct}
                isSubmitting={updateProductMutation.isPending}
            />
        </Container>
    );
}
