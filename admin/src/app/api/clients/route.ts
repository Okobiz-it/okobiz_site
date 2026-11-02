import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import ClientPartner from "@/models/ClientPartner";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const clients = await ClientPartner.find().sort({ order: 1 });
      return NextResponse.json({ success: true, data: clients });
    }
  } catch (err: any) {
    console.warn("MongoDB GET clients error:", err.message);
  }
  const store = getDataStore();
  return NextResponse.json({ success: true, data: store.clients || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getDataStore();
    const newClient = {
      _id: "c-" + Date.now(),
      name: body.name || "New Partner",
      image: body.image || "/assets/nitol niloy-C3PFPoNU.png",
      websiteLink: body.websiteLink || "",
      order: body.order || (store.clients.length + 1),
      isActive: body.isActive !== undefined ? body.isActive : true
    };

    store.clients.push(newClient);
    saveDatastore(store);

    let finalDoc = newClient;
    const db = await connectDB();
    if (db) {
      try {
        const created = await ClientPartner.create(newClient);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB ClientPartner create error:", dbErr.message);
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
    const idx = store.clients.findIndex(c => c._id === _id);
    if (idx !== -1) {
      store.clients[idx] = { ...store.clients[idx], ...updates };
      saveDatastore(store);
    }

    let updatedDoc = { _id, ...updates };
    const db = await connectDB();
    if (db) {
      try {
        const res = await ClientPartner.findByIdAndUpdate(_id, updates, { new: true, upsert: true });
        if (res) updatedDoc = res.toObject ? res.toObject() : res;
      } catch (dbErr: any) {
        console.error("MongoDB ClientPartner update error:", dbErr.message);
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
    store.clients = store.clients.filter(c => c._id !== id);
    saveDatastore(store);

    const db = await connectDB();
    if (db) {
      try {
        await ClientPartner.findByIdAndDelete(id);
      } catch (dbErr: any) {
        console.error("MongoDB ClientPartner delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
