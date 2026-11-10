import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import Quotation from "@/models/Quotation";
import { sendQuotationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

async function generateNextRefNo(existingCount: number): Promise<string> {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);
  const sequence = String(existingCount + 1).padStart(3, "0");
  return `okobiz/bizpos/${sequence}/${day}/${year}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").toLowerCase();
    const status = searchParams.get("status") || "";

    const store = getDataStore();
    let quotationsList: any[] = [];
    let totalCount = 0;

    const db = await connectDB();
    if (db) {
      try {
        const query: any = {};
        if (status && status !== "ALL") {
          query.status = status;
        }
        if (search) {
          query.$or = [
            { ref_no: { $regex: search, $options: "i" } },
            { client_name: { $regex: search, $options: "i" } },
            { organization_name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { subject: { $regex: search, $options: "i" } },
          ];
        }
        quotationsList = await Quotation.find(query).sort({ created_at: -1 }).lean();
        totalCount = await Quotation.countDocuments();
      } catch (dbErr: any) {
        console.warn("MongoDB GET quotations error:", dbErr.message);
      }
    }

    // Fallback to dataStore if DB returned empty or offline
    if (quotationsList.length === 0 && Array.isArray(store.quotations)) {
      quotationsList = store.quotations.filter((q: any) => {
        const matchStatus = !status || status === "ALL" || q.status === status;
        const matchSearch =
          !search ||
          (q.ref_no && q.ref_no.toLowerCase().includes(search)) ||
          (q.client_name && q.client_name.toLowerCase().includes(search)) ||
          (q.organization_name && q.organization_name.toLowerCase().includes(search)) ||
          (q.email && q.email.toLowerCase().includes(search)) ||
          (q.phone && q.phone.toLowerCase().includes(search)) ||
          (q.subject && q.subject.toLowerCase().includes(search));
        return matchStatus && matchSearch;
      });
      totalCount = store.quotations.length;
    }

    const nextRefNo = await generateNextRefNo(totalCount);

    return NextResponse.json({
      success: true,
      data: quotationsList,
      nextRefNo,
    });
  } catch (error: any) {
    console.error("GET /api/quotations error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch quotations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = getDataStore();
    if (!store.quotations) store.quotations = [];

    let ref_no = (body.ref_no || "").trim();
    if (!ref_no) {
      ref_no = await generateNextRefNo(store.quotations.length);
    }

    const newQuotation = {
      _id: "quote-" + Date.now(),
      ref_no,
      quote_date: body.quote_date ? new Date(body.quote_date) : new Date(),
      client_name: body.client_name || "Valued Client",
      organization_name: body.organization_name || "",
      address: body.address || "",
      phone: body.phone || "",
      email: body.email || "",
      subject: body.subject || "Quotation for Web & Software Solution",
      software_columns: body.software_columns || [],
      software_rows: body.software_rows || [],
      software_amount: Number(body.software_amount || 0),
      plan_name: body.plan_name || "Starter",
      billing_cycle: body.billing_cycle || "MONTHLY",
      license_fee_title: body.license_fee_title || "One-time Setup & License Fee",
      license_fee_amount: Number(body.license_fee_amount || 0),
      subscription_amount: Number(body.subscription_amount || 0),
      recurring_note: body.recurring_note || "",
      has_hardware: Boolean(body.has_hardware),
      hardware_columns: body.hardware_columns || [],
      hardware_rows: body.hardware_rows || [],
      hardware_amount: Number(body.hardware_amount || 0),
      grand_total: Number(body.grand_total || 0),
      in_words: body.in_words || "",
      project_breakdown: body.project_breakdown || "",
      terms_conditions: body.terms_conditions || "",
      client_requirements: body.client_requirements || "",
      deliverables: body.deliverables || "",
      additional_notes: body.additional_notes || "",
      company_signatory_name: body.company_signatory_name || "Md. Sorower Jahan",
      company_signatory_title: body.company_signatory_title || "CEO, okobiz",
      company_phone: body.company_phone || "+880 1973590937",
      company_email: body.company_email || "info@okobiz.com",
      status: body.status || "DRAFT",
      email_sent_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Save to local store
    store.quotations.unshift(newQuotation);
    saveDatastore(store);

    let createdDoc: any = newQuotation;

    // Save to MongoDB
    const db = await connectDB();
    if (db) {
      try {
        const created = await Quotation.create(newQuotation);
        if (created) {
          createdDoc = created.toObject ? created.toObject() : created;
        }
      } catch (dbErr: any) {
        console.warn("MongoDB Quotation create error:", dbErr.message);
      }
    }

    let emailSent = false;
    let emailError = null;

    if (body.send_email && body.email) {
      try {
        let attachmentBuffer: Buffer | undefined;
        if (body.pdf_base64) {
          const base64Data = body.pdf_base64.replace(/^data:application\/pdf;base64,/, "");
          attachmentBuffer = Buffer.from(base64Data, "base64");
        }

        const origin = req.headers.get("origin") || req.nextUrl?.origin;
        const appUrl = origin || process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
        const viewOnlineUrl = `${appUrl}/dashboard/quotations/${createdDoc._id || createdDoc.id}/print`;

        await sendQuotationEmail({
          to: body.email,
          clientName: createdDoc.client_name,
          organizationName: createdDoc.organization_name,
          refNo: createdDoc.ref_no,
          subject: createdDoc.subject,
          grandTotal: Number(createdDoc.grand_total),
          inWords: createdDoc.in_words,
          attachmentBuffer,
          viewOnlineUrl,
        });

        // Update email_sent_at
        createdDoc.email_sent_at = new Date();
        const storeIdx = store.quotations.findIndex((q: any) => q._id === createdDoc._id);
        if (storeIdx !== -1) {
          store.quotations[storeIdx].email_sent_at = new Date().toISOString();
          saveDatastore(store);
        }

        if (db) {
          try {
            await Quotation.findByIdAndUpdate(createdDoc._id, { email_sent_at: new Date() });
          } catch {}
        }

        emailSent = true;
      } catch (err: any) {
        console.error("Failed to send quotation email:", err);
        emailError = err.message || "Failed to dispatch email";
      }
    }

    return NextResponse.json({
      success: true,
      data: createdDoc,
      emailSent,
      emailError,
    });
  } catch (error: any) {
    console.error("POST /api/quotations error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create quotation" },
      { status: 500 }
    );
  }
}

