import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import {
  QuotationPrintData,
  QuotationPageModel,
  QuotationPageShell,
  QUOTATION_CSS,
  AtomicBlock,
  tokenizeHtmlBlocks,
  assembleBlocks,
  compileNarrativeText,
  formatPrice,
} from "@/components/quotation/quotation-print-sheet";
import { format } from "@/lib/date";
import { numberToWords } from "@/lib/number-to-words";

export function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.requestAnimationFrame) {
      setTimeout(resolve, 16);
      return;
    }
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

// ─────────────────────────────────────────────────────────────
// HARDENED MEASUREMENT SANDBOX (210mm A4, ISOLATED, WITH STYLES)
// ─────────────────────────────────────────────────────────────
export function createSandbox(): { root: HTMLDivElement; dispose(): void } {
  const root = document.createElement("div");
  // Exact 210mm width matching the real print and screen quotation page shell
  root.style.cssText =
    "position:absolute;left:-10000px;top:0;visibility:hidden;pointer-events:none;" +
    "width:210mm;display:flow-root;box-sizing:border-box;";
  root.className = "quotation-document font-sans";

  const styleEl = document.createElement("style");
  styleEl.textContent = QUOTATION_CSS;
  root.appendChild(styleEl);

  document.body.appendChild(root);
  return {
    root,
    dispose: () => {
      try {
        root.remove();
      } catch {}
    },
  };
}

// Extracts a short single-line slice of a block to test orphan-heading clearance
function getFirstLineBlock(block: AtomicBlock): AtomicBlock {
  const isListItem = block.isListItem;
  const tag = isListItem ? "li" : "p";
  const match = block.html.match(new RegExp(`^<${tag}(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/${tag}>$`, "i"));
  const text = (match ? match[1] : block.html).replace(/<[^>]*>/g, "").trim();
  const firstLineText = text.split(/[.\n]/)[0]?.slice(0, 75) || text.slice(0, 75);
  return {
    ...block,
    html: `<${tag}>${firstLineText}</${tag}>`,
  };
}

