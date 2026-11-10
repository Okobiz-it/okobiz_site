export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import ServiceItem from "@/models/ServiceItem";
import { createSlug } from "@/lib/slug";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const id = searchParams.get("id");

  try {
    const db = await connectDB();
    if (db) {
      // If querying single service
      if (slug) {
        const found = await ServiceItem.findOne({ slug });
        if (found) return NextResponse.json({ success: true, data: found });
      }
      if (id) {
        const found = await ServiceItem.findById(id);
        if (found) return NextResponse.json({ success: true, data: found });
      }

      const services = await ServiceItem.find().sort({ order: 1, _id: 1 });
      
      // If MongoDB has fewer services than default store or missing images, sync defaults
      const store = getDataStore();
      if (services.length < store.services.length || services.some(s => !s.image)) {
        for (const defaultSrv of store.services) {
          const exists = services.find(s => s.slug === defaultSrv.slug);
          if (!exists) {
            const toInsert = { ...defaultSrv, _id: "srv-" + defaultSrv.slug };
            await ServiceItem.create(toInsert).catch(() => {});
          } else if (!exists.image || !exists.bannerImage || !exists.whyChooseUs?.length || !exists.pricingPlans?.length) {
            await ServiceItem.findByIdAndUpdate(exists._id, {
              title: exists.title || defaultSrv.title,
              image: exists.image || defaultSrv.image,
              bannerImage: exists.bannerImage || defaultSrv.bannerImage,
              bannerSubtitle: exists.bannerSubtitle || defaultSrv.bannerSubtitle,
              shortDesc: exists.shortDesc || defaultSrv.shortDesc,
              fullDesc: exists.fullDesc || defaultSrv.fullDesc,
              whyChooseUs: (exists.whyChooseUs && exists.whyChooseUs.length > 0) ? exists.whyChooseUs : defaultSrv.whyChooseUs,
              techStack: (exists.techStack && exists.techStack.length > 0) ? exists.techStack : defaultSrv.techStack,
              pricingPlans: (exists.pricingPlans && exists.pricingPlans.length > 0) ? exists.pricingPlans : defaultSrv.pricingPlans,
              order: exists.order || defaultSrv.order,
            }).catch(() => {});
          }
        }
        const updated = await ServiceItem.find().sort({ order: 1, _id: 1 });
        return NextResponse.json({ success: true, data: updated });
      }

      if (services.length > 0) {
        return NextResponse.json({ success: true, data: services });
      }
    }
  } catch (err: any) {
    console.warn("MongoDB GET services error:", err.message);
  }

  const store = getDataStore();
  if (slug) {
    const item = (store.services || []).find(s => s.slug === slug);
    return NextResponse.json({ success: Boolean(item), data: item || null });
  }
  if (id) {
    const item = (store.services || []).find(s => s._id === id);
    return NextResponse.json({ success: Boolean(item), data: item || null });
  }

  return NextResponse.json({ success: true, data: store.services || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getDataStore();
    if (!store.services) store.services = [];

    const targetSlug = createSlug(body.slug || body.title || "service") || `service-${Date.now()}`;

    // Duplicate slug check in datastore
    const storeExists = (store.services || []).some(
      s => s.slug?.toLowerCase().trim() === targetSlug.toLowerCase().trim()
    );

    // Duplicate slug check in MongoDB
    const db = await connectDB();
    let dbExists = false;
    if (db) {
      try {
        const found = await ServiceItem.findOne({ slug: targetSlug });
        if (found) dbExists = true;
      } catch (dbErr: any) {
        console.warn("MongoDB slug check warning:", dbErr.message);
      }
    }

    if (storeExists || dbExists) {
      return NextResponse.json(
        {
          success: false,
          message: `A service with the slug "${targetSlug}" already exists. Please choose a unique URL slug.`
        },
        { status: 400 }
      );
    }

    const formattedPricingPlans = Array.isArray(body.pricingPlans)
      ? body.pricingPlans.map((p: any) => ({
          name: p.name || "Standard Plan",
          price: Number(p.price) || 0,
          discountPrice: Number(p.discountPrice) || 0,
          period: p.period || "One-Time Setup",
          badge: p.badge || "",
          description: p.description || "",
          features: Array.isArray(p.features)
            ? p.features
            : (p.featuresText ? p.featuresText.split("\n").map((f: string) => f.trim()).filter(Boolean) : []),
          isPopular: Boolean(p.isPopular)
        }))
      : [];

    const newService = {
      _id: "srv-" + Date.now(),
      title: body.title || "New Service",
      slug: targetSlug,
      image: body.thumbnail || body.image || (Array.isArray(body.images) && body.images[0]) || "/assets/website-app-DOXr3sR7.webp",
      thumbnail: body.thumbnail || body.image || (Array.isArray(body.images) && body.images[0]) || "",
      mediaType: body.mediaType || (body.video ? "video" : "image"),
      images: Array.isArray(body.images) ? body.images : (body.image ? [body.image] : []),
      video: body.video || "",
      videoThumbnail: body.videoThumbnail || "",
      bannerImage: body.bannerImage || "",
      bannerSubtitle: body.bannerSubtitle || "",
      shortDesc: body.shortDesc || "",
      fullDesc: body.fullDesc || "",
      icon: body.icon || "Monitor",
      features: Array.isArray(body.features)
        ? body.features
        : (body.features ? body.features.split("\n").map((f: string) => f.trim()).filter(Boolean) : []),
      whyChooseUs: Array.isArray(body.whyChooseUs) ? body.whyChooseUs : [],
      techStack: Array.isArray(body.techStack)
        ? body.techStack
        : (body.techStack ? body.techStack.split(",").map((t: string) => t.trim()).filter(Boolean) : []),
      pricingPlans: formattedPricingPlans,
      order: Number(body.order) || store.services.length + 1
    };

    store.services.push(newService);
    saveDatastore(store);

    let finalDoc = newService;
    if (db) {
      try {
        const created = await ServiceItem.create(newService);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB ServiceItem create error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, data: finalDoc });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { _id, ...updates } = body;
    if (!_id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    if (updates.features && typeof updates.features === "string") {
      updates.features = updates.features.split("\n").map((f: string) => f.trim()).filter(Boolean);
    }
    if (updates.techStack && typeof updates.techStack === "string") {
      updates.techStack = updates.techStack.split(",").map((t: string) => t.trim()).filter(Boolean);
    }
    delete updates.priceRange;

    if (updates.pricingPlans && Array.isArray(updates.pricingPlans)) {
      updates.pricingPlans = updates.pricingPlans.map((p: any) => ({
        name: p.name || "Standard Plan",
        price: Number(p.price) || 0,
        discountPrice: Number(p.discountPrice) || 0,
        period: p.period || "One-Time Setup",
        badge: p.badge || "",
        description: p.description || "",
        features: Array.isArray(p.features)
          ? p.features
          : (p.featuresText ? p.featuresText.split("\n").map((f: string) => f.trim()).filter(Boolean) : []),
        isPopular: Boolean(p.isPopular)
      }));
    }

    if (updates.slug) {
      updates.slug = createSlug(updates.slug);

      // Check duplicate slug in datastore
      const store = getDataStore();
      const storeExists = (store.services || []).some(
        s => s.slug?.toLowerCase().trim() === updates.slug.toLowerCase().trim() && s._id !== _id
      );

      // Check duplicate slug in MongoDB
      const db = await connectDB();
      let dbExists = false;
      if (db) {
        try {
          const found = await ServiceItem.findOne({ slug: updates.slug, _id: { $ne: _id } });
          if (found) dbExists = true;
        } catch (dbErr: any) {
          console.warn("MongoDB slug check warning:", dbErr.message);
        }
      }

      if (storeExists || dbExists) {
        return NextResponse.json(
          {
            success: false,
            message: `A service with the slug "${updates.slug}" already exists. Please choose a unique URL slug.`
          },
          { status: 400 }
        );
      }
    }

    const store = getDataStore();
    if (!store.services) store.services = [];
    const idx = store.services.findIndex(s => s._id === _id);
    if (idx !== -1) {
      store.services[idx] = { ...store.services[idx], ...updates };
      saveDatastore(store);
    }

    let updatedDoc = { _id, ...updates };
    const db = await connectDB();
    if (db) {
      try {
        const res = await ServiceItem.findByIdAndUpdate(_id, updates, { new: true, upsert: true });
        if (res) updatedDoc = res.toObject ? res.toObject() : res;
      } catch (dbErr: any) {
        console.error("MongoDB ServiceItem update error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, data: updatedDoc });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    const store = getDataStore();
    store.services = (store.services || []).filter(s => s._id !== id);
    saveDatastore(store);

    const db = await connectDB();
    if (db) {
      try {
        await ServiceItem.findByIdAndDelete(id);
      } catch (dbErr: any) {
        console.error("MongoDB ServiceItem delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
