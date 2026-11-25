"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { QuotationPrintSheet } from "@/components/quotation/quotation-print-sheet";
import { BillPrintSheet } from "@/components/quotation/bill-print-sheet";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";

export default function QuotationPrintPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paginationReady, setPaginationReady] = useState(false);
  const printSheetRef = useRef<HTMLDivElement>(null);

  const rawQuoteId = params.id as string;
  const quoteId = rawQuoteId ? decodeURIComponent(rawQuoteId).trim() : "";

  useEffect(() => {
    if (!quoteId) return;
    fetch(`/api/quotations/${encodeURIComponent(quoteId)}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
        } else {
          toast.error("Failed to load quotation data");
        }
      })
      .catch(() => toast.error("Error fetching quotation"))
      .finally(() => setLoading(false));
  }, [quoteId]);

  // Monitor when closed-loop measured pagination completes
  useEffect(() => {
    if (!data) return;
    const checkReady = () => {
      if (printSheetRef.current?.querySelector('[data-pagination-ready="true"]')) {
        setPaginationReady(true);
        return true;
      }
      return false;
    };

    if (checkReady()) return;
    const interval = setInterval(() => {
      if (checkReady()) {
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [data]);

  const waitForPaginationReady = async () => {
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    if (!printSheetRef.current) return;
    if (printSheetRef.current.querySelector('[data-pagination-ready="true"]')) {
      return;
    }

    const start = Date.now();
    while (Date.now() - start < 2500) {
      await new Promise((r) => setTimeout(r, 60));
      if (printSheetRef.current.querySelector('[data-pagination-ready="true"]')) {
        setPaginationReady(true);
        return;
      }
    }
  };

  const handlePrint = async () => {
    await waitForPaginationReady();
    toast.info("In Destination, select 'Save as PDF' to save a pristine vector PDF.");
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-[#0167D6] mb-2" />
        <p className="text-sm font-medium">Preparing document for print...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h2 className="text-lg font-bold text-red-600 mb-2">Document Not Found</h2>
        <Button onClick={() => router.push("/dashboard/quotations")}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Quotations
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black/90 pb-16 print:p-0 print:m-0 print:bg-white print:dark:bg-white print:min-h-0">
      {/* Top Floating Action Bar */}
      <div className="no-print sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 shadow-sm">
        <div className="max-w-[850px] mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(data.doc_type === "BILL" ? "/dashboard/quotations/manage-bills" : "/dashboard/quotations")}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> {data.doc_type === "BILL" ? "Back to Bills" : "Back to Quotations"}
          </Button>

          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              onClick={handlePrint}
              disabled={!paginationReady}
              className="bg-[#0167D6] hover:bg-blue-700 text-white flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
            >
              <Printer className="w-4 h-4" />{" "}
              {!paginationReady ? "Paginating..." : "Print / Save PDF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="pt-6 px-4 print:p-0 print:px-0 print:m-0 print:mx-0 flex justify-center print:block print:w-full print:max-w-full">
        <div ref={printSheetRef} className="w-full flex justify-center print:block print:w-full print:max-w-full print:p-0 print:m-0">
          {data.doc_type === "BILL" ? (
            <BillPrintSheet data={data} />
          ) : (
            <QuotationPrintSheet data={data} />
          )}
        </div>
      </div>
    </div>
  );
}
