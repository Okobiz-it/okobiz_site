"use client";

import React, { useState, useEffect } from "react";
import PageBanner from "@/components/PageBanner";
import TalkCta from "@/components/TalkCta";
import SectionLoader from "@/components/SectionLoader";
import DataLoadError from "@/components/DataLoadError";
import { getClients } from "@/lib/api";
import { ClientPartner } from "@/data/mockData";

export default function OurClientsPage() {
  const [clients, setClients] = useState<ClientPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await getClients();
      if (Array.isArray(data)) {
        setClients(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.warn("Failed to fetch clients:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="bg-black text-white">
      <PageBanner
        title="Our Honorable Clients"
        subtitle="Global brands and forward-thinking enterprises that partner with okobiz"
      />

      <section className="py-20 bg-[#0E100F]">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span
              className="font-bold px-5 py-2 mb-3 inline-block text-[#0167D6] rounded-full text-xs uppercase tracking-wider"
              style={{ background: "rgba(1, 103, 214, 0.15)" }}
            >
              - Our Partners -
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-2 mb-4">
              People Who Trust Us
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              We collaborate with ambitious businesses to develop digital products and marketing strategies that drive measurable ROI.
            </p>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <SectionLoader size="md" />
              <p className="text-xs text-gray-400 mt-3 font-medium">Loading partner brands...</p>
            </div>
          ) : error ? (
            <DataLoadError
              title="Client Partners Couldn't Load"
              message="We were unable to connect to the server to fetch our verified partner companies. Please check your connection or try again."
              onRetry={fetchClients}
            />
          ) : clients.length === 0 ? (
            <div className="bg-[#131418] border border-gray-800 rounded-[4px] p-12 text-center text-gray-400 text-sm">
              No client partners available.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {clients.map((client, idx) => (
                <div
                  key={client._id || idx}
                  className="bg-white rounded-xl p-6 flex flex-col items-center justify-center h-36 hover:scale-105 transition-transform duration-200 shadow-xl group border border-gray-100"
                >
                  <img
                    src={client.image}
                    alt={client.name}
                    className="max-h-16 max-w-[140px] w-auto object-contain group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[11px] font-semibold text-gray-500 mt-2">
                    {client.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <TalkCta />
    </div>
  );
}
