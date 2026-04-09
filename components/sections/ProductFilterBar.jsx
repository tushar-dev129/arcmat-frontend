import React, { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Container from '../ui/Container'
import Button from '../ui/Button'
import { useGetCategoryTree } from '@/hooks/useCategory'
import { useCompareStore } from '@/store/useCompareStore'
import { Loader2 } from 'lucide-react'

const findNodeAndDetermineDisplay = (tree, targetId) => {
    if (targetId === 'All' || !targetId) {
        return { nodesToDisplay: tree, parentNode: null };
    }

    let foundNode = null;
    let foundParent = null;

    const traverse = (nodes, parent = null) => {
        for (const node of nodes) {
            if (node._id === targetId || node.id === targetId) {
                foundNode = node;
                foundParent = parent;
                return true;
            }
            if (node.children?.length > 0) {
                if (traverse(node.children, node)) return true;
            }
        }
        return false;
    };
    
    traverse(tree);

    if (!foundNode) return { nodesToDisplay: tree, parentNode: null };

    // If the node has children, show its children as the drill-down options
    if (foundNode.children && foundNode.children.length > 0) {
        return { nodesToDisplay: foundNode.children, parentNode: foundNode };
    }
    
    // If the node has NO children (it's a leaf node), gracefully fallback to showing its siblings
    if (foundParent) {
        return { nodesToDisplay: foundParent.children, parentNode: foundParent };
    }

    // Edge case: Level 1 node with no children -> show level 1 siblings
    return { nodesToDisplay: tree, parentNode: null };
}

const ProductFilterBar = ({ selectedCategory, setSelectedCategory, onOpenFilters, categoryCounts = {} }) => {
    const { data: treeDataRaw, isLoading } = useGetCategoryTree();

    const dynamicCategories = useMemo(() => {
        const treeData = Array.isArray(treeDataRaw?.data) ? treeDataRaw.data : (Array.isArray(treeDataRaw) ? treeDataRaw : []);
        if (!treeData || treeData.length === 0) return [];

        const { nodesToDisplay, parentNode } = findNodeAndDetermineDisplay(treeData, selectedCategory);

        const uniqueNames = new Set();
        const mapped = nodesToDisplay.filter(cat => {
            const isDuplicate = uniqueNames.has(cat.name);
            uniqueNames.add(cat.name);
            return !isDuplicate;
        }).map(cat => ({
            name: cat.name,
            id: cat._id || cat.id
        }));

        const rootId = parentNode ? (parentNode._id || parentNode.id) : 'All';
        const allPillName = 'All'; // Represents resetting back to the current parent category layer
        
        return [{ name: allPillName, id: rootId }, ...mapped];
    }, [treeDataRaw, selectedCategory]);

    const comparedCount = useCompareStore(state => state.comparedProducts.length);
    const openCompareModal = useCompareStore(state => state.openCompareModal);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section className="bg-white border-b-2 border-gray-200 py-3">

            <Container className="flex items-center gap-2 sm:gap-4">

                <Button
                    onClick={onOpenFilters}
                    className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shrink-0 cursor-pointer">
                    <Image src="/Icons/Vector.svg" width={18} height={18} alt="Vector" />
                    <span className="hidden sm:inline text-[15px] font-medium">Filters</span>
                </Button>

                <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scroll-smooth py-1 px-1">
                        {isLoading ? (
                            <div className="flex items-center gap-2 px-4 py-2">
                                <Loader2 className="w-4 h-4 text-[#e09a74] animate-spin" />
                                <span className="text-sm text-gray-400">Loading categories...</span>
                            </div>
                        ) : (
                            dynamicCategories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full whitespace-nowrap transition-all text-[14px] sm:text-[15px] cursor-pointer ${selectedCategory === cat.id
                                        ? 'bg-[#e09a74] text-white shadow-sm font-semibold'
                                        : 'bg-[#f3f4f6] text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <span>{cat.name}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-3 shrink-0">

                    <div className="hidden md:block h-8 w-[1px] bg-gray-200 mx-1"></div>

                    <Button
                        className="p-2 hover:bg-gray-50 rounded-full transition-colors cursor-pointer relative"
                    >
                        <Image src="/Icons/Search.svg" width={20} height={20} alt="Search" className="opacity-60" />
                    </Button>

                    <Button
                        className="p-2 flex sm:hidden hover:bg-gray-50 rounded-full transition-colors relative"
                    >
                        <Image src="/Icons/Vector_2.svg" width={15} height={15} alt="Search" className="opacity-60" />
                    </Button>

                    <Button
                        onClick={() => openCompareModal()}
                        className="hidden sm:block ml-1 sm:ml-2 px-4 sm:px-7 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-2xl hover:bg-[#e09a74] hover:text-white transition-colors text-[14px] sm:text-[15px] font-bold text-gray-700 shadow-sm cursor-pointer whitespace-nowrap"
                    >
                        Compare {mounted && comparedCount > 0 && `(${comparedCount})`}
                    </Button>
                </div>

            </Container>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

        </section>
    )
}

export default ProductFilterBar
