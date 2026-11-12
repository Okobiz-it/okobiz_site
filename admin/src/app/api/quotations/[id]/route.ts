import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import Quotation from "@/models/Quotation";
import { sendQuotationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(
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
          // Try finding by ref_no if id was ref
          quotation = await Quotation.findOne({ ref_no: id }).lean();
        }
      } catch (dbErr: any) {
        console.warn("MongoDB GET quotation by id error:", dbErr.message);
      }
    }

    // Fallback to local dataStore
    if (!quotation) {
      const store = getDataStore();
      const list = store.quotations || [];
      quotation = list.find((q: any) => String(q._id) === String(id) || String(q.id) === String(id) || q.ref_no === id);
    }

    if (!quotation) {
      return NextResponse.json(
        { success: false, message: "Quotation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error: any) {
    console.error("GET /api/quotations/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch quotation" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await req.json();
    const store = getDataStore();
    if (!store.quotations) store.quotations = [];

    const updateData: any = {
      ref_no: body.ref_no,
      doc_type: body.doc_type,
      bill_rows: body.bill_rows,
      quote_date: body.quote_date ? new Date(body.quote_date) : undefined,
      client_name: body.client_name,
      organization_name: body.organization_name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      subject: body.subject,
      software_columns: body.software_columns,
      software_rows: body.software_rows,
      software_amount: Number(body.software_amount || 0),
      plan_name: body.plan_name,
      billing_cycle: body.billing_cycle,
      license_fee_title: body.license_fee_title,
      license_fee_amount: Number(body.license_fee_amount || 0),
      subscription_amount: Number(body.subscription_amount || 0),
      recurring_note: body.recurring_note,
      has_hardware: Boolean(body.has_hardware),
      hardware_columns: body.hardware_columns,
      hardware_rows: body.hardware_rows,
      hardware_amount: Number(body.hardware_amount || 0),
      grand_total: Number(body.grand_total || 0),
      in_words: body.in_words,
      project_breakdown: body.project_breakdown,
      terms_conditions: body.terms_conditions,
      client_requirements: body.client_requirements,
      deliverables: body.deliverables,
      additional_notes: body.additional_notes,
      company_signatory_name: body.company_signatory_name,
      company_signatory_title: body.company_signatory_title,
      company_phone: body.company_phone,
      company_email: body.company_email,
      status: body.status,
      updated_at: new Date(),
    };

    let updatedDoc: any = null;

    // Update MongoDB
    const db = await connectDB();
    if (db) {
      try {
        const res = await Quotation.findByIdAndUpdate(id, updateData, { new: true }).lean();
        if (res) updatedDoc = res;
      } catch (dbErr: any) {
        console.warn("MongoDB PUT quotation error:", dbErr.message);
      }
    }

    // Update local dataStore
    const storeIdx = store.quotations.findIndex(
      (q: any) => String(q._id) === String(id) || String(q.id) === String(id) || q.ref_no === id
    );
    if (storeIdx !== -1) {
      store.quotations[storeIdx] = {
        ...store.quotations[storeIdx],
        ...updateData,
      };
      if (!updatedDoc) updatedDoc = store.quotations[storeIdx];
      saveDatastore(store);
    } else if (!updatedDoc) {
      // If not in store yet, append
      const fallbackObj = { _id: id, ...updateData };
      store.quotations.unshift(fallbackObj);
      saveDatastore(store);
      updatedDoc = fallbackObj;
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
        const viewOnlineUrl = `${appUrl}/dashboard/quotations/${id}/print`;

        await sendQuotationEmail({
          to: body.email,
          clientName: updatedDoc.client_name,
          organizationName: updatedDoc.organization_name,
          refNo: updatedDoc.ref_no,
          subject: updatedDoc.subject,
          grandTotal: Number(updatedDoc.grand_total),
          inWords: updatedDoc.in_words,
          attachmentBuffer,
          viewOnlineUrl,
        });

        // Update email_sent_at
        const now = new Date();
        if (db) {
          try {
            await Quotation.findByIdAndUpdate(id, { email_sent_at: now });
          } catch {}
        }
        if (storeIdx !== -1) {
          store.quotations[storeIdx].email_sent_at = now.toISOString();
          saveDatastore(store);
        }
        updatedDoc.email_sent_at = now;
        emailSent = true;
      } catch (err: any) {
        console.error("Failed to send quotation update email:", err);
        emailError = err.message || "Failed to dispatch email";
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedDoc,
      emailSent,
      emailError,
    });
  } catch (error: any) {
    console.error("PUT /api/quotations/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update quotation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Remove from MongoDB
    const db = await connectDB();
    if (db) {
      try {
        await Quotation.findByIdAndDelete(id);
      } catch (dbErr: any) {
        console.warn("MongoDB DELETE quotation error:", dbErr.message);
      }
    }

    // Remove from local dataStore
    const store = getDataStore();
    if (store.quotations) {
      store.quotations = store.quotations.filter(
        (q: any) => String(q._id) !== String(id) && String(q.id) !== String(id) && q.ref_no !== id
      );
      saveDatastore(store);
    }

    return NextResponse.json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/quotations/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete quotation" },
      { status: 500 }
    );
  }
}

