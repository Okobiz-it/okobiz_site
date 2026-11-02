"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0C0E] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#3368B2] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-medium">Loading okobiz Admin...</p>
      </div>
    </div>
  );
}
