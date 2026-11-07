export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDataStore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import ClientPartner from "@/models/ClientPartner";
import ThemeItem from "@/models/ThemeItem";
import BlogItem from "@/models/BlogItem";
import TeamMember from "@/models/TeamMember";
import MediaAsset from "@/models/MediaAsset";
import Inquiry from "@/models/Inquiry";

import ProductItem from "@/models/ProductItem";

export async function GET() {
  try {
    const store = getDataStore();
    const stats = {
      clients: store.clients.length,
      themes: store.themes.length,
      products: store.products?.length || 0,
      blogs: store.blogs.length,
      team: store.team.length,
      media: store.media.length,
      inquiries: store.inquiries.length,
      newInquiries: store.inquiries.filter(i => i.status === "new").length,
      heroSlides: store.heroSlides.length,
      services: store.services.length
    };

    const db = await connectDB();
    if (db) {
      try {
        const [c, t, p, b, tm, m, inq] = await Promise.all([
          ClientPartner.countDocuments(),
          ThemeItem.countDocuments(),
          ProductItem.countDocuments(),
          BlogItem.countDocuments(),
          TeamMember.countDocuments(),
          MediaAsset.countDocuments(),
          Inquiry.countDocuments()
        ]);
        if (c > 0) stats.clients = c;
        if (t > 0) stats.themes = t;
        if (p > 0) stats.products = p;
        if (b > 0) stats.blogs = b;
        if (tm > 0) stats.team = tm;
        if (m > 0) stats.media = m;
        if (inq > 0) stats.inquiries = inq;
      } catch (e) {}
    }

    return NextResponse.json({ success: true, data: stats });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
