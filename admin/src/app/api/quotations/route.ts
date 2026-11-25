import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import Quotation from "@/models/Quotation";
import {
  computeSupersededIds,
  getDocId,
  matchesDocumentSearch,
  parseRevisionRef,
} from "@/lib/quotation-revisions";

export const dynamic = "force-dynamic";

function generateNextRefNoFromDocs(docs: any[], docType: string = "QUOTATION"): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const month = monthNames[now.getMonth()];

  const sameTypeDocs = docs.filter((q) =>
    docType === "BILL" ? q?.doc_type === "BILL" : q?.doc_type !== "BILL"
  );

  // Exclude revisions (-R1, -R2, ...) when counting unique base quotations/bills
  const baseDocsCount = sameTypeDocs.filter((q) => {
    if (q?.parent_id) return false;
    const { revNumber } = parseRevisionRef(q?.ref_no || "");
    return revNumber === 0;
  }).length;

  const existingRefs = new Set(
    sameTypeDocs.map((q) => String(q?.ref_no || "").trim().toLowerCase())
  );

  let seq = baseDocsCount + 1;
  while (true) {
    const sequence = String(seq).padStart(3, "0");
    const candidate =
      docType === "BILL"
        ? `okobiz/bill/${month}/${sequence}/${year}`
        : `okobiz/bizpos/${sequence}/${day}/${year}`;
    if (!existingRefs.has(candidate.toLowerCase())) {
      return candidate;
    }
    seq += 1;
  }
}

