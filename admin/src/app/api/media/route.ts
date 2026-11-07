export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import MediaAsset from "@/models/MediaAsset";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const media = await MediaAsset.find().sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: media });
    }
  } catch (err: any) {
    console.warn("MongoDB GET media error:", err.message);
  }
  const store = getDataStore();
  return NextResponse.json({ success: true, data: store.media || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getDataStore();
    const newMedia = {
      _id: "med-" + Date.now(),
      name: body.name || "Media Asset",
      filename: body.filename || "file",
      path: body.url || body.path || "",
      type: (body.type || "image") as "image" | "pdf" | "video",
      size: Number(body.size) || 0,
      mimeType: body.mimeType || "",
      url: body.url || body.path || "",
      createdAt: new Date().toISOString()
    };

    if (!store.media) store.media = [];
    store.media.unshift(newMedia);
    saveDatastore(store);

    let finalDoc = newMedia;
    const db = await connectDB();
    if (db) {
      try {
        const created = await MediaAsset.create(newMedia);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB MediaAsset create error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, data: finalDoc });
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
    store.media = store.media.filter(m => m._id !== id);
    saveDatastore(store);

    const db = await connectDB();
    if (db) {
      try {
        await MediaAsset.findByIdAndDelete(id);
      } catch (dbErr: any) {
        console.error("MongoDB MediaAsset delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
