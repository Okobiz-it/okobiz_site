"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Linkedin, Instagram, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-gray-800 text-white bg-black">
      {/* Background Image Container with dark overlay strictly for top content */}
      <div
        style={{ backgroundImage: "url('/assets/footer-bg-bqynHdjN.webp')" }}
        className="bg-cover bg-no-repeat bg-bottom relative"
      >
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Column 1: Brand & Contact Info */}
            <div className="space-y-6">
              <Link href="/" className="inline-block">
                <img
                  src="/assets/okobiz-logo-C_Tt48xb.png"
                  alt="okobiz logo"
                  className="h-10 md:h-12 w-auto object-contain"
                />
              </Link>

              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#3368B2] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Email: </span>
                    <a href="mailto:info@okobiz.com" className="hover:text-[#0167D6] transition-colors">
                      info@okobiz.com
                    </a>
                    {", "}
                    <a href="mailto:info.okobiz@gmail.com" className="hover:text-[#0167D6] transition-colors">
                      info.okobiz@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#3368B2] shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Phone: </span>
                    <a href="tel:+8801973590937" className="hover:text-[#0167D6] transition-colors">
                      +880 1973-590937
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#3368B2] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Address: </span>
                    <span>Mirpur, Dhaka 1216, Bangladesh</span>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://facebook.com/okobiz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 transition-transform"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/company/okobiz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#0A66C2] flex items-center justify-center text-white hover:scale-110 transition-transform"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/8801973590937"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:scale-110 transition-transform"
                  aria-label="WhatsApp"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com/okobiz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] flex items-center justify-center text-white hover:scale-110 transition-transform"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-white text-base font-bold uppercase tracking-wider mb-6 pb-2 border-b border-gray-800">
                Important Links
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-[#3368B2] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/amazing_team" className="hover:text-[#3368B2] transition-colors">
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="hover:text-[#3368B2] transition-colors">
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-[#3368B2] transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/ourclients" className="hover:text-[#3368B2] transition-colors">
                    Our Clients
                  </Link>
                </li>
                <li>
                  <Link href="/career" className="hover:text-[#3368B2] transition-colors">
                    Career
                  </Link>
                </li>
                <li>
                  <a
                    href="https://wa.me/8801973590937"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#3368B2] transition-colors"
                  >
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Services Links */}
            <div>
              <h3 className="text-white text-base font-bold uppercase tracking-wider mb-6 pb-2 border-b border-gray-800">
                Services
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link
                    href="/website-app-development-service"
                    className="hover:text-[#3368B2] transition-colors"
                  >
                    Website Design
                  </Link>
                </li>
                <li>
                  <Link
                    href="/website-app-development-service"
                    className="hover:text-[#3368B2] transition-colors"
                  >
                    Apps Design & Development
                  </Link>
                </li>
                <li>
                  <Link
                    href="/website-app-development-service"
                    className="hover:text-[#3368B2] transition-colors"
                  >
                    Ecommerce Solutions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/graphics-solution-service"
                    className="hover:text-[#3368B2] transition-colors"
                  >
                    Graphics Solutions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/digital-marketing-service"
                    className="hover:text-[#3368B2] transition-colors"
                  >
                    Digital Marketing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Quick Contact */}
            <div>
              <h3 className="text-white text-base font-bold uppercase tracking-wider mb-6 pb-2 border-b border-gray-800">
                Contact Us
              </h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                We provide excellent website and app development, digital marketing, and graphic motion solutions.
              </p>
              <Link
                href="/contact-us"
                className="inline-block px-6 py-3 bg-[#3368B2] hover:bg-[#0167D6] text-white text-sm font-semibold rounded-md transition-all shadow-md"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Blue Footer Copyright Bar - Completely outside any blur overlay, crystal clear, vibrant */}
      <div className="relative z-20 bg-[#3368B2] py-4 border-t border-blue-400/30">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20 text-center">
          <p className="text-sm sm:text-base text-white font-semibold tracking-wide drop-shadow-sm">
            © Copyright 2026, All Rights Reserved by okobiz
          </p>
        </div>
      </div>
    </footer>
  );
}
