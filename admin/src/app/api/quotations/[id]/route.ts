import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
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
        { success: false, message: "Missing quotation ID" },
        { status: 400 }
      );
    }

    const decodedId = decodeURIComponent(id).trim();
    let quotation: any = null;

    // Check MongoDB with robust search
    const db = await connectDB();
    if (db) {
      try {
        quotation = await Quotation.findOne({
          $or: [
            { _id: decodedId },
            { ref_no: decodedId }
          ]
        }).lean();
      } catch (dbErr: any) {
        console.warn("MongoDB GET quotation by id error:", dbErr.message);
      }
    }

    // Fallback to local dataStore
    if (!quotation) {
      const store = getDataStore();
      const list = store.quotations || [];
      quotation = list.find(
        (q: any) => String(q._id) === decodedId || String(q.id) === decodedId || q.ref_no === decodedId
      );

      // Auto-heal: sync back into MongoDB so it will be available in future calls
      if (quotation && db) {
        try {
          await Quotation.findOneAndUpdate(
            { ref_no: quotation.ref_no },
            { $set: quotation },
            { upsert: true, new: true }
          );
        } catch (syncErr: any) {
          console.warn("Auto-sync quotation to MongoDB error:", syncErr.message);
        }
      }
    }

    if (!quotation) {
      return NextResponse.json(
        { success: false, message: "Quotation not found" },
        { status: 404 }
      );
    }

    // Check dynamically whether this document already has a child revision
    let isRevised = Boolean(quotation.is_revised);
    if (!isRevised) {
      if (db) {
        try {
          const hasChild = await Quotation.exists({ parent_id: String(quotation._id) });
          if (hasChild) isRevised = true;
        } catch {}
      } else {
        const store = getDataStore();
        const docId = String(quotation._id || quotation.id || "");
        if (
          Array.isArray(store.quotations) &&
          store.quotations.some((q: any) => q?.parent_id && String(q.parent_id) === docId)
        ) {
          isRevised = true;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...quotation,
        is_revised: isRevised,
      },
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

    const decodedId = decodeURIComponent(id).trim();
    const body = await req.json();
    const store = getDataStore();
    if (!store.quotations) store.quotations = [];

    // Locate existing document so revision metadata is preserved during edits
    const existingLocal = store.quotations.find(
      (q: any) =>
        String(q._id) === decodedId || String(q.id) === decodedId || q.ref_no === decodedId
    );
    let existingDb: any = null;
    const db = await connectDB();
    if (db) {
      try {
        existingDb = await Quotation.findOne({
          $or: [{ _id: decodedId }, { ref_no: decodedId }],
        }).lean();
      } catch {}
    }
    const existingDoc = existingDb || existingLocal;

    const updateData: any = {
      ref_no: (body.ref_no || "").trim(),
      doc_type: body.doc_type || existingDoc?.doc_type || "QUOTATION",
      parent_id: body.parent_id !== undefined ? body.parent_id : existingDoc?.parent_id ?? null,
      root_ref_no:
        body.root_ref_no !== undefined ? body.root_ref_no : existingDoc?.root_ref_no || "",
      revision_number:
        body.revision_number !== undefined
          ? Number(body.revision_number)
          : existingDoc?.revision_number ?? 0,
      is_revised:
        body.is_revised !== undefined ? Boolean(body.is_revised) : Boolean(existingDoc?.is_revised),
      revised_to_id:
        body.revised_to_id !== undefined ? body.revised_to_id : existingDoc?.revised_to_id ?? null,
      bill_rows: body.bill_rows || [],
      sub_total: Number(body.sub_total || 0),
      has_advance_payment: Boolean(body.has_advance_payment),
      advance_amount: Number(body.advance_amount || 0),
      advance_label: body.advance_label || "Already Paid / Advance",
      quote_date: body.quote_date ? new Date(body.quote_date) : new Date(),
      client_name: (body.client_name || "").trim(),
      organization_name: (body.organization_name || "").trim(),
      address: (body.address || "").trim(),
      phone: (body.phone || "").trim(),
      email: (body.email || "").trim(),
      subject: (body.subject || "").trim(),
      software_columns: body.software_columns || [],
      software_rows: body.software_rows || [],
      software_amount: Number(body.software_amount || 0),
      plan_name: body.plan_name || "",
      billing_cycle: body.billing_cycle || "",
      license_fee_title: body.license_fee_title || "",
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
      company_signatory_title: body.company_signatory_title || "CEO | Okobiz",
      company_phone: body.company_phone || "+880 1973590937",
      company_email: body.company_email || "info@okobiz.com",
      status: body.status || "SENT",
      updated_at: new Date(),
    };

    let updatedDoc: any = null;

    // Update MongoDB with upsert so it never fails even if document was only in local store
    if (db) {
      try {
        const queryOr: any[] = [{ _id: decodedId }, { ref_no: decodedId }];
        if (body.id && body.id !== decodedId) {
          queryOr.push({ _id: body.id });
        }

        const res = await Quotation.findOneAndUpdate(
          { $or: queryOr },
          { $set: updateData },
          { new: true, upsert: true }
        ).lean();
        if (res) updatedDoc = res;
      } catch (dbErr: any) {
        console.warn("MongoDB PUT quotation error:", dbErr.message);
      }
    }

    // Update local dataStore
    const storeIdx = store.quotations.findIndex(
      (q: any) =>
        String(q._id) === decodedId ||
        String(q.id) === decodedId ||
        q.ref_no === decodedId ||
        (body.ref_no && q.ref_no === body.ref_no)
    );
    if (storeIdx !== -1) {
      store.quotations[storeIdx] = {
        ...store.quotations[storeIdx],
        ...updateData,
        _id: store.quotations[storeIdx]._id || decodedId,
      };
      if (!updatedDoc) updatedDoc = store.quotations[storeIdx];
      saveDatastore(store);
    } else {
      const fallbackObj = { _id: decodedId, ...updateData };
      store.quotations.unshift(fallbackObj);
      saveDatastore(store);
      if (!updatedDoc) updatedDoc = fallbackObj;
    }

    return NextResponse.json({
      success: true,
      data: updatedDoc,
      message: "Quotation updated successfully",
    });
  } catch (error: any) {
    console.error("PUT /api/quotations/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update quotation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const decodedId = decodeURIComponent(id).trim();
    const body = await req.json();
    const store = getDataStore();
    if (!store.quotations) store.quotations = [];

    const patchData: any = {
      ...body,
      updated_at: new Date(),
    };

    let updatedDoc: any = null;

    // Update MongoDB
    const db = await connectDB();
    if (db) {
      try {
        const queryOr: any[] = [{ _id: decodedId }, { ref_no: decodedId }];
        if (body.ref_no) queryOr.push({ ref_no: body.ref_no });
        if (body.id) queryOr.push({ _id: body.id });

        const res = await Quotation.findOneAndUpdate(
          { $or: queryOr },
          { $set: patchData },
          { new: true, upsert: true }
        ).lean();
        if (res) updatedDoc = res;
      } catch (dbErr: any) {
        console.warn("MongoDB PATCH quotation error:", dbErr.message);
      }
    }

    // Update local dataStore
    const storeIdx = store.quotations.findIndex(
      (q: any) =>
        String(q._id) === decodedId ||
        String(q.id) === decodedId ||
        q.ref_no === decodedId ||
        (body.ref_no && q.ref_no === body.ref_no)
    );
    if (storeIdx !== -1) {
      store.quotations[storeIdx] = {
        ...store.quotations[storeIdx],
        ...patchData,
      };
      if (!updatedDoc) updatedDoc = store.quotations[storeIdx];
      saveDatastore(store);
    } else {
      const fallbackObj = { _id: decodedId, ...patchData };
      store.quotations.unshift(fallbackObj);
      saveDatastore(store);
      if (!updatedDoc) updatedDoc = fallbackObj;
    }

    return NextResponse.json({
      success: true,
      data: updatedDoc,
      message: "Quotation updated successfully",
    });
  } catch (error: any) {
    console.error("PATCH /api/quotations/[id] error:", error);
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

    const decodedId = decodeURIComponent(id).trim();
    const store = getDataStore();
    if (!store.quotations) store.quotations = [];

    let deletedDoc: any = store.quotations.find(
      (q: any) =>
        String(q._id) === decodedId ||
        String(q.id) === decodedId ||
        q.ref_no === decodedId
    );

    // Remove from MongoDB
    const db = await connectDB();
    if (db) {
      try {
        const removed = await Quotation.findOneAndDelete({
          $or: [{ _id: decodedId }, { ref_no: decodedId }],
        }).lean();
        if (removed) deletedDoc = removed;
      } catch (dbErr: any) {
        console.warn("MongoDB DELETE quotation error:", dbErr.message);
      }
    }

    // Remove from local dataStore
    store.quotations = store.quotations.filter(
      (q: any) =>
        String(q._id) !== decodedId &&
        String(q.id) !== decodedId &&
        q.ref_no !== decodedId
    );

    // If this was a revision whose parent has no other remaining children, unlock the parent
    const parentId = deletedDoc?.parent_id ? String(deletedDoc.parent_id) : null;
    if (parentId) {
      const hasSibling = store.quotations.some(
        (q: any) => q?.parent_id && String(q.parent_id) === parentId
      );
      let dbSiblingExists = false;
      if (db) {
        try {
          dbSiblingExists = Boolean(await Quotation.exists({ parent_id: parentId }));
        } catch {}
      }

      if (!hasSibling && !dbSiblingExists) {
        const pIdx = store.quotations.findIndex(
          (q: any) => String(q._id) === parentId || String(q.id) === parentId
        );
        if (pIdx !== -1) {
          store.quotations[pIdx] = {
            ...store.quotations[pIdx],
            is_revised: false,
            revised_to_id: null,
          };
        }
        if (db) {
          try {
            await Quotation.findOneAndUpdate(
              { $or: [{ _id: parentId }, { ref_no: parentId }] },
              { $set: { is_revised: false, revised_to_id: null } }
            );
          } catch {}
        }
      }
    }

    saveDatastore(store);

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
