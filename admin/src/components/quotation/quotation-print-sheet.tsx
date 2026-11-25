"use client";

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { format } from "@/lib/date";
import { numberToWords } from "@/lib/number-to-words";
import {
  QuotationColumn,
  SoftwareRow,
  HardwareRow,
  DEFAULT_SOFTWARE_COLUMNS,
  DEFAULT_HARDWARE_COLUMNS,
} from "./quotation-defaults";
import {
  OkobizHeaderBanner,
  OkobizWatermark,
  OkobizFooterBanner,
  OkobizLetterheadPage,
} from "./okobiz-letterhead-page";
import { paginateMeasured, nextFrame } from "@/lib/quotation-paginator";

export {
  OkobizHeaderBanner,
  OkobizWatermark,
  OkobizFooterBanner,
  OkobizLetterheadPage,
};

export interface QuotationPrintData {
  id?: number | string;
  _id?: string;
  ref_no: string;
  quote_date: string | Date;
  client_name: string;
  organization_name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  subject: string;
  software_columns?: QuotationColumn[];
  software_rows?: SoftwareRow[];
  software_amount?: number | string;
  plan_name?: string | null;
  billing_cycle?: string;
  license_fee_title?: string;
  license_fee_amount?: number | string;
  subscription_amount?: number | string;
  recurring_note?: string | null;
  has_hardware?: boolean;
  hardware_columns?: QuotationColumn[];
  hardware_rows?: HardwareRow[];
  hardware_amount?: number | string;
  grand_total: number | string;
  in_words?: string | null;
  project_breakdown?: string | null;
  terms_conditions?: string | null;
  client_requirements?: string | null;
  deliverables?: string | null;
  additional_notes?: string | null;
  company_signatory_name?: string;
  company_signatory_title?: string;
  company_phone?: string;
  company_email?: string;
}

interface QuotationPrintSheetProps {
  data: QuotationPrintData;
  className?: string;
}

export interface QuotationPageModel {
  pageNumber: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  tableChunk?: {
    rows: SoftwareRow[];
    isFirstChunk: boolean;
    isLastChunk: boolean;
  } | null;
  narrativeHtml?: string | null;
  showSignatory?: boolean;
}

export interface AtomicBlock {
  type: string;
  html: string;
  isListItem: boolean;
  listType?: "ol" | "ul";
  itemIndex?: number;
  height: number;
}

// ─────────────────────────────────────────────────────────────
// CALIBRATED METRICS FOR SYNCHRONOUS FALLBACK (SSR & INITIAL PAINT)
// ─────────────────────────────────────────────────────────────
export const METRICS = {
  PARA_CHARS: 112,
  LI_CHARS: 106,
  LINE_H: 12.5 * 1.375, // 17.19px (matched to particulars 12.5px font)
  PARA_MARGIN: 2.0,
  LI_MARGIN: 1.5,
  TABLE_SCOPE_CHARS: 30,
  TABLE_PART_CHARS: 58,
  TABLE_LINE_H: 14.5,
  TABLE_ROW_PAD: 6.0, // py-1 = 4px top + 4px bottom padding
};

export const formatPrice = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === "" || val === 0) return "0/-";
  if (typeof val === "string" && val.includes("/-")) return val;
  const num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.-]/g, "")) : val;
  if (isNaN(num)) return String(val);
  return num.toLocaleString("en-IN") + "/-";
};

// ─────────────────────────────────────────────────────────────
// TOP-LEVEL REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────
export const SignatoryBlock: React.FC<{ data: QuotationPrintData }> = ({ data }) => {
  const signatoryTitleDisplay = (() => {
    const raw = (data.company_signatory_title || "CEO").trim();
    if (/okobiz/i.test(raw)) {
      return raw.replace(/,\s*okobiz/i, " | Okobiz").replace(/\|\s*okobiz/i, "| Okobiz");
    }
    return `${raw} | Okobiz`;
  })();

  return (
    <div className="pt-2 mt-auto pb-0.5 select-none shrink-0 signatory-block">
      <div className="flex justify-between items-end">
        <div>
          <div className="font-bold text-zinc-900 mb-0.5 text-[14px] print:text-[14px]">Thanks &amp; Regards</div>
          <div className="h-10" />
          <div className="font-bold text-zinc-900 text-[14px] print:text-[14px] leading-snug">
            {data.company_signatory_name || "Md. Sorower Jahan"}
          </div>
          <div className="font-semibold text-zinc-700 text-[13px] print:text-[13px] leading-snug">
            {signatoryTitleDisplay}
          </div>
          <div className="text-zinc-600 text-[12.2px] print:text-[12.2px] leading-snug">
            Contact No: {data.company_phone || "+880 1973590937"}
          </div>
        </div>

        <div className="text-right">
          <div className="font-bold text-zinc-900 text-[14px] print:text-[14px] pb-1">
            Client Signature
          </div>
        </div>
      </div>

      <div className="mt-2 text-center text-[11px] print:text-[11px] text-zinc-500 italic select-none">
        *System generated quotation. No need to signature
      </div>
    </div>
  );
};

export const FirstPageHeader: React.FC<{ data: QuotationPrintData; formattedDate: string }> = ({
  data,
  formattedDate,
}) => (
  <div className="first-page-header shrink-0">
    <div className="flex justify-between items-start text-[13px] font-semibold mb-1.5">
      <div>{formattedDate}</div>
      {data.ref_no && (
        <div className="text-right">
          <span>Ref No. </span>
          <span className="font-bold text-[#1E65B8]">{data.ref_no}</span>
        </div>
      )}
    </div>

    <div className="text-[12px] leading-snug mb-1">
      <div className="font-semibold mb-0.5">To</div>
      {data.client_name && <div className="font-bold text-zinc-900">{data.client_name}</div>}
      {data.organization_name && (
        <div className="text-zinc-700 font-medium">{data.organization_name}</div>
      )}
      {data.address && <div className="text-zinc-600">{data.address}</div>}
      {data.phone && <div className="text-zinc-600">Cell: {data.phone}</div>}
      {data.email && <div className="text-zinc-600">Email: {data.email}</div>}
    </div>

    <div className="text-[13.5px] print:text-[13.5px] font-bold text-zinc-900 mb-1.5 pb-0.5 border-b border-zinc-200">
      <span>Subject: </span>
      <span className="underline">{data.subject || "Quotation for Web & Software Solution"}</span>
    </div>
  </div>
);

