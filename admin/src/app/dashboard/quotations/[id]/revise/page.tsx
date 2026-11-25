"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QuotationForm } from "@/components/quotation/quotation-form";
import { BillForm } from "@/components/quotation/bill-form";
import { RefreshCw, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDocId, getNextRevisionRefNo } from "@/lib/quotation-revisions";

export default function ReviseQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const [sourceDoc, setSourceDoc] = useState<any>(null);
  const [revisedData, setRevisedData] = useState<any>(null);
  const [alreadyRevised, setAlreadyRevised] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rawId = params.id as string;
  const quoteId = rawId ? decodeURIComponent(rawId).trim() : "";

  useEffect(() => {
    if (!quoteId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/quotations/${encodeURIComponent(quoteId)}`)
      .then((res) => res.json())
      .then(async (resData) => {
        if (!resData.success || !resData.data) {
          setError(resData.message || "Failed to load document details");
          return;
        }

        const doc = resData.data;
        setSourceDoc(doc);

        const docType = doc.doc_type === "BILL" ? "BILL" : "QUOTATION";
        let sameTypeDocs: any[] = [];
        try {
          const listRes = await fetch(`/api/quotations?doc_type=${docType}`);
          const listJson = await listRes.json();
          if (listJson.success && Array.isArray(listJson.data)) {
            sameTypeDocs = listJson.data;
          }
        } catch {}

        const docId = getDocId(doc);
        const matchedInList = sameTypeDocs.find((item) => getDocId(item) === docId);
        const isSuperseded = Boolean(doc.is_revised || matchedInList?.is_revised);

        if (isSuperseded) {
          setAlreadyRevised(true);
          return;
        }

        const nextRefNo = getNextRevisionRefNo(doc.ref_no || "", sameTypeDocs);
        const todayYmd = new Date().toISOString().split("T")[0];

        // Prepare clean revision seed copying all domain details with the new -R{n} reference
        setRevisedData({
          ...doc,
          _id: undefined,
          id: undefined,
          is_revised: false,
          revised_to_id: null,
          parent_id: docId,
          ref_no: nextRefNo,
          quote_date: todayYmd,
        });
      })
      .catch((err) => {
        setError(err.message || "Failed to load document for revision");
      })
      .finally(() => setLoading(false));
  }, [quoteId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-[#0167D6] mb-2" />
        <p className="text-sm font-medium">Preparing revision...</p>
      </div>
    );
  }

  if (error || !sourceDoc) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h2 className="text-lg font-bold text-red-600 mb-2">Error Loading Document</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error || "Document not found"}</p>
        <Button onClick={() => router.push("/dashboard/quotations")}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Quotations
        </Button>
      </div>
    );
  }

  const isBill = sourceDoc.doc_type === "BILL";
  const backUrl = isBill ? "/dashboard/quotations/manage-bills" : "/dashboard/quotations";

  if (alreadyRevised || !revisedData) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Revision Already Created
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{sourceDoc.ref_no}</span>{" "}
          has already been revised. You can only revise the latest version in the list.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => router.push(backUrl)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to List
          </Button>
          {sourceDoc.revised_to_id && (
            <Button
              onClick={() =>
                router.push(`/dashboard/quotations/${encodeURIComponent(sourceDoc.revised_to_id)}/revise`)
              }
              className="bg-[#0167D6] hover:bg-blue-700 text-white"
            >
              Open Revised Version
            </Button>
          )}
        </div>
      </div>
    );
  }

  const sourceId = getDocId(sourceDoc);

  return (
    <div className="w-full">
      {isBill ? (
        <BillForm
          initialData={revisedData}
          reviseFromId={sourceId}
          sourceRefNo={sourceDoc.ref_no}
        />
      ) : (
        <QuotationForm
          initialData={revisedData}
          reviseFromId={sourceId}
          sourceRefNo={sourceDoc.ref_no}
        />
      )}
    </div>
  );
}