// Split paragraph or list item candidate based on real browser overflow predicate
function splitBlockWithPredicate(
  block: AtomicBlock,
  pageBlocks: AtomicBlock[],
  narrativeEl: HTMLElement,
  fits: (body: HTMLElement) => boolean,
  body: HTMLElement
): { fitsBlock: AtomicBlock | null; remainderBlock: AtomicBlock | null } {
  const isListItem = block.isListItem;
  const rawHtml = block.html;
  const tag = isListItem ? "li" : "p";
  const match = rawHtml.match(new RegExp(`^<${tag}(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/${tag}>$`, "i"));
  const inner = match ? match[1] : rawHtml.replace(/<[^>]*>/g, "");

  // Find candidate split offsets at whitespace or line-breaks outside of HTML tags
  const candidates: Array<{ pos: number; isSentence: boolean }> = [];
  let inTag = false;

  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === "<") {
      inTag = true;
    } else if (ch === ">") {
      inTag = false;
      const tagSlice = inner.slice(Math.max(0, i - 6), i + 1);
      if (/<br\s*\/?>$/i.test(tagSlice)) {
        candidates.push({ pos: i + 1, isSentence: true });
      }
    } else if (!inTag && /\s/.test(ch)) {
      const prevText = inner.slice(Math.max(0, i - 10), i);
      const isSentence = /[.?!;:\u0964]["'”’]?$/.test(prevText.trim());
      candidates.push({ pos: i, isSentence });
    }
  }

  if (candidates.length < 2) {
    return { fitsBlock: null, remainderBlock: block };
  }

  function makeHalves(splitPos: number) {
    const rawPart1 = inner.substring(0, splitPos).trim().replace(/<br\s*\/?>$/i, "");
    const rawPart2 = inner.substring(splitPos).trim().replace(/^<br\s*\/?>/i, "");

    const openTags: Array<{ tag: string; fullOpenTag: string }> = [];
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

    const part1Html = `<${tag}>${rawPart1}${closeTagsPart1}</${tag}>`;
    // For list items: continuation gets data-continued="true" so <ol> numbering does not advance
    const part2Html = isListItem
      ? `<li data-continued="true" style="list-style-type: none;">${openTagsPart2}${rawPart2}</li>`
      : `<p>${openTagsPart2}${rawPart2}</p>`;

    return { part1Html, part2Html };
  }

  // Binary search for largest candidate where fits(body) is true
  let low = 0;
  let high = candidates.length - 1;
  let bestIdx = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const { part1Html } = makeHalves(candidates[mid].pos);
    narrativeEl.innerHTML = assembleBlocks([...pageBlocks, { ...block, html: part1Html }]);

    if (fits(body)) {
      bestIdx = mid;
      low = mid + 1; // Try to fit more
    } else {
      high = mid - 1; // Overflows, back off
    }
  }

  if (bestIdx === -1) {
    return { fitsBlock: null, remainderBlock: block };
  }

  // Prefer a sentence boundary if it retains at least 85% of character fit
  // AND does not leave an excessive bottom gap (> 20px)
  const bestPos = candidates[bestIdx].pos;
  let selectedIdx = bestIdx;
  const minCharTarget = bestPos * 0.85;

  for (let c = bestIdx; c >= 0; c--) {
    if (candidates[c].isSentence && candidates[c].pos >= minCharTarget) {
      selectedIdx = c;
      break;
    }
  }

  if (selectedIdx !== bestIdx) {
    const { part1Html: sentHtml } = makeHalves(candidates[selectedIdx].pos);
    narrativeEl.innerHTML = assembleBlocks([...pageBlocks, { ...block, html: sentHtml }]);
    const freeSpace = body.clientHeight - body.scrollHeight;
    if (freeSpace > 20) {
      selectedIdx = bestIdx;
    }
  }

  const { part1Html, part2Html } = makeHalves(candidates[selectedIdx].pos);

  return {
    fitsBlock: { ...block, html: part1Html, height: 0 },
    remainderBlock: { ...block, html: part2Html, height: 0 },
  };
}

