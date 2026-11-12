"use client";

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { format } from "@/lib/date";
import {
  OkobizHeaderBanner,
  OkobizWatermark,
  OkobizFooterBanner,
} from "./okobiz-letterhead-page";
import { numberToWords } from "@/lib/number-to-words";
import { QUOTATION_CSS } from "./quotation-print-sheet";
import { createSandbox, nextFrame } from "@/lib/quotation-paginator";

export interface BillRow {
  sl?: number | string;
  expense_head: string;
  amount: number | string;
}

export interface BillPrintData {
  id?: string;
  _id?: string;
  ref_no?: string;
  quote_date?: string | Date;
  client_name?: string;
  organization_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  subject?: string;
  bill_rows?: BillRow[];
  software_rows?: any[];
  sub_total?: number;
  has_advance_payment?: boolean;
  advance_amount?: number;
  advance_label?: string;
  grand_total?: number;
  software_amount?: number;
  in_words?: string;
  additional_notes?: string;
  company_phone?: string;
  company_email?: string;
}

export interface BillPageModel {
  pageNumber: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  rows: BillRow[];
  globalStartIdx: number;
}

export const formatBillPrice = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === "") return "0/-";
  const num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.-]/g, "")) : val;
  if (isNaN(num)) return String(val);
  return num.toLocaleString("en-IN") + "/-";
};

// ─────────────────────────────────────────────────────────────
// SHARED BILL PAGE SHELL COMPONENT
// - Both real render and sandbox measurement use this exact component!
// ─────────────────────────────────────────────────────────────
interface BillPageShellProps {
  data: BillPrintData;
  formattedDate: string;
  subTotal: number;
  grandTotal: number;
  inWordsDisplay: string;
  page: BillPageModel;
  measureMode?: boolean;
}

