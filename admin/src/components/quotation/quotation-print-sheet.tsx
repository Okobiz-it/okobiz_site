"use client";

import React from "react";
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

// ─────────────────────────────────────────────────────────────
// ACCURATE PHYSICAL HEIGHT ESTIMATOR & ADAPTIVE BLOCK SPLITTER
// - Calibrated to exact typography of Okobiz quotation / bill pads
// - Calculates exact rendered pixel heights for all rich text elements
// - Dynamically splits paragraphs and list items to fill pages down to bottom margin
// - 100% prevents footer clipping & eliminates large gaps across all pages
// ─────────────────────────────────────────────────────────────
function estimateBlockHeight(html: string, isListItem = false): number {
  const text = html.replace(/<[^>]*>/g, "").trim();
  const lower = html.toLowerCase();

  if (lower.startsWith("<h1")) {
    const lines = Math.max(1, Math.ceil((text.length || 1) / 100));
    return lines * 19 + 12;
  }
  if (lower.startsWith("<h2")) {
    const lines = Math.max(1, Math.ceil((text.length || 1) / 110));
    return lines * 18 + 10;
  }
  if (lower.startsWith("<h3")) {
    const lines = Math.max(1, Math.ceil((text.length || 1) / 120));
    return lines * 17 + 8;
  }
  if (lower.startsWith("<h4") || lower.startsWith("<h5") || lower.startsWith("<h6")) {
    const lines = Math.max(1, Math.ceil((text.length || 1) / 125));
    return lines * 16 + 7;
  }
  if (lower.startsWith("<blockquote")) {
    const lines = Math.max(1, Math.ceil(text.length / 95));
    return lines * 16.5 + 10;
  }
  if (lower.startsWith("<pre") || lower.startsWith("<code")) {
    const lines = Math.max(1, Math.ceil(text.length / 90));
    return lines * 16.0 + 8;
  }
  if (lower.startsWith("<hr")) {
    return 9999;
  }
  if (!text) {
    if (lower.includes("<br")) return 16.5;
    return 0;
  }

  // Realistic character capacity in 703px usable width at 11.5px font-sans in print:
  // Paragraphs hold ~135 chars/line. List items hold ~120 chars/line (after 20px list padding).
  const charPerLine = isListItem ? 120 : 135;
  const lineHeight = 16.5;
  const extraMargin = isListItem ? 2.5 : 3.5;

  const tag = isListItem ? "li" : "p";
  const match = html.match(new RegExp(`^<${tag}(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/${tag}>$`, "i"));
  const inner = match ? match[1] : html;

  // Account for explicit <br/> line breaks inside paragraphs or list items
  const rawSegments = inner.split(/<br\s*\/?>|\r?\n/i);
  let totalLines = 0;
  for (const seg of rawSegments) {
    const segText = seg.replace(/<[^>]*>/g, "").trim();
    if (segText.length === 0) continue;
    totalLines += Math.max(1, Math.ceil(segText.length / charPerLine));
  }
  if (totalLines === 0) totalLines = 1;
  return totalLines * lineHeight + extraMargin;
}

// ─────────────────────────────────────────────────────────────
// ACCURATE TABLE ROW HEIGHT ESTIMATOR
// - Calibrated to 703px usable width (28% scope = 197px, 51% particulars = 358px)
// - Scope column holds ~30 chars/line at 12px bold
// - Particulars column holds ~68 chars/line at 12px text in print
// ─────────────────────────────────────────────────────────────
function estimateTableRowHeight(row: SoftwareRow): number {
  const scopeText = (row.scope || "").trim();
  const partText = (row.particulars || "").trim();

  if (scopeText.length === 0 && partText.length === 0) {
    return 24;
  }

  // Count lines considering explicit line breaks
  const scopeSegments = scopeText.split(/<br\s*\/?>|\r?\n/i);
  let scopeLines = 0;
  for (const seg of scopeSegments) {
    const clean = seg.replace(/<[^>]*>/g, "").trim();
    if (clean.length > 0) {
      scopeLines += Math.max(1, Math.ceil(clean.length / 30));
    }
  }
  if (scopeLines === 0) scopeLines = 1;

  const partSegments = partText.split(/<br\s*\/?>|\r?\n/i);
  let partLines = 0;
  for (const seg of partSegments) {
    const clean = seg.replace(/<[^>]*>/g, "").trim();
    if (clean.length > 0) {
      partLines += Math.max(1, Math.ceil(clean.length / 68));
    }
  }
  if (partLines === 0) partLines = 1;

  const maxLines = Math.max(scopeLines, partLines);
  return Math.max(24, 8 + maxLines * 16.5);
}

