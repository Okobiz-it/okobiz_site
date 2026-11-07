export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const inqs = await Inquiry.find().sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: inqs });
    }
  } catch (err: any) {
    console.warn("MongoDB GET inquiries error:", err.message);
  }
  const store = getDataStore();
  return NextResponse.json({ success: true, data: store.inquiries || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getDataStore();
    const newInq = {
      _id: "inq-" + Date.now(),
      name: body.name || "Anonymous",
      email: body.email || "",
      phone: body.phone || "",
      service: body.service || "General Inquiry",
      message: body.message || "",
      status: "new" as const,
      createdAt: new Date().toISOString()
    };

    if (!store.inquiries) store.inquiries = [];
    store.inquiries.unshift(newInq);
    saveDatastore(store);

    let finalDoc = newInq;
    const db = await connectDB();
    if (db) {
      try {
        const created = await Inquiry.create(newInq);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB Inquiry create error:", dbErr.message);
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
    const { _id, status } = body;
    if (!_id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    const store = getDataStore();
    const idx = store.inquiries.findIndex(i => i._id === _id);
    if (idx !== -1) {
      store.inquiries[idx].status = status;
      saveDatastore(store);
    }

    let updatedDoc = { _id, status };
    const db = await connectDB();
    if (db) {
      try {
        const res = await Inquiry.findByIdAndUpdate(_id, { status }, { new: true });
        if (res) updatedDoc = res.toObject ? res.toObject() : res;
      } catch (dbErr: any) {
        console.error("MongoDB Inquiry update error:", dbErr.message);
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
    store.inquiries = store.inquiries.filter(i => i._id !== id);
    saveDatastore(store);

    const db = await connectDB();
    if (db) {
      try {
        await Inquiry.findByIdAndDelete(id);
      } catch (dbErr: any) {
        console.error("MongoDB Inquiry delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
