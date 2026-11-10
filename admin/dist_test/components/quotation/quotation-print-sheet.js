"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationPrintSheet = exports.OkobizLetterheadPage = exports.OkobizFooterBanner = exports.OkobizWatermark = exports.OkobizHeaderBanner = void 0;
exports.buildQuotationPages = buildQuotationPages;
const react_1 = __importDefault(require("react"));
const date_1 = require("@/lib/date");
const number_to_words_1 = require("@/lib/number-to-words");
const okobiz_letterhead_page_1 = require("./okobiz-letterhead-page");
Object.defineProperty(exports, "OkobizHeaderBanner", { enumerable: true, get: function () { return okobiz_letterhead_page_1.OkobizHeaderBanner; } });
Object.defineProperty(exports, "OkobizWatermark", { enumerable: true, get: function () { return okobiz_letterhead_page_1.OkobizWatermark; } });
Object.defineProperty(exports, "OkobizFooterBanner", { enumerable: true, get: function () { return okobiz_letterhead_page_1.OkobizFooterBanner; } });
Object.defineProperty(exports, "OkobizLetterheadPage", { enumerable: true, get: function () { return okobiz_letterhead_page_1.OkobizLetterheadPage; } });
// ─────────────────────────────────────────────────────────────
// ACCURATE PHYSICAL HEIGHT ESTIMATOR & ADAPTIVE BLOCK SPLITTER
// - Calibrated to exact typography of Okobiz quotation / bill pads
// - Calculates exact rendered pixel heights for all rich text elements
// - Dynamically splits paragraphs and list items to fill pages down to bottom margin
// - 100% prevents footer clipping & eliminates large gaps across all pages
// ─────────────────────────────────────────────────────────────
function estimateBlockHeight(html, isListItem = false) {
    const text = html.replace(/<[^>]*>/g, "").trim();
    const lower = html.toLowerCase();
    if (lower.startsWith("<h1")) {
        const lines = Math.max(1, Math.ceil((text.length || 1) / 80));
        return lines * 18.75 + 14;
    }
    if (lower.startsWith("<h2")) {
        const lines = Math.max(1, Math.ceil((text.length || 1) / 88));
        return lines * 17.55 + 11;
    }
    if (lower.startsWith("<h3")) {
        const lines = Math.max(1, Math.ceil((text.length || 1) / 95));
        return lines * 16.25 + 9;
    }
    if (lower.startsWith("<h4") || lower.startsWith("<h5") || lower.startsWith("<h6")) {
        const lines = Math.max(1, Math.ceil((text.length || 1) / 98));
        return lines * 15.6 + 8;
    }
    if (isListItem || lower.startsWith("<li")) {
        const lines = Math.max(1, Math.ceil(text.length / 94));
        return lines * 16.7 + 2.5;
    }
    if (lower.startsWith("<blockquote")) {
        const lines = Math.max(1, Math.ceil(text.length / 92));
        return lines * 16.7 + 16;
    }
    if (lower.startsWith("<pre") || lower.startsWith("<code")) {
        const lines = Math.max(1, Math.ceil(text.length / 90));
        return lines * 16.0 + 8;
    }
    if (lower.startsWith("<hr")) {
        return 9999;
    }
    if (!text) {
        if (lower.includes("<br"))
            return 16.7;
        return 0;
    }
    const lines = Math.max(1, Math.ceil(text.length / 98));
    return lines * 16.7 + 3.5;
}
// ─────────────────────────────────────────────────────────────
// ACCURATE TABLE ROW HEIGHT ESTIMATOR
// - Calibrated to 703px usable width (28% scope, 51% particulars)
// ─────────────────────────────────────────────────────────────
function estimateTableRowHeight(row) {
    const scopeText = (row.scope || "").trim();
    const partText = (row.particulars || "").trim();
    if (scopeText.length === 0 && partText.length === 0) {
        return 22;
    }
    const scopeLines = Math.max(1, Math.ceil(scopeText.length / 26));
    const partLines = Math.max(1, Math.ceil(partText.length / 52));
    const maxLines = Math.max(scopeLines, partLines);
    return Math.max(22, 8 + maxLines * 16);
}
// Dynamically split an atomic block (paragraph or list item) to fit remaining page height
function splitBlockForAvailableHeight(block, availableHeight) {
    const charPerLine = block.isListItem ? 94 : 98;
    const lineHeight = 16.7;
    const marginExtra = block.isListItem ? 2.5 : 3.5;
    const rawHtml = block.html;
    const tag = block.isListItem ? "li" : "p";
    const match = rawHtml.match(new RegExp(`^<${tag}(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/${tag}>$`, "i"));
    const inner = match ? match[1] : rawHtml.replace(/<[^>]*>/g, "");
    const textOnly = inner.replace(/<[^>]*>/g, "").trim();
    const totalLines = Math.max(1, Math.ceil(textOnly.length / charPerLine));
    const totalH = totalLines * lineHeight + marginExtra;
    if (totalH <= availableHeight) {
        return { fitsBlock: block, remainderBlock: null };
    }
    const linesThatFit = Math.floor((availableHeight - marginExtra) / lineHeight);
    // Need at least 1 line to stay, and at least 1 line in remainder
    if (linesThatFit < 1 || linesThatFit >= totalLines) {
        return { fitsBlock: null, remainderBlock: block };
    }
    const targetChars = linesThatFit * charPerLine;
    let splitPos = -1;
    const punctRegex = /([.?!;\u0964]["'”’]?\s+)(?=[A-Z0-9\u0980-\u09FF"'“‘])/g;
    let pMatch;
    while ((pMatch = punctRegex.exec(inner)) !== null) {
        const end = pMatch.index + pMatch[0].length;
        const textSoFar = inner.substring(0, end).replace(/<[^>]*>/g, "").length;
        if (textSoFar <= targetChars + 15) {
            splitPos = end;
        }
        else {
            break;
        }
    }
    // Fallback to word boundary
    if (splitPos === -1 || inner.substring(0, splitPos).replace(/<[^>]*>/g, "").length < targetChars * 0.45) {
        const spaceRegex = /\s+/g;
        let sMatch;
        let lastValidSpace = -1;
        while ((sMatch = spaceRegex.exec(inner)) !== null) {
            const textSoFar = inner.substring(0, sMatch.index).replace(/<[^>]*>/g, "").length;
            if (textSoFar <= targetChars) {
                lastValidSpace = sMatch.index + sMatch[0].length;
            }
            else {
                break;
            }
        }
        if (lastValidSpace > 0) {
            splitPos = lastValidSpace;
        }
        else {
            splitPos = inner.length;
        }
    }
    const rawPart1 = inner.substring(0, splitPos).trim();
    const rawPart2 = inner.substring(splitPos).trim();
    if (!rawPart1 || !rawPart2) {
        return { fitsBlock: null, remainderBlock: block };
    }
    // Balance open tags across both halves
    const openTags = [];
    const tagRegex = /<\/?([a-z0-9_-]+)(?:\s+[^>]*)?>/gi;
    let tMatch;
    while ((tMatch = tagRegex.exec(rawPart1)) !== null) {
        const isClose = tMatch[0].startsWith("</");
        const tagName = tMatch[1].toLowerCase();
        if (tagName === "br" || tagName === "hr" || tagName === "img")
            continue;
        if (!isClose) {
            openTags.push({ tag: tagName, fullOpenTag: tMatch[0] });
        }
        else {
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
    const fitsBlock = {
        ...block,
        html: htmlPart1,
        height: estimateBlockHeight(htmlPart1, block.isListItem),
    };
    const remainderBlock = {
        ...block,
        html: htmlPart2,
        height: estimateBlockHeight(htmlPart2, block.isListItem),
    };
    return { fitsBlock, remainderBlock };
}
function tokenizeHtmlBlocks(rawHtml) {
    // 1. Unwrap container divs that enclose blocks so each inner element is paginated independently
    let sanitized = rawHtml.replace(/<div(?:\s+[^>]*)?>([\s\S]*?)<\/div>/gi, (match, inner) => {
        if (/<(?:h[1-6]|p|ol|ul|li|blockquote)\b/i.test(inner)) {
            return inner;
        }
        return match;
    });
    // 2. Split double <br> into separate paragraphs for clean block boundaries
    sanitized = sanitized.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "</p><p>");
    const blocks = [];
    const blockRegex = /<(h[1-6]|p|blockquote|div)(?:\s+[^>]*)?>[\s\S]*?<\/\1>|<hr(?:\s+[^>]*)?\/?>|<(ol|ul)(?:\s+[^>]*)?>[\s\S]*?<\/\2>/gi;
    let m;
    let lastPos = 0;
    while ((m = blockRegex.exec(sanitized)) !== null) {
        if (m.index > lastPos) {
            const text = sanitized.substring(lastPos, m.index).trim();
            if (text) {
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
        }
        else if (tagName === "ol" || tagName === "ul") {
            const isOl = tagName === "ol";
            const startMatch = fullMatch.match(/start=["']?(\d+)["']?/i);
            const startNum = startMatch ? parseInt(startMatch[1], 10) : 1;
            const liRegex = /<li(?:\s+[^>]*)?>[\s\S]*?<\/li>/gi;
            let liMatch;
            let count = 0;
            while ((liMatch = liRegex.exec(fullMatch)) !== null) {
                const liHtml = liMatch[0];
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
        else if (tagName === "p") {
            blocks.push({
                type: "p",
                html: fullMatch,
                isListItem: false,
                height: estimateBlockHeight(fullMatch),
            });
        }
        else {
            blocks.push({
                type: tagName,
                html: fullMatch,
                isListItem: false,
                height: estimateBlockHeight(fullMatch),
            });
        }
        lastPos = blockRegex.lastIndex;
    }
    if (lastPos < sanitized.length) {
        const text = sanitized.substring(lastPos).trim();
        if (text) {
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
function assembleBlocks(blocksSlice) {
    if (!blocksSlice || blocksSlice.length === 0)
        return "";
    const out = [];
    let inList = false;
    let currentListType = null;
    let currentStart = 1;
    for (let i = 0; i < blocksSlice.length; i++) {
        const b = blocksSlice[i];
        if (b.isListItem) {
            if (!inList) {
                inList = true;
                currentListType = b.listType || "ul";
                currentStart = b.itemIndex || 1;
                out.push(currentListType === "ol" ? `<ol start="${currentStart}">` : "<ul>");
            }
            else if (currentListType !== b.listType) {
                out.push(currentListType === "ol" ? "</ol>" : "</ul>");
                currentListType = b.listType || "ul";
                currentStart = b.itemIndex || 1;
                out.push(currentListType === "ol" ? `<ol start="${currentStart}">` : "<ul>");
            }
            out.push(b.html);
        }
        else {
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
// - Each page is cleanly budgeted to exactly 945px usable height.
// - Accurately maintains list numbering across page boundaries (<ol start="...">).
// - Supports explicit manual <!-- pagebreak --> or <hr class="page-break">.
// ─────────────────────────────────────────────────────────────
function buildQuotationPages(data) {
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
    // Support manual pagebreak markers by replacing with an hr marker tag
    raw = raw.replace(/<!--\s*pagebreak\s*-->/gi, '<hr class="page-break" />');
    const allBlocks = tokenizeHtmlBlocks(raw);
    // Height constants in A4 at 96 DPI:
    // Total A4 page height: 1122.5px
    // OkobizHeaderBanner (~106px) + OkobizFooterBanner (~36px) + safe bottom margin (~16.5px) = ~158.5px
    // Net usable height: 964px (calibrated packing density down to the bottom without clipping)
    const PAGE_USABLE_HEIGHT = 964;
    const TABLE_THEAD_HEIGHT = 28;
    const TABLE_TFOOT_HEIGHT = 48; // Grand total + in words
    const TABLE_CONTINUES_NOTE_HEIGHT = 16; // "Scope of work continues on next page →"
    const SIGNATORY_HEIGHT = 115;
    const CONTINUATION_TABLE_HEADER_HEIGHT = 30; // "Scope of Work & Deliverables (Continued)"
    // Page 1 Client Details height
    let clientDetailsHeight = 36;
    if (data.organization_name)
        clientDetailsHeight += 16;
    if (data.address)
        clientDetailsHeight += 16;
    if (data.phone || data.email)
        clientDetailsHeight += 16;
    clientDetailsHeight += 10;
    const page1AvailH = PAGE_USABLE_HEIGHT - 24 - clientDetailsHeight - 8;
    const pages = [];
    let unallocatedRows = [...softwareRows];
    let unallocatedBlocks = [...allBlocks];
    let pageNumber = 1;
    while (unallocatedRows.length > 0 || unallocatedBlocks.length > 0) {
        const isFirstPage = pageNumber === 1;
        let pageAvailH = isFirstPage ? page1AvailH : PAGE_USABLE_HEIGHT;
        let pageTableChunk = null;
        let pageNarrativeHtml = null;
        let showSignatory = false;
        // 1. Process Table Rows on this page if any remain
        if (unallocatedRows.length > 0) {
            const isFirstTableChunk = isFirstPage;
            if (!isFirstPage) {
                pageAvailH -= CONTINUATION_TABLE_HEADER_HEIGHT;
            }
            pageAvailH -= TABLE_THEAD_HEIGHT;
            const chunkRows = [];
            let currentTableH = 0;
            while (unallocatedRows.length > 0) {
                const nextRow = unallocatedRows[0];
                const nextRowH = estimateTableRowHeight(nextRow);
                const isFinalRow = unallocatedRows.length === 1;
                const neededH = nextRowH + (isFinalRow ? TABLE_TFOOT_HEIGHT : TABLE_CONTINUES_NOTE_HEIGHT);
                if (currentTableH + neededH <= pageAvailH) {
                    chunkRows.push(unallocatedRows.shift());
                    currentTableH += nextRowH;
                }
                else {
                    // If we can't even fit 1 row, take at least 1 row to prevent infinite loop
                    if (chunkRows.length === 0) {
                        chunkRows.push(unallocatedRows.shift());
                        currentTableH += nextRowH;
                    }
                    break;
                }
            }
            const isLastChunk = unallocatedRows.length === 0;
            if (isLastChunk) {
                currentTableH += TABLE_TFOOT_HEIGHT;
            }
            else {
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
        // Content flows IMMEDIATELY after table (or at top of page if table already finished)
        if (unallocatedRows.length === 0 && unallocatedBlocks.length > 0 && pageAvailH > 25) {
            // Check if ALL remaining blocks + signatory can fit on this page
            const remainingBlocksH = unallocatedBlocks.reduce((sum, b) => sum + b.height, 0);
            if (remainingBlocksH + SIGNATORY_HEIGHT <= pageAvailH) {
                // Fits entirely on this page with signatory!
                pageNarrativeHtml = assembleBlocks(unallocatedBlocks);
                unallocatedBlocks = [];
                showSignatory = true;
            }
            else {
                // Adaptive block packing: fill page down to the bottom margin
                const pageBlocks = [];
                while (unallocatedBlocks.length > 0 && pageAvailH > 15) {
                    const nextB = unallocatedBlocks[0];
                    // Check if this block is an explicit page break
                    if (nextB.type === "pagebreak" || nextB.html.includes("page-break")) {
                        unallocatedBlocks.shift();
                        break;
                    }
                    // Orphan heading check: Heading needs room for heading + at least 34px (2 lines) of text
                    if (nextB.type.startsWith("h")) {
                        if (pageAvailH < nextB.height + 34) {
                            // Heading cannot fit with text underneath -> push heading to next page!
                            break;
                        }
                    }
                    if (nextB.height <= pageAvailH) {
                        pageBlocks.push(unallocatedBlocks.shift());
                        pageAvailH -= nextB.height;
                    }
                    else {
                        // Block does NOT fit entirely. Adaptively split it if at least ~2 lines fit!
                        if ((nextB.type === "p" || nextB.type === "li") && pageAvailH >= 34) {
                            const splitRes = splitBlockForAvailableHeight(nextB, pageAvailH);
                            if (splitRes.fitsBlock) {
                                pageBlocks.push(splitRes.fitsBlock);
                                pageAvailH -= splitRes.fitsBlock.height;
                                unallocatedBlocks[0] = splitRes.remainderBlock;
                            }
                        }
                        break;
                    }
                }
                if (pageBlocks.length === 0 && unallocatedBlocks.length > 0) {
                    // Safety fallback: take at least 1 block to ensure progress
                    pageBlocks.push(unallocatedBlocks.shift());
                }
                pageNarrativeHtml = assembleBlocks(pageBlocks);
            }
        }
        else if (unallocatedRows.length === 0 && unallocatedBlocks.length === 0) {
            // Table and narrative both exhausted; check if signatory is needed
            showSignatory = true;
        }
        pages.push({
            pageNumber: pageNumber++,
            isFirstPage,
            isLastPage: false,
            tableChunk: pageTableChunk,
            narrativeHtml: pageNarrativeHtml || null,
            showSignatory,
        });
    }
    // Ensure last page has isLastPage: true and showSignatory: true
    if (pages.length > 0) {
        pages[pages.length - 1].isLastPage = true;
        pages[pages.length - 1].showSignatory = true;
    }
    return pages;
}
const formatPrice = (val) => {
    if (val === undefined || val === null || val === "" || val === 0)
        return "0/-";
    if (typeof val === "string" && val.includes("/-"))
        return val;
    const num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.-]/g, "")) : val;
    if (isNaN(num))
        return String(val);
    return num.toLocaleString("en-IN") + "/-";
};
const QuotationPrintSheet = ({ data, className = "", }) => {
    const pages = buildQuotationPages(data);
    const formattedDate = data.quote_date
        ? (0, date_1.format)(new Date(data.quote_date), "d MMMM, yyyy")
        : (0, date_1.format)(new Date(), "d MMMM, yyyy");
    const grandTotalValue = data.grand_total || data.software_amount || 0;
    const formattedGrandTotal = formatPrice(grandTotalValue);
    const inWordsDisplay = data.in_words && data.in_words.trim().length > 0
        ? data.in_words
        : (0, number_to_words_1.numberToWords)(grandTotalValue).replace(" Taka Only", " Only");
    const SignatoryBlock = () => (react_1.default.createElement("div", { className: "pt-3 mt-auto pb-0.5 select-none shrink-0" },
        react_1.default.createElement("div", { className: "flex justify-between items-end text-xs" },
            react_1.default.createElement("div", null,
                react_1.default.createElement("div", { className: "font-bold text-zinc-900 mb-0.5" }, "Thanks & Regards"),
                react_1.default.createElement("div", { className: "h-7 sm:h-8" }),
                react_1.default.createElement("div", { className: "font-bold text-zinc-900" },
                    data.company_signatory_name || "Md. Sorower Jahan",
                    " |",
                    " ",
                    data.company_signatory_title || "CEO"),
                react_1.default.createElement("div", { className: "font-semibold text-zinc-700" }, "okobiz"),
                react_1.default.createElement("div", { className: "text-zinc-600" },
                    "Contact No: ",
                    data.company_phone || "+880 1973590937")),
            react_1.default.createElement("div", { className: "text-right" },
                react_1.default.createElement("div", { className: "h-7 sm:h-8" }),
                react_1.default.createElement("div", { className: "w-44 sm:w-48 border-t-2 border-dashed border-zinc-800 mb-1 ml-auto" }),
                react_1.default.createElement("div", { className: "font-bold text-zinc-900" }, "Client Signature & Seal")))));
    const renderSoftwareTable = (rows, isLastScopePage = true) => {
        if (!rows || rows.length === 0)
            return null;
        return (react_1.default.createElement("div", { className: "shrink-0 mb-1.5 quotation-table-wrapper" },
            react_1.default.createElement("div", { className: "border border-zinc-900 overflow-hidden bg-transparent" },
                react_1.default.createElement("table", { className: "quotation-table w-full text-xs border-collapse bg-transparent shrink-0", style: { tableLayout: "fixed", height: "auto" } },
                    react_1.default.createElement("thead", null,
                        react_1.default.createElement("tr", { className: "bg-[#1E65B8] !text-white font-bold border-b border-zinc-900 print:bg-[#1E65B8] print:text-white", style: { backgroundColor: "#1E65B8", color: "#ffffff" } },
                            react_1.default.createElement("th", { style: { width: "7%", backgroundColor: "#1E65B8", color: "#ffffff" }, className: "quotation-th py-1 px-2 text-center text-xs font-bold uppercase tracking-wider border-r border-white/50 text-white-always !text-white" },
                                react_1.default.createElement("span", { className: "text-white-always !text-white font-bold" }, "SL")),
                            react_1.default.createElement("th", { style: { width: "28%", backgroundColor: "#1E65B8", color: "#ffffff" }, className: "quotation-th py-1 px-2.5 text-left text-xs font-bold uppercase tracking-wider border-r border-white/50 text-white-always !text-white" },
                                react_1.default.createElement("span", { className: "text-white-always !text-white font-bold" }, "SCOPE OF WORK")),
                            react_1.default.createElement("th", { style: { width: "51%", backgroundColor: "#1E65B8", color: "#ffffff" }, className: "quotation-th py-1 px-2.5 text-left text-xs font-bold uppercase tracking-wider border-r border-white/50 text-white-always !text-white" },
                                react_1.default.createElement("span", { className: "text-white-always !text-white font-bold" }, "PARTICULARS")),
                            react_1.default.createElement("th", { style: { width: "14%", backgroundColor: "#1E65B8", color: "#ffffff" }, className: "quotation-th py-1 px-2 text-center text-xs font-bold uppercase tracking-wider text-white-always !text-white" },
                                react_1.default.createElement("span", { className: "text-white-always !text-white font-bold" }, "AMOUNT")))),
                    react_1.default.createElement("tbody", { className: "divide-y divide-zinc-400 bg-transparent", style: { backgroundColor: "transparent" } }, rows.map((row, index) => (react_1.default.createElement("tr", { key: index, className: "bg-transparent", style: { backgroundColor: "transparent", height: "auto" } },
                        react_1.default.createElement("td", { className: "py-1 px-2 text-center font-bold text-zinc-900 align-top border-r border-zinc-500 w-[7%] bg-transparent", style: { backgroundColor: "transparent" } }, row.sl || index + 1),
                        react_1.default.createElement("td", { className: "py-1 px-2.5 font-bold text-zinc-900 align-top border-r border-zinc-500 w-[28%] bg-transparent", style: { backgroundColor: "transparent" } }, row.scope),
                        react_1.default.createElement("td", { className: "py-1 px-2.5 text-zinc-800 leading-snug align-top border-r border-zinc-500 w-[51%] bg-transparent", style: { backgroundColor: "transparent" } }, row.particulars),
                        index === 0 && (react_1.default.createElement("td", { rowSpan: rows.length, className: "py-1.5 px-2 text-center font-bold text-zinc-900 text-sm align-middle bg-transparent w-[14%]", style: { backgroundColor: "transparent" } }, formattedGrandTotal)))))),
                    isLastScopePage && (react_1.default.createElement("tfoot", { className: "border-t-2 border-zinc-900 bg-transparent", style: { backgroundColor: "transparent" } },
                        react_1.default.createElement("tr", { className: "bg-transparent font-bold border-b border-zinc-800", style: { backgroundColor: "transparent" } },
                            react_1.default.createElement("td", { colSpan: 3, className: "py-1 px-3 text-right text-xs font-bold text-zinc-900 border-r border-zinc-800 uppercase tracking-wide bg-transparent", style: { backgroundColor: "transparent" } }, "Grand Total ="),
                            react_1.default.createElement("td", { className: "py-1 px-2.5 text-center text-xs font-bold text-zinc-900 bg-transparent", style: { backgroundColor: "transparent" } }, formattedGrandTotal)),
                        react_1.default.createElement("tr", { className: "bg-transparent font-bold", style: { backgroundColor: "transparent" } },
                            react_1.default.createElement("td", { colSpan: 4, className: "py-1 px-3 text-left text-xs font-bold text-zinc-900 bg-transparent", style: { backgroundColor: "transparent" } },
                                "In Word: ",
                                inWordsDisplay))))))));
    };
    return (react_1.default.createElement("div", { className: `quotation-document font-sans text-zinc-900 bg-white w-[794px] max-w-[794px] mx-auto p-0 print:p-0 print:w-full print:max-w-full print:m-0 print:mx-0 [&_*]:!rounded-none ${className}` },
        react_1.default.createElement("style", { dangerouslySetInnerHTML: {
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
            } }),
        pages.map((page) => (react_1.default.createElement("section", { key: `quotation-page-${page.pageNumber}`, className: "quotation-page relative bg-white border border-zinc-200 print:border-none p-0 mb-8 print:mb-0 shadow-sm print:shadow-none w-[794px] min-h-[1123px] h-[1123px] print:w-full print:max-w-full print:h-[297mm] print:min-h-[297mm] print:max-h-[297mm] print:m-0 print:mx-0 flex flex-col justify-between overflow-hidden rounded-none" },
            react_1.default.createElement(okobiz_letterhead_page_1.OkobizWatermark, null),
            react_1.default.createElement(okobiz_letterhead_page_1.OkobizHeaderBanner, null),
            react_1.default.createElement("div", { className: "quotation-page-body flex-1 flex flex-col px-5 sm:px-8 print:px-[12mm] relative z-10 bg-transparent" },
                page.isFirstPage ? (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("div", { className: "flex justify-between items-start text-xs sm:text-sm font-semibold mb-2.5" },
                        react_1.default.createElement("div", null, formattedDate),
                        data.ref_no && (react_1.default.createElement("div", { className: "text-right" },
                            react_1.default.createElement("span", null, "Ref No. "),
                            react_1.default.createElement("span", { className: "font-bold text-[#1E65B8]" }, data.ref_no)))),
                    react_1.default.createElement("div", { className: "text-xs leading-snug mb-2" },
                        react_1.default.createElement("div", { className: "font-semibold mb-0.5" }, "To"),
                        data.client_name && (react_1.default.createElement("div", { className: "font-bold text-zinc-900" }, data.client_name)),
                        data.organization_name && (react_1.default.createElement("div", { className: "text-zinc-700 font-medium" }, data.organization_name)),
                        data.address && react_1.default.createElement("div", { className: "text-zinc-600" }, data.address),
                        data.phone && (react_1.default.createElement("div", { className: "text-zinc-600" },
                            "Cell: ",
                            data.phone)),
                        data.email && (react_1.default.createElement("div", { className: "text-zinc-600" },
                            "Email: ",
                            data.email))),
                    react_1.default.createElement("div", { className: "text-xs font-bold text-zinc-900 mb-3.5 pb-1 border-b border-zinc-200" },
                        react_1.default.createElement("span", null, "Subject: "),
                        react_1.default.createElement("span", { className: "underline" }, data.subject || "Quotation for Web & Software Solution")))) : page.tableChunk ? (react_1.default.createElement("div", { className: "flex justify-between items-center text-xs font-semibold mb-3.5 pb-1 border-b border-zinc-200" },
                    react_1.default.createElement("span", { className: "font-bold text-zinc-800" }, "Scope of Work & Deliverables (Continued)"),
                    react_1.default.createElement("div", { className: "text-right text-zinc-600" },
                        react_1.default.createElement("span", null, "Ref No. "),
                        react_1.default.createElement("span", { className: "font-bold text-[#1E65B8]" }, data.ref_no)))) : null,
                page.tableChunk && (react_1.default.createElement("div", { className: "mt-1" },
                    renderSoftwareTable(page.tableChunk.rows, page.tableChunk.isLastChunk),
                    !page.tableChunk.isLastChunk && (react_1.default.createElement("div", { className: "text-[10px] text-zinc-500 font-semibold italic text-right mt-1 pb-1" }, "Scope of work continues on next page \u2192")))),
                page.narrativeHtml && (react_1.default.createElement("div", { className: `quotation-narrative-flow ${page.tableChunk ? "mt-2.5" : "mt-0"} flex-1 text-xs text-zinc-800 leading-normal`, dangerouslySetInnerHTML: { __html: page.narrativeHtml } })),
                page.showSignatory && react_1.default.createElement(SignatoryBlock, null)),
            react_1.default.createElement(okobiz_letterhead_page_1.OkobizFooterBanner, { phone: data.company_phone, email: data.company_email }))))));
};
exports.QuotationPrintSheet = QuotationPrintSheet;
