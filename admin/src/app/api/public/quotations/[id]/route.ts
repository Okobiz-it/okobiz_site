import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getDataStore } from "@/lib/dataStore";
import Quotation from "@/models/Quotation";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid quotation ID" },
        { status: 400 }
      );
    }

    let quotation: any = null;

    const db = await connectDB();
    if (db) {
      try {
        quotation = await Quotation.findById(id).lean();
        if (!quotation) {
          quotation = await Quotation.findOne({ ref_no: id }).lean();
        }
      } catch (dbErr: any) {
        console.warn("MongoDB public GET quotation error:", dbErr.message);
      }
    }

    if (!quotation) {
      const store = getDataStore();
      const list = store.quotations || [];
      quotation = list.find(
        (q: any) => String(q._id) === String(id) || String(q.id) === String(id) || q.ref_no === id
      );
    }

    if (!quotation) {
      return NextResponse.json(
        { success: false, message: "Quotation not found" },
        { status: 404 }
      );
    }

    if (req.nextUrl.searchParams.get("download") === "true") {
      return NextResponse.redirect(new URL(`/dashboard/quotations/${quotation._id || quotation.id || id}/print`, req.url));
    }

    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error: any) {
    console.error("GET /api/public/quotations/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch quotation" },
      { status: 500 }
    );
  }
}

