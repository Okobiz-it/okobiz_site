"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QuotationForm } from "@/components/quotation/quotation-form";
import { BillForm } from "@/components/quotation/bill-form";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/quotations/${params.id}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
        } else {
          setError(resData.message || "Failed to load quotation");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-[#0167D6] mb-2" />
        <p className="text-sm font-medium">Loading quotation details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h2 className="text-lg font-bold text-red-600 mb-2">Error Loading Quotation</h2>
        <p className="text-sm text-slate-600 mb-4">{error || "Quotation not found"}</p>
        <Button onClick={() => router.push("/dashboard/quotations")}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Quotations
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {data.doc_type === "BILL" ? (
        <BillForm initialData={data} isEdit={true} />
      ) : (
        <QuotationForm initialData={data} isEdit={true} />
      )}
    </div>
  );
}

