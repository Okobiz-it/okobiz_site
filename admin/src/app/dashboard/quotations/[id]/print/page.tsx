"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { QuotationPrintSheet } from "@/components/quotation/quotation-print-sheet";
import { BillPrintSheet } from "@/components/quotation/bill-print-sheet";
import { Button } from "@/components/ui/button";
import { Printer, Download, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";
import { exportQuotationToPdf } from "@/lib/pdf-download";

export default function QuotationPrintPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [paginationReady, setPaginationReady] = useState(false);
  const printSheetRef = useRef<HTMLDivElement>(null);

  const quoteId = params.id as string;

  useEffect(() => {
    if (!quoteId) return;
    fetch(`/api/quotations/${quoteId}`)
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

  const handleDirectDownload = async () => {
    if (!printSheetRef.current || !data) return;
    setIsDownloading(true);
    await waitForPaginationReady();
    const toastId = toast.loading("Generating pristine PDF for direct download...");

    try {
      const isBill = data.doc_type === "BILL";
      const cleanRefNo = (data.ref_no || (isBill ? "bill" : "quotation")).replace(/[^a-zA-Z0-9_-]/g, "_");
      await exportQuotationToPdf(printSheetRef.current, `${isBill ? "Bill" : "Quotation"}_${cleanRefNo}.pdf`);
      toast.dismiss(toastId);
      toast.success("PDF downloaded successfully!");
    } catch (err: any) {
      console.error("Direct download error:", err);
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to download PDF. Try using Print.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!data?.email) {
      toast.error("Client email is missing in this quotation");
      return;
    }

    setIsSendingEmail(true);
    const toastId = toast.loading(`Sending official PDF to ${data.email}...`);

    try {
      const res = await fetch(`/api/quotations/${quoteId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const result = await res.json();
      toast.dismiss(toastId);

      if (result.success) {
        toast.success(`Quotation successfully dispatched to ${data.email}`);
      } else {
        toast.error(result.message || "Failed to send email");
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
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
    <div className="w-full min-h-full bg-slate-100 dark:bg-slate-950 pb-16 print:bg-white print:p-0 print:pb-0">
      {/* Non-printable Floating Top Action Bar - Flush to Header */}
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
              variant="outline"
              size="sm"
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="flex items-center gap-1.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
            >
              {isSendingEmail ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
              {isSendingEmail ? "Sending..." : "Email to Client"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDirectDownload}
              disabled={isDownloading || !paginationReady}
              className="flex items-center gap-1.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-100 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isDownloading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              )}
              {isDownloading
                ? "Downloading..."
                : !paginationReady
                ? "Paginating..."
                : "Direct Download PDF"}
            </Button>

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

