import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center bg-black text-white px-4 py-20">
      <div className="flex flex-col items-center justify-center text-center max-w-lg">
        <img
          src="/assets/404error-DYbHXRds.webp"
          alt="404 Error"
          className="w-80 sm:w-96 mb-8 drop-shadow-2xl"
        />

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase text-white mb-4">
          Page Not Found!
        </h1>

        <p className="text-base sm:text-lg text-gray-400 mb-8 leading-relaxed">
          Sorry we can&apos;t find that page! The link you clicked may be broken or the page may have been removed.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#3368B2] hover:bg-[#0167D6] text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
