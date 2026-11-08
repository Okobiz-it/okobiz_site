"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  Check,
  Cpu,
  Layers,
  Sparkles,
  RotateCcw
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
  label = "Technology Frameworks & Tools",
  helperText = "Select technologies from the icon library. All icons render with uniform styling."
}: TechnologyIconPickerProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  // Normalize selected list for comparison
  const selectedSet = useMemo(() => {
    return new Set(selected.map((item) => item.toLowerCase().trim()));
  }, [selected]);

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
      {/* Header with Title and Selected Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-gray-800">
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

        {selected.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="self-start sm:self-center text-[11px] text-slate-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 font-medium inline-flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear selection</span>
          </button>
        )}
      </div>

      {/* Selected Items Badges Strip */}
      {selected.length > 0 ? (
        <div className="p-2.5 rounded-[4px] bg-slate-50 dark:bg-[#0E0F12] border border-slate-200 dark:border-gray-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 mb-2 tracking-wider">
            Active Stack Preview:
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-white dark:bg-[#181A1F] border border-[#0167D6]/40 text-slate-900 dark:text-white text-xs font-semibold shadow-2xs group"
              >
                {getTechIcon(item, "w-3.5 h-3.5 text-[#0167D6] shrink-0")}
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeTech(idx)}
                  className="ml-1 text-slate-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-0.5 rounded transition"
                  title={`Remove ${item}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-[4px] bg-slate-50 dark:bg-[#0E0F12] border border-dashed border-slate-300 dark:border-gray-800 text-center">
          <p className="text-xs text-slate-500 dark:text-gray-400">
            No technologies selected yet. Click any technology below to add it to your stack.
          </p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="pt-1">
        {/* Search input */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search technologies (e.g. React, Next.js, Node, Meta, SEO, Flutter)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-[#0E0F12] border border-slate-200 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-[4px] whitespace-nowrap transition ${
                isActive
                  ? "bg-[#0167D6] text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-[#1A1C20] text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-[#22252A] hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-gray-800"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Selectable Icon Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1.5 border border-slate-200 dark:border-gray-800/80 rounded-[4px] bg-slate-50/50 dark:bg-[#0E0F12]/60">
        {filteredCatalog.map((item) => {
          const isSelected = selectedSet.has(item.name.toLowerCase().trim());
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleTech(item.name)}
              title={item.name}
              className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-[4px] text-left transition border text-xs font-semibold ${
                isSelected
                  ? "bg-blue-50/90 dark:bg-blue-950/40 border-[#0167D6] text-slate-900 dark:text-white shadow-2xs"
                  : "bg-white dark:bg-[#15171B] border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-50 dark:hover:bg-[#191B20]"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 text-[#0167D6]">
                  {renderTechSvg(item.id, "w-4 h-4 text-[#0167D6]")}
                </span>
                <span className="truncate">{item.name}</span>
              </div>
              {isSelected ? (
                <span className="w-4 h-4 rounded-[2px] bg-[#0167D6] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-[2px] border border-slate-300 dark:border-gray-700 shrink-0 opacity-40 hover:opacity-100" />
              )}
            </button>
          );
        })}

        {filteredCatalog.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-slate-500 dark:text-gray-400">
            No matching technologies found for &quot;{search}&quot;. Use the custom tool input above to add it.
          </div>
        )}
      </div>
    </div>
  );
}