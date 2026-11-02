import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import GalleryItem from "@/models/GalleryItem";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const items = await GalleryItem.find().sort({ order: 1, createdAt: -1 });
      return NextResponse.json({ success: true, data: items });
    }
  } catch (err: any) {
    console.warn("MongoDB GET gallery error:", err.message);
  }
  const store = getDataStore();
  return NextResponse.json({ success: true, data: store.gallery || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.imageUrl || !body.title) {
      return NextResponse.json({ success: false, message: "Title and Image are required" }, { status: 400 });
    }

    const store = getDataStore();
    const newItem = {
      _id: "gal-" + Date.now(),
      title: body.title,
      category: body.category || "Events",
      imageUrl: body.imageUrl,
      description: body.description || "",
      order: Number(body.order) || 0,
      featured: Boolean(body.featured),
      createdAt: new Date().toISOString()
    };

    if (!store.gallery) store.gallery = [];
    store.gallery.unshift(newItem);
    saveDatastore(store);

    let finalDoc = newItem;
    const db = await connectDB();
    if (db) {
      try {
        const created = await GalleryItem.create(newItem);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB GalleryItem create error:", dbErr.message);
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

    const store = getDataStore();
    if (store.gallery) {
      const idx = store.gallery.findIndex((g) => g._id === _id);
      if (idx !== -1) {
        store.gallery[idx] = { ...store.gallery[idx], ...updates };
        saveDatastore(store);
      }
    }

    let updatedDoc = { _id, ...updates };
    const db = await connectDB();
    if (db) {
      try {
        const res = await GalleryItem.findByIdAndUpdate(_id, updates, { new: true, upsert: true });
        if (res) updatedDoc = res.toObject ? res.toObject() : res;
      } catch (dbErr: any) {
        console.error("MongoDB GalleryItem update error:", dbErr.message);
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
    if (store.gallery) {
      store.gallery = store.gallery.filter((g) => g._id !== id);
      saveDatastore(store);
    }

    const db = await connectDB();
    if (db) {
      try {
        await GalleryItem.findByIdAndDelete(id);
      } catch (dbErr: any) {
        console.error("MongoDB GalleryItem delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