export const BillPageShell: React.FC<BillPageShellProps> = ({
  data,
  formattedDate,
  subTotal,
  grandTotal,
  inWordsDisplay,
  page,
  measureMode = false,
}) => {
  const hasAdvance = Boolean(
    data.has_advance_payment && Number(data.advance_amount || 0) > 0
  );
  const advanceAmount = Number(data.advance_amount || 0);
  const advanceLabel = data.advance_label?.trim() || "Already Paid / Advance";
  const effectiveSubTotal =
    subTotal !== undefined && !isNaN(subTotal) && subTotal > 0
      ? subTotal
      : hasAdvance
      ? grandTotal + advanceAmount
      : grandTotal;
  return (
    <section
      className="quotation-page relative bg-white border border-zinc-200 print:border-none p-0 mb-8 print:mb-0 shadow-sm print:shadow-none w-[210mm] max-w-[210mm] print:w-full print:max-w-full print:m-0 print:mx-0 flex flex-col justify-between overflow-hidden rounded-none"
      style={{
        minHeight: "var(--q-page-h, 296.2mm)",
        height: "var(--q-page-h, 296.2mm)",
        maxHeight: "var(--q-page-h, 296.2mm)",
        pageBreakAfter: page.isLastPage ? "auto" : "always",
        breakAfter: page.isLastPage ? "auto" : "page",
      }}
    >
      {/* Official Okobiz Watermark */}
      <OkobizWatermark />

      {/* Official Header Banner */}
      <OkobizHeaderBanner />

      {/* Content Body */}
      <div
        className="quotation-page-body flex-1 flex flex-col px-[12mm] pb-[8px] print:px-[12mm] print:pb-[8px] relative z-10 bg-transparent"
        style={measureMode ? { overflow: "hidden" } : undefined}
      >
        {/* Header on Page 1 */}
        {page.isFirstPage ? (
          <div className="first-page-header shrink-0 mb-2">
            <div className="flex justify-between items-start text-[13px] font-semibold mb-2.5">
              <div>Date: {formattedDate}</div>
              {data.ref_no && (
                <div className="text-right">
                  <span>Ref. No. </span>
                  <span className="font-bold text-[#1E65B8]">{data.ref_no}</span>
                </div>
              )}
            </div>

            <div className="text-[12px] leading-snug mb-2">
              <div className="font-semibold mb-0.5">To</div>
              {data.client_name && <div className="font-bold text-zinc-900">{data.client_name}</div>}
              {data.organization_name && (
                <div className="text-zinc-800 font-medium">{data.organization_name}</div>
              )}
              {data.address && <div className="text-zinc-600">Location: {data.address}</div>}
              {data.phone && <div className="text-zinc-600">Cell: {data.phone}</div>}
              {data.email && <div className="text-zinc-600">Email: {data.email}</div>}
            </div>

            <div className="text-[13.8px] print:text-[13.8px] font-bold text-zinc-900 mb-3 pb-1 border-b border-zinc-200">
              <span>Sub: </span>
              <span className="underline">{data.subject || "Due Bill for Web & Software Solution"}</span>
            </div>
          </div>
        ) : (
          /* Continuation Header on subsequent pages */
          <div className="continuation-header flex justify-between items-center text-xs font-semibold mb-3.5 pb-1 border-b border-zinc-200 shrink-0">
            <span className="font-bold text-zinc-800">
              Expense Head &amp; Amount (Continued)
            </span>
            <div className="text-right text-zinc-600">
              <span>Ref. No. </span>
              <span className="font-bold text-[#1E65B8]">{data.ref_no}</span>
            </div>
          </div>
        )}

        {/* Bill Table */}
        <div className="quotation-table-wrapper shrink-0 mb-2">
          <div className="border border-zinc-900 overflow-hidden bg-transparent">
            <table
              className="quotation-table w-full text-[12.5px] border-collapse bg-transparent shrink-0"
              style={{ tableLayout: "fixed" }}
            >
              <thead>
                <tr
                  className="bg-[#1E65B8] !text-white font-bold border-b border-zinc-900 print:bg-[#1E65B8] print:text-white"
                  style={{ backgroundColor: "#1E65B8", color: "#ffffff" }}
                >
                  <th
                    style={{ width: "8%", backgroundColor: "#1E65B8", color: "#ffffff" }}
                    className="quotation-th py-2 px-2 text-center text-[12.5px] font-bold uppercase tracking-wider border-r border-white/50 text-white-always !text-white"
                  >
                    <span className="text-white-always !text-white font-bold">SL</span>
                  </th>
                  <th
                    style={{ width: "68%", backgroundColor: "#1E65B8", color: "#ffffff" }}
                    className="quotation-th py-2 px-3 text-left text-[12.5px] font-bold uppercase tracking-wider border-r border-white/50 text-white-always !text-white"
                  >
                    <span className="text-white-always !text-white font-bold">EXPENSE HEAD</span>
                  </th>
                  <th
                    style={{ width: "24%", backgroundColor: "#1E65B8", color: "#ffffff" }}
                    className="quotation-th py-2 px-2 text-center text-[12.5px] font-bold uppercase tracking-wider text-white-always !text-white"
                  >
                    <span className="text-white-always !text-white font-bold">AMOUNT</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-400 bg-transparent">
                {page.rows.map((row, index) => {
                  const slDisplay = row.sl || page.globalStartIdx + index + 1;
                  return (
                    <tr key={index} className="bg-transparent align-top">
                      <td className="py-2 px-2 text-center text-zinc-900 font-semibold border-r border-zinc-900 align-top">
                        {slDisplay}
                      </td>
                      <td className="py-2 px-3 text-left text-zinc-900 font-medium border-r border-zinc-900 whitespace-pre-line leading-snug align-top">
                        {row.expense_head}
                      </td>
                      <td className="py-2 px-2 text-center text-zinc-900 font-semibold align-top">
                        Tk. {formatBillPrice(row.amount)}
                      </td>
                    </tr>
                  );
                })}

                {/* Total & Advance Payment Breakdown (Only on final page) */}
                {page.isLastPage && (
                  hasAdvance ? (
                    <>
                      {/* 1. Subtotal / Total Amount before deduction */}
                      <tr className="border-t-2 border-zinc-900 bg-zinc-50/70 font-bold">
                        <td
                          colSpan={2}
                          className="py-1.5 px-3 text-center text-zinc-900 font-bold border-r border-zinc-900 tracking-wider text-[12.5px]"
                        >
                          Total Amount
                        </td>
                        <td className="py-1.5 px-2 text-center text-zinc-900 font-bold text-[12.5px]">
                          Tk. {formatBillPrice(effectiveSubTotal)}
                        </td>
                      </tr>

                      {/* 2. Less: Already Paid / Advance Amount (Green Color) */}
                      <tr className="border-t border-zinc-400 bg-emerald-50/30 font-bold">
                        <td
                          colSpan={2}
                          className="py-1.5 px-3 text-center font-bold border-r border-zinc-900 tracking-wider text-[12.5px]"
                          style={{ color: "#047857" }}
                        >
                          {advanceLabel}
                        </td>
                        <td
                          className="py-1.5 px-2 text-center font-bold text-[12.5px]"
                          style={{ color: "#059669" }}
                        >
                          Tk. {formatBillPrice(advanceAmount)}
                        </td>
                      </tr>

                      {/* 3. Net Payable Total Due Amount */}
                      <tr className="border-t-2 border-zinc-900 bg-zinc-100 font-bold">
                        <td
                          colSpan={2}
                          className="py-2 px-3 text-center text-zinc-950 font-bold border-r border-zinc-900 tracking-wider uppercase text-[12.5px]"
                        >
                          Total Due Amount
                        </td>
                        <td className="py-2 px-2 text-center text-zinc-950 font-extrabold text-[13px]">
                          Tk. {formatBillPrice(grandTotal)}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr className="border-t-2 border-zinc-900 bg-zinc-50/60 font-bold">
                      <td
                        colSpan={2}
                        className="py-2 px-3 text-center text-zinc-900 font-bold border-r border-zinc-900 tracking-wider"
                      >
                        Total Amount
                      </td>
                      <td className="py-2 px-2 text-center text-zinc-900 font-bold">
                        Tk. {formatBillPrice(grandTotal)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Scope Continues Note (if not last page) */}
          {!page.isLastPage && (
            <div className="table-continues-note text-[10px] text-zinc-500 font-semibold italic text-right mt-1 pb-1 shrink-0">
              Expense items continue on next page →
            </div>
          )}
        </div>

        {/* In Words & Bottom-Left Closing Block (Only on final page) */}
        {page.isLastPage && (
          <>
            <div className="text-[13px] font-bold text-zinc-900 mt-2 shrink-0">
              In Words: {inWordsDisplay.endsWith(".") ? inWordsDisplay : `${inWordsDisplay}.`}
            </div>

            {/* BOTTOM LEFT CLOSING BLOCK (Exact dark bold typography) */}
            <div className="mt-auto pt-6 pb-2 text-left select-none shrink-0">
              <p className="text-[14px] font-bold text-zinc-950 dark:text-black mb-3" style={{ color: "#09090b" }}>
                Please pay the bill.
              </p>
              <p className="text-[14px] font-extrabold text-zinc-950 dark:text-black mb-3" style={{ color: "#09090b" }}>
                Thank you
              </p>
              <p className="text-[14px] font-extrabold text-zinc-950 dark:text-black leading-snug" style={{ color: "#09090b" }}>
                Admin &amp; Accounts
              </p>
              <p className="text-[13.5px] font-bold text-zinc-900 dark:text-black leading-snug" style={{ color: "#09090b" }}>
                Okobiz
              </p>
            </div>
          </>
        )}
      </div>

      {/* Official Okobiz Footer Banner */}
      <OkobizFooterBanner phone={data.company_phone} email={data.company_email} />
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// CALIBRATED SYNCHRONOUS INITIALIZER
// Provides instant zero-layout-shift SSR and initial paint
// ─────────────────────────────────────────────────────────────
export function buildBillPagesSync(allRows: BillRow[], hasAdvance: boolean = false): BillPageModel[] {
  if (allRows.length === 0) {
    return [
      {
        pageNumber: 1,
        isFirstPage: true,
        isLastPage: true,
        rows: [],
        globalStartIdx: 0,
      },
    ];
  }

  // If <= 17 rows (or 15 with advance breakdown), fits on 1 page completely with total + closing block
  const maxFirstFinal = hasAdvance ? 15 : 17;
  if (allRows.length <= maxFirstFinal) {
    return [
      {
        pageNumber: 1,
        isFirstPage: true,
        isLastPage: true,
        rows: allRows,
        globalStartIdx: 0,
      },
    ];
  }

  const pages: BillPageModel[] = [];
  let remaining = [...allRows];
  let pageNumber = 1;
  let globalStartIdx = 0;

  while (remaining.length > 0) {
    const isFirstPage = pageNumber === 1;

    // Check if remaining rows fit on this page as final page
    const maxOnFinalPage = isFirstPage ? maxFirstFinal : (hasAdvance ? 18 : 20);
    if (remaining.length <= maxOnFinalPage) {
      pages.push({
        pageNumber,
        isFirstPage,
        isLastPage: true,
        rows: remaining,
        globalStartIdx,
      });
      break;
    }

    // Otherwise, pack maximum rows for non-final page
    const maxNonFinal = isFirstPage ? 22 : 25;
    const count = Math.min(remaining.length, maxNonFinal);
    const pageRows = remaining.slice(0, count);
    remaining = remaining.slice(count);

    pages.push({
      pageNumber: pageNumber++,
      isFirstPage,
      isLastPage: false,
      rows: pageRows,
      globalStartIdx,
    });
    globalStartIdx += count;
  }

  return pages;
}

// ─────────────────────────────────────────────────────────────
// REAL CLOSED-LOOP MEASURED PAGINATION ENGINE FOR BILLS
// - Measures real rendered DOM heights in a 210mm isolated sandbox
// - Binary-searches the maximum number of rows that fit without overflowing
// - Eliminates bottom gaps: fills every page right down to the 8px padding!
// ─────────────────────────────────────────────────────────────
export async function paginateBillMeasured(
  data: BillPrintData,
  allRows: BillRow[]
): Promise<BillPageModel[]> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return buildBillPagesSync(allRows, Boolean(data.has_advance_payment && Number(data.advance_amount || 0) > 0));
  }

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const sandbox = createSandbox();
  const host = document.createElement("div");
  sandbox.root.appendChild(host);
  const reactRoot = createRoot(host);

  try {
    const formattedDate = data.quote_date
      ? format(new Date(data.quote_date), "d MMM yyyy")
      : format(new Date(), "d MMM yyyy");

    const subTotal =
      data.sub_total !== undefined && data.sub_total !== null && !isNaN(Number(data.sub_total))
        ? Number(data.sub_total)
        : allRows.reduce((sum, r) => {
            const val = typeof r.amount === "string" ? parseFloat(r.amount.replace(/[^0-9.-]/g, "")) : r.amount;
            return sum + (isNaN(val) ? 0 : val);
          }, 0);

    const hasAdvance = Boolean(
      data.has_advance_payment && Number(data.advance_amount || 0) > 0
    );
    const advanceAmount = Number(data.advance_amount || 0);

    const grandTotal =
      data.grand_total !== undefined && data.grand_total !== null && !isNaN(Number(data.grand_total))
        ? Number(data.grand_total)
        : Math.max(0, subTotal - (hasAdvance ? advanceAmount : 0));

    const inWordsDisplay =
      data.in_words && data.in_words.trim().length > 0
        ? data.in_words
        : numberToWords(grandTotal).replace(" Taka Only", " Taka Only.");

    const fits = (body: HTMLElement) => body.scrollHeight - body.clientHeight <= 0;

    const renderCandidate = (pageModel: BillPageModel): HTMLElement => {
      flushSync(() => {
        reactRoot.render(
          <BillPageShell
            data={data}
            formattedDate={formattedDate}
            subTotal={subTotal}
            grandTotal={grandTotal}
            inWordsDisplay={inWordsDisplay}
            page={pageModel}
            measureMode={true}
          />
        );
      });
      return host.querySelector(".quotation-page-body") as HTMLElement;
    };

    // Render initial candidate shell first so letterhead watermark images are mounted
    renderCandidate({
      pageNumber: 1,
      isFirstPage: true,
      isLastPage: true,
      rows: allRows.slice(0, 1),
      globalStartIdx: 0,
    });

    // Await decoding of all letterhead images
    await Promise.all(
      Array.from(sandbox.root.querySelectorAll("img")).map((img) =>
        img.decode ? img.decode().catch(() => {}) : Promise.resolve()
      )
    );

    const pages: BillPageModel[] = [];
    let unallocatedRows = [...allRows];
    let pageNumber = 1;
    let globalStartIdx = 0;

    while (unallocatedRows.length > 0) {
      const isFirstPage = pageNumber === 1;

      // 1. First test: can ALL remaining rows fit on this page as the LAST page (with Total Amount + In Words + Closing block)?
      const testLastBody = renderCandidate({
        pageNumber,
        isFirstPage,
        isLastPage: true,
        rows: unallocatedRows,
        globalStartIdx,
      });

      if (fits(testLastBody)) {
        // Fits completely!
        pages.push({
          pageNumber,
          isFirstPage,
          isLastPage: true,
          rows: unallocatedRows,
          globalStartIdx,
        });
        break;
      }

      // 2. Doesn't fit as last page: this page is a non-last page.
      // Binary search for the MAXIMUM rows that fit on this page with isLastPage: false (with TableContinuesNote)
      let low = 1;
      let high = unallocatedRows.length - 1;
      let bestK = 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const candidateRows = unallocatedRows.slice(0, mid);
        const body = renderCandidate({
          pageNumber,
          isFirstPage,
          isLastPage: false,
          rows: candidateRows,
          globalStartIdx,
        });

        if (fits(body)) {
          bestK = mid;
          low = mid + 1; // Try fitting more rows!
        } else {
          high = mid - 1; // Overflows, reduce!
        }
      }

      const chunk = unallocatedRows.slice(0, bestK);
      unallocatedRows = unallocatedRows.slice(bestK);

      pages.push({
        pageNumber: pageNumber++,
        isFirstPage,
        isLastPage: false,
        rows: chunk,
        globalStartIdx,
      });
      globalStartIdx += bestK;
    }

    // Safety: ensure last page is marked isLastPage
    if (pages.length > 0) {
      pages[pages.length - 1].isLastPage = true;
    }

    return pages;
  } finally {
    try {
      reactRoot.unmount();
      sandbox.dispose();
    } catch {}
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN BILL PRINT SHEET COMPONENT
// ─────────────────────────────────────────────────────────────
export const BillPrintSheet: React.FC<{ data: BillPrintData }> = ({ data }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const formattedDate = data.quote_date
    ? format(new Date(data.quote_date), "d MMM yyyy")
    : format(new Date(), "d MMM yyyy");

  // Normalize rows
  const allRows: BillRow[] = useMemo(() => {
    if (Array.isArray(data.bill_rows) && data.bill_rows.length > 0) {
      return data.bill_rows.map((r, i) => ({
        sl: r.sl || i + 1,
        expense_head: r.expense_head,
        amount: r.amount,
      }));
    }
    if (Array.isArray(data.software_rows) && data.software_rows.length > 0) {
      return data.software_rows.map((r, i) => ({
        sl: r.sl || i + 1,
        expense_head: r.expense_head || r.scope || "Expense Item",
        amount: r.amount || 0,
      }));
    }
    return [
      {
        sl: 1,
        expense_head: "Website Design & Development",
        amount: 5000,
      },
    ];
  }, [data.bill_rows, data.software_rows]);

  // Calculate Subtotal & Grand Total
  const subTotal = useMemo(() => {
    if (data.sub_total !== undefined && data.sub_total !== null && !isNaN(Number(data.sub_total))) {
      return Number(data.sub_total);
    }
    return allRows.reduce((sum, r) => {
      const val = typeof r.amount === "string" ? parseFloat(r.amount.replace(/[^0-9.-]/g, "")) : r.amount;
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [data.sub_total, allRows]);

  const hasAdvance = Boolean(
    data.has_advance_payment && Number(data.advance_amount || 0) > 0
  );
  const advanceAmount = Number(data.advance_amount || 0);

  const grandTotal = useMemo(() => {
    if (data.grand_total !== undefined && data.grand_total !== null && !isNaN(Number(data.grand_total))) {
      return Number(data.grand_total);
    }
    return Math.max(0, subTotal - (hasAdvance ? advanceAmount : 0));
  }, [data.grand_total, subTotal, hasAdvance, advanceAmount]);

  const inWordsDisplay = useMemo(() => {
    return data.in_words && data.in_words.trim().length > 0
      ? data.in_words
      : numberToWords(grandTotal).replace(" Taka Only", " Taka Only.");
  }, [data.in_words, grandTotal]);

  // Initialize pages with calibrated synchronous layout
  const [pages, setPages] = useState<BillPageModel[]>(() => buildBillPagesSync(allRows, hasAdvance));
  const [ready, setReady] = useState(false);

  // Stable layout dependency key to prevent infinite loops
  const layoutKey = useMemo(() => {
    return JSON.stringify({
      ref_no: data.ref_no,
      date: data.quote_date,
      client: data.client_name,
      org: data.organization_name,
      addr: data.address,
      phone: data.phone,
      email: data.email,
      sub: data.subject,
      sub_total: subTotal,
      has_adv: data.has_advance_payment,
      adv_amt: data.advance_amount,
      adv_lbl: data.advance_label,
      total: grandTotal,
      words: inWordsDisplay,
      rows: allRows,
    });
  }, [data, allRows, subTotal, grandTotal, inWordsDisplay]);

  // Measured closed-loop pagination
  useLayoutEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }

        const nextPages = await paginateBillMeasured(data, allRows);
        if (cancelled) return;

        if (nextPages && nextPages.length > 0) {
          setPages(nextPages);
        }

        await nextFrame();

        if (!cancelled) {
          setReady(true);
        }
      } catch (err) {
        console.warn("[BillPrintSheet] Measured pagination error:", err);
        if (!cancelled) {
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [layoutKey]);

  // Handle print events to ensure layout is ready
  useEffect(() => {
    const handleBeforePrint = () => setReady(true);
    window.addEventListener("beforeprint", handleBeforePrint);
    const mediaQuery = window.matchMedia ? window.matchMedia("print") : null;
    const handleMediaChange = (mql: MediaQueryListEvent) => {
      if (mql.matches) setReady(true);
    };
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    }
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="quotation-document font-sans text-zinc-900 bg-transparent w-[210mm] max-w-[210mm] mx-auto p-0 print:p-0 print:w-full print:max-w-full print:m-0 print:mx-0 [&_*]:!rounded-none"
      data-pagination-ready={ready ? "true" : "false"}
    >
      <style dangerouslySetInnerHTML={{ __html: QUOTATION_CSS }} />
      {pages.map((page) => (
        <BillPageShell
          key={`bill-page-${page.pageNumber}`}
          data={data}
          formattedDate={formattedDate}
          subTotal={subTotal}
          grandTotal={grandTotal}
          inWordsDisplay={inWordsDisplay}
          page={page}
          measureMode={false}
        />
      ))}
    </div>
  );
};
