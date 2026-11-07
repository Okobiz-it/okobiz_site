"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0C0E] transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative z-10 w-64 h-full">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0B0C0E] transition-colors duration-200">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
