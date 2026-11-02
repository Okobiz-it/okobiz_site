"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/8801973590937"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-sm font-semibold">
        Chat with us
      </span>
    </a>
  );
}