function sortByCreatedDesc(list: any[]): any[] {
  return [...list].sort(
    (a, b) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime()
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const status = searchParams.get("status") || "";
    const docType = (searchParams.get("doc_type") || "").toUpperCase();

    const store = getDataStore();
    if (!Array.isArray(store.quotations)) store.quotations = [];

    let allDocsInSystem: any[] = [];

    const db = await connectDB();
    if (db) {
      try {
        // Bi-directional sync: ensure any local store quotations are in MongoDB
        if (store.quotations.length > 0) {
          for (const localQ of store.quotations) {
            const exists = await Quotation.findOne({
              $or: [{ _id: localQ._id }, { ref_no: localQ.ref_no }],
            }).lean();
            if (!exists) {
              await Quotation.create(localQ).catch(() => {});
            }
          }
        }

        allDocsInSystem = await Quotation.find({}).sort({ created_at: -1 }).lean();

        if (allDocsInSystem.length > 0) {
          store.quotations = allDocsInSystem;
          saveDatastore(store);
        }
      } catch (dbErr: any) {
        console.warn("MongoDB GET quotations error:", dbErr.message);
      }
    }

    // Fallback to dataStore if DB returned empty or connection failed
    if (allDocsInSystem.length === 0 && Array.isArray(store.quotations)) {
      allDocsInSystem = sortByCreatedDesc(store.quotations);
    }

    const allTypeDocs = allDocsInSystem.filter((q: any) => {
      if (!docType) return true;
      return docType === "BILL" ? q.doc_type === "BILL" : q.doc_type !== "BILL";
    });

    // Compute superseded status across the full doc_type dataset before search/status filtering
    const supersededIds = computeSupersededIds(allTypeDocs);

    const enrichedDocs = allTypeDocs.map((doc) => ({
      ...doc,
      is_revised: Boolean(doc.is_revised) || supersededIds.has(getDocId(doc)),
    }));

    const filteredList = enrichedDocs.filter((q: any) => {
      const matchStatus = !status || status === "ALL" || q.status === status;
      const matchSearch = matchesDocumentSearch(q, search);
      return matchStatus && matchSearch;
    });

    const nextRefNo = generateNextRefNoFromDocs(allDocsInSystem, "QUOTATION");
    const nextBillRefNo = generateNextRefNoFromDocs(allDocsInSystem, "BILL");

    return NextResponse.json({
      success: true,
      data: filteredList,
      nextRefNo,
      nextBillRefNo,
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

    const doc_type = body.doc_type || "QUOTATION";
    const db = await connectDB();

    // Load current docs to validate uniqueness and parent revision state
    let existingDocs: any[] = store.quotations;
    if (db) {
      try {
        existingDocs = await Quotation.find({}).lean();
      } catch (dbErr: any) {
        console.warn("MongoDB read during POST quotation:", dbErr.message);
      }
    }

    let ref_no = (body.ref_no || "").trim();
    if (!ref_no) {
      ref_no = generateNextRefNoFromDocs(existingDocs, doc_type);
    }

    // Prevent overwriting an existing record on duplicate ref_no
    const duplicateRef = existingDocs.find(
      (q: any) => String(q?.ref_no || "").trim().toLowerCase() === ref_no.toLowerCase()
    );
    if (duplicateRef) {
      return NextResponse.json(
        {
          success: false,
          message: `A document with Reference No. "${ref_no}" already exists.`,
        },
        { status: 409 }
      );
    }

    const parentId = body.parent_id ? String(body.parent_id).trim() : null;
    if (parentId) {
      const parentDoc = existingDocs.find(
        (q: any) => getDocId(q) === parentId || q.ref_no === parentId
      );
      const alreadyHasChild = existingDocs.some(
        (q: any) => q?.parent_id && String(q.parent_id) === parentId
      );
      if (parentDoc?.is_revised || alreadyHasChild) {
        return NextResponse.json(
          {
            success: false,
            message: "This version has already been revised. Please revise the latest version.",
          },
          { status: 409 }
        );
      }
    }

    const { baseRef, revNumber } = parseRevisionRef(ref_no);
    let newId = "quote-" + Date.now();
    while (existingDocs.some((q: any) => String(q?._id) === newId)) {
      newId = `quote-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const newQuotation = {
      _id: newId,
      ref_no,
      doc_type,
      parent_id: parentId,
      root_ref_no: (body.root_ref_no || baseRef || ref_no).trim(),
      revision_number:
        body.revision_number !== undefined ? Number(body.revision_number) : revNumber,
      is_revised: false,
      revised_to_id: null,
      quote_date: body.quote_date ? new Date(body.quote_date) : new Date(),
      client_name: (body.client_name || "").trim() || "Valued Client",
      organization_name: (body.organization_name || "").trim(),
      address: (body.address || "").trim(),
      phone: (body.phone || "").trim(),
      email: (body.email || "").trim(),
      subject:
        (body.subject || "").trim() ||
        (doc_type === "BILL"
          ? "Due Bill for Web & Software Solution"
          : "Quotation for Web & Software Solution"),
      bill_rows: body.bill_rows || [],
      sub_total: Number(body.sub_total || 0),
      has_advance_payment: Boolean(body.has_advance_payment),
      advance_amount: Number(body.advance_amount || 0),
      advance_label: body.advance_label || "Already Paid / Advance",
      software_columns: body.software_columns || [],
      software_rows: body.software_rows || [],
      software_amount: Number(body.software_amount || 0),
      plan_name: body.plan_name || "",
      billing_cycle: body.billing_cycle || "",
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
      company_signatory_title: body.company_signatory_title || "CEO | Okobiz",
      company_phone: body.company_phone || "+880 1973590937",
      company_email: body.company_email || "info@okobiz.com",
      status: body.status || "SENT",
      email_sent_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Save to local store and lock parent if revising
    store.quotations.unshift(newQuotation);
    if (parentId) {
      const parentIdx = store.quotations.findIndex(
        (q: any) => getDocId(q) === parentId || q.ref_no === parentId
      );
      if (parentIdx !== -1) {
        store.quotations[parentIdx] = {
          ...store.quotations[parentIdx],
          is_revised: true,
          revised_to_id: newQuotation._id,
          updated_at: new Date(),
        };
      }
    }
    saveDatastore(store);

    let createdDoc: any = newQuotation;

    // Save to MongoDB and mark parent revised
    if (db) {
      try {
        const created = await Quotation.create(newQuotation);
        if (created) {
          createdDoc = created.toObject ? created.toObject() : created;
        }
        if (parentId) {
          await Quotation.findOneAndUpdate(
            { $or: [{ _id: parentId }, { ref_no: parentId }] },
            {
              $set: {
                is_revised: true,
                revised_to_id: newQuotation._id,
                updated_at: new Date(),
              },
            }
          );
        }
      } catch (dbErr: any) {
        console.warn("MongoDB Quotation create error:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: createdDoc,
    });
  } catch (error: any) {
    console.error("POST /api/quotations error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create quotation" },
      { status: 500 }
    );
  }
}
