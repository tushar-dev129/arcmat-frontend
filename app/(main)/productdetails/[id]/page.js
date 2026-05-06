"use client"
import React from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import ProductDetailView from "@/components/sections/ProductDetailView"
import Container from "@/components/ui/Container"
import { useGetRetailerProductDetail } from '@/hooks/useRetailer'
import { Loader2 } from 'lucide-react'

const ProductDetailPage = () => {
    const params = useParams()
    const searchParams = useSearchParams()
    const id = params.id
    const variantId = searchParams.get('variantId')

    const { data: apiResponse, isLoading, error } = useGetRetailerProductDetail(id)
    const product = apiResponse?.data?.data

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-xl text-gray-500 font-medium">Product not found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <ProductDetailView
                product={product}
                initialVariantId={variantId}
                categories={apiResponse?.data?.parentcategory}
                childCategories={apiResponse?.data?.childcategory}
            />
        </div>
    )
}

export default ProductDetailPage
