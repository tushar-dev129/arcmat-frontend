"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import { useGetContractors } from "@/hooks/useContractor";
import ContractorCard from "@/components/cards/ContractorCard";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContractorListingPage() {
    const [search, setSearch] = useState("");
    const [city, setCity] = useState("");
    
    const { data: contractorData, isLoading, error } = useGetContractors({
        search,
        city
    });

    const contractors = contractorData?.data?.data || [];
    const errorMessage = error?.message || (contractorData?.status === 'failed' ? contractorData.message : null);

    return (
        <main className="min-h-screen bg-[hsl(30,20%,98%)] py-12">
            <Container>
                {/* Simplified Search Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">Our Professionals</h1>
                    
                    <div className="bg-white p-2 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center gap-2">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search by name or service..."
                                className="w-full pl-14 pr-6 py-4 bg-transparent border-none rounded-2xl outline-none focus:ring-0 transition-all text-sm font-bold text-gray-800"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="h-8 w-px bg-gray-100 hidden md:block"></div>
                        <div className="w-full md:w-64 relative">
                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="City (e.g. Mumbai)"
                                className="w-full pl-14 pr-6 py-4 bg-transparent border-none rounded-2xl outline-none focus:ring-0 transition-all text-sm font-bold text-gray-800"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                        <button className="w-full md:w-auto px-10 py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-[1.25rem] transition-all duration-300 shadow-lg shadow-primary/20 active:scale-95">
                            Search
                        </button>
                    </div>

                    {/* Quick Filters */}
                    <AnimatePresence>
                        {(search || city) && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 mt-4"
                            >
                                {search && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-500">
                                        "{search}" <X className="w-3 h-3 cursor-pointer hover:text-primary" onClick={() => setSearch("")} />
                                    </span>
                                )}
                                {city && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-500">
                                        {city} <X className="w-3 h-3 cursor-pointer hover:text-primary" onClick={() => setCity("")} />
                                    </span>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Results Section */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-[400px] w-full bg-gray-200 animate-pulse rounded-[2rem]" />
                        ))}
                    </div>
                ) : contractors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {contractors.map((contractor) => (
                            <ContractorCard key={contractor._id} contractor={contractor} />
                        ))}
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <Search className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No professionals found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your filters to find more experts.</p>
                    </div>
                )}
            </Container>
        </main>
    );
}
