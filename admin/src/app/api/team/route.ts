import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const team = await TeamMember.find().sort({ order: 1 });
      return NextResponse.json({ success: true, data: team });
    }
  } catch (err: any) {
    console.warn("MongoDB GET team error:", err.message);
  }
  const store = getDataStore();
  return NextResponse.json({ success: true, data: store.team || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getDataStore();
    const newMember = {
      _id: "tm-" + Date.now(),
      name: body.name || "Team Member",
      designation: body.designation || "Specialist",
      image: body.image || "/assets/CEO-0fmQDjG-.webp",
      type: (body.type === "advisor" ? "advisor" : "team") as "team" | "advisor",
      order: body.order || (store.team.length + 1)
    };

    store.team.push(newMember);
    saveDatastore(store);

    let finalDoc = newMember;
    const db = await connectDB();
    if (db) {
      try {
        const created = await TeamMember.create(newMember);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB TeamMember create error:", dbErr.message);
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
    const idx = store.team.findIndex(t => t._id === _id);
    if (idx !== -1) {
      store.team[idx] = { ...store.team[idx], ...updates };
      saveDatastore(store);
    }

    let updatedDoc = { _id, ...updates };
    const db = await connectDB();
    if (db) {
      try {
        const res = await TeamMember.findByIdAndUpdate(_id, updates, { new: true, upsert: true });
        if (res) updatedDoc = res.toObject ? res.toObject() : res;
      } catch (dbErr: any) {
        console.error("MongoDB TeamMember update error:", dbErr.message);
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
    store.team = store.team.filter(t => t._id !== id);
    saveDatastore(store);

    const db = await connectDB();
    if (db) {
      try {
        await TeamMember.findByIdAndDelete(id);
      } catch (dbErr: any) {
        console.error("MongoDB TeamMember delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
