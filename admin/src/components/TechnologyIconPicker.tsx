"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  Check,
  Cpu,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-react";
import { TECH_CATALOG, TechItem, renderTechSvg, getTechIcon } from "@/lib/techIcons";

interface TechnologyIconPickerProps {
  selected: string[];
  onChange: (items: string[]) => void;
  label?: string;
  helperText?: string;
}

type CategoryFilter = "all" | "web" | "backend" | "mobile" | "database" | "marketing" | "design";

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All Technologies" },
  { id: "web", label: "Web & Frontend" },
  { id: "backend", label: "Backend & APIs" },
  { id: "mobile", label: "Mobile Apps" },
  { id: "database", label: "Database & Cloud" },
  { id: "marketing", label: "Digital Marketing & SEO" },
  { id: "design", label: "UI/UX & Creative" },
];

export default function TechnologyIconPicker({
  selected = [],
  onChange,
  label = "Technologies & Frameworks Utilized",
  helperText = "Technologies, languages, and frameworks associated with this item.",
}: TechnologyIconPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [initialSelectedWhenOpened, setInitialSelectedWhenOpened] = useState<string[]>([]);

  const handleOpenModal = () => {
    setInitialSelectedWhenOpened([...selected]);
    setIsModalOpen(true);
  };

  // Normalize selected list for comparison
  const selectedSet = useMemo(() => {
    return new Set(selected.map((item) => item.toLowerCase().trim()));
  }, [selected]);

  // Set of items that were already selected when the modal opened
  const initialSelectedSet = useMemo(() => {
    return new Set(initialSelectedWhenOpened.map((item) => item.toLowerCase().trim()));
  }, [initialSelectedWhenOpened]);

  // Count how many new technologies have been added since opening the modal
  const newlyAddedCount = useMemo(() => {
    return selected.filter(
      (item) => !initialSelectedSet.has(item.toLowerCase().trim())
    ).length;
  }, [selected, initialSelectedSet]);

  const hasNewAdded = newlyAddedCount > 0;

  // Filter catalog by search query and category
  const filteredCatalog = useMemo(() => {
    return TECH_CATALOG.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const toggleTech = (name: string) => {
    const trimmed = name.trim();
    const isSelected = selected.some(
      (item) => item.toLowerCase().trim() === trimmed.toLowerCase()
    );

    if (isSelected) {
      onChange(
        selected.filter(
          (item) => item.toLowerCase().trim() !== trimmed.toLowerCase()
        )
      );
    } else {
      onChange([...selected, trimmed]);
    }
  };

  const removeTech = (indexToRemove: number) => {
    onChange(selected.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAll = () => {
    if (selected.length > 0) {
      onChange([]);
    }
  };

  return (
    <div className="space-y-3 rounded-[4px] border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#141519] p-4 shadow-2xs">
      {/* Header with Title, Count, and "Add Technology" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-gray-800">
        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-gray-200 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#0167D6]" />
            <span>{label}</span>
            <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-[4px] bg-blue-50 dark:bg-blue-950/60 text-[#0167D6] dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
              {selected.length} Selected
            </span>
          </label>
          {helperText && (
            <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
              {helperText}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-slate-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 font-medium inline-flex items-center gap-1 transition px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Technology</span>
          </button>
        </div>
      </div>

      {/* Selected Items Grid with Top-Right Minus Button */}
      {selected.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
          {selected.map((item, idx) => (
            <div
              key={idx}
              className="relative group flex items-center gap-2 px-3 py-2 rounded-[4px] bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800 text-slate-800 dark:text-gray-100 text-xs font-semibold shadow-2xs hover:border-[#0167D6]/50 transition"
            >
              <span className="shrink-0 text-[#0167D6]">
                {getTechIcon(item, "w-4 h-4 text-[#0167D6]")}
              </span>
              <span className="truncate pr-3">{item}</span>

              {/* Minus button on top-right corner */}
              <button
                type="button"
                onClick={() => removeTech(idx)}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xs cursor-pointer transition transform hover:scale-110"
                title={`Remove ${item}`}
                aria-label={`Remove ${item}`}
              >
                <Minus size={8} className="stroke-[3]" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-gray-800/80 rounded-[4px] bg-slate-50/50 dark:bg-[#0E0F12]/40">
          <Cpu className="w-8 h-8 mx-auto text-slate-300 dark:text-gray-600 mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-gray-300">
            No technologies selected yet
          </p>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5 mb-3">
            Click &quot;Add Technology&quot; to pick icons from our comprehensive tech catalog.
          </p>
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-bold transition cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Technology</span>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TECHNOLOGY SELECTION MODAL
      ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-lg shadow-2xl flex flex-col max-h-[85vh] cursor-default overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#0167D6]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Select Technologies &amp; Frameworks
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-[4px] bg-blue-50 dark:bg-blue-950/60 text-[#0167D6] dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
                  {selected.length} Selected
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-[4px] text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search & Filter Controls */}
            <div className="px-5 pt-4 pb-3 space-y-3 border-b border-slate-100 dark:border-gray-800/80 bg-slate-50/50 dark:bg-[#101114]">
              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search technologies (e.g. React, Next.js, Node, MongoDB, Docker, Python)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 bg-white dark:bg-[#18191D] border border-slate-200 dark:border-gray-700 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] shadow-2xs"
                  autoFocus
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1 text-[11px] font-semibold rounded-[4px] whitespace-nowrap transition cursor-pointer ${
                        isActive
                          ? "bg-[#0167D6] text-white shadow-2xs"
                          : "bg-white dark:bg-[#18191D] text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-[#202227] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-gray-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredCatalog.map((item) => {
                  const isSelected = selectedSet.has(item.name.toLowerCase().trim());
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleTech(item.name)}
                      title={item.name}
                      className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-[4px] text-left transition border text-xs font-semibold cursor-pointer ${
                        isSelected
                          ? "bg-blue-50/90 dark:bg-blue-950/40 border-[#0167D6] text-slate-900 dark:text-white shadow-2xs"
                          : "bg-white dark:bg-[#18191D] border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-50/80 dark:hover:bg-[#202227]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0 text-[#0167D6]">
                          {renderTechSvg(item.id, "w-4 h-4 text-[#0167D6]")}
                        </span>
                        <span className="truncate">{item.name}</span>
                      </div>
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-[3px] bg-[#0167D6] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-[3px] border border-slate-300 dark:border-gray-700 shrink-0 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  );
                })}

                {filteredCatalog.length === 0 && (
                  <div className="col-span-full py-12 text-center text-xs text-slate-500 dark:text-gray-400">
                    No matching technologies found for &quot;{search}&quot;.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-[#101114]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                  {selected.length} {selected.length === 1 ? "technology" : "technologies"} currently selected
                </span>
                {newlyAddedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0167D6] dark:bg-emerald-950/80 dark:text-emerald-400 border border-blue-200 dark:border-emerald-800/60">
                    +{newlyAddedCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!hasNewAdded}
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-[4px] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                    hasNewAdded
                      ? "bg-[#0167D6] hover:bg-blue-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white cursor-pointer active:scale-95"
                      : "bg-slate-200 text-slate-400 dark:bg-gray-800 dark:text-gray-500 border border-slate-200 dark:border-gray-700/60 cursor-not-allowed opacity-50"
                  }`}
                  title={hasNewAdded ? "Done selecting technologies" : "Select at least one new technology to complete"}
                >
                  <Check size={14} className={hasNewAdded ? "stroke-[2.5]" : "stroke-[2] opacity-40"} />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
