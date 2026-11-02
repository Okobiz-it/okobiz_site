"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Camera
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import { GalleryItem } from "@/data/mockData";
import { getGallery } from "@/lib/api";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCat, setSelectedCat] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const gridTopRef = useRef<HTMLDivElement>(null);

  const categories = [
    "All",
    "Events",
    "Office Life",
    "Projects",
    "Team Moments",
    "Achievements"
  ];

  // Reset to page 1 on category filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCat]);

  // Fetch gallery items from MongoDB / Cloudinary
  useEffect(() => {
    const fetchRemote = async () => {
      try {
        const liveItems = await getGallery();
        if (Array.isArray(liveItems) && liveItems.length > 0) {
          setItems(liveItems);
        }
      } catch (e) {
        console.warn("Failed to fetch live gallery items:", e);
      }
    };
    fetchRemote();
  }, []);


  const filteredItems = useMemo(() => {
    if (selectedCat === "All") return items;
    return items.filter((it) => it.category === selectedCat);
  }, [items, selectedCat]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! + 1) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! - 1 + filteredItems.length) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  const currentItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="bg-black text-white min-h-screen">
      <PageBanner
        title="Our Gallery"
        subtitle="Moments, milestones, engineering sprints, and vibrant culture at okobiz"
      />

      <section className="py-16 md:py-24 bg-[#111215]" ref={gridTopRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-bold text-[#0077FF] text-xs sm:text-sm uppercase tracking-widest inline-block mb-3">
              - LIFE AT OKOBIZ -
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Moments Behind The Code
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Explore snapshots of our engineering workshops, annual summits, creative design sessions, and collaborative milestones.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex justify-center flex-wrap gap-2.5 mb-14">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-200 ${
                  selectedCat === cat
                    ? "bg-[#3368B2] text-white shadow-lg shadow-blue-900/40"
                    : "bg-[#181A1F] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid with sharpened border radius on photo cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {paginatedItems.map((item, idx) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + idx;

              return (
                <div
                  key={item._id || globalIndex}
                  onClick={() => openLightbox(globalIndex)}
                  className="group relative bg-[#16171B] border border-gray-800/90 rounded-md overflow-hidden cursor-pointer shadow-xl hover:border-[#3368B2] hover:shadow-[0_10px_35px_rgba(51,104,178,0.3)] transition-all duration-300"
                >
                  {/* Image Box with sharpened corners */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-black rounded-md">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />

                    {/* Top Category Badge - Only badge on the top is displayed, sharpened */}
                    <div className="absolute top-3.5 left-3.5 pointer-events-none z-10">
                      <span className="px-3 py-1 rounded-sm bg-[#3368B2] text-white text-[11px] font-bold shadow-lg shadow-black/50 tracking-wide">
                        {item.category}
                      </span>
                    </div>

                    {/* Hover Zoom / Expand Indicator */}
                    <div className="absolute top-3.5 right-3.5 w-9 h-9 rounded-sm bg-black/60 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg z-10">
                      <Maximize2 size={16} />
                    </div>

                    {/* Subtle hover overlay to enhance interaction feel without blocking image */}
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20 bg-[#16171B] rounded-md border border-gray-800">
              <Camera size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No photos in this category yet.</p>
            </div>
          )}

          {/* 12 images per page Pagination Bar */}
          {totalPages > 1 && (
            <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-400">
                Showing <span className="text-white font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span>–<span className="text-white font-semibold">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of <span className="text-white font-semibold">{filteredItems.length}</span> photos (12 per page)
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md bg-[#181A1D] border border-gray-800 text-gray-400 hover:text-white hover:border-[#3368B2] disabled:opacity-30 disabled:pointer-events-none transition"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-md text-xs font-bold transition ${
                      currentPage === page
                        ? "bg-[#3368B2] text-white shadow-lg shadow-blue-900/40"
                        : "bg-[#181A1D] border border-gray-800 text-gray-300 hover:border-gray-600 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md bg-[#181A1D] border border-gray-800 text-gray-400 hover:text-white hover:border-[#3368B2] disabled:opacity-30 disabled:pointer-events-none transition"
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Fullscreen Modal */}
      {lightboxIndex !== null && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6 select-none">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 sm:top-6 sm:right-8 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close Lightbox"
          >
            <X size={24} />
          </button>

          {/* Left Arrow Button */}
          {filteredItems.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-sm transition-all hover:scale-110"
              aria-label="Previous Photo"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Right Arrow Button */}
          {filteredItems.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-sm transition-all hover:scale-110"
              aria-label="Next Photo"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Center Image Container */}
          <div
            className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[70vh] w-auto overflow-hidden rounded-md border border-gray-800 shadow-2xl bg-black">
              <img
                src={currentItem.imageUrl}
                alt={currentItem.title}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Lightbox Caption Bar */}
            <div className="w-full text-center mt-4 px-4 max-w-2xl">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-sm text-[11px] font-bold bg-[#3368B2] text-white">
                  {currentItem.category}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {lightboxIndex + 1} of {filteredItems.length}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                {currentItem.title}
              </h3>
              {currentItem.description && (
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {currentItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <TalkCta />
    </div>
  );
}
