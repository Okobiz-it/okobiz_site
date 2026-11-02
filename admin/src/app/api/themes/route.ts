import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import ThemeItem from "@/models/ThemeItem";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const themes = await ThemeItem.find().sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: themes });
    }
  } catch (err: any) {
    console.warn("MongoDB GET themes error:", err.message);
  }
  const store = getDataStore();
  return NextResponse.json({ success: true, data: store.themes || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getDataStore();
    const newTheme = {
      _id: "thm-" + Date.now(),
      websiteTitle: body.websiteTitle || "New Project",
      category: body.category || "Web Applications",
      clientName: body.clientName || "",
      mediaType: body.mediaType || (body.video ? "video" : "image"),
      price: Number(body.price) || 0,
      discountPrice: Number(body.discountPrice) || 0,
      websiteLink: body.websiteLink || "",
      photo: body.photo || "/assets/bdhajj-D468QQtK.png",
      video: body.video || "",
      videoThumbnail: body.videoThumbnail || "",
      popularBadge: Boolean(body.popularBadge),
      featuredBadge: Boolean(body.featuredBadge),
      description: body.description || "",
      challenge: body.challenge || "",
      solution: body.solution || "",
      features: Array.isArray(body.features)
        ? body.features
        : (body.features ? body.features.split("\n").map((f: string) => f.trim()).filter(Boolean) : []),
      createdAt: new Date().toISOString()
    };

    if (!store.themes) store.themes = [];
    store.themes.unshift(newTheme);
    saveDatastore(store);

    let finalDoc = newTheme;
    const db = await connectDB();
    if (db) {
      try {
        const created = await ThemeItem.create(newTheme);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB ThemeItem create error:", dbErr.message);
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
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.discountPrice !== undefined) updates.discountPrice = Number(updates.discountPrice);

    const store = getDataStore();
    const idx = store.themes.findIndex(t => t._id === _id);
    if (idx !== -1) {
      store.themes[idx] = { ...store.themes[idx], ...updates };
      saveDatastore(store);
    }

    let updatedDoc = { _id, ...updates };
    const db = await connectDB();
    if (db) {
      try {
        const res = await ThemeItem.findByIdAndUpdate(_id, updates, { new: true, upsert: true });
        if (res) updatedDoc = res.toObject ? res.toObject() : res;
      } catch (dbErr: any) {
        console.error("MongoDB ThemeItem update error:", dbErr.message);
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
    const existing = store.themes?.find(t => t._id === id);
    if (existing) {
      if (existing.photo) await deleteFromCloudinary(existing.photo);
      if (existing.video) await deleteFromCloudinary(existing.video);
      if (existing.videoThumbnail) await deleteFromCloudinary(existing.videoThumbnail);
    }

    store.themes = store.themes.filter(t => t._id !== id);
    saveDatastore(store);

    const db = await connectDB();
    if (db) {
      try {
        const dbDoc = await ThemeItem.findById(id);
        if (dbDoc) {
          if (dbDoc.photo && dbDoc.photo !== existing?.photo) await deleteFromCloudinary(dbDoc.photo);
          if (dbDoc.video && dbDoc.video !== existing?.video) await deleteFromCloudinary(dbDoc.video);
          if (dbDoc.videoThumbnail && dbDoc.videoThumbnail !== existing?.videoThumbnail) await deleteFromCloudinary(dbDoc.videoThumbnail);
          await ThemeItem.findByIdAndDelete(id);
        }
      } catch (dbErr: any) {
        console.error("MongoDB ThemeItem delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