export const ContinuationHeader: React.FC<{ data: QuotationPrintData }> = ({ data }) => (
  <div className="continuation-header flex justify-between items-center text-xs font-semibold mb-3.5 pb-1 border-b border-zinc-200 shrink-0">
    <span className="font-bold text-zinc-800">
      Scope of Work &amp; Deliverables (Continued)
    </span>
    <div className="text-right text-zinc-600">
      <span>Ref No. </span>
      <span className="font-bold text-[#1E65B8]">{data.ref_no}</span>
    </div>
  </div>
);

export const TableContinuesNote = () => (
  <div className="table-continues-note text-[10px] text-zinc-500 font-semibold italic text-right mt-1 pb-1 shrink-0">
    Scope of work continues on next page →
  </div>
);

export const SoftwareTable: React.FC<{
  rows: SoftwareRow[];
  isLast: boolean;
  formattedGrandTotal?: string;
  inWordsDisplay?: string;
}> = ({ rows, isLast, formattedGrandTotal, inWordsDisplay }) => {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="shrink-0 mb-2 quotation-table-wrapper">
      <div className="border border-zinc-900 overflow-hidden bg-transparent">
        <table
          className="quotation-table w-full text-[12.5px] border-collapse bg-transparent shrink-0"
          style={{ tableLayout: "fixed", height: "auto" }}
        >
          <thead>
            <tr
              className="bg-[#1E65B8] !text-white font-bold border-b border-zinc-900 print:bg-[#1E65B8] print:text-white"
              style={{ backgroundColor: "#1E65B8", color: "#ffffff" }}
            >
              <th
                style={{ width: "7%", backgroundColor: "#1E65B8", color: "#ffffff" }}
                className="quotation-th py-1 px-2 text-center text-[12.5px] font-bold uppercase tracking-wider border-r border-white/50 text-white-always !text-white"
              >
                <span className="text-white-always !text-white font-bold">SL</span>
              </th>
              <th
                style={{ width: "28%", backgroundColor: "#1E65B8", color: "#ffffff" }}
                className="quotation-th py-1 px-3 text-left text-[12.5px] font-bold uppercase tracking-wider border-r border-white/50 text-white-always !text-white"
              >
                <span className="text-white-always !text-white font-bold">SCOPE OF WORK</span>
              </th>
              <th
                style={{ width: "51%", backgroundColor: "#1E65B8", color: "#ffffff" }}
                className="quotation-th py-1 px-3 text-left text-[12.5px] font-bold uppercase tracking-wider border-r border-white/50 text-white-always !text-white"
              >
                <span className="text-white-always !text-white font-bold">PARTICULARS</span>
              </th>
              <th
                style={{ width: "14%", backgroundColor: "#1E65B8", color: "#ffffff" }}
                className="quotation-th py-1 px-2 text-center text-[12.5px] font-bold uppercase tracking-wider text-white-always !text-white"
              >
                <span className="text-white-always !text-white font-bold">AMOUNT</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-400 bg-transparent" style={{ backgroundColor: "transparent" }}>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="bg-transparent"
                style={{ backgroundColor: "transparent", height: "auto" }}
              >
                <td
                  className="py-1 px-2 text-center font-bold text-zinc-900 align-top border-r border-zinc-500 w-[7%] bg-transparent text-[12.5px]"
                  style={{ backgroundColor: "transparent" }}
                >
                  {row.sl || index + 1}
                </td>
                <td
                  className="py-1 px-3 font-bold text-zinc-900 align-top border-r border-zinc-500 w-[28%] bg-transparent whitespace-pre-line leading-snug text-[12.5px]"
                  style={{ backgroundColor: "transparent" }}
                >
                  {row.scope}
                </td>
                <td
                  className="py-1 px-3 text-zinc-800 leading-snug align-top border-r border-zinc-500 w-[51%] bg-transparent whitespace-pre-line text-[12.5px]"
                  style={{ backgroundColor: "transparent" }}
                >
                  {row.particulars}
                </td>
                {index === 0 && (
                  <td
                    rowSpan={rows.length}
                    className="py-1 px-2 text-center font-bold text-zinc-900 text-[15px] align-middle bg-transparent w-[14%]"
                    style={{ backgroundColor: "transparent" }}
                  >
                    {formattedGrandTotal}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {isLast && (
            <tfoot className="border-t-2 border-zinc-900 bg-transparent" style={{ backgroundColor: "transparent" }}>
              <tr className="bg-transparent font-bold border-b border-zinc-800" style={{ backgroundColor: "transparent" }}>
                <td
                  colSpan={3}
                  className="py-1 px-3.5 text-right text-[12.5px] font-bold text-zinc-900 border-r border-zinc-800 uppercase tracking-wide bg-transparent"
                  style={{ backgroundColor: "transparent" }}
                >
                  Grand Total =
                </td>
                <td
                  className="py-1 px-2.5 text-center text-[13px] font-bold text-zinc-900 bg-transparent"
                  style={{ backgroundColor: "transparent" }}
                >
                  {formattedGrandTotal}
                </td>
              </tr>
              <tr className="bg-transparent font-bold" style={{ backgroundColor: "transparent" }}>
                <td
                  colSpan={4}
                  className="py-1 px-3.5 text-left text-[12.5px] font-bold text-zinc-900 bg-transparent"
                  style={{ backgroundColor: "transparent" }}
                >
                  In Word: {inWordsDisplay}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SHARED PAGE SHELL COMPONENT (INSTRUCTION B)
// - Both real render and sandbox measure using this EXACT SAME component!
// ─────────────────────────────────────────────────────────────
export const QuotationPageShell: React.FC<{
  data: QuotationPrintData;
  formattedDate: string;
  formattedGrandTotal: string;
  inWordsDisplay: string;
  page: QuotationPageModel;
  measureMode?: boolean;
}> = ({
  data,
  formattedDate,
  formattedGrandTotal,
  inWordsDisplay,
  page,
  measureMode = false,
}) => {
  return (
    <section
      className="quotation-page relative bg-white border border-zinc-200 print:border-none p-0 mb-8 print:mb-0 shadow-sm print:shadow-none w-[210mm] max-w-[210mm] print:w-full print:max-w-full print:m-0 print:mx-0 flex flex-col justify-between overflow-hidden rounded-none"
    >
      <OkobizWatermark />
      <OkobizHeaderBanner />

      <div
        className="quotation-page-body flex-1 flex flex-col px-[12mm] pb-[6px] print:px-[12mm] print:pb-[6px] relative z-10 bg-transparent"
      >
        {page.isFirstPage ? (
          <FirstPageHeader data={data} formattedDate={formattedDate} />
        ) : page.tableChunk ? (
          <ContinuationHeader data={data} />
        ) : null}

        {/* Table Chunk (if any on this page) */}
        {page.tableChunk && (
          <div className="mt-0.5">
            <SoftwareTable
              rows={page.tableChunk.rows}
              isLast={page.tableChunk.isLastChunk}
              formattedGrandTotal={formattedGrandTotal}
              inWordsDisplay={inWordsDisplay}
            />
            {!page.tableChunk.isLastChunk && <TableContinuesNote />}
          </div>
        )}

        {/* Narrative Content */}
        {(measureMode || (page.narrativeHtml && page.narrativeHtml.trim().length > 0)) && (
          <div
            className={`quotation-narrative-flow ${page.tableChunk ? "mt-2.5" : "mt-0"} text-[12.5px] text-zinc-800 leading-snug`}
            style={measureMode ? { flex: "none" } : { flex: "1 1 0%" }}
            dangerouslySetInnerHTML={{ __html: page.narrativeHtml || "" }}
          />
        )}

        {/* Signatory Block */}
        {page.showSignatory && <SignatoryBlock data={data} />}
      </div>

      <OkobizFooterBanner
        phone={data.company_phone}
        email={data.company_email}
      />
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// DE-DUPLICATED NARRATIVE COMPILER
// ─────────────────────────────────────────────────────────────
export function compileNarrativeText(data: QuotationPrintData): string {
  let raw = (data.terms_conditions || "").trim();

  if (!raw) {
    const parts: string[] = [];
    if (data.project_breakdown && data.project_breakdown.trim()) {
      parts.push(data.project_breakdown.trim());
    }
    if (data.client_requirements && data.client_requirements.trim()) {
      parts.push(`<h3>What Will You Provide Us?</h3>\n${data.client_requirements.trim()}`);
    }
    if (data.deliverables && data.deliverables.trim()) {
      parts.push(`<h3>What Access You Will Get From okobiz:</h3>\n${data.deliverables.trim()}`);
    }
    if (data.additional_notes && data.additional_notes.trim()) {
      parts.push(data.additional_notes.trim());
    }
    return parts.join("\n\n");
  }

  const cleanRaw = raw.replace(/<[^>]*>/g, " ").toLowerCase();

  if (data.project_breakdown) {
    const cleanBreakdown = data.project_breakdown.replace(/<[^>]*>/g, " ").trim().toLowerCase();
    if (cleanBreakdown.length > 20 && !cleanRaw.includes(cleanBreakdown.slice(0, 30))) {
      raw = data.project_breakdown + "\n\n" + raw;
    }
  }

  if (data.client_requirements) {
    const cleanReq = data.client_requirements.replace(/<[^>]*>/g, " ").trim().toLowerCase();
    if (cleanReq.length > 20 && !cleanRaw.includes(cleanReq.slice(0, 30))) {
      raw = raw + "\n\n<h3>What Will You Provide Us?</h3>\n" + data.client_requirements;
    }
  }

  if (data.deliverables) {
    const cleanDeliv = data.deliverables.replace(/<[^>]*>/g, " ").trim().toLowerCase();
    if (cleanDeliv.length > 20 && !cleanRaw.includes(cleanDeliv.slice(0, 30))) {
      raw = raw + "\n\n<h3>What Access You Will Get From okobiz:</h3>\n" + data.deliverables;
    }
  }

  if (data.additional_notes) {
    const cleanNotes = data.additional_notes.replace(/<[^>]*>/g, " ").trim().toLowerCase();
    if (cleanNotes.length > 20 && !cleanRaw.includes(cleanNotes.slice(0, 30))) {
      raw = raw + "\n\n" + data.additional_notes;
    }
  }

  return raw;
}

// ─────────────────────────────────────────────────────────────
// SYNCHRONOUS FALLBACK ESTIMATION FUNCTIONS (SSR / FIRST PAINT)
// ─────────────────────────────────────────────────────────────
export function estimateBlockHeight(html: string, isListItem = false): number {
  const text = html.replace(/<[^>]*>/g, "").trim();
  const lower = html.toLowerCase();

  if (lower.startsWith("<h1")) {
    const lines = Math.max(1, Math.ceil((text.length || 1) / 55));
    return lines * 18 + 10;
  }
  if (lower.startsWith("<h2")) {
    const lines = Math.max(1, Math.ceil((text.length || 1) / 65));
    return lines * 16.5 + 8;
  }
  if (lower.startsWith("<h3")) {
    const lines = Math.max(1, Math.ceil((text.length || 1) / 70));
    return lines * 15.5 + 6;
  }
  if (lower.startsWith("<h4") || lower.startsWith("<h5") || lower.startsWith("<h6")) {
    const lines = Math.max(1, Math.ceil((text.length || 1) / 72));
    return lines * 14.5 + 5;
  }
  if (lower.startsWith("<blockquote")) {
    const lines = Math.max(1, Math.ceil(text.length / 68));
    return lines * 15.5 + 6;
  }
  if (lower.startsWith("<pre") || lower.startsWith("<code")) {
    const lines = Math.max(1, Math.ceil(text.length / 65));
    return lines * 15.0 + 5;
  }
  if (lower.startsWith("<hr")) {
    if (lower.includes("page-break") || lower.includes("pagebreak")) return 9999;
    return 12;
  }
  if (!text) {
    if (lower.includes("<br")) return METRICS.LINE_H;
    return 0;
  }

  const charPerLine = isListItem ? METRICS.LI_CHARS : METRICS.PARA_CHARS;
  const extraMargin = isListItem ? METRICS.LI_MARGIN : METRICS.PARA_MARGIN;

  const tag = isListItem ? "li" : "p";
  const match = html.match(new RegExp(`^<${tag}(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/${tag}>$`, "i"));
  const inner = match ? match[1] : html;

  const rawSegments = inner.split(/<br\s*\/?>|<\/p>\s*<p(?:\s+[^>]*)?>|\r?\n/i);
  let totalLines = 0;
  for (const seg of rawSegments) {
    const segText = seg.replace(/<[^>]*>/g, "").trim();
    if (segText.length === 0) continue;
    totalLines += Math.max(1, Math.ceil(segText.length / charPerLine));
  }
  if (totalLines === 0) totalLines = 1;
  return totalLines * METRICS.LINE_H + extraMargin;
}

export function estimateTableRowHeight(row: SoftwareRow): number {
  const scopeText = (row.scope || "").trim();
  const partText = (row.particulars || "").trim();

  if (scopeText.length === 0 && partText.length === 0) {
    return 15.0;
  }

  const scopeLines = Math.max(1, Math.ceil(scopeText.length / METRICS.TABLE_SCOPE_CHARS));
  const partLines = Math.max(1, Math.ceil(partText.length / METRICS.TABLE_PART_CHARS));
  const maxLines = Math.max(scopeLines, partLines);
  if (maxLines === 1) return 21.0;
  return METRICS.TABLE_ROW_PAD + maxLines * METRICS.TABLE_LINE_H;
}

export function splitBlockForAvailableHeight(
  block: AtomicBlock,
  availableHeight: number
): { fitsBlock: AtomicBlock | null; remainderBlock: AtomicBlock | null } {
  const isListItem = block.isListItem;
  const charPerLine = isListItem ? METRICS.LI_CHARS : METRICS.PARA_CHARS;
  const extraMargin = isListItem ? METRICS.LI_MARGIN : METRICS.PARA_MARGIN;

  const rawHtml = block.html;
  const tag = isListItem ? "li" : "p";
  const match = rawHtml.match(new RegExp(`^<${tag}(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/${tag}>$`, "i"));
  const inner = match ? match[1] : rawHtml.replace(/<[^>]*>/g, "");

  const cleanText = inner.replace(/<[^>]*>/g, "").trim();
  const totalLines = Math.max(1, Math.ceil(cleanText.length / charPerLine));
  const totalH = totalLines * METRICS.LINE_H + extraMargin;

  if (totalH <= availableHeight + 2) {
    return { fitsBlock: block, remainderBlock: null };
  }

  const linesThatFit = Math.floor((availableHeight + 2 - extraMargin) / METRICS.LINE_H);
  if (linesThatFit < 1 || linesThatFit >= totalLines) {
    return { fitsBlock: null, remainderBlock: block };
  }

  const targetChars = linesThatFit * charPerLine;
  let splitPos = -1;

  const punctRegex = /([.?!;:\u0964]["'”’]?\s+)(?=[A-Z0-9\u0980-\u09FF"'“‘<])/g;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = punctRegex.exec(inner)) !== null) {
    const end = pMatch.index + pMatch[0].length;
    const textSoFar = inner.substring(0, end).replace(/<[^>]*>/g, "").length;
    if (textSoFar <= targetChars + 15) {
      splitPos = end;
    } else {
      break;
    }
  }

  if (splitPos === -1 || inner.substring(0, splitPos).replace(/<[^>]*>/g, "").length < targetChars * 0.3) {
    const spaceRegex = /\s+/g;
    let sMatch: RegExpExecArray | null;
    let lastValidSpace = -1;
    while ((sMatch = spaceRegex.exec(inner)) !== null) {
      const textSoFar = inner.substring(0, sMatch.index).replace(/<[^>]*>/g, "").length;
      if (textSoFar <= targetChars) {
        lastValidSpace = sMatch.index + sMatch[0].length;
      } else {
        break;
      }
    }
    if (lastValidSpace > 0) {
      splitPos = lastValidSpace;
    }
  }

  if (splitPos <= 0 || splitPos >= inner.length) {
    return { fitsBlock: null, remainderBlock: block };
  }

  const rawPart1 = inner.substring(0, splitPos).trim().replace(/<br\s*\/?>$/i, "");
  const rawPart2 = inner.substring(splitPos).trim();

  if (!rawPart1 || !rawPart2) {
    return { fitsBlock: null, remainderBlock: block };
  }

  const openTags: { tag: string; fullOpenTag: string }[] = [];
  const tagRegex = /<\/?([a-z0-9_-]+)(?:\s+[^>]*)?>/gi;
  let tMatch: RegExpExecArray | null;
  while ((tMatch = tagRegex.exec(rawPart1)) !== null) {
    const isClose = tMatch[0].startsWith("</");
    const tagName = tMatch[1].toLowerCase();
    if (tagName === "br" || tagName === "hr" || tagName === "img") continue;
    if (!isClose) {
      openTags.push({ tag: tagName, fullOpenTag: tMatch[0] });
    } else {
      for (let j = openTags.length - 1; j >= 0; j--) {
        if (openTags[j].tag === tagName) {
          openTags.splice(j, 1);
          break;
        }
      }
    }
  }

  const closeTagsPart1 = [...openTags].reverse().map((t) => `</${t.tag}>`).join("");
  const openTagsPart2 = openTags.map((t) => t.fullOpenTag).join("");

  const htmlPart1 = `<${tag}>${rawPart1}${closeTagsPart1}</${tag}>`;
  const htmlPart2 = isListItem
    ? `<li data-continued="true" style="list-style-type: none;">${openTagsPart2}${rawPart2}</li>`
    : `<p>${openTagsPart2}${rawPart2}</p>`;

  const fitsText = rawPart1.replace(/<[^>]*>/g, "").trim();
  const fitLines = Math.max(1, Math.ceil(fitsText.length / charPerLine));

  return {
    fitsBlock: { ...block, html: htmlPart1, height: fitLines * METRICS.LINE_H + extraMargin },
    remainderBlock: { ...block, html: htmlPart2, height: Math.max(1, totalLines - fitLines) * METRICS.LINE_H + extraMargin },
  };
}

export function tokenizeHtmlBlocks(rawHtml: string): AtomicBlock[] {
  if (!rawHtml) return [];

  let html = rawHtml.trim();

  // Support manual pagebreak markers
  html = html.replace(/<!--\s*pagebreak\s*-->/gi, '<hr class="page-break" />');

  // Replace <br><br> with paragraph boundaries
  html = html.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "</p><p>");

  // Recursively unwrap outer <div> wrappers if they contain block-level elements
  let prevHtml = "";
  let loopCount = 0;
  while (html !== prevHtml && loopCount < 10) {
    loopCount++;
    prevHtml = html;
    html = html.replace(/<div(?:\s+[^>]*)?>([\s\S]*?)<\/div>/gi, (match, inner) => {
      if (/<(?:h[1-6]|p|ol|ul|li|blockquote|div|hr)\b/i.test(inner)) {
        return inner;
      }
      const textOnly = inner.replace(/<[^>]*>/g, "").trim();
      if (textOnly) {
        return `<p>${inner}</p>`;
      }
      return "";
    });
  }

  // If text has no standard block containers, split by newline into paragraphs
  if (!/<(?:h[1-6]|p|ol|ul|li|blockquote|div|hr)\b/i.test(html)) {
    html = html
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => `<p>${line}</p>`)
      .join("");
  }

  const blocks: AtomicBlock[] = [];
  const blockRegex = /<(h[1-6]|p|blockquote)(?:\s+[^>]*)?>[\s\S]*?<\/\1>|<hr(?:\s+[^>]*)?\/?>|<(ol|ul)(?:\s+[^>]*)?>[\s\S]*?<\/\2>/gi;
  let m: RegExpExecArray | null;
  let lastPos = 0;

  while ((m = blockRegex.exec(html)) !== null) {
    if (m.index > lastPos) {
      const text = html.substring(lastPos, m.index).trim();
      if (text && text.replace(/<[^>]*>/g, "").trim()) {
        const pHtml = `<p>${text}</p>`;
        blocks.push({
          type: "p",
          html: pHtml,
          isListItem: false,
          height: estimateBlockHeight(pHtml),
        });
      }
    }

    const fullMatch = m[0];
    const tagName = (m[1] || m[2] || "hr").toLowerCase();

    if (fullMatch.includes("page-break") || fullMatch.includes("<!-- pagebreak -->")) {
      blocks.push({
        type: "pagebreak",
        html: "",
        isListItem: false,
        height: 9999,
      });
    } else if (tagName === "hr") {
      blocks.push({
        type: "hr",
        html: "<hr />",
        isListItem: false,
        height: 14,
      });
    } else if (tagName === "ol" || tagName === "ul") {
      const isOl = tagName === "ol";
      const startMatch = fullMatch.match(/start=["']?(\d+)["']?/i);
      const startNum = startMatch ? parseInt(startMatch[1], 10) : 1;

      const liRegex = /<li(?:\s+[^>]*)?>[\s\S]*?<\/li>/gi;
      let liMatch: RegExpExecArray | null;
      let count = 0;
      while ((liMatch = liRegex.exec(fullMatch)) !== null) {
        const liHtml = liMatch[0];
        const textOnly = liHtml.replace(/<[^>]*>/g, "").trim();
        if (textOnly) {
          const pRegex = /<p(?:\s+[^>]*)?>[\s\S]*?<\/p>/gi;
          const pMatches = liHtml.match(pRegex);
          if (pMatches && pMatches.length > 1) {
            // Compound list item with multiple paragraphs: decompose into atomic sub-blocks
            pMatches.forEach((pHtml, pIdx) => {
              const pText = pHtml.replace(/<[^>]*>/g, "").trim();
              if (pText) {
                const subLiHtml =
                  pIdx === 0
                    ? `<li>${pHtml}</li>`
                    : `<li data-continued="true" style="list-style-type: none;">${pHtml}</li>`;
                blocks.push({
                  type: "li",
                  html: subLiHtml,
                  isListItem: true,
                  listType: isOl ? "ol" : "ul",
                  itemIndex: pIdx === 0 ? startNum + count : undefined,
                  height: estimateBlockHeight(subLiHtml, true),
                });
              }
            });
            count++;
          } else {
            blocks.push({
              type: "li",
              html: liHtml,
              isListItem: true,
              listType: isOl ? "ol" : "ul",
              itemIndex: startNum + count,
              height: estimateBlockHeight(liHtml, true),
            });
            count++;
          }
        }
      }
    } else {
      const textOnly = fullMatch.replace(/<[^>]*>/g, "").trim();
      if (textOnly) {
        blocks.push({
          type: tagName,
          html: fullMatch,
          isListItem: false,
          height: estimateBlockHeight(fullMatch),
        });
      }
    }

    lastPos = blockRegex.lastIndex;
  }

  if (lastPos < html.length) {
    const text = html.substring(lastPos).trim();
    if (text && text.replace(/<[^>]*>/g, "").trim()) {
      const pHtml = `<p>${text}</p>`;
      blocks.push({
        type: "p",
        html: pHtml,
        isListItem: false,
        height: estimateBlockHeight(pHtml),
      });
    }
  }

  return blocks;
}

export function assembleBlocks(blocksSlice: AtomicBlock[]): string {
  if (!blocksSlice || blocksSlice.length === 0) return "";
  const out: string[] = [];
  let inList = false;
  let currentListType: "ol" | "ul" | null = null;
  let currentStart = 1;

  for (let i = 0; i < blocksSlice.length; i++) {
    const b = blocksSlice[i];
    if (b.isListItem) {
      if (!inList) {
        inList = true;
        currentListType = b.listType || "ul";
        currentStart = b.itemIndex || 1;
        out.push(currentListType === "ol" ? `<ol start="${currentStart}">` : "<ul>");
      } else if (currentListType !== b.listType) {
        out.push(currentListType === "ol" ? "</ol>" : "</ul>");
        currentListType = b.listType || "ul";
        currentStart = b.itemIndex || 1;
        out.push(currentListType === "ol" ? `<ol start="${currentStart}">` : "<ul>");
      }
      if (b.itemIndex !== undefined && b.listType === "ol" && !b.html.includes("value=")) {
        out.push(b.html.replace(/^<li\b/i, `<li value="${b.itemIndex}"`));
      } else {
        out.push(b.html);
      }
    } else {
      if (inList) {
        out.push(currentListType === "ol" ? "</ol>" : "</ul>");
        inList = false;
        currentListType = null;
      }
      out.push(b.html);
    }
  }

  if (inList) {
    out.push(currentListType === "ol" ? "</ol>" : "</ul>");
  }

  return out.join("\n");
}

// ─────────────────────────────────────────────────────────────
// SYNCHRONOUS INITIAL PAGINATOR (SSR & INSTANT FIRST PAINT)
// ─────────────────────────────────────────────────────────────
export function buildQuotationPages(data: QuotationPrintData): QuotationPageModel[] {
  const softwareRows = data.software_rows || [];
  const raw = compileNarrativeText(data);
  const allBlocks = tokenizeHtmlBlocks(raw);

  const PAGE_USABLE_HEIGHT = 977;
  const TABLE_THEAD_HEIGHT = 20;
  const TABLE_TFOOT_HEIGHT = 42;
  const TABLE_MARGINS_TOTAL = 6;
  const TABLE_CONTINUES_NOTE_HEIGHT = 16;
  const SIGNATORY_HEIGHT = 145;
  const CONTINUATION_TABLE_HEADER_HEIGHT = 24;

  let clientCardH = 12.0;
  if (data.client_name && data.client_name.trim().length > 0) clientCardH += 13.0;
  if (data.organization_name && data.organization_name.trim().length > 0) clientCardH += 13.0;
  if (data.address && data.address.trim().length > 0) {
    const addrLines = Math.max(1, Math.ceil(data.address.trim().length / 60));
    clientCardH += addrLines * 13.0;
  }
  if (data.phone && data.phone.trim().length > 0) clientCardH += 13.0;
  if (data.email && data.email.trim().length > 0) clientCardH += 13.0;
  clientCardH += 3.0;

  const subjectText = data.subject || "Quotation for Web & Software Solution";
  const subjectLines = Math.max(1, Math.ceil((subjectText.length + 10) / 75));
  const subjectH = 6 + subjectLines * 13.0;

  const page1PreTableH = 12 + clientCardH + subjectH;
  const page1AvailH = PAGE_USABLE_HEIGHT - page1PreTableH;

  const pages: QuotationPageModel[] = [];
  let unallocatedRows = [...softwareRows];
  let unallocatedBlocks = [...allBlocks];
  let pageNumber = 1;

  while (unallocatedRows.length > 0 || unallocatedBlocks.length > 0) {
    const isFirstPage = pageNumber === 1;
    let pageAvailH = isFirstPage ? page1AvailH : PAGE_USABLE_HEIGHT;

    let pageTableChunk: QuotationPageModel["tableChunk"] = null;
    let pageNarrativeHtml: string | null = null;
    let showSignatory = false;

    if (unallocatedRows.length > 0) {
      const isFirstTableChunk = isFirstPage;
      if (!isFirstPage) {
        pageAvailH -= CONTINUATION_TABLE_HEADER_HEIGHT;
      }
      pageAvailH -= TABLE_THEAD_HEIGHT + TABLE_MARGINS_TOTAL;

      const chunkRows: SoftwareRow[] = [];
      let currentTableH = 0;

      while (unallocatedRows.length > 0) {
        const nextRow = unallocatedRows[0];
        const nextRowH = estimateTableRowHeight(nextRow);
        const isFinalRow = unallocatedRows.length === 1;
        const neededH = nextRowH + (isFinalRow ? TABLE_TFOOT_HEIGHT : TABLE_CONTINUES_NOTE_HEIGHT);

        if (currentTableH + neededH <= pageAvailH + 2) {
          chunkRows.push(unallocatedRows.shift()!);
          currentTableH += nextRowH;
        } else {
          if (chunkRows.length === 0) {
            chunkRows.push(unallocatedRows.shift()!);
            currentTableH += nextRowH;
          }
          break;
        }
      }

      const isLastChunk = unallocatedRows.length === 0;
      if (isLastChunk) {
        currentTableH += TABLE_TFOOT_HEIGHT;
      } else {
        currentTableH += TABLE_CONTINUES_NOTE_HEIGHT;
      }

      pageTableChunk = {
        rows: chunkRows,
        isFirstChunk: isFirstTableChunk,
        isLastChunk,
      };

      pageAvailH -= currentTableH;
    }

    if (unallocatedRows.length === 0 && unallocatedBlocks.length > 0 && pageAvailH > 10) {
      const remainingBlocksH = unallocatedBlocks.reduce((sum, b) => sum + b.height, 0);

      if (remainingBlocksH + SIGNATORY_HEIGHT <= pageAvailH + 2) {
        pageNarrativeHtml = assembleBlocks(unallocatedBlocks);
        unallocatedBlocks = [];
        showSignatory = true;
      } else {
        let effectiveAvailH = pageAvailH;
        const pageBlocks: AtomicBlock[] = [];

        while (unallocatedBlocks.length > 0 && effectiveAvailH > 10) {
          const nextB = unallocatedBlocks[0];

          if (nextB.type === "pagebreak" || nextB.html.includes("page-break")) {
            unallocatedBlocks.shift();
            break;
          }

          if (
            (nextB.type.startsWith("h") || nextB.html.startsWith("<p><strong>")) &&
            effectiveAvailH < nextB.height + 18
          ) {
            break;
          }

          if (nextB.height <= effectiveAvailH + 2) {
            pageBlocks.push(unallocatedBlocks.shift()!);
            effectiveAvailH -= nextB.height;
          } else {
            if ((nextB.type === "p" || nextB.type === "li") && effectiveAvailH >= 10) {
              const splitRes = splitBlockForAvailableHeight(nextB, effectiveAvailH);
              if (splitRes.fitsBlock) {
                pageBlocks.push(splitRes.fitsBlock);
                effectiveAvailH -= splitRes.fitsBlock.height;
                unallocatedBlocks[0] = splitRes.remainderBlock!;
              }
            }
            break;
          }
        }

        if (pageBlocks.length === 0 && unallocatedBlocks.length > 0) {
          pageBlocks.push(unallocatedBlocks.shift()!);
        }

        const usedBlocksH = pageBlocks.reduce((s, b) => s + b.height, 0);
        if (unallocatedBlocks.length === 0 && pageAvailH - usedBlocksH >= SIGNATORY_HEIGHT) {
          showSignatory = true;
        }

        pageNarrativeHtml = assembleBlocks(pageBlocks);
      }
    } else if (unallocatedRows.length === 0 && unallocatedBlocks.length === 0) {
      showSignatory = true;
    }

    const hasTable = !!pageTableChunk;
    const hasNarrative = !!(pageNarrativeHtml && pageNarrativeHtml.trim().length > 0);

    if (hasTable || hasNarrative || showSignatory) {
      pages.push({
        pageNumber: pageNumber++,
        isFirstPage,
        isLastPage: false,
        tableChunk: pageTableChunk,
        narrativeHtml: pageNarrativeHtml || null,
        showSignatory,
      });
    }
  }

  if (pages.length > 0) {
    const lastPage = pages[pages.length - 1];
    lastPage.showSignatory = true;
    lastPage.isLastPage = true;
  }

  return pages;
}

// ─────────────────────────────────────────────────────────────
// SHARED HYGIENIC CSS (SCREEN & PRINT ZERO-DIVERGENCE)
// ─────────────────────────────────────────────────────────────
export const QUOTATION_CSS = `
  /* Core quotation typography & layout */
  .quotation-document {
    --q-page-h: 296.2mm;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  }
  .quotation-page {
    box-sizing: border-box !important;
    width: 210mm !important;
    min-width: 210mm !important;
    max-width: 210mm !important;
    height: var(--q-page-h, 296.2mm) !important;
    min-height: var(--q-page-h, 296.2mm) !important;
    max-height: var(--q-page-h, 296.2mm) !important;
    overflow: hidden !important;
    position: relative !important;
  }
  .quotation-page-body {
    box-sizing: border-box !important;
    width: 100% !important;
    padding-left: 12mm !important;
    padding-right: 12mm !important;
    padding-bottom: 8px !important;
    padding-top: 0 !important;
    flex: 1 1 0% !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
  }
  .quotation-table,
  .quotation-table-wrapper {
    table-layout: fixed !important;
    height: auto !important;
    min-height: 0 !important;
    flex-grow: 0 !important;
    flex-shrink: 0 !important;
  }
  .quotation-table,
  .quotation-table tbody,
  .quotation-table tr,
  .quotation-table tfoot {
    border-collapse: collapse !important;
    width: 100% !important;
    background-color: transparent !important;
  }
  .quotation-table tr,
  .quotation-table td,
  .quotation-table th {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
  }
  .quotation-page thead,
  .quotation-page th,
  .quotation-table thead,
  .quotation-table th {
    background-color: #1E65B8 !important;
    color: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .quotation-page th *,
  .quotation-table th * {
    color: #ffffff !important;
  }
  .quotation-narrative-flow {
    font-size: 12.5px !important;
    line-height: 1.375 !important;
    color: #27272a !important;
  }
  .quotation-narrative-flow h1 {
    display: block !important;
    font-size: 16px !important;
    font-weight: 800 !important;
    color: #09090b !important;
    margin-top: 8px !important;
    margin-bottom: 3px !important;
    line-height: 1.25 !important;
  }
  .quotation-narrative-flow h2 {
    display: block !important;
    font-size: 14.5px !important;
    font-weight: 700 !important;
    color: #09090b !important;
    margin-top: 6px !important;
    margin-bottom: 2px !important;
    line-height: 1.25 !important;
  }
  .quotation-narrative-flow h3 {
    display: block !important;
    font-size: 13.5px !important;
    font-weight: 700 !important;
    color: #09090b !important;
    margin-top: 5px !important;
    margin-bottom: 2px !important;
    line-height: 1.25 !important;
  }
  .quotation-narrative-flow h4,
  .quotation-narrative-flow h5,
  .quotation-narrative-flow h6 {
    display: block !important;
    font-size: 12.5px !important;
    font-weight: 700 !important;
    color: #09090b !important;
    margin-top: 5px !important;
    margin-bottom: 2px !important;
  }
  .quotation-narrative-flow strong,
  .quotation-narrative-flow b {
    font-weight: 700 !important;
    color: #09090b !important;
  }
  .quotation-narrative-flow em,
  .quotation-narrative-flow i {
    font-style: italic !important;
  }
  .quotation-narrative-flow u {
    text-decoration: underline !important;
    text-underline-offset: 2px !important;
  }
  .quotation-narrative-flow s,
  .quotation-narrative-flow strike,
  .quotation-narrative-flow del {
    text-decoration: line-through !important;
  }
  .quotation-narrative-flow ol {
    display: block !important;
    list-style-type: decimal !important;
    margin: 2px 0 !important;
    padding-left: 20px !important;
  }
  .quotation-narrative-flow ul {
    display: block !important;
    list-style-type: disc !important;
    margin: 2px 0 !important;
    padding-left: 20px !important;
  }
  .quotation-narrative-flow li {
    display: list-item !important;
    margin-bottom: 2.0px !important;
    font-size: 12.5px !important;
    line-height: 1.375 !important;
    color: #27272a !important;
  }
  .quotation-narrative-flow li[data-continued="true"] {
    list-style-type: none !important;
    padding-left: 0 !important;
  }
  .quotation-narrative-flow p {
    margin-bottom: 2.5px !important;
    font-size: 12.5px !important;
    line-height: 1.375 !important;
    color: #27272a !important;
  }
  .quotation-narrative-flow blockquote {
    display: block !important;
    border-left: 3px solid #1E65B8 !important;
    background-color: #f8fafc !important;
    padding: 4px 8px !important;
    margin: 4px 0 !important;
    color: #334155 !important;
    font-style: italic !important;
  }
  .quotation-narrative-flow code {
    display: inline-block !important;
    background-color: #f1f5f9 !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 2px !important;
    padding: 0 4px !important;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
    font-size: 10.5px !important;
    color: #0f172a !important;
  }
  .quotation-narrative-flow hr {
    display: block !important;
    border: none !important;
    border-top: 1px solid #cbd5e1 !important;
    margin: 6px 0 !important;
    height: 1px !important;
    width: 100% !important;
  }

  @media print {
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      background-color: #ffffff !important;
      color: #000000 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
      min-height: 100% !important;
      overflow: visible !important;
    }
    .no-print, [data-sonner-toaster], [data-sonner-toast], [aria-live="polite"], [role="status"], header, aside, nav {
      display: none !important;
    }
    .quotation-document {
      --q-page-h: 296.2mm;
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
      max-width: 210mm !important;
      width: 210mm !important;
      background: #ffffff !important;
    }
    .quotation-page {
      box-sizing: border-box !important;
      width: 210mm !important;
      min-width: 210mm !important;
      max-width: 210mm !important;
      height: var(--q-page-h, 296.2mm) !important;
      min-height: var(--q-page-h, 296.2mm) !important;
      max-height: var(--q-page-h, 296.2mm) !important;
      padding: 0 !important;
      margin: 0 !important;
      box-shadow: none !important;
      border: none !important;
      background: #ffffff !important;
      overflow: hidden !important;
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .quotation-page:not(:last-child) {
      page-break-after: always !important;
      break-after: page !important;
    }
    .quotation-page:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
    }
    .quotation-page-body {
      box-sizing: border-box !important;
      width: 100% !important;
      padding-left: 12mm !important;
      padding-right: 12mm !important;
      padding-bottom: 8px !important;
      padding-top: 0 !important;
      flex: 1 1 0% !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }
    .quotation-footer {
      flex-shrink: 0 !important;
      width: 100% !important;
      position: relative !important;
      z-index: 20 !important;
      margin-top: auto !important;
    }
    .quotation-footer,
    .quotation-footer *,
    .text-white-always {
      color: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .quotation-footer svg:not(.globe-icon) {
      color: #ffffff !important;
      fill: #ffffff !important;
    }
    .quotation-footer svg.globe-icon {
      fill: none !important;
    }
    .quotation-footer svg.globe-icon circle,
    .quotation-footer svg.globe-icon path.globe-line {
      fill: none !important;
      stroke: #ffffff !important;
      stroke-width: 1.6px !important;
    }
    .quotation-footer svg.globe-icon path.globe-cursor {
      fill: #ffffff !important;
      stroke: #1E65B8 !important;
      stroke-width: 0.8px !important;
    }
  }
`;

// ─────────────────────────────────────────────────────────────
// MAIN QUOTATION PRINT SHEET COMPONENT (INSTRUCTION E)
// ─────────────────────────────────────────────────────────────
export const QuotationPrintSheet: React.FC<QuotationPrintSheetProps> = ({
  data,
  className = "",
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<QuotationPageModel[]>(() => buildQuotationPages(data));
  const [ready, setReady] = useState(false);

  // Stable layout dependency key to prevent infinite re-renders on object identity change
  const layoutKey = useMemo(() => {
    return JSON.stringify({
      ref_no: data.ref_no,
      quote_date: data.quote_date,
      client_name: data.client_name,
      org: data.organization_name,
      addr: data.address,
      phone: data.phone,
      email: data.email,
      subject: data.subject,
      grand_total: data.grand_total,
      in_words: data.in_words,
      rows: data.software_rows,
      terms: data.terms_conditions,
      breakdown: data.project_breakdown,
      reqs: data.client_requirements,
      deliv: data.deliverables,
      notes: data.additional_notes,
      sig_name: data.company_signatory_name,
      sig_title: data.company_signatory_title,
      sig_phone: data.company_phone,
      sig_email: data.company_email,
    });
  }, [data]);

  // Step E: Single-pass real layout pagination with localized element verification
  useLayoutEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }

        const nextPages = await paginateMeasured(data);
        if (cancelled) return;

        if (nextPages && nextPages.length > 0) {
          setPages(nextPages);
        }

        await nextFrame();

        // Check overflow and gap strictly within THIS instance's DOM (no global query contamination!)
        if (rootRef.current) {
          const bodyEls = Array.from(
            rootRef.current.querySelectorAll<HTMLElement>(".quotation-page-body")
          );

          bodyEls.forEach((body, idx) => {
            const overflow = body.scrollHeight - body.clientHeight;
            if (process.env.NODE_ENV === "development" && overflow > 0.5) {
              console.warn(`[QuotationPrintSheet] Page ${idx + 1} overflow: ${overflow.toFixed(1)}px`);
            }

            // Check bottom gap on non-last pages
            if (idx < bodyEls.length - 1) {
              const narrative = body.querySelector<HTMLElement>(".quotation-narrative-flow");
              if (narrative) {
                const freeSpace = narrative.clientHeight - narrative.scrollHeight;
                if (process.env.NODE_ENV === "development" && freeSpace > 24) {
                  console.info(`[QuotationPrintSheet] Page ${idx + 1} bottom gap: ${freeSpace.toFixed(1)}px`);
                }
              }
            }
          });
        }

        if (!cancelled) {
          setReady(true);
        }
      } catch (err) {
        console.warn("[QuotationPrintSheet] Measured pagination error:", err);
        if (!cancelled) {
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [layoutKey]);

  // Re-verify on print event
  useEffect(() => {
    const handleBeforePrint = () => {
      setReady(true);
    };

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

  const formattedDate = data.quote_date
    ? format(new Date(data.quote_date), "d MMMM, yyyy")
    : format(new Date(), "d MMMM, yyyy");

  const grandTotalValue = data.grand_total || data.software_amount || 0;
  const formattedGrandTotal = formatPrice(grandTotalValue);
  const inWordsDisplay =
    data.in_words && data.in_words.trim().length > 0
      ? data.in_words
      : numberToWords(grandTotalValue).replace(" Taka Only", " Taka Only.");

  return (
    <div
      ref={rootRef}
      className={`quotation-document font-sans text-zinc-900 bg-white w-[794px] max-w-[794px] mx-auto p-0 print:p-0 print:w-full print:max-w-full print:m-0 print:mx-0 [&_*]:!rounded-none ${className}`}
      data-pagination-ready={ready ? "true" : "false"}
    >
      <style dangerouslySetInnerHTML={{ __html: QUOTATION_CSS }} />

      {/* ════════════════════════ REAL A4 QUOTATION PAGES (SHARED SHELL) ════════════════════════ */}
      {pages.map((page) => (
        <QuotationPageShell
          key={`quotation-page-${page.pageNumber}`}
          data={data}
          formattedDate={formattedDate}
          formattedGrandTotal={formattedGrandTotal}
          inWordsDisplay={inWordsDisplay}
          page={page}
          measureMode={false}
        />
      ))}
    </div>
  );
};
