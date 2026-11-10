import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import Quotation from "@/models/Quotation";
import { sendQuotationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing quotation ID" },
        { status: 400 }
      );
    }

    let quotation: any = null;

    // Check MongoDB
    const db = await connectDB();
    if (db) {
      try {
        quotation = await Quotation.findById(id).lean();
        if (!quotation) {
          quotation = await Quotation.findOne({ ref_no: id }).lean();
        }
      } catch (dbErr: any) {
        console.warn("MongoDB GET quotation for send-email error:", dbErr.message);
      }
    }

    // Fallback to local dataStore
    const store = getDataStore();
    if (!quotation && store.quotations) {
      quotation = store.quotations.find(
        (q: any) => String(q._id) === String(id) || String(q.id) === String(id) || q.ref_no === id
      );
    }

    if (!quotation) {
      return NextResponse.json(
        { success: false, message: "Quotation not found" },
        { status: 404 }
      );
    }

    let recipientEmail = quotation.email;
    let pdfBase64: string | null = null;

    try {
      const body = await req.json();
      if (body.email) recipientEmail = body.email;
      if (body.pdf_base64) pdfBase64 = body.pdf_base64;
    } catch {}

    if (!recipientEmail) {
      return NextResponse.json(
        { success: false, message: "Client email is required to send quotation" },
        { status: 400 }
      );
    }

    let attachmentBuffer: Buffer | undefined;
    if (pdfBase64) {
      const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
      attachmentBuffer = Buffer.from(base64Data, "base64");
    }

    const origin = req.headers.get("origin") || req.nextUrl?.origin;
    const appUrl = origin || process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
    const viewOnlineUrl = `${appUrl}/dashboard/quotations/${quotation._id || quotation.id}/print`;

    await sendQuotationEmail({
      to: recipientEmail,
      clientName: quotation.client_name,
      organizationName: quotation.organization_name,
      refNo: quotation.ref_no,
      subject: quotation.subject,
      grandTotal: Number(quotation.grand_total),
      inWords: quotation.in_words,
      attachmentBuffer,
      viewOnlineUrl,
    });

    const now = new Date();
    const updatedStatus = quotation.status === "DRAFT" ? "SENT" : quotation.status;

    if (db) {
      try {
        await Quotation.findByIdAndUpdate(quotation._id, {
          email_sent_at: now,
          status: updatedStatus,
        });
      } catch {}
    }

    if (store.quotations) {
      const storeIdx = store.quotations.findIndex(
        (q: any) => String(q._id) === String(quotation._id) || String(q.id) === String(quotation._id) || q.ref_no === quotation.ref_no
      );
      if (storeIdx !== -1) {
        store.quotations[storeIdx].email_sent_at = now.toISOString();
        store.quotations[storeIdx].status = updatedStatus;
        saveDatastore(store);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Quotation email successfully dispatched to ${recipientEmail}`,
    });
  } catch (error: any) {
    console.error("POST /api/quotations/[id]/send-email error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}

