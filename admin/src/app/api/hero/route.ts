export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import HeroSlide from "@/models/HeroSlide";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const slides = await HeroSlide.find().sort({ order: 1 });
      return NextResponse.json({ success: true, data: slides });
    }
  } catch (err: any) {
    console.warn("MongoDB GET hero error:", err.message);
  }
  const store = getDataStore();
  return NextResponse.json({ success: true, data: store.heroSlides || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getDataStore();
    const newSlide = {
      _id: "hero-" + Date.now(),
      title: body.title || "New Slide",
      img: body.img || "/assets/Untitled-10-C-7O9vGO.webp",
      order: body.order || (store.heroSlides.length + 1),
      isActive: body.isActive !== undefined ? body.isActive : true,
      buttonText: body.buttonText || "More Information",
      buttonLink: body.buttonLink || "/contact-us"
    };

    store.heroSlides.push(newSlide);
    saveDatastore(store);

    let finalDoc = newSlide;
    const db = await connectDB();
    if (db) {
      try {
        const created = await HeroSlide.create(newSlide);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB HeroSlide create error:", dbErr.message);
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
    const idx = store.heroSlides.findIndex(s => s._id === _id);
    if (idx !== -1) {
      store.heroSlides[idx] = { ...store.heroSlides[idx], ...updates };
      saveDatastore(store);
    }

    let updatedDoc = { _id, ...updates };
    const db = await connectDB();
    if (db) {
      try {
        const res = await HeroSlide.findByIdAndUpdate(_id, updates, { new: true, upsert: true });
        if (res) updatedDoc = res.toObject ? res.toObject() : res;
      } catch (dbErr: any) {
        console.error("MongoDB HeroSlide update error:", dbErr.message);
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
    store.heroSlides = store.heroSlides.filter(s => s._id !== id);
    saveDatastore(store);

    const db = await connectDB();
    if (db) {
      try {
        await HeroSlide.findByIdAndDelete(id);
      } catch (dbErr: any) {
        console.error("MongoDB HeroSlide delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
