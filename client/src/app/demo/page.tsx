"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UniversalLoader from "@/components/UniversalLoader";

export default function DemoRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/products");
  }, [router]);

  return <UniversalLoader fullScreen size="lg" />;
}
