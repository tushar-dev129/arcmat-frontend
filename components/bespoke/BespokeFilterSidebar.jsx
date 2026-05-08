"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Search, FilterX, X } from "lucide-react";

const getCatId = (cat) => cat?._id || cat?.id;

const FilterItem = ({
    item,
    depth = 0,
    activeId,
    setActiveId,
    openPath,
    setOpenPath
}) => {
    const id = getCatId(item);
    const hasChildren = item.children && item.children.length > 0;
    
    // Check if this item is in the currently opened path
    const isOpen = openPath.includes(id);
    const isActive = activeId === id;

    const handleToggle = (e) => {
        e.stopPropagation();
        
        if (hasChildren) {
            // If it's already open, close it (by truncating path to parent)
            if (isOpen) {
                const parentIndex = openPath.indexOf(id) - 1;
                const newPath = parentIndex >= 0 ? openPath.slice(0, parentIndex + 1) : [];
                setOpenPath(newPath);
            } else {
                // Open it and make it the new path end
                // We need to keep parents in the path. depth tells us where to truncate.
                const newPath = [...openPath.slice(0, depth), id];
                setOpenPath(newPath);
            }
        }
        
        // When clicking any item, set it as the active filter
        setActiveId(id);
    };

    return (
        <div className="w-full">
            <button
                onClick={handleToggle}
                className={`flex w-full items-center justify-between py-2 px-2 text-left transition-colors rounded-md group ${
                    isActive
                        ? "text-[#b76b45] font-bold bg-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 font-medium"
                }`}
                style={{ paddingLeft: `${(depth * 1) + 0.5}rem` }}
            >
                <span className="text-[15px] truncate">{item.name}</span>
                {hasChildren && (
                    <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out ${
                            isOpen ? "rotate-180 text-[#b76b45]" : "text-gray-400 group-hover:text-gray-600"
                        }`}
                    />
                )}
            </button>
            
            <div
                className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
            >
                <div className="overflow-hidden">
                    <div className="pt-1 pb-1 flex flex-col gap-0.5">
                        {item.children?.map((child) => (
                            <FilterItem
                                key={getCatId(child)}
                                item={child}
                                depth={depth + 1}
                                activeId={activeId}
                                setActiveId={setActiveId}
                                openPath={openPath}
                                setOpenPath={setOpenPath}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const BespokeFilterSidebar = ({
    treeData,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    selectedSubcategory,
    selectedSubSubcategory,
    onFilterChange, // function to update parent state: (cat, subcat, subsubcat) => void
    isMobileOpen,
    setIsMobileOpen
}) => {
    // For local navigation state
    const [openPath, setOpenPath] = useState([]);
    
    // We map the deepest selected category to activeId
    const activeId = selectedSubSubcategory || selectedSubcategory || selectedCategory || "";

    // When an item is clicked, figure out its lineage
    const handleSetActiveId = (targetId) => {
        if (!targetId) {
            onFilterChange("", "", "");
            setOpenPath([]);
            return;
        }

        // Search the tree to find the category, subcategory, subsubcategory
        let cat = "", subcat = "", subsubcat = "";
        let newPath = [];
        
        for (const c of treeData) {
            const cid = getCatId(c);
            if (cid === targetId) {
                cat = targetId;
                newPath = [cid];
                break;
            }
            if (c.children) {
                for (const sc of c.children) {
                    const scid = getCatId(sc);
                    if (scid === targetId) {
                        cat = cid;
                        subcat = targetId;
                        newPath = [cid, scid];
                        break;
                    }
                    if (sc.children) {
                        for (const ssc of sc.children) {
                            const sscid = getCatId(ssc);
                            if (sscid === targetId) {
                                cat = cid;
                                subcat = scid;
                                subsubcat = targetId;
                                newPath = [cid, scid, sscid];
                                break;
                            }
                        }
                    }
                    if (subcat) break;
                }
            }
            if (cat) break;
        }

        onFilterChange(cat, subcat, subsubcat);
        setOpenPath(newPath);
        
        // On mobile, auto-close sidebar after selection if it's a leaf node?
        // Let's keep it open to allow users to see results and tweak.
    };

    // On mount or external state change, ensure open path is correct
    useEffect(() => {
        const path = [];
        if (selectedCategory) path.push(selectedCategory);
        if (selectedSubcategory) path.push(selectedSubcategory);
        if (selectedSubSubcategory) path.push(selectedSubSubcategory);
        setOpenPath(path);
    }, [selectedCategory, selectedSubcategory, selectedSubSubcategory]);

    const handleClearFilters = () => {
        onFilterChange("", "", "");
        setSearchTerm("");
        setOpenPath([]);
    };

    const hasActiveFilters = !!activeId || !!searchTerm;

    const sidebarContent = (
        <div className="flex h-full flex-col bg-transparent">
            {/* Header for mobile */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 lg:hidden bg-white">
                <h2 className="text-lg font-bold text-gray-950">Filters</h2>
                <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 -mr-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 lg:p-0 lg:pr-6 scrollbar-thin scrollbar-thumb-gray-200">
                {/* Search */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search brands..."
                            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-gray-800 outline-none transition focus:border-[#b76b45] focus:ring-4 focus:ring-[#b76b45]/10"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900">Categories</h3>
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="flex items-center gap-1 text-xs font-bold text-[#b76b45] hover:text-[#9a5a3a] transition-colors"
                            >
                                <FilterX className="h-3 w-3" />
                                Clear
                            </button>
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-0.5">
                        {treeData?.map((cat) => (
                            <FilterItem
                                key={getCatId(cat)}
                                item={cat}
                                depth={0}
                                activeId={activeId}
                                setActiveId={handleSetActiveId}
                                openPath={openPath}
                                setOpenPath={setOpenPath}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-[280px] shrink-0 h-[calc(100vh-8rem)] sticky top-24">
                <div className="h-full overflow-hidden">
                    {sidebarContent}
                </div>
            </aside>

            {/* Mobile Drawer Overlay */}
            <div 
                className={`fixed inset-0 z-[9998] bg-gray-950/50 backdrop-blur-sm transition-opacity lg:hidden ${
                    isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* Mobile Drawer */}
            <aside 
                className={`fixed inset-y-0 left-0 z-[9999] w-[85vw] max-w-[320px] transform bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
};

export default BespokeFilterSidebar;
