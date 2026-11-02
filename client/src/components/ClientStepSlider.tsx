"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getClients } from "@/lib/api";
import { ClientPartner } from "@/data/mockData";

export default function ClientStepSlider() {
  const [clients, setClients] = useState<ClientPartner[]>([]);

  useEffect(() => {
    getClients().then((data) => {
      if (data && data.length > 0) setClients(data);
    });
  }, []);

  // Duplicate clients array to enable seamless infinite scroll
  const duplicatedClients = [...clients, ...clients];

  return (
    <div className="relative w-full max-w-6xl mx-auto overflow-hidden py-6 select-none group">
      {/* Subtle edge fade overlays for premium look */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-20 pointer-events-none bg-gradient-to-r from-[#131417] to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-20 pointer-events-none bg-gradient-to-l from-[#131417] to-transparent" />

      {/* Marquee track: glides smoothly, freezes immediately on hover */}
      <div className="flex w-max items-center animate-client-track group-hover:[animation-play-state:paused]">
        {duplicatedClients.map((client, idx) => (
          <div
            key={`${client.name}-${idx}`}
            className="px-3 sm:px-4 shrink-0 flex items-center justify-center py-4"
          >
            <Link
              href="/ourclients"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-[136px] lg:h-[136px] rounded-full bg-white flex items-center justify-center p-3 sm:p-4 md:p-5 shadow-[0_0_24px_rgba(51,104,178,0.7)] border-2 border-[#3368B2]/50 hover:border-[#3368B2] hover:shadow-[0_0_45px_rgba(51,104,178,1)] hover:scale-110 transition-all duration-300 ease-out cursor-pointer group/item"
              title={`${client.name} - View All Clients`}
            >
              <img
                src={client.image}
                alt={client.name}
                className="max-h-10 sm:max-h-12 md:max-h-14 lg:max-h-16 max-w-[80%] w-auto object-contain transition-transform duration-300 group-hover/item:scale-105"
              />
            </Link>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes clientTrack {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-client-track {
          animation: clientTrack 35s linear infinite;
        }
      `}</style>
    </div>
  );
}
