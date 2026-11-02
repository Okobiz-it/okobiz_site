"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/products");
  }, [router]);

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#3368B2] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-400">Redirecting to Products & SaaS Solutions...</p>
      </div>
    </div>
  );
}
