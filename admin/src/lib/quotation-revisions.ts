export type DateRangePreset = "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR" | "CUSTOM";

export const ITEMS_PER_PAGE = 15;

export interface ParsedRevisionRef {
  baseRef: string;
  revNumber: number;
}

/**
 * Extracts document identifier consistently across MongoDB and local dataStore records.
 */
export function getDocId(doc: any): string {
  if (!doc) return "";
  return String(doc._id || doc.id || doc.ref_no || "").trim();
}

/**
 * Parses reference strings such as:
 * - "okobiz/bizpos/002/25/26" -> { baseRef: "okobiz/bizpos/002/25/26", revNumber: 0 }
 * - "okobiz/bizpos/002/25/26 -R1" -> { baseRef: "okobiz/bizpos/002/25/26", revNumber: 1 }
 * - "okobiz/bizpos/002/25/26 -R2" -> { baseRef: "okobiz/bizpos/002/25/26", revNumber: 2 }
 */
export function parseRevisionRef(refNo: string = ""): ParsedRevisionRef {
  const trimmed = String(refNo || "").trim();
  const match = trimmed.match(/^(.*?)\s+-R(\d*)$/i) || trimmed.match(/^(.*?)-R(\d*)$/i);
  if (match && match[1].trim().length > 0) {
    const rev = match[2] ? parseInt(match[2], 10) : 1;
    return {
      baseRef: match[1].trim(),
      revNumber: isNaN(rev) || rev < 1 ? 1 : rev,
    };
  }
  return { baseRef: trimmed, revNumber: 0 };
}

/**
 * Computes the next revision reference number (e.g. "okobiz/bizpos/002/25/26 -R1" -> "-R2").
 */
export function getNextRevisionRefNo(
  currentRefNo: string,
  existingDocs: Array<{ ref_no?: string }> = []
): string {
  const { baseRef, revNumber } = parseRevisionRef(currentRefNo);
  const normalizedBase = baseRef.toLowerCase();

  let maxExistingRev = revNumber;
  for (const doc of existingDocs) {
    const parsed = parseRevisionRef(doc?.ref_no || "");
    if (parsed.baseRef.toLowerCase() === normalizedBase && parsed.revNumber > maxExistingRev) {
      maxExistingRev = parsed.revNumber;
    }
  }

  return `${baseRef} -R${maxExistingRev + 1}`;
}

/**
 * Identifies document IDs that have already been revised by a newer version in the dataset.
 */
export function computeSupersededIds(docs: any[]): Set<string> {
  const superseded = new Set<string>();
  const parentIdsWithChildren = new Set<string>();
  const maxRevByBase = new Map<string, number>();

  for (const doc of docs) {
    if (doc?.parent_id) {
      parentIdsWithChildren.add(String(doc.parent_id));
    }
    const { baseRef, revNumber } = parseRevisionRef(doc?.ref_no || "");
    const key = baseRef.toLowerCase();
    if (key) {
      const prevMax = maxRevByBase.get(key) ?? -1;
      if (revNumber > prevMax) {
        maxRevByBase.set(key, revNumber);
      }
    }
  }

  for (const doc of docs) {
    const docId = getDocId(doc);
    if (!docId) continue;

    if (Boolean(doc?.is_revised) || parentIdsWithChildren.has(docId)) {
      superseded.add(docId);
      continue;
    }

    const { baseRef, revNumber } = parseRevisionRef(doc?.ref_no || "");
    const key = baseRef.toLowerCase();
    if (key) {
      const maxRev = maxRevByBase.get(key) ?? 0;
      if (maxRev > revNumber) {
        superseded.add(docId);
      }
    }
  }

  return superseded;
}

/**
 * Normalizes a date value into a timezone-safe local calendar YYYY-MM-DD string.
 */
export function extractCalendarYMD(dateInput: Date | string | number | null | undefined): string | null {
  if (dateInput === null || dateInput === undefined || dateInput === "") return null;

  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    // Preserve exact calendar date when persisted from <input type="date"> as UTC midnight
    if (/^\d{4}-\d{2}-\d{2}T00:00:00(\.000)?Z$/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns inclusive YYYY-MM-DD calendar bounds for date-range presets.
 */
export function getDateRangeBounds(
  preset: DateRangePreset,
  customStart?: string,
  customEnd?: string,
  referenceDate: Date = new Date()
): { start: string | null; end: string | null } {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  if (preset === "THIS_WEEK") {
    const dayOfWeek = referenceDate.getDay(); // 0 (Sun) - 6 (Sat)
    const startDate = new Date(year, month, referenceDate.getDate() - dayOfWeek);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6);
    return {
      start: extractCalendarYMD(startDate),
      end: extractCalendarYMD(endDate),
    };
  }

  if (preset === "THIS_MONTH") {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    return {
      start: extractCalendarYMD(startDate),
      end: extractCalendarYMD(endDate),
    };
  }

  if (preset === "THIS_YEAR") {
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`,
    };
  }

  return {
    start: customStart ? customStart.trim() : null,
    end: customEnd ? customEnd.trim() : null,
  };
}

/**
 * Accumulates count and grand_total for active (latest revision only) documents
 * falling within the selected date range.
 */
export function accumulateLatestStats(
  docs: any[],
  preset: DateRangePreset,
  customStart?: string,
  customEnd?: string,
  referenceDate: Date = new Date()
): { count: number; totalAmount: number; supersededIds: Set<string> } {
  const supersededIds = computeSupersededIds(docs);
  const { start, end } = getDateRangeBounds(preset, customStart, customEnd, referenceDate);

  let count = 0;
  let totalAmount = 0;

  for (const doc of docs) {
    const docId = getDocId(doc);
    if (supersededIds.has(docId)) continue;

    const docYmd = extractCalendarYMD(doc?.quote_date || doc?.created_at);
    if (!docYmd) continue;
    if (start && docYmd < start) continue;
    if (end && docYmd > end) continue;

    count += 1;
    totalAmount += Number(doc?.grand_total) || 0;
  }

  return { count, totalAmount, supersededIds };
}

/**
 * Matches a document against a search query across Ref No, Client, Organization, Email, Phone, and Subject.
 */
export function matchesDocumentSearch(doc: any, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  return Boolean(
    (doc?.ref_no && String(doc.ref_no).toLowerCase().includes(q)) ||
      (doc?.client_name && String(doc.client_name).toLowerCase().includes(q)) ||
      (doc?.organization_name && String(doc.organization_name).toLowerCase().includes(q)) ||
      (doc?.email && String(doc.email).toLowerCase().includes(q)) ||
      (doc?.phone && String(doc.phone).toLowerCase().includes(q)) ||
      (doc?.subject && String(doc.subject).toLowerCase().includes(q))
  );
}

/**
 * Slices an item list into 15-item pages cleanly.
 */
export function paginateItems<T>(
  items: T[],
  requestedPage: number,
  pageSize: number = ITEMS_PER_PAGE
): {
  pageItems: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
} {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pageItems = items.slice(startIndex, endIndex);

  return {
    pageItems,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
  };
}
