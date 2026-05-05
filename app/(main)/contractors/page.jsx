"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import { useGetContractors } from "@/hooks/useContractor";
import ContractorCard from "@/components/cards/ContractorCard";
import { Search, SlidersHorizontal, MapPin, X } from "lucide-react";

export default function ContractorListingPage() {
    const [search, setSearch] = useState("");
    const [city, setCity] = useState("");
    
    const { data: contractorData, isLoading } = useGetContractors({
        search,
        city,
        status: 'approved'
    });

    const contractors = contractorData?.data || [];

    return (
        <main className="min-h-screen bg-[hsl(30,20%,98%)] pb-20">
            {/* Hero Section */}
            <section className="relative h-[400px] flex items-center overflow-hidden bg-[hsl(20,10%,15%)]">
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute inset-0 bg-gradient-to-r from-[hsl(20,10%,15%)] via-transparent to-transparent z-10" />
                    {/* Background pattern or image could go here */}
                    <div className="w-full h-full bg-[url('/images/hero-pattern.png')] bg-repeat opacity-20" />
                </div>
                
                <Container className="relative z-20">
                    <div className="max-w-2xl">
                        <span className="inline-block px-4 py-1 rounded-full bg-[hsl(15,80%,65%)]/20 border border-[hsl(15,80%,65%)]/30 text-[hsl(15,80%,65%)] text-xs font-bold mb-6 tracking-widest uppercase">
                            Premium Network
                        </span>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Find the Best <span className="text-[hsl(15,80%,65%)]">Contractors</span> for Your Space.
                        </h1>
                        <p className="text-gray-400 text-lg mb-8 max-w-lg">
                            Discover verified professionals and bespoke makers who bring architecture to life with precision and craftsmanship.
                        </p>
                    </div>
                </Container>

                {/* Floating Search Bar */}
                <div className="absolute -bottom-10 left-0 w-full z-30">
                    <Container>
                        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-[hsl(30,15%,90%)] flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 w-full relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search by business name or service..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[hsl(15,80%,65%)] transition-all text-sm font-medium"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-64 relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="City (e.g. Mumbai)"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[hsl(15,80%,65%)] transition-all text-sm font-medium"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>
                            <button className="w-full md:w-auto px-8 py-3.5 bg-[hsl(20,10%,15%)] hover:bg-[hsl(15,80%,60%)] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                                <SlidersHorizontal className="w-4 h-4" />
                                Find Experts
                            </button>
                        </div>
                    </Container>
                </div>
            </section>

            {/* Main Content Area */}
            <Container className="mt-24">
                {/* Active Filters */}
                {(search || city) && (
                    <div className="flex items-center gap-3 mb-8">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Filters:</span>
                        {search && (
                            <button 
                                onClick={() => setSearch("")}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[hsl(30,15%,90%)] rounded-full text-xs font-bold text-[hsl(20,10%,15%)] hover:bg-gray-50 transition-all"
                            >
                                Search: {search} <X className="w-3 h-3" />
                            </button>
                        )}
                        {city && (
                            <button 
                                onClick={() => setCity("")}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[hsl(30,15%,90%)] rounded-full text-xs font-bold text-[hsl(20,10%,15%)] hover:bg-gray-50 transition-all"
                            >
                                City: {city} <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                )}

                {/* Results Count & Sort */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[hsl(20,10%,15%)]">
                            {isLoading ? "Finding Professionals..." : `${contractors.length} Experts found`}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">Verified contractors & service providers in your network.</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-500">Sort by:</span>
                        <select className="bg-white border border-[hsl(30,15%,90%)] px-4 py-2 rounded-xl text-sm font-bold outline-none focus:border-[hsl(15,80%,65%)] transition-all cursor-pointer">
                            <option>Recommended</option>
                            <option>Top Rated</option>
                            <option>Most Experienced</option>
                            <option>Recently Added</option>
                        </select>
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-[450px] w-full bg-gray-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : contractors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {contractors.map((contractor) => (
                            <ContractorCard key={contractor._id} contractor={contractor} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-24 h-24 bg-[#ead4ce]/30 rounded-full flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-[hsl(15,80%,60%)]" />
                        </div>
                        <h3 className="text-2xl font-bold text-[hsl(20,10%,15%)] mb-2">No professionals found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your search filters or city to find what you're looking for.</p>
                        <button 
                            onClick={() => {setSearch(""); setCity("");}}
                            className="mt-8 px-6 py-3 bg-[hsl(20,10%,15%)] text-white font-bold rounded-xl hover:bg-[hsl(15,80%,60%)] transition-all"
                        >
                            Reset all filters
                        </button>
                    </div>
                )}
            </Container>
        </main>
    );
}
