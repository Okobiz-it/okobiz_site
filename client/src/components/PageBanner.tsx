import React from "react";

interface PageBannerProps {
  title: string;
  className?: string;
  subtitle?: string;
}

export default function PageBanner({ title, className = "", subtitle }: PageBannerProps) {
  return (
    <section
      style={{ backgroundImage: "url('/assets/sub-banner-DifPcO04.webp')" }}
      className={`bg-cover bg-no-repeat bg-bottom relative h-48 sm:h-56 md:h-64 lg:h-80 flex items-center justify-center ${className}`}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px]" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider uppercase text-white drop-shadow-md">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
