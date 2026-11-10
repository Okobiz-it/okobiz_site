"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPrintPage = pathname?.includes("/print");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Restore user's collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("okobiz_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch (e) {
      // Graceful fallback if localStorage is disabled in browser
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("okobiz_sidebar_collapsed", String(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B0C0E] transition-colors duration-200 print:h-auto print:overflow-visible print:bg-white print:block">
      {/* Desktop Sidebar (Collapsible) */}
      <div
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out no-print print:hidden ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print print:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative z-10 w-64 h-full">
            <Sidebar onClose={() => setMobileMenuOpen(false)} isCollapsed={false} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:h-auto print:block">
        <div className="no-print print:hidden">
          <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </div>
        <main
          className={`flex-1 overflow-y-auto ${
            isPrintPage ? "p-0" : "p-4 sm:p-6 lg:p-8 2xl:px-10"
          } bg-slate-50 dark:bg-[#0B0C0E] transition-colors duration-200 print:overflow-visible print:h-auto print:p-0 print:m-0 print:bg-white print:block`}
        >
          <div className="w-full print:w-full print:p-0 print:m-0">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