// ─────────────────────────────────────────────────────────────
// REAL CLOSED-LOOP PAGINATION ENGINE
// - No guessed heights, no penalties, no arithmetic drift
// - Uses fits(body) === (scrollHeight - clientHeight <= 0)
// ─────────────────────────────────────────────────────────────
export async function paginateMeasured(
  data: QuotationPrintData
): Promise<QuotationPageModel[]> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return [];
  }

  // Step D: Wait for fonts and images
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const sandbox = createSandbox();
  const host = document.createElement("div");
  sandbox.root.appendChild(host);
  const reactRoot = createRoot(host);

  try {
    const formattedDate = data.quote_date
      ? format(new Date(data.quote_date), "d MMMM, yyyy")
      : format(new Date(), "d MMMM, yyyy");

    const grandTotalValue = data.grand_total || data.software_amount || 0;
    const formattedGrandTotal = formatPrice(grandTotalValue);
    const inWordsDisplay =
      data.in_words && data.in_words.trim().length > 0
        ? data.in_words
        : numberToWords(grandTotalValue).replace(" Taka Only", " Only");

    const allRows = data.software_rows || [];

    // Ground-truth overflow predicate directly from the real browser layout engine
    const fits = (body: HTMLElement) => body.scrollHeight - body.clientHeight <= 0;

    // Helper to render candidate shell into sandbox
    const renderCandidate = (pageModel: QuotationPageModel): HTMLElement => {
      flushSync(() => {
        reactRoot.render(
          <QuotationPageShell
            data={data}
            formattedDate={formattedDate}
            formattedGrandTotal={formattedGrandTotal}
            inWordsDisplay={inWordsDisplay}
            page={pageModel}
            measureMode={true}
          />
        );
      });
      return host.querySelector(".quotation-page-body") as HTMLElement;
    };

    // Render initial candidate shell first so letterhead watermark images are mounted in DOM
    renderCandidate({
      pageNumber: 1,
      isFirstPage: true,
      isLastPage: false,
      tableChunk: null,
      narrativeHtml: "",
      showSignatory: false,
    });

    // Await decoding of all letterhead images
    await Promise.all(
      Array.from(sandbox.root.querySelectorAll("img")).map((img) =>
        img.decode ? img.decode().catch(() => {}) : Promise.resolve()
      )
    );

    // Prepare narrative content (de-duplicated)
    const rawNarrative = compileNarrativeText(data);
    const allBlocks = tokenizeHtmlBlocks(rawNarrative);

    const pages: QuotationPageModel[] = [];
    let unallocatedRows = [...allRows];
    let unallocatedBlocks = [...allBlocks];
    let pageNumber = 1;

    while (unallocatedRows.length > 0 || unallocatedBlocks.length > 0) {
      const isFirstPage = pageNumber === 1;
      let pageTableChunk: QuotationPageModel["tableChunk"] = null;
      let pageNarrativeHtml: string | null = null;
      let showSignatory = false;

      // ─────────────────────────────────────────────────────────
      // 1. Table Chunk Fitting (Binary Search on Real Rendered Shell)
      // ─────────────────────────────────────────────────────────
      if (unallocatedRows.length > 0) {
        let low = 1;
        let high = unallocatedRows.length;
        let bestK = 0;

        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          const candidateRows = unallocatedRows.slice(0, mid);
          const isLastChunk = mid === unallocatedRows.length;

          const body = renderCandidate({
            pageNumber,
            isFirstPage,
            isLastPage: false,
            tableChunk: {
              rows: candidateRows,
              isFirstChunk: isFirstPage,
              isLastChunk,
            },
            narrativeHtml: "",
            showSignatory: false,
          });

          if (fits(body)) {
            bestK = mid;
            low = mid + 1; // Try fitting more rows
          } else {
            high = mid - 1; // Overflows, reduce rows
          }
        }

        // Safety: ensure at least 1 row is placed per page
        if (bestK === 0) bestK = 1;

        const chunkRows = unallocatedRows.slice(0, bestK);
        unallocatedRows = unallocatedRows.slice(bestK);
        const isLastChunk = unallocatedRows.length === 0;

        pageTableChunk = {
          rows: chunkRows,
          isFirstChunk: isFirstPage,
          isLastChunk,
        };

        // If table doesn't finish on this page, narrative cannot start here
        if (!isLastChunk) {
          pages.push({
            pageNumber: pageNumber++,
            isFirstPage,
            isLastPage: false,
            tableChunk: pageTableChunk,
            narrativeHtml: null,
            showSignatory: false,
          });
          continue;
        }
      }

      // ─────────────────────────────────────────────────────────
      // 2. Narrative Chunk Fitting (Greedy Fit with Real DOM Test)
      // ─────────────────────────────────────────────────────────
      // Render shell with table (if any) and empty narrative flow container
      let body = renderCandidate({
        pageNumber,
        isFirstPage,
        isLastPage: false,
        tableChunk: pageTableChunk,
        narrativeHtml: "",
        showSignatory: false,
      });

      const narrativeEl = body.querySelector(".quotation-narrative-flow") as HTMLElement;
      const pageBlocks: AtomicBlock[] = [];

      if (narrativeEl && unallocatedBlocks.length > 0) {
        while (unallocatedBlocks.length > 0) {
          const nextB = unallocatedBlocks[0];

          // Explicit manual page break
          if (nextB.type === "pagebreak" || nextB.html.includes("page-break")) {
            unallocatedBlocks.shift();
            break;
          }

          // Orphan heading check: only standalone headings (h1-h6 or lone <p><strong> without body text)
          const isStandaloneHeading =
            nextB.type.startsWith("h") ||
            (nextB.type === "p" && nextB.html.startsWith("<p><strong>") && !nextB.html.includes("<br")) ||
            (nextB.type === "li" && nextB.html.startsWith("<li><p><strong>") && !nextB.html.includes("<br"));
          if (isStandaloneHeading) {
            if (unallocatedBlocks.length > 1) {
              const probeNext = unallocatedBlocks[1];
              const firstLineOfNext = getFirstLineBlock(probeNext);
              narrativeEl.innerHTML = assembleBlocks([...pageBlocks, nextB, firstLineOfNext]);
              if (!fits(body)) {
                // Cannot fit heading + at least 1 line of text. Move heading to next page!
                break;
              }
            } else {
              // Lone heading at the very end of the document
              break;
            }
          }

          // Test candidate slice with next block
          narrativeEl.innerHTML = assembleBlocks([...pageBlocks, nextB]);

          if (fits(body)) {
            pageBlocks.push(unallocatedBlocks.shift()!);
          } else {
            // Block does not fit: attempt measured split if paragraph or list item
            if (nextB.type === "p" || nextB.type === "li") {
              const splitRes = splitBlockWithPredicate(
                nextB,
                pageBlocks,
                narrativeEl,
                fits,
                body
              );

              if (splitRes.fitsBlock) {
                pageBlocks.push(splitRes.fitsBlock);
                unallocatedBlocks[0] = splitRes.remainderBlock!;
                narrativeEl.innerHTML = assembleBlocks(pageBlocks);
              }
            }
            // Page is now full
            break;
          }
        }

        // Safety: If no block could be placed and no table exists on this page, take at least 1
        if (pageBlocks.length === 0 && unallocatedBlocks.length > 0 && !pageTableChunk) {
          pageBlocks.push(unallocatedBlocks.shift()!);
          narrativeEl.innerHTML = assembleBlocks(pageBlocks);
        }

        pageNarrativeHtml = assembleBlocks(pageBlocks);

        // ─────────────────────────────────────────────────────────
        // 3. Signatory Placement Test
        // ─────────────────────────────────────────────────────────
        if (unallocatedBlocks.length === 0) {
          // All blocks placed: test if SignatoryBlock fits on this page
          const bodyWithSig = renderCandidate({
            pageNumber,
            isFirstPage,
            isLastPage: true,
            tableChunk: pageTableChunk,
            narrativeHtml: pageNarrativeHtml,
            showSignatory: true,
          });

          // Allow subpixel / flexbox tolerance (up to 8px)
          const fitsWithSig = bodyWithSig.scrollHeight - bodyWithSig.clientHeight <= 8;

          if (fitsWithSig) {
            showSignatory = true;
          } else {
            // Signatory doesn't fit on this page and must go to a new page.
            // DO NOT pop regular content (list items or paragraphs) off this page!
            // Leaving regular content on this page ensures the page remains full with zero bottom gap.
            // ONLY pop if the trailing element is an orphan heading with zero children.
            if (pageBlocks.length > 0) {
              const remainingLast = pageBlocks[pageBlocks.length - 1];
              const isOrphanHeading =
                remainingLast.type.startsWith("h") ||
                (remainingLast.type === "p" &&
                  remainingLast.html.startsWith("<p><strong>") &&
                  !remainingLast.html.includes("<br")) ||
                (remainingLast.type === "li" &&
                  remainingLast.html.startsWith("<li><p><strong>") &&
                  !remainingLast.html.includes("<br"));
              if (isOrphanHeading && pageBlocks.length > 1) {
                unallocatedBlocks.unshift(pageBlocks.pop()!);
                pageNarrativeHtml = assembleBlocks(pageBlocks);
              }
            }
          }
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

    // Ensure signatory is placed: if all blocks finished but signatory could not fit on any page,
    // add a final page for the signatory block so it is never clipped or forced onto an overflowing page
    const anyPageHasSig = pages.some((p) => p.showSignatory);
    if (!anyPageHasSig && pages.length > 0) {
      pages.push({
        pageNumber: pageNumber++,
        isFirstPage: false,
        isLastPage: true,
        tableChunk: null,
        narrativeHtml: null,
        showSignatory: true,
      });
    }

    // Ensure final page has isLastPage and showSignatory set
    if (pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      lastPage.showSignatory = true;
      lastPage.isLastPage = true;
    }

    return pages;
  } finally {
    try {
      reactRoot.unmount();
      sandbox.dispose();
    } catch {}
  }
}
