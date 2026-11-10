export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDataStore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import ProductItem from "@/models/ProductItem";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
  }

  try {
    const db = await connectDB();
    if (db) {
      const product = await ProductItem.findOne({
        $or: [{ _id: id }, { slug: id.toLowerCase() }]
      });
      if (product) {
        return NextResponse.json({ success: true, data: product });
      }
    }
  } catch (err: any) {
    console.warn("MongoDB GET product by ID error:", err.message);
  }

  const store = getDataStore();
  const match = store.products?.find(
    (p) => p._id === id || (p.slug && p.slug.toLowerCase() === id.toLowerCase())
  );
  if (match) {
    return NextResponse.json({ success: true, data: match });
  }

  return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
}
