"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  RotateCcw,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";
import ProductTable from "@/components/products/ProductTable";

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (e) {
      console.warn("Failed to fetch products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? All images and uploaded videos will be permanently purged."
      )
    ) {
      return;
    }
    try {
      await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  // Filter & Pagination logic
  const filtered = products.filter((p) => {
    const matchSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase()) ||
      p.tagline?.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const predefinedCategories = [
    "All",
    "SaaS & ERP",
    "Healthcare & Pharmacy",
    "Restaurant & Food",
    "Retail & Supermarket",
    "Education & School",
    "Accounting & Billing",
  ];

  const extraCategories = Array.from(
    new Set(
      products
        .map((p) => p.category?.trim())
        .filter(
          (cat): cat is string =>
            Boolean(cat) && !predefinedCategories.includes(cat)
        )
    )
  );
  const categories = [...predefinedCategories, ...extraCategories];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Finished Products &amp; SaaS Systems
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-[4px] bg-blue-50 text-[#0167D6] border border-blue-200 dark:bg-blue-900/30 dark:text-[#3368B2] dark:border-blue-800/40 font-bold">
              {products.length} Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
            Showcase, sell, and configure finished software products with multiple
            screenshots, front videos, rich text descriptions, and editable
            pricing plans.
          </p>
        </div>

        <Link
          href="/dashboard/products/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#15171C] border border-slate-200 dark:border-gray-800 rounded-[4px] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500"
          />
          <input
            type="text"
            placeholder="Search products by title, slug, ERP, SaaS..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0E0F12] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 pointer-events-none"
            />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none pl-8 pr-8 py-2 bg-slate-50 dark:bg-[#0E0F12] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6] cursor-pointer transition shadow-xs"
            >
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  className="bg-white dark:bg-[#131417] text-slate-900 dark:text-white"
                >
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 pointer-events-none"
            />
          </div>

          {(selectedCategory !== "All" || search) && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearch("");
                setCurrentPage(1);
              }}
              className="p-2 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 text-xs font-medium transition cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw size={14} />
            </button>
          )}

          {/* View Mode Switcher (Grid vs Table) */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#0E0F12] border border-slate-300 dark:border-gray-800 rounded-[4px]">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-[3px] transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-gray-800 text-[#0167D6] dark:text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:text-gray-500 dark:hover:text-gray-300"
              }`}
              title="Grid View (Cards matching Services & Portfolio)"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-[3px] transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-gray-800 text-[#0167D6] dark:text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:text-gray-500 dark:hover:text-gray-300"
              }`}
              title="Table View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Catalog Listing */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0167D6]" />
          Loading products catalog...
        </div>
      ) : (
        <ProductTable
          products={products}
          paginated={paginated}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          openEdit={(item) => router.push(`/dashboard/products/${item._id}/edit`)}
          handleDelete={handleDelete}
          openCreate={() => router.push("/dashboard/products/create")}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
        />
      )}
    </div>
  );
}
