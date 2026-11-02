import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import ProductItem from "@/models/ProductItem";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { createSlug } from "@/lib/slug";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const db = await connectDB();
    if (db) {
      if (id) {
        const product = await ProductItem.findOne({
          $or: [{ _id: id }, { slug: id.toLowerCase() }]
        });
        if (product) {
          const obj = product.toObject ? product.toObject() : product;
          if (!obj.slug) obj.slug = obj._id;
          return NextResponse.json({ success: true, data: obj });
        }
      } else {
        let products = await ProductItem.find().sort({ order: 1, createdAt: -1 });
        if (!products || products.length === 0) {
          // Auto-seed default products into MongoDB
          const store = getDataStore();
          if (store.products && store.products.length > 0) {
            try {
              await ProductItem.insertMany(store.products);
              products = await ProductItem.find().sort({ order: 1, createdAt: -1 });
            } catch (seedErr: any) {
              console.warn("MongoDB auto-seed products notice:", seedErr.message);
            }
          }
        }
        if (products && products.length > 0) {
          // Backfill any products that have missing or empty slug
          for (const p of products) {
            if (!p.slug) {
              try {
                await ProductItem.updateOne({ _id: p._id }, { $set: { slug: p._id } });
              } catch (_) {}
            }
          }
          const mapped = products.map((p: any) => {
            const obj = p.toObject ? p.toObject() : p;
            if (!obj.slug) obj.slug = obj._id;
            return obj;
          });
          return NextResponse.json({ success: true, data: mapped });
        }
      }
    }
  } catch (err: any) {
    console.warn("MongoDB GET products notice:", err.message);
  }

  // Fallback to local dataStore
  const store = getDataStore();
  const products = (store.products || []).map((p: any) => ({
    ...p,
    slug: p.slug || p._id
  }));
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const match = products.find(
      (p) => p._id === id || (p.slug && p.slug.toLowerCase() === id.toLowerCase())
    );
    return NextResponse.json({ success: !!match, data: match || null });
  }

  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getDataStore();

    // Sanitize and validate slug using slugify
    let rawSlug = createSlug(body.slug || "");
    if (!rawSlug && body.title) {
      rawSlug = createSlug(body.title);
    }
    if (!rawSlug) {
      rawSlug = "prod-" + Date.now();
    }

    // Check duplicate slug in store: check both p.slug and p._id
    const isSlugDuplicateInStore = (store.products || []).some(
      (p) => (p.slug && p.slug.toLowerCase() === rawSlug.toLowerCase()) || (p._id && p._id.toLowerCase() === rawSlug.toLowerCase())
    );

    let isSlugDuplicateInDb = false;
    const db = await connectDB();
    if (db) {
      try {
        const existing = await ProductItem.findOne({
          $or: [{ slug: rawSlug.toLowerCase() }, { _id: rawSlug }]
        });
        if (existing) isSlugDuplicateInDb = true;
      } catch (dbErr: any) {
        console.warn("MongoDB check slug error:", dbErr.message);
      }
    }

    if (isSlugDuplicateInStore || isSlugDuplicateInDb) {
      return NextResponse.json(
        { success: false, message: `The slug "${rawSlug}" is already in use by another product. Please choose a unique slug.` },
        { status: 400 }
      );
    }

    const statusVal: "active" | "draft" = body.status === "draft" ? "draft" : "active";
    const mediaTypeVal: "image" | "video" = (body.mediaType === "video" || body.video) ? "video" : "image";

    const newProduct = {
      _id: "prod-" + Date.now(),
      title: body.title || "New Product",
      slug: rawSlug,
      tagline: body.tagline || "",
      category: body.category || "SaaS & ERP",
      mediaType: mediaTypeVal,
      thumbnail: body.thumbnail || body.images?.[0] || "/assets/web-2-DujjTO8C.webp",
      images: Array.isArray(body.images) ? body.images.filter(Boolean) : [],
      video: body.video || "",
      videoThumbnail: body.videoThumbnail || "",
      description: body.description || "",
      features: Array.isArray(body.features)
        ? body.features
        : (body.features ? body.features.split("\n").map((f: string) => f.trim()).filter(Boolean) : []),
      pricingPlans: Array.isArray(body.pricingPlans)
        ? body.pricingPlans.map((plan: any) => ({
            name: plan.name || "Standard Plan",
            price: Number(plan.price) || 0,
            discountPrice: Number(plan.discountPrice) || 0,
            period: plan.period || "One-Time Setup",
            badge: plan.badge || "",
            description: plan.description || "",
            features: Array.isArray(plan.features)
              ? plan.features
              : (typeof plan.features === "string"
                  ? plan.features.split("\n").map((f: string) => f.trim()).filter(Boolean)
                  : []),
            isPopular: Boolean(plan.isPopular)
          }))
        : [],
      reviews: Array.isArray(body.reviews)
        ? body.reviews.map((r: any) => ({
            name: r.name || "Verified Client",
            designation: r.designation || "",
            company: r.company || "",
            location: r.location || "",
            rating: Number(r.rating) || 5,
            comment: r.comment || "",
            tag: r.tag || ""
          }))
        : [],
      liveUrl: body.liveUrl || "",
      whatsappNumber: body.whatsappNumber || "+8801973590937",
      popularBadge: Boolean(body.popularBadge),
      featuredBadge: Boolean(body.featuredBadge),
      order: Number(body.order) || (store.products?.length || 0) + 1,
      status: statusVal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!store.products) store.products = [];
    store.products.unshift(newProduct);
    saveDatastore(store);

    let finalDoc = newProduct;
    if (db) {
      try {
        const created = await ProductItem.create(newProduct);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB ProductItem create error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, data: finalDoc });
  } catch (err: any) {
    console.error("Products POST error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { _id, ...updates } = body;
    if (!_id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    const store = getDataStore();

    // Check slug uniqueness if slug is being updated
    if (updates.slug !== undefined) {
      const cleanSlug = createSlug(updates.slug);
      if (!cleanSlug) {
        return NextResponse.json({ success: false, message: "Product slug cannot be empty." }, { status: 400 });
      }

      const isDuplicateStore = (store.products || []).some(
        (p) => p._id !== _id && ((p.slug && p.slug.toLowerCase() === cleanSlug) || (p._id && p._id.toLowerCase() === cleanSlug))
      );

      let isDuplicateDb = false;
      const db = await connectDB();
      if (db) {
        try {
          const existing = await ProductItem.findOne({
            $or: [{ slug: cleanSlug }, { _id: cleanSlug }],
            _id: { $ne: _id }
          });
          if (existing) isDuplicateDb = true;
        } catch (dbErr: any) {
          console.warn("MongoDB check duplicate slug on PUT notice:", dbErr.message);
        }
      }

      if (isDuplicateStore || isDuplicateDb) {
        return NextResponse.json(
          { success: false, message: `The slug "${cleanSlug}" is already in use by another product. Please choose a unique slug.` },
          { status: 400 }
        );
      }
      updates.slug = cleanSlug;
    }

    if (updates.features && typeof updates.features === "string") {
      updates.features = updates.features.split("\n").map((f: string) => f.trim()).filter(Boolean);
    }
    if (updates.images && Array.isArray(updates.images)) {
      updates.images = updates.images.filter(Boolean);
    }
    if (updates.pricingPlans && Array.isArray(updates.pricingPlans)) {
      updates.pricingPlans = updates.pricingPlans.map((plan: any) => ({
        ...plan,
        price: Number(plan.price) || 0,
        discountPrice: Number(plan.discountPrice) || 0,
        features: Array.isArray(plan.features)
          ? plan.features
          : (typeof plan.features === "string"
              ? plan.features.split("\n").map((f: string) => f.trim()).filter(Boolean)
              : []),
        isPopular: Boolean(plan.isPopular)
      }));
    }
    if (updates.reviews && Array.isArray(updates.reviews)) {
      updates.reviews = updates.reviews.map((r: any) => ({
        name: r.name || "Verified Client",
        designation: r.designation || "",
        company: r.company || "",
        location: r.location || "",
        rating: Number(r.rating) || 5,
        comment: r.comment || "",
        tag: r.tag || ""
      }));
    }

    updates.updatedAt = new Date().toISOString();

    const idx = store.products?.findIndex((p) => p._id === _id);
    if (idx !== undefined && idx !== -1) {
      store.products[idx] = { ...store.products[idx], ...updates };
      saveDatastore(store);
    }

    let updatedDoc = { _id, ...updates };
    const db = await connectDB();
    if (db) {
      try {
        const res = await ProductItem.findByIdAndUpdate(_id, updates, { new: true, upsert: true });
        if (res) updatedDoc = res.toObject ? res.toObject() : res;
      } catch (dbErr: any) {
        console.error("MongoDB ProductItem update error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, data: updatedDoc });
  } catch (err: any) {
    console.error("Products PUT error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    const store = getDataStore();
    const existing = store.products?.find((p) => p._id === id);
    if (existing) {
      if (existing.thumbnail) await deleteFromCloudinary(existing.thumbnail);
      if (Array.isArray(existing.images)) {
        for (const img of existing.images) {
          if (img && img !== existing.thumbnail) await deleteFromCloudinary(img);
        }
      }
      if (existing.video && !existing.video.includes("youtube.com") && !existing.video.includes("youtu.be")) {
        await deleteFromCloudinary(existing.video);
      }
      if (existing.videoThumbnail) await deleteFromCloudinary(existing.videoThumbnail);
    }

    store.products = (store.products || []).filter((p) => p._id !== id);
    saveDatastore(store);

    const db = await connectDB();
    if (db) {
      try {
        const dbDoc = await ProductItem.findById(id);
        if (dbDoc) {
          if (dbDoc.thumbnail && dbDoc.thumbnail !== existing?.thumbnail) await deleteFromCloudinary(dbDoc.thumbnail);
          await ProductItem.findByIdAndDelete(id);
        }
      } catch (dbErr: any) {
        console.error("MongoDB ProductItem delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (err: any) {
    console.error("Products DELETE error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
