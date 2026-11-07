export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import SiteSetting from "@/models/SiteSetting";

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const setting = await SiteSetting.findOne();
      if (setting) {
        return NextResponse.json({ success: true, data: setting });
      }
    }
  } catch (err: any) {
    console.warn("MongoDB GET settings error:", err.message);
  }
  const store = getDataStore();
  return NextResponse.json({ success: true, data: store.settings });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const store = getDataStore();
    store.settings = { ...store.settings, ...body };
    saveDatastore(store);

    let finalSettings = store.settings;
    const db = await connectDB();
    if (db) {
      try {
        const updated = await SiteSetting.findOneAndUpdate({}, { $set: body }, { new: true, upsert: true });
        if (updated) finalSettings = updated.toObject ? updated.toObject() : updated;
      } catch (dbErr: any) {
        console.error("MongoDB SiteSetting update error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, data: finalSettings });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
