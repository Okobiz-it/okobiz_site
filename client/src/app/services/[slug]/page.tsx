import React from "react";
import type { Metadata } from "next";
import ServiceDetailView from "@/components/ServiceDetailView";
import { getServiceBySlug, getServices } from "@/lib/api";

export const dynamic = "force-dynamic";

interface ServiceSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServiceSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Details - okobiz",
      description: "Explore our professional digital engineering and creative services."
    };
  }

  return {
    title: `${service.title} - okobiz`,
    description: service.shortDesc || "Explore our professional digital engineering and creative services.",
    keywords: service.features || ["services", "okobiz", "web development"]
  };
}

export default async function DynamicServicePage({ params }: ServiceSlugPageProps) {
  const { slug } = await params;
  const initialService = await getServiceBySlug(slug);

  return <ServiceDetailView slug={slug} initialService={initialService} />;
}
