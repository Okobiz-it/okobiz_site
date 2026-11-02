import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import FaqItem from "@/models/FaqItem";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const faqs = await FaqItem.find().sort({ order: 1 });
      return NextResponse.json({ success: true, data: faqs });
    }
  } catch (err: any) {
    console.warn("MongoDB GET faqs error:", err.message);
  }
  const store = getDataStore();
  return NextResponse.json({ success: true, data: store.faqs || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getDataStore();
    const newFaq = {
      _id: "faq-" + Date.now(),
      question: body.question || "New Question",
      answer: body.answer || "Answer here...",
      category: body.category || "General",
      order: body.order || (store.faqs.length + 1)
    };

    store.faqs.push(newFaq);
    saveDatastore(store);

    let finalDoc = newFaq;
    const db = await connectDB();
    if (db) {
      try {
        const created = await FaqItem.create(newFaq);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB FaqItem create error:", dbErr.message);
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
    const idx = store.faqs.findIndex(f => f._id === _id);
    if (idx !== -1) {
      store.faqs[idx] = { ...store.faqs[idx], ...updates };
      saveDatastore(store);
    }

    let updatedDoc = { _id, ...updates };
    const db = await connectDB();
    if (db) {
      try {
        const res = await FaqItem.findByIdAndUpdate(_id, updates, { new: true, upsert: true });
        if (res) updatedDoc = res.toObject ? res.toObject() : res;
      } catch (dbErr: any) {
        console.error("MongoDB FaqItem update error:", dbErr.message);
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
    store.faqs = store.faqs.filter(f => f._id !== id);
    saveDatastore(store);

    const db = await connectDB();
    if (db) {
      try {
        await FaqItem.findByIdAndDelete(id);
      } catch (dbErr: any) {
        console.error("MongoDB FaqItem delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
