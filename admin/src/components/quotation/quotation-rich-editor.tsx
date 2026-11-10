"use client";

import React from "react";
import RichTextEditor from "@/components/RichTextEditor";

interface QuotationRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function QuotationRichEditor({
  value,
  onChange,
  placeholder = "Write quotation terms, project timeline, and deliverables here...",
}: QuotationRichEditorProps) {
  return (
    <div className="quotation-rich-editor-wrapper w-full">
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minHeight="min-h-[380px]"
      />
    </div>
  );
}