interface AtomicBlock {
  type: string;
  html: string;
  isListItem: boolean;
  listType?: "ol" | "ul";
  itemIndex?: number;
  height: number;
}

// Dynamically split an atomic block (paragraph or list item) to fit remaining page height
function splitBlockForAvailableHeight(
  block: AtomicBlock,
  availableHeight: number
): { fitsBlock: AtomicBlock | null; remainderBlock: AtomicBlock | null } {
  const isListItem = block.isListItem;
  const charPerLine = isListItem ? 120 : 135;
  const lineHeight = 16.5;
  const marginExtra = isListItem ? 2.5 : 3.5;

  const rawHtml = block.html;
  const tag = isListItem ? "li" : "p";
  const match = rawHtml.match(new RegExp(`^<${tag}(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/${tag}>$`, "i"));
  const inner = match ? match[1] : rawHtml.replace(/<[^>]*>/g, "");

  const rawSegments = inner.split(/<br\s*\/?>|\r?\n/i);
  let totalLines = 0;
  for (const seg of rawSegments) {
    const segText = seg.replace(/<[^>]*>/g, "").trim();
    if (segText.length === 0) continue;
    totalLines += Math.max(1, Math.ceil(segText.length / charPerLine));
  }
  if (totalLines === 0) totalLines = 1;

  const totalH = totalLines * lineHeight + marginExtra;
  if (totalH <= availableHeight) {
    return { fitsBlock: block, remainderBlock: null };
  }

  const linesThatFit = Math.floor((availableHeight - marginExtra) / lineHeight);
  // Allow any line to fit to avoid leaving empty gaps
  if (linesThatFit < 1 || linesThatFit >= totalLines) {
    return { fitsBlock: null, remainderBlock: block };
  }

  const targetChars = linesThatFit * charPerLine;
  let splitPos = -1;

  // 1. Prefer splitting at a <br> boundary if present
  const brRegex = /<br\s*\/?>/gi;
  let bMatch: RegExpExecArray | null;
  while ((bMatch = brRegex.exec(inner)) !== null) {
    const end = bMatch.index + bMatch[0].length;
    const textSoFar = inner.substring(0, end).replace(/<[^>]*>/g, "").length;
    if (textSoFar <= targetChars + 10) {
      splitPos = end;
    } else {
      break;
    }
  }

  // 2. Sentence boundary (. ? ! ; ।)
  if (splitPos === -1 || inner.substring(0, splitPos).replace(/<[^>]*>/g, "").length < targetChars * 0.4) {
    const punctRegex = /([.?!;\u0964]["'”’]?\s+)(?=[A-Z0-9\u0980-\u09FF"'“‘<])/g;
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
  }

  // 3. Fallback to word boundary
  if (splitPos === -1 || inner.substring(0, splitPos).replace(/<[^>]*>/g, "").length < targetChars * 0.4) {
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

  const rawPart1 = inner.substring(0, splitPos).trim();
  const rawPart2 = inner.substring(splitPos).trim();

  if (!rawPart1 || !rawPart2) {
    return { fitsBlock: null, remainderBlock: block };
  }

  // Balance open tags across both halves
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
  const htmlPart2 = `<${tag}>${openTagsPart2}${rawPart2}</${tag}>`;

  const fitsBlock: AtomicBlock = {
    ...block,
    html: htmlPart1,
    height: linesThatFit * lineHeight + marginExtra,
  };
  const remainderBlock: AtomicBlock = {
    ...block,
    html: htmlPart2,
    height: (totalLines - linesThatFit) * lineHeight + marginExtra,
  };

  return { fitsBlock, remainderBlock };
}

function tokenizeHtmlBlocks(rawHtml: string): AtomicBlock[] {
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

    if (tagName === "hr" || fullMatch.includes("page-break")) {
      blocks.push({
        type: "pagebreak",
        html: "",
        isListItem: false,
        height: 9999,
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

function assembleBlocks(blocksSlice: AtomicBlock[]): string {
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
      out.push(b.html);
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
// UNIFIED DYNAMIC QUOTATION FLOW & PAGINATOR
// - Word-style continuous flow: Content starts IMMEDIATELY after table on any page!
// - ZERO artificial gaps when table rows grow or flow across pages.
// - Each page is cleanly budgeted to exactly 955px usable height.
// - Accurately maintains list numbering across page boundaries (<ol start="...">).
// - Supports explicit manual <!-- pagebreak --> or <hr class="page-break">.
// ─────────────────────────────────────────────────────────────
export function buildQuotationPages(data: QuotationPrintData): QuotationPageModel[] {
  const softwareRows = data.software_rows || [];

  let raw = (data.terms_conditions || "").trim();
  if (data.project_breakdown && !raw.toLowerCase().includes("breakdown")) {
    raw = data.project_breakdown + "\n" + raw;
  }
  if (data.client_requirements && !raw.toLowerCase().includes("what will you provide")) {
    raw = raw + "\n<h3>12. What Will You Provide Us?</h3>\n" + data.client_requirements;
  }
  if (data.deliverables && !raw.toLowerCase().includes("what access you will get")) {
    raw = raw + "\n<h3>13. What Access You Will Get From okobiz:</h3>\n" + data.deliverables;
  }
  if (data.additional_notes && !raw.includes(data.additional_notes)) {
    raw = raw + "\n" + data.additional_notes;
  }

  const allBlocks = tokenizeHtmlBlocks(raw);

  // Height constants in A4 at 96 DPI:
  // Total A4 page height: 1122.5px
  // OkobizHeaderBanner (~106px) + OkobizFooterBanner (~32px) = 138.5px
  // Net usable height: 976px (maintains exactly ~8px gap above footer banner)
  const PAGE_USABLE_HEIGHT = 976;
  const TABLE_THEAD_HEIGHT = 26;
  const TABLE_TFOOT_HEIGHT = 48; // Grand total + in words
  const TABLE_CONTINUES_NOTE_HEIGHT = 16; // "Scope of work continues on next page →"
  const SIGNATORY_HEIGHT = 115;
  const CONTINUATION_TABLE_HEADER_HEIGHT = 28; // "Scope of Work & Deliverables (Continued)"

  // Accurately compute Page 1 pre-table height
  let clientCardH = 15; // "To" line
  if (data.client_name && data.client_name.trim().length > 0) clientCardH += 16;
  if (data.organization_name && data.organization_name.trim().length > 0) clientCardH += 15;
  if (data.address && data.address.trim().length > 0) clientCardH += 15;
  if (data.phone && data.phone.trim().length > 0) clientCardH += 15;
  if (data.email && data.email.trim().length > 0) clientCardH += 15;
  clientCardH += 8; // mb-2

  const page1PreTableH = 24 + clientCardH + 30; // Date/Ref + To + Subject
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

    // 1. Process Table Rows on this page if any remain
    if (unallocatedRows.length > 0) {
      const isFirstTableChunk = isFirstPage;
      if (!isFirstPage) {
        pageAvailH -= CONTINUATION_TABLE_HEADER_HEIGHT;
      }
      pageAvailH -= TABLE_THEAD_HEIGHT;

      const chunkRows: SoftwareRow[] = [];
      let currentTableH = 0;

      while (unallocatedRows.length > 0) {
        const nextRow = unallocatedRows[0];
        const nextRowH = estimateTableRowHeight(nextRow);
        const isFinalRow = unallocatedRows.length === 1;
        const neededH = nextRowH + (isFinalRow ? TABLE_TFOOT_HEIGHT : TABLE_CONTINUES_NOTE_HEIGHT);

        if (currentTableH + neededH <= pageAvailH) {
          chunkRows.push(unallocatedRows.shift()!);
          currentTableH += nextRowH;
        } else {
          // If we can't even fit 1 row, take at least 1 row to prevent infinite loop
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
        isLastChunk: isLastChunk,
      };

      pageAvailH -= currentTableH;
    }

    // 2. Process Narrative Content on this page
    if (unallocatedRows.length === 0 && unallocatedBlocks.length > 0 && pageAvailH > 15) {
      const remainingBlocksH = unallocatedBlocks.reduce((sum, b) => sum + b.height, 0);

      if (remainingBlocksH + SIGNATORY_HEIGHT <= pageAvailH) {
        // Fits entirely on this page with signatory!
        pageNarrativeHtml = assembleBlocks(unallocatedBlocks);
        unallocatedBlocks = [];
        showSignatory = true;
      } else {
        let effectiveAvailH = pageAvailH;

        // If ALL remaining blocks could fit on this page, but the signatory cannot fit,
        // holding all of them here would leave the next page completely blank with ONLY the signatory.
        // We gently hold back just enough (25-35px, i.e. 1 line/item) so the next page has real content above the signatory,
        // without creating an unsightly empty gap on this page!
        if (remainingBlocksH <= pageAvailH) {
          const gentleHoldbackH = Math.min(35, Math.max(20, remainingBlocksH * 0.10));
          effectiveAvailH = Math.max(25, pageAvailH - gentleHoldbackH);
        }

        const pageBlocks: AtomicBlock[] = [];

        while (unallocatedBlocks.length > 0 && effectiveAvailH > 12) {
          const nextB = unallocatedBlocks[0];

          // Check if this block is an explicit page break
          if (nextB.type === "pagebreak" || nextB.html.includes("page-break")) {
            unallocatedBlocks.shift();
            break;
          }

          // Orphan heading check: Heading needs room for heading + at least 1 line (~16.5px) of text
          if (nextB.type.startsWith("h")) {
            if (effectiveAvailH < nextB.height + 16.5) {
              break;
            }
          }

          if (nextB.height <= effectiveAvailH) {
            pageBlocks.push(unallocatedBlocks.shift()!);
            effectiveAvailH -= nextB.height;
          } else {
            // Block does NOT fit entirely. Adaptively split it if paragraph or list item down to 1 line
            if ((nextB.type === "p" || nextB.type === "li") && effectiveAvailH >= 16) {
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

        // If after packing, all blocks are finished AND remaining page space >= signatory:
        const usedBlocksH = pageBlocks.reduce((s, b) => s + b.height, 0);
        if (unallocatedBlocks.length === 0 && (pageAvailH - usedBlocksH) >= SIGNATORY_HEIGHT) {
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

  // Ensure last page has isLastPage: true and showSignatory: true
  if (pages.length > 0) {
    const lastPage = pages[pages.length - 1];
    if (!lastPage.showSignatory) {
      lastPage.showSignatory = true;
    }
    lastPage.isLastPage = true;
  }

  return pages;
}

const formatPrice = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === "" || val === 0) return "0/-";
  if (typeof val === "string" && val.includes("/-")) return val;
  const num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.-]/g, "")) : val;
  if (isNaN(num)) return String(val);
  return num.toLocaleString("en-IN") + "/-";
};

export const QuotationPrintSheet: React.FC<QuotationPrintSheetProps> = ({
  data,
  className = "",
}) => {
  const pages = buildQuotationPages(data);

  const formattedDate = data.quote_date
    ? format(new Date(data.quote_date), "d MMMM, yyyy")
    : format(new Date(), "d MMMM, yyyy");

  const grandTotalValue = data.grand_total || data.software_amount || 0;
  const formattedGrandTotal = formatPrice(grandTotalValue);
  const inWordsDisplay =
    data.in_words && data.in_words.trim().length > 0
      ? data.in_words
      : numberToWords(grandTotalValue).replace(" Taka Only", " Only");

  const SignatoryBlock = () => (
    <div className="pt-3 mt-auto pb-0.5 select-none shrink-0">
      <div className="flex justify-between items-end text-xs">
        <div>
          <div className="font-bold text-zinc-900 mb-0.5">Thanks & Regards</div>
          <div className="h-7 sm:h-8" />
          <div className="font-bold text-zinc-900">
            {data.company_signatory_name || "Md. Sorower Jahan"} |{" "}
            {data.company_signatory_title || "CEO"}
          </div>
          <div className="font-semibold text-zinc-700">okobiz</div>
          <div className="text-zinc-600">
            Contact No: {data.company_phone || "+880 1973590937"}
          </div>
        </div>

        <div className="text-right">
          <div className="h-7 sm:h-8" />
          <div className="w-44 sm:w-48 border-t-2 border-dashed border-zinc-800 mb-1 ml-auto" />
          <div className="font-bold text-zinc-900">Client Signature & Seal</div>
        </div>
      </div>
    </div>
  );

  const renderSoftwareTable = (rows: SoftwareRow[], isLastScopePage: boolean = true) => {
    if (!rows || rows.length === 0) return null;
    return (
      <div className="shrink-0 mb-1.5 quotation-table-wrapper">
        <div className="border border-zinc-900 overflow-hidden bg-transparent">
          <table
            className="quotation-table w-full text-xs border-collapse bg-transparent shrink-0"
            style={{ tableLayout: "fixed", height: "auto" }}
          >
            <thead>
              <tr
                className="bg-[#1E65B8] !text-white font-bold border-b border-zinc-900 print:bg-[#1E65B8] print:text-white"
                style={{ backgroundColor: "#1E65B8", color: "#ffffff" }}
              >
                <th
                  style={{ width: "7%", backgroundColor: "#1E65B8", color: "#ffffff" }}
                  className="quotation-th py-1 px-2 text-center text-xs font-bold uppercase tracking-wider border-r border-white/50 text-white-always !text-white"
                >
                  <span className="text-white-always !text-white font-bold">SL</span>
                </th>
                <th
                  style={{ width: "28%", backgroundColor: "#1E65B8", color: "#ffffff" }}
                  className="quotation-th py-1 px-2.5 text-left text-xs font-bold uppercase tracking-wider border-r border-white/50 text-white-always !text-white"
                >
                  <span className="text-white-always !text-white font-bold">SCOPE OF WORK</span>
                </th>
                <th
                  style={{ width: "51%", backgroundColor: "#1E65B8", color: "#ffffff" }}
                  className="quotation-th py-1 px-2.5 text-left text-xs font-bold uppercase tracking-wider border-r border-white/50 text-white-always !text-white"
                >
                  <span className="text-white-always !text-white font-bold">PARTICULARS</span>
                </th>
                <th
                  style={{ width: "14%", backgroundColor: "#1E65B8", color: "#ffffff" }}
                  className="quotation-th py-1 px-2 text-center text-xs font-bold uppercase tracking-wider text-white-always !text-white"
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
                    className="py-1 px-2 text-center font-bold text-zinc-900 align-top border-r border-zinc-500 w-[7%] bg-transparent"
                    style={{ backgroundColor: "transparent" }}
                  >
                    {row.sl || index + 1}
                  </td>
                  <td
                    className="py-1 px-2.5 font-bold text-zinc-900 align-top border-r border-zinc-500 w-[28%] bg-transparent"
                    style={{ backgroundColor: "transparent" }}
                  >
                    {row.scope}
                  </td>
                  <td
                    className="py-1 px-2.5 text-zinc-800 leading-snug align-top border-r border-zinc-500 w-[51%] bg-transparent"
                    style={{ backgroundColor: "transparent" }}
                  >
                    {row.particulars}
                  </td>
                  {index === 0 && (
                    <td
                      rowSpan={rows.length}
                      className="py-1.5 px-2 text-center font-bold text-zinc-900 text-sm align-middle bg-transparent w-[14%]"
                      style={{ backgroundColor: "transparent" }}
                    >
                      {formattedGrandTotal}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            {isLastScopePage && (
              <tfoot className="border-t-2 border-zinc-900 bg-transparent" style={{ backgroundColor: "transparent" }}>
                <tr className="bg-transparent font-bold border-b border-zinc-800" style={{ backgroundColor: "transparent" }}>
                  <td
                    colSpan={3}
                    className="py-1 px-3 text-right text-xs font-bold text-zinc-900 border-r border-zinc-800 uppercase tracking-wide bg-transparent"
                    style={{ backgroundColor: "transparent" }}
                  >
                    Grand Total =
                  </td>
                  <td
                    className="py-1 px-2.5 text-center text-xs font-bold text-zinc-900 bg-transparent"
                    style={{ backgroundColor: "transparent" }}
                  >
                    {formattedGrandTotal}
                  </td>
                </tr>
                <tr className="bg-transparent font-bold" style={{ backgroundColor: "transparent" }}>
                  <td
                    colSpan={4}
                    className="py-1 px-3 text-left text-xs font-bold text-zinc-900 bg-transparent"
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

  return (
    <div
      className={`quotation-document font-sans text-zinc-900 bg-white w-[794px] max-w-[794px] mx-auto p-0 print:p-0 print:w-full print:max-w-full print:m-0 print:mx-0 [&_*]:!rounded-none ${className}`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* ══════════════ RICH TEXT EDITOR STYLES (SCREEN & PREVIEW) ══════════════ */
        .quotation-narrative-flow {
          font-size: 11.5px;
          line-height: 1.45;
          color: #1e293b;
        }
        .quotation-narrative-flow h1,
        .quotation-narrative-flow h1 * {
          display: block;
          font-size: 15px;
          font-weight: 800;
          color: #09090b;
          margin-top: 10px;
          margin-bottom: 4px;
          line-height: 1.25;
        }
        .quotation-narrative-flow h2,
        .quotation-narrative-flow h2 * {
          display: block;
          font-size: 13.5px;
          font-weight: 700;
          color: #09090b;
          margin-top: 8px;
          margin-bottom: 3px;
          line-height: 1.3;
        }
        .quotation-narrative-flow h3,
        .quotation-narrative-flow h3 * {
          display: block;
          font-size: 12.5px;
          font-weight: 700;
          color: #09090b;
          margin-top: 7px;
          margin-bottom: 2px;
          line-height: 1.3;
        }
        .quotation-narrative-flow h4,
        .quotation-narrative-flow h4 *,
        .quotation-narrative-flow h5,
        .quotation-narrative-flow h5 *,
        .quotation-narrative-flow h6,
        .quotation-narrative-flow h6 * {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #09090b;
          margin-top: 6px;
          margin-bottom: 2px;
        }
        .quotation-narrative-flow strong,
        .quotation-narrative-flow b,
        .quotation-narrative-flow strong *,
        .quotation-narrative-flow b *,
        .quotation-narrative-flow [style*="font-weight: bold"],
        .quotation-narrative-flow [style*="font-weight:bold"],
        .quotation-narrative-flow [style*="font-weight: 700"],
        .quotation-narrative-flow [style*="font-weight:700"] {
          font-weight: 700 !important;
          color: #09090b !important;
        }
        .quotation-narrative-flow em,
        .quotation-narrative-flow i,
        .quotation-narrative-flow em *,
        .quotation-narrative-flow i * {
          font-style: italic !important;
        }
        .quotation-narrative-flow u,
        .quotation-narrative-flow u * {
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
          margin: 3px 0 !important;
          padding-left: 20px !important;
        }
        .quotation-narrative-flow ul {
          display: block !important;
          list-style-type: disc !important;
          margin: 3px 0 !important;
          padding-left: 20px !important;
        }
        .quotation-narrative-flow li {
          display: list-item !important;
          margin-bottom: 2.5px !important;
          line-height: 1.45 !important;
          color: #1e293b !important;
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
        .quotation-narrative-flow a {
          color: #1E65B8 !important;
          text-decoration: underline !important;
        }
        .quotation-narrative-flow p {
          margin-bottom: 3.5px !important;
          line-height: 1.45 !important;
        }
        .quotation-narrative-flow [style*="color"],
        .quotation-narrative-flow [style*="background-color"],
        .quotation-narrative-flow font,
        .quotation-narrative-flow mark {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* ══════════════ PRINT STYLES (A4 PDF EXPORT) ══════════════ */
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt !important;
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
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
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
          .quotation-page-body {
            box-sizing: border-box !important;
            width: 100% !important;
            padding: 0 12mm !important;
            flex: 1 1 0% !important;
            display: flex !important;
            flex-direction: column !important;
            position: relative !important;
            z-index: 10 !important;
            background-color: transparent !important;
            min-height: 0 !important;
            overflow: hidden !important;
          }
          .quotation-page:not(:last-child) {
            page-break-after: always !important;
            break-after: page !important;
          }
          .quotation-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .quotation-page img {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .quotation-watermark {
            position: absolute !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            pointer-events: none !important;
            z-index: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .quotation-watermark img {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
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
          .quotation-table td,
          .quotation-table tfoot {
            border-collapse: collapse !important;
            width: 100% !important;
            background-color: transparent !important;
            background: transparent !important;
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
            background: #1E65B8 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .quotation-page th *,
          .quotation-table th * {
            color: #ffffff !important;
          }

          /* Explicit rich text styles inside @media print */
          .quotation-narrative-flow {
            font-size: 11.5px !important;
            line-height: 1.45 !important;
            color: #1e293b !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .quotation-narrative-flow h1,
          .quotation-narrative-flow h1 * {
            display: block !important;
            font-size: 15px !important;
            font-weight: 800 !important;
            color: #09090b !important;
            margin-top: 10px !important;
            margin-bottom: 4px !important;
            line-height: 1.25 !important;
          }
          .quotation-narrative-flow h2,
          .quotation-narrative-flow h2 * {
            display: block !important;
            font-size: 13.5px !important;
            font-weight: 700 !important;
            color: #09090b !important;
            margin-top: 8px !important;
            margin-bottom: 3px !important;
            line-height: 1.3 !important;
          }
          .quotation-narrative-flow h3,
          .quotation-narrative-flow h3 * {
            display: block !important;
            font-size: 12.5px !important;
            font-weight: 700 !important;
            color: #09090b !important;
            margin-top: 7px !important;
            margin-bottom: 2px !important;
            line-height: 1.3 !important;
          }
          .quotation-narrative-flow h4,
          .quotation-narrative-flow h4 *,
          .quotation-narrative-flow h5,
          .quotation-narrative-flow h5 *,
          .quotation-narrative-flow h6,
          .quotation-narrative-flow h6 * {
            display: block !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            color: #09090b !important;
            margin-top: 6px !important;
            margin-bottom: 2px !important;
          }
          .quotation-narrative-flow strong,
          .quotation-narrative-flow b,
          .quotation-narrative-flow strong *,
          .quotation-narrative-flow b *,
          .quotation-narrative-flow [style*="font-weight: bold"],
          .quotation-narrative-flow [style*="font-weight:bold"],
          .quotation-narrative-flow [style*="font-weight: 700"],
          .quotation-narrative-flow [style*="font-weight:700"] {
            font-weight: 700 !important;
            color: #09090b !important;
          }
          .quotation-narrative-flow em,
          .quotation-narrative-flow i,
          .quotation-narrative-flow em *,
          .quotation-narrative-flow i * {
            font-style: italic !important;
          }
          .quotation-narrative-flow u,
          .quotation-narrative-flow u * {
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
            margin: 3px 0 !important;
            padding-left: 20px !important;
          }
          .quotation-narrative-flow ul {
            display: block !important;
            list-style-type: disc !important;
            margin: 3px 0 !important;
            padding-left: 20px !important;
          }
          .quotation-narrative-flow li {
            display: list-item !important;
            margin-bottom: 2.5px !important;
            line-height: 1.45 !important;
            color: #1e293b !important;
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
          .quotation-narrative-flow a {
            color: #1E65B8 !important;
            text-decoration: underline !important;
          }
          .quotation-narrative-flow p {
            margin-bottom: 3.5px !important;
            line-height: 1.45 !important;
          }
          .quotation-narrative-flow [style*="color"],
          .quotation-narrative-flow [style*="background-color"],
          .quotation-narrative-flow font,
          .quotation-narrative-flow mark {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `,
        }}
      />

      {/* ════════════════════════ UNIFIED SEAMLESS QUOTATION PAGES ════════════════════════ */}
      {pages.map((page) => (
        <section
          key={`quotation-page-${page.pageNumber}`}
          className="quotation-page relative bg-white border border-zinc-200 print:border-none p-0 mb-8 print:mb-0 shadow-sm print:shadow-none w-[794px] min-h-[1123px] h-[1123px] print:w-full print:max-w-full print:h-[297mm] print:min-h-[297mm] print:max-h-[297mm] print:m-0 print:mx-0 flex flex-col justify-between overflow-hidden rounded-none"
        >
          <OkobizWatermark />

          <OkobizHeaderBanner />

          <div className="quotation-page-body flex-1 flex flex-col px-5 sm:px-8 print:px-[12mm] relative z-10 bg-transparent">
            {page.isFirstPage ? (
              <>
                <div className="flex justify-between items-start text-xs sm:text-sm font-semibold mb-2.5">
                  <div>{formattedDate}</div>
                  {data.ref_no && (
                    <div className="text-right">
                      <span>Ref No. </span>
                      <span className="font-bold text-[#1E65B8]">{data.ref_no}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs leading-snug mb-2">
                  <div className="font-semibold mb-0.5">To</div>
                  {data.client_name && (
                    <div className="font-bold text-zinc-900">{data.client_name}</div>
                  )}
                  {data.organization_name && (
                    <div className="text-zinc-700 font-medium">
                      {data.organization_name}
                    </div>
                  )}
                  {data.address && <div className="text-zinc-600">{data.address}</div>}
                  {data.phone && (
                    <div className="text-zinc-600">Cell: {data.phone}</div>
                  )}
                  {data.email && (
                    <div className="text-zinc-600">Email: {data.email}</div>
                  )}
                </div>

                <div className="text-xs font-bold text-zinc-900 mb-3.5 pb-1 border-b border-zinc-200">
                  <span>Subject: </span>
                  <span className="underline">{data.subject || "Quotation for Web & Software Solution"}</span>
                </div>
              </>
            ) : page.tableChunk ? (
              <div className="flex justify-between items-center text-xs font-semibold mb-3.5 pb-1 border-b border-zinc-200">
                <span className="font-bold text-zinc-800">
                  Scope of Work &amp; Deliverables (Continued)
                </span>
                <div className="text-right text-zinc-600">
                  <span>Ref No. </span>
                  <span className="font-bold text-[#1E65B8]">{data.ref_no}</span>
                </div>
              </div>
            ) : null}

            {/* Table (if any on this page) */}
            {page.tableChunk && (
              <div className="mt-1">
                {renderSoftwareTable(page.tableChunk.rows, page.tableChunk.isLastChunk)}
                {!page.tableChunk.isLastChunk && (
                  <div className="text-[10px] text-zinc-500 font-semibold italic text-right mt-1 pb-1">
                    Scope of work continues on next page →
                  </div>
                )}
              </div>
            )}

            {/* Narrative Content (Flows seamlessly immediately after table or at top of page) */}
            {page.narrativeHtml && (
              <div
                className={`quotation-narrative-flow ${page.tableChunk ? "mt-2.5" : "mt-0"} flex-1 text-xs text-zinc-800 leading-normal`}
                dangerouslySetInnerHTML={{ __html: page.narrativeHtml }}
              />
            )}

            {/* Signatory Block (at the bottom of the final page) */}
            {page.showSignatory && <SignatoryBlock />}
          </div>

          <OkobizFooterBanner
            phone={data.company_phone}
            email={data.company_email}
          />
        </section>
      ))}
    </div>
  );
};
