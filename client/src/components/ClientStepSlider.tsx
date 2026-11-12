"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getClients } from "@/lib/api";
import { ClientPartner } from "@/data/mockData";

export default function ClientStepSlider() {
  const [items, setItems] = useState<ClientPartner[]>([]);

  const [itemsPerView, setItemsPerView] = useState<number>(5);
  const [translateOffset, setTranslateOffset] = useState<number>(0);
  const [transitionEnabled, setTransitionEnabled] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isBusyRef = useRef<boolean>(false);
  const wheelLockRef = useRef<boolean>(false);

  // Responsive calculation: 5 for lg (>=1024px), 3 for md (>=640px), 2 for mobile (<640px)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setItemsPerView(5);
      } else if (width >= 640) {
        setItemsPerView(3);
      } else {
        setItemsPerView(2);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch live clients from API / database
  useEffect(() => {
    getClients().then((data) => {
      if (data && data.length >= 5) {
        const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
        const buffer = sorted.length < 10 ? [...sorted, ...sorted] : sorted;
        setItems(buffer);
      }
    });
  }, []);

  const shiftPercent = 100 / itemsPerView;

  // Slide forward by 1 item: [1,2,3,4,5] -> [2,3,4,5,6] -> [3,4,5,6,7]
  const slideNext = useCallback(() => {
    if (isBusyRef.current) return;
    isBusyRef.current = true;

    setTransitionEnabled(true);
    setTranslateOffset(-shiftPercent);
  }, [shiftPercent]);

  // Slide backward by 1 item
  const slidePrev = useCallback(() => {
    if (isBusyRef.current) return;
    isBusyRef.current = true;

    // 1. Move last element to front
    setItems((prev) => [prev[prev.length - 1], ...prev.slice(0, -1)]);
    // 2. Instantly jump track to -shiftPercent without animation
    setTransitionEnabled(false);
    setTranslateOffset(-shiftPercent);

    // 3. Next frame: smoothly glide to 0
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
        setTranslateOffset(0);
      });
    });
  }, [shiftPercent]);

  // When animation finishes: rotate array and reset offset to 0 instantly
  const handleTransitionEnd = useCallback(() => {
    if (translateOffset !== 0) {
      // Rotate array: move first element to the end of array
      setItems((prev) => [...prev.slice(1), prev[0]]);
      // Reset translation back to 0 without transition
      setTransitionEnabled(false);
      setTranslateOffset(0);
    }
    isBusyRef.current = false;
  }, [translateOffset]);

  // 3-second hold timer: holds for 3 seconds, then advances 1 logo at a time infinitely
  useEffect(() => {
    if (isPaused) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      slideNext();
    }, 3000);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPaused, slideNext]);

  // Wheel interaction: scroll moves logos 1 at a time smoothly
  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 15) return;

    if (wheelLockRef.current) return;
    wheelLockRef.current = true;
    setTimeout(() => {
      wheelLockRef.current = false;
    }, 350);

    if (delta > 0) {
      slideNext();
    } else {
      slidePrev();
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full max-w-6xl mx-auto overflow-hidden py-8 select-none group"
    >
      {/* Sliding Track: moves 1 logo at a time, eternal circular ring buffer that never runs out */}
      <div
        onTransitionEnd={handleTransitionEnd}
        className="flex items-center w-full"
        style={{
          transform: `translate3d(${translateOffset}%, 0, 0)`,
          transition: transitionEnabled
            ? "transform 650ms cubic-bezier(0.25, 1, 0.5, 1)"
            : "none",
        }}
      >
        {items.map((client, idx) => (
          <div
            key={`${client.name}-${idx}`}
            style={{ width: `${shiftPercent}%` }}
            className="shrink-0 flex items-center justify-center py-4 px-2 sm:px-3"
          >
            <Link
              href="/ourclients"
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-[144px] lg:h-[144px] rounded-full bg-white flex items-center justify-center p-3 sm:p-4 shadow-[0_0_28px_rgba(51,104,178,0.75)] border-2 border-[#3368B2]/60 hover:border-[#38bdf8] hover:shadow-[0_0_50px_rgba(56,189,248,0.95)] hover:scale-110 transition-all duration-300 ease-out cursor-pointer group/circle"
              title={`${client.name} - View All Clients`}
            >
              <img
                src={client.image}
                alt={client.name}
                className="max-h-[72%] max-w-[82%] w-auto h-auto object-contain transition-transform duration-300 group-hover/circle:scale-105"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
