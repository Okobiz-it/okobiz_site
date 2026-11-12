"use client";

import React from "react";
import { Phone, Send } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// OFFICIAL OKOBIZ WATERMARK (GLYPH WITH SMILE)
// ─────────────────────────────────────────────────────────────
export const OKOBIZ_WATERMARK_SRC =
  "data:image/png;base64,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";

export const OkobizWatermark = () => (
  <div
    className="quotation-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0"
    aria-hidden="true"
    style={{ zIndex: 0 }}
  >
    <div
      className="w-[58%] max-w-[460px] aspect-[399/360] flex items-center justify-center pointer-events-none select-none"
      style={{ opacity: 0.16 }}
    >
      <img
        src={OKOBIZ_WATERMARK_SRC}
        alt=""
        width={399}
        height={360}
        className="w-full h-full object-contain pointer-events-none select-none"
        style={{ opacity: 1 }}
      />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// OFFICIAL OKOBIZ HEADER BANNER (UNIFIED FULL-BLEED VECTOR SVG)
// ─────────────────────────────────────────────────────────────
export const OkobizHeaderBanner = () => (
  <div className="relative w-full select-none overflow-hidden shrink-0 m-0 p-0 mb-3 print:mb-3">
    <svg
      viewBox="0 0 723 86"
      className="w-full h-auto block select-none pointer-events-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Okobiz - Leading the Digital Revolution"
    >
      <defs>
        <clipPath id="okobiz-tri-clip-pad">
          <rect x="0" y="0" width="723" height="79" />
        </clipPath>
      </defs>

      {/* LEFT TRIANGLES */}
      <g clipPath="url(#okobiz-tri-clip-pad)">
        <polygon points="68,2 55,24 81,24" fill="#2f6db5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="94,2 81,24 107,24" fill="#7ba3d6" stroke="#fff" strokeWidth="0.5" />
        <polygon points="68,2 94,2 81,24" fill="#d3e0f2" stroke="#fff" strokeWidth="0.5" />
        <polygon points="29,24 16,46 42,46" fill="#a9c3e5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="55,24 42,46 68,46" fill="#4f86c8" stroke="#fff" strokeWidth="0.5" />
        <polygon points="81,24 68,46 94,46" fill="#2f6db5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="29,24 55,24 42,46" fill="#7ba3d6" stroke="#fff" strokeWidth="0.5" />
        <polygon points="55,24 81,24 68,46" fill="#d3e0f2" stroke="#fff" strokeWidth="0.5" />
        <polygon points="81,24 107,24 94,46" fill="#4f86c8" stroke="#fff" strokeWidth="0.5" />
        <polygon points="16,46 3,68 29,68" fill="#2f6db5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="42,46 29,68 55,68" fill="#7ba3d6" stroke="#fff" strokeWidth="0.5" />
        <polygon points="68,46 55,68 81,68" fill="#4f86c8" stroke="#fff" strokeWidth="0.5" />
        <polygon points="94,46 81,68 107,68" fill="#a9c3e5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="16,46 42,46 29,68" fill="#d3e0f2" stroke="#fff" strokeWidth="0.5" />
        <polygon points="42,46 68,46 55,68" fill="#2f6db5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="68,46 94,46 81,68" fill="#a9c3e5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="3,68 -10,90 16,90" fill="#7ba3d6" stroke="#fff" strokeWidth="0.5" />
        <polygon points="29,68 16,90 42,90" fill="#d3e0f2" stroke="#fff" strokeWidth="0.5" />
        <polygon points="55,68 42,90 68,90" fill="#4f86c8" stroke="#fff" strokeWidth="0.5" />
        <polygon points="3,68 29,68 16,90" fill="#2f6db5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="29,68 55,68 42,90" fill="#a9c3e5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="55,68 81,68 68,90" fill="#7ba3d6" stroke="#fff" strokeWidth="0.5" />
      </g>

      {/* RIGHT TRIANGLES (Mirrored horizontally) */}
      <g transform="translate(723,0) scale(-1,1)" clipPath="url(#okobiz-tri-clip-pad)">
        <polygon points="68,2 55,24 81,24" fill="#2f6db5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="94,2 81,24 107,24" fill="#7ba3d6" stroke="#fff" strokeWidth="0.5" />
        <polygon points="68,2 94,2 81,24" fill="#d3e0f2" stroke="#fff" strokeWidth="0.5" />
        <polygon points="29,24 16,46 42,46" fill="#a9c3e5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="55,24 42,46 68,46" fill="#4f86c8" stroke="#fff" strokeWidth="0.5" />
        <polygon points="81,24 68,46 94,46" fill="#2f6db5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="29,24 55,24 42,46" fill="#7ba3d6" stroke="#fff" strokeWidth="0.5" />
        <polygon points="55,24 81,24 68,46" fill="#d3e0f2" stroke="#fff" strokeWidth="0.5" />
        <polygon points="81,24 107,24 94,46" fill="#4f86c8" stroke="#fff" strokeWidth="0.5" />
        <polygon points="16,46 3,68 29,68" fill="#2f6db5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="42,46 29,68 55,68" fill="#7ba3d6" stroke="#fff" strokeWidth="0.5" />
        <polygon points="68,46 55,68 81,68" fill="#4f86c8" stroke="#fff" strokeWidth="0.5" />
        <polygon points="94,46 81,68 107,68" fill="#a9c3e5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="16,46 42,46 29,68" fill="#d3e0f2" stroke="#fff" strokeWidth="0.5" />
        <polygon points="42,46 68,46 55,68" fill="#2f6db5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="68,46 94,46 81,68" fill="#a9c3e5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="3,68 -10,90 16,90" fill="#7ba3d6" stroke="#fff" strokeWidth="0.5" />
        <polygon points="29,68 16,90 42,90" fill="#d3e0f2" stroke="#fff" strokeWidth="0.5" />
        <polygon points="55,68 42,90 68,90" fill="#4f86c8" stroke="#fff" strokeWidth="0.5" />
        <polygon points="3,68 29,68 16,90" fill="#2f6db5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="29,68 55,68 42,90" fill="#a9c3e5" stroke="#fff" strokeWidth="0.5" />
        <polygon points="55,68 81,68 68,90" fill="#7ba3d6" stroke="#fff" strokeWidth="0.5" />
      </g>

      {/* BLUE SLOGAN BAR */}
      <polygon points="78,60 646,60 652,77 70,77" fill="#1E65B8" />
      <text
        x="361.5"
        y="72"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="bold"
        fill="#ffffff"
        letterSpacing="0.22em"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        LEADING THE DIGITAL REVOLUTION
      </text>

      {/* BOTTOM THIN BLUE LINE */}
      <rect x="0" y="79" width="723" height="2.5" fill="#1E65B8" />

      {/* CENTER OKOBIZ LOGO */}
      <g transform="translate(276.5, 12)">
        <path d="M 18,14 C 24.6,14 30,19.4 30,26 C 30,32.6 24.6,38 18,38 C 11.4,38 6,32.6 6,26 C 6,19.4 11.4,14 18,14 Z M 18,20 C 14.7,20 12,22.7 12,26 C 12,29.3 14.7,32 18,32 C 21.3,32 24,29.3 24,26 C 24,22.7 21.3,20 18,20 Z" fill="#1E65B8" fillRule="evenodd" />
        <path d="M 37,5 L 43.5,5 L 43.5,23.5 L 54.5,14 L 62.5,14 L 49.5,25 L 63.5,38 L 55,38 L 43.5,27.5 L 43.5,38 L 37,38 Z" fill="#1E65B8" />
        <path d="M 77,14 L 67.5,14 C 66.5,14.5 67,16 69,17.2 C 67.5,19.5 66,22.6 66,26 C 66,32.6 71,38 77,38 C 83.6,38 88.5,32.6 88.5,26 C 88.5,19.4 83.6,14 77,14 Z M 77,20 C 73.7,20 71,22.7 71,26 C 71,29.3 73.7,32 77,32 C 80.3,32 83,29.3 83,26 C 83,22.7 80.3,20 77,20 Z" fill="#1E65B8" fillRule="evenodd" />
        <path d="M 73.5,26 C 74.5,29.8 79.5,29.8 80.5,26" stroke="#1E65B8" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M 96,5 L 102.5,5 L 102.5,16.5 C 104.2,14.8 106.8,14 110,14 C 116.6,14 122,19.4 122,26 C 122,32.6 116.6,38 110,38 C 106.8,38 104.2,37.2 102.5,35.5 L 102.5,38 L 96,38 Z M 109,20 C 105.7,20 103,22.7 103,26 C 103,29.3 105.7,32 109,32 C 112.3,32 115,29.3 115,26 C 115,22.7 112.3,20 109,20 Z" fill="#1E65B8" fillRule="evenodd" />
        <rect x="128.5" y="14" width="6.5" height="24" fill="#1E65B8" />
        <circle cx="131.75" cy="8" r="3.4" fill="#1E65B8" />
        <path d="M 142,14 L 161,14 L 161,19.5 L 149.5,32.5 L 161,32.5 L 161,38 L 141.5,38 L 141.5,33 L 153,19.5 L 142,19.5 Z" fill="#1E65B8" />
      </g>
    </svg>
  </div>
);

// ─────────────────────────────────────────────────────────────
// OFFICIAL OKOBIZ FOOTER BANNER (PURE WHITE CONTACT INFO)
// ─────────────────────────────────────────────────────────────
export const OkobizFooterBanner = ({
  phone = "+880 1973 590937",
  email = "info@okobiz.com",
  web = "www.okobiz.com",
}: {
  phone?: string;
  email?: string;
  web?: string;
}) => (
  <div className="quotation-footer w-full mt-auto select-none shrink-0 overflow-hidden m-0 p-0">
    {/* Blue Bar */}
    <div
      className="bg-[#1E65B8] text-white py-1.5 px-[12mm] print:px-[12mm] flex items-center justify-between text-[9.8px] print:text-[9.8px] font-semibold tracking-wide text-white-always w-full"
      style={{ backgroundColor: "#1E65B8", color: "#ffffff" }}
    >
      <div className="flex items-center gap-1.5 text-white-always" style={{ color: "#ffffff" }}>
        <Phone
          className="w-2.5 h-2.5 text-white fill-white stroke-none shrink-0"
          style={{ fill: "#ffffff", color: "#ffffff" }}
        />
        <span className="text-white-always !text-white font-medium" style={{ color: "#ffffff" }}>
          {phone}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-white-always" style={{ color: "#ffffff" }}>
        <Send
          className="w-2.5 h-2.5 text-white fill-white stroke-none shrink-0"
          style={{ fill: "#ffffff", color: "#ffffff" }}
        />
        <span className="text-white-always !text-white font-medium" style={{ color: "#ffffff" }}>
          {email}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-white-always" style={{ color: "#ffffff" }}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="globe-icon w-3 h-3 text-white shrink-0"
          style={{ fill: "none" }}
          aria-hidden="true"
        >
          <circle
            cx="11"
            cy="11"
            r="8"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
          />
          <path
            d="M3 11h16"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="globe-line"
          />
          <path
            d="M11 3a11.5 11.5 0 0 0 0 16 11.5 11.5 0 0 0 0-16"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
            className="globe-line"
          />
          <path
            d="M14 12.5l5.5 2.2-2.1 1 1.8 2.8-1.4 0.9-1.8-2.8-1.8 1.4z"
            fill="#ffffff"
            stroke="#1E65B8"
            strokeWidth="0.8"
            strokeLinejoin="round"
            className="globe-cursor"
          />
        </svg>
        <span className="text-white-always !text-white font-medium" style={{ color: "#ffffff" }}>
          {web}
        </span>
      </div>
    </div>

    {/* Color Palette Strip */}
    <div className="grid grid-cols-8 h-2 w-full">
      <div className="bg-[#E8EEFA]" />
      <div className="bg-[#D4E3F7]" />
      <div className="bg-[#B9D4F4]" />
      <div className="bg-[#93BFF0]" />
      <div className="bg-[#69A5EB]" />
      <div className="bg-[#458BE4]" />
      <div className="bg-[#2A73D4]" />
      <div className="bg-[#1E65B8]" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// REUSABLE OKOBIZ LETTERHEAD PAD CONTAINER
// Use this component to wrap ANY document (Bills, Invoices,
// Proposals, Agreements, Receipts, Quotations, Official Notices)
// ─────────────────────────────────────────────────────────────
export interface OkobizLetterheadPageProps {
  children: React.ReactNode;
  refNo?: string;
  date?: string;
  showWatermark?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  phone?: string;
  email?: string;
  web?: string;
  className?: string;
}

export const OkobizLetterheadPage: React.FC<OkobizLetterheadPageProps> = ({
  children,
  refNo,
  date,
  showWatermark = true,
  showHeader = true,
  showFooter = true,
  phone = "+880 1973 590937",
  email = "info@okobiz.com",
  web = "www.okobiz.com",
  className = "",
}) => {
  return (
    <section
      className={`quotation-page relative bg-white border border-zinc-200 print:border-none p-0 mb-8 print:mb-0 shadow-sm print:shadow-none w-[210mm] max-w-[210mm] print:w-full print:max-w-full print:m-0 print:mx-0 flex flex-col justify-between overflow-hidden rounded-none ${className}`}
    >
      {showWatermark && <OkobizWatermark />}

      {showHeader && <OkobizHeaderBanner />}

      <div className="quotation-page-body flex-1 flex flex-col px-[12mm] pb-[8px] print:px-[12mm] print:pb-[8px] relative z-10 bg-transparent">
        {(date || refNo) && (
          <div className="flex justify-between items-start text-[13px] font-semibold mb-3">
            <div>{date || ""}</div>
            {refNo && (
              <div className="text-right">
                <span>Ref No. </span>
                <span className="font-bold text-[#1E65B8]">{refNo}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 flex flex-col bg-transparent">{children}</div>
      </div>

      {showFooter && <OkobizFooterBanner phone={phone} email={email} web={web} />}
    </section>
  );
};

