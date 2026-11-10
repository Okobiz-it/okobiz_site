"use client";

import React, { useEffect, useState } from "react";
import { subscribeToasts, toast } from "@/lib/toast";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2, X } from "lucide-react";

export function Toaster() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    return subscribeToasts(setItems);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print">
      {items.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-[4px] border shadow-xl text-xs font-medium transition-all duration-200 animate-in slide-in-from-bottom-2 ${
            item.type === "success"
              ? "bg-white dark:bg-[#15171C] text-slate-900 dark:text-white border-emerald-500/40"
              : item.type === "error"
              ? "bg-white dark:bg-[#15171C] text-slate-900 dark:text-white border-red-500/40"
              : item.type === "warning"
              ? "bg-white dark:bg-[#15171C] text-slate-900 dark:text-white border-amber-500/40"
              : item.type === "loading"
              ? "bg-white dark:bg-[#15171C] text-slate-900 dark:text-white border-blue-500/40"
              : "bg-white dark:bg-[#15171C] text-slate-900 dark:text-white border-slate-300 dark:border-gray-800"
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {item.type === "success" && <CheckCircle2 size={16} className="text-emerald-500" />}
            {item.type === "error" && <AlertCircle size={16} className="text-red-500" />}
            {item.type === "warning" && <AlertTriangle size={16} className="text-amber-500" />}
            {item.type === "loading" && <Loader2 size={16} className="text-[#0167D6] animate-spin" />}
            {item.type === "info" && <Info size={16} className="text-blue-500" />}
          </div>
          <div className="flex-1 leading-relaxed text-slate-800 dark:text-gray-200">{item.message}</div>
          <button
            onClick={() => toast.dismiss(item.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0 p-0.5 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

