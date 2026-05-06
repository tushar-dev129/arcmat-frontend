"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Container from "@/components/ui/Container";
import {
    useCreateContractorBespokeRequest,
    useGetBrands,
    useGetContractorBespokeRequests
} from "@/hooks/useBrand";
import { getBrandImageUrl } from "@/lib/productUtils";
import { toast } from "@/components/ui/Toast";
import { Loader2, Send, ShieldCheck } from "lucide-react";

const requestStatusClass = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
};

const ContractorBrandRequestsPage = () => {
    const [messageByBrand, setMessageByBrand] = useState({});
    const { data: brandsData, isLoading: brandsLoading } = useGetBrands({ type: "frontend", limit: 200 });
    const { data: requestsData, isLoading: requestsLoading } = useGetContractorBespokeRequests({
        brandId: "mine",
        mine: "contractor",
    });
    const createRequest = useCreateContractorBespokeRequest();

    const brands = brandsData?.data || [];
    const requests = requestsData?.data || [];
    const requestByBrandId = useMemo(() => {
        const map = new Map();
        requests.forEach((request) => {
            const brandId = request.brandId?._id || request.brandId;
            map.set(String(brandId), request);
        });
        return map;
    }, [requests]);

    const sendRequest = async (brandId) => {
        try {
            await createRequest.mutateAsync({
                brandId,
                message: messageByBrand[brandId] || "",
            });
            setMessageByBrand((current) => ({ ...current, [brandId]: "" }));
            toast.success("Request sent to brand");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Could not send request");
        }
    };

    return (
        <Container className="py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-950">Brand Display Requests</h1>
                <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-gray-500">
                    Ask brands to show your contractor profile on their bespoke page. The brand can approve your request from their dashboard.
                </p>
            </div>

            {brandsLoading || requestsLoading ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-gray-200 bg-white">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : brands.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {brands.map((brand) => {
                        const brandId = brand._id || brand.id;
                        const existingRequest = requestByBrandId.get(String(brandId));
                        const status = existingRequest?.status;

                        return (
                            <div key={brandId} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                        <Image src={getBrandImageUrl(brand.logo)} alt={brand.name} fill className="object-contain p-2" unoptimized />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="truncate text-lg font-bold text-gray-950">{brand.name}</h2>
                                        <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-gray-400">{brand.country || "Global"}</p>
                                    </div>
                                </div>

                                {status ? (
                                    <div className={`mt-5 rounded-lg border px-4 py-3 text-sm font-bold capitalize ${requestStatusClass[status] || requestStatusClass.pending}`}>
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            {status}
                                        </div>
                                        {existingRequest.brandNote && (
                                            <p className="mt-2 text-xs font-medium normal-case">{existingRequest.brandNote}</p>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <textarea
                                            value={messageByBrand[brandId] || ""}
                                            onChange={(event) => setMessageByBrand((current) => ({ ...current, [brandId]: event.target.value }))}
                                            placeholder="Tell the brand why your contractor profile should appear on their bespoke page."
                                            rows={4}
                                            className="mt-5 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium leading-6 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                        <button
                                            onClick={() => sendRequest(brandId)}
                                            disabled={createRequest.isPending}
                                            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-[#c97f58] disabled:opacity-60"
                                        >
                                            {createRequest.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                            Request Display
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
                    <h2 className="text-lg font-bold text-gray-950">No brands available</h2>
                    <p className="mt-2 text-sm font-medium text-gray-500">Brands will appear here when they are active.</p>
                </div>
            )}
        </Container>
    );
};

export default ContractorBrandRequestsPage;
