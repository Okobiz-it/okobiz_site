"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageSquare, Phone } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { title: "Home", link: "/" },
  { title: "Services", link: "/services" },
  { title: "Portfolio", link: "/portfolio" },
  { title: "Products", link: "/products" },
  { title: "Blogs", link: "/blog" },
  { title: "Gallery", link: "/gallery" },
  { title: "Amazing Team", link: "/amazing_team" },
  { title: "Contact Us", link: "/contact-us" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLinkActive = (link: string) => {
    if (!pathname) return false;
    if (link === "/") {
      return pathname === "/";
    }
    if (link === "/products") {
      return pathname === "/products" || pathname.startsWith("/products/") || pathname === "/demo" || pathname.startsWith("/demo/");
    }
    if (link === "/portfolio") {
      return pathname === "/portfolio" || pathname.startsWith("/portfolio/");
    }
    if (link === "/services") {
      return pathname === "/services" || pathname.startsWith("/services/") || pathname.endsWith("-service");
    }
    if (link === "/blog") {
      return pathname === "/blog" || pathname.startsWith("/blog/") || pathname.startsWith("/blogs");
    }
    return pathname === link || pathname.startsWith(`${link}/`);
  };

  return (
    <header className="relative w-full z-50">
      <div
        className={`fixed top-0 left-0 w-full transition-all duration-300 z-50 bg-white dark:bg-black/95 ${
          isScrolled
            ? "shadow-sm border-b border-slate-200 dark:border-gray-800/80 py-2 dark:shadow-custom-blue"
            : "border-b border-slate-200/60 dark:border-transparent py-3.5"
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/assets/okobiz-logo-C_Tt48xb.png"
              alt="okobiz logo"
              className="h-9 md:h-12 w-auto object-contain transition-transform hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {NAV_LINKS.map((item) => {
              const isActive = isLinkActive(item.link);
              return (
                <Link
                  key={item.title}
                  href={item.link}
                  className={`text-sm xl:text-base tracking-wide transition-all duration-200 py-1 ${
                    isActive
                      ? "text-[#0167D6] font-bold uppercase border border-[#0167D6] px-4 rounded-[4px] bg-blue-50 dark:bg-[#3368B2]/10"
                      : "dark:text-gray-200 text-slate-700 hover:text-[#0167D6] font-medium"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Call / WhatsApp Button & Theme Toggle */}
          <div className="hidden sm:flex items-center space-x-3">
            <a
              href="tel:+8801973590937"
              className="flex items-center gap-x-3 dark:text-white text-slate-800 text-sm md:text-base group"
            >
              <div className="w-10 h-10 rounded-full bg-[#3368B2] flex items-center justify-center text-white group-hover:bg-[#0167D6] transition-colors shadow-sm">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs dark:text-gray-300 text-slate-500">Need help?</p>
                <p className="font-bold tracking-wide dark:text-white text-slate-900 group-hover:text-[#0167D6] transition-colors">
                  01973-590937
                </p>
              </div>
            </a>

            {/* Theme Toggle Button */}
            <div className="pl-2 border-l dark:border-gray-800 border-slate-200">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Right Controls: Theme Toggle & Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="dark:text-white text-slate-800 p-2 hover:text-[#0167D6] focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed top-0 right-0 h-full w-[280px] sm:w-[340px] dark:bg-[#141416] bg-white border-l dark:border-gray-800 border-slate-200 p-6 flex flex-col justify-between z-50 shadow-2xl">
            <div>
              <div className="flex justify-between items-center pb-6 border-b dark:border-gray-800 border-slate-200">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <img
                    src="/assets/okobiz-logo-C_Tt48xb.png"
                    alt="okobiz logo"
                    className="h-8 w-auto"
                  />
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="dark:text-gray-400 text-slate-500 hover:text-[#0167D6]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <ul className="flex flex-col space-y-4 mt-8">
                {NAV_LINKS.map((item) => {
                  const isActive = isLinkActive(item.link);
                  return (
                    <li key={item.title}>
                      <Link
                        href={item.link}
                        onClick={() => setIsOpen(false)}
                        className={`block text-base transition-colors ${
                          isActive
                            ? "text-[#0167D6] font-bold"
                            : "dark:text-gray-300 text-slate-700 hover:text-[#0167D6]"
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="pt-6 border-t dark:border-gray-800 border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold dark:text-gray-400 text-slate-600">Appearance</span>
                <ThemeToggle showLabel />
              </div>

              <a
                href="tel:+8801973590937"
                className="flex items-center gap-3 dark:text-white text-slate-800 pt-2"              >
                <div className="w-9 h-9 rounded-full bg-[#3368B2] flex items-center justify-center text-white">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs dark:text-gray-400 text-slate-500">Need help?</p>
                  <p className="text-sm font-bold dark:text-white text-slate-900">01973-590937</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
