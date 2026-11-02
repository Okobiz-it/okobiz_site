import { redirect, notFound } from "next/navigation";
import { getServiceBySlug } from "@/lib/api";

export const dynamic = "force-dynamic";

interface DynamicSlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DynamicSlugPage({ params }: DynamicSlugPageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (service) {
    redirect(`/services/${service.slug}`);
  }

  notFound();
}
