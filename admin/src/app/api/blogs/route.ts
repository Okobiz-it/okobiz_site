import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import BlogItem from "@/models/BlogItem";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const blogs = await BlogItem.find().sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: blogs });
    }
  } catch (err: any) {
    console.warn("MongoDB GET blogs error:", err.message);
  }
  const store = getDataStore();
  return NextResponse.json({ success: true, data: store.blogs || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getDataStore();
    const newBlog = {
      _id: "blg-" + Date.now(),
      title: body.title || "Untitled Blog Post",
      content: body.content || "",
      category: body.category || "Technology",
      author: body.author || "okobiz Editorial",
      photo: body.photo || "/assets/website-app-DOXr3sR7.webp",
      createdAt: new Date().toISOString(),
      commentsCount: 0,
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true
    };

    if (!store.blogs) store.blogs = [];
    store.blogs.unshift(newBlog);
    saveDatastore(store);

    let finalDoc = newBlog;
    const db = await connectDB();
    if (db) {
      try {
        const created = await BlogItem.create(newBlog);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB BlogItem create error:", dbErr.message);
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
    const idx = store.blogs.findIndex(b => b._id === _id);
    if (idx !== -1) {
      store.blogs[idx] = { ...store.blogs[idx], ...updates };
      saveDatastore(store);
    }

    let updatedDoc = { _id, ...updates };
    const db = await connectDB();
    if (db) {
      try {
        const res = await BlogItem.findByIdAndUpdate(_id, updates, { new: true, upsert: true });
        if (res) updatedDoc = res.toObject ? res.toObject() : res;
      } catch (dbErr: any) {
        console.error("MongoDB BlogItem update error:", dbErr.message);
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
    store.blogs = store.blogs.filter(b => b._id !== id);
    saveDatastore(store);

    const db = await connectDB();
    if (db) {
      try {
        await BlogItem.findByIdAndDelete(id);
      } catch (dbErr: any) {
        console.error("MongoDB BlogItem delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
