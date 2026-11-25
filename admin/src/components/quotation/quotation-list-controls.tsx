"use client";

import React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePreset } from "@/lib/quotation-revisions";

interface DateRangeFilterControlProps {
  value: DateRangePreset;
  onChange: (preset: DateRangePreset) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (val: string) => void;
  onCustomEndChange: (val: string) => void;
}

export const DATE_RANGE_LABELS: Record<DateRangePreset, string> = {
  THIS_WEEK: "This Week",
  THIS_MONTH: "This Month",
  THIS_YEAR: "This Year",
  CUSTOM: "Custom Range",
};

export const DateRangeFilterControl: React.FC<DateRangeFilterControlProps> = ({
  value,
  onChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex items-center">
        <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
        <select
          aria-label="Summary Date Range"
          value={value}
          onChange={(e) => onChange(e.target.value as DateRangePreset)}
          className="h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer shadow-xs"
        >
          <option value="THIS_WEEK">This Week</option>
          <option value="THIS_MONTH">This Month</option>
          <option value="THIS_YEAR">This Year</option>
          <option value="CUSTOM">Custom Range</option>
        </select>
      </div>

      {value === "CUSTOM" && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            aria-label="Custom range start date"
            value={customStart}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden"
          />
          <span className="text-[11px] text-slate-400 font-medium">to</span>
          <input
            type="date"
            aria-label="Custom range end date"
            value={customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden"
          />
        </div>
      )}
    </div>
  );
};

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  itemLabel = "items",
  onPageChange,
}) => {
  if (totalItems === 0) return null;

  // Build visible page numbers with ellipsis for large page counts
  const getPageNumbers = (): Array<number | "..."> => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: Array<number | "..."> = [1];
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let p = start; p <= end; p++) pages.push(p);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-xs">
      <div className="text-slate-500 dark:text-slate-400 font-medium">
        Showing <span className="font-bold text-slate-800 dark:text-slate-200">{startIndex + 1}</span> to{" "}
        <span className="font-bold text-slate-800 dark:text-slate-200">{endIndex}</span> of{" "}
        <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span> {itemLabel}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-8 px-2.5 text-xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
            Prev
          </Button>

          {getPageNumbers().map((item, idx) =>
            item === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 select-none">
                ...
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(item)}
                className={`h-8 min-w-[32px] px-2 text-xs cursor-pointer ${
                  item === currentPage
                    ? "bg-[#0167D6] hover:bg-blue-700 text-white border-[#0167D6]"
                    : ""
                }`}
              >
                {item}
              </Button>
            )
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-8 px-2.5 text-xs cursor-pointer"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </div>
      )}
    </div>
  );
};
