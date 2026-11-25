"use client";

import React from "react";
import RichTextEditor from "@/components/RichTextEditor";

interface QuotationRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSaveText?: () => void;
  isSavingText?: boolean;
  isSaveDisabled?: boolean;
  saveButtonText?: string;
  saveButtonTitle?: string;
}

export function QuotationRichEditor({
  value,
  onChange,
  placeholder = "Write quotation terms, project timeline, and deliverables here...",
  onSaveText,
  isSavingText = false,
  isSaveDisabled = false,
  saveButtonText,
  saveButtonTitle,
}: QuotationRichEditorProps) {
  return (
    <div className="quotation-rich-editor-wrapper w-full">
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minHeight="min-h-[200px]"
        onSaveText={onSaveText}
        isSavingText={isSavingText}
        isSaveDisabled={isSaveDisabled}
        saveButtonText={saveButtonText}
        saveButtonTitle={saveButtonTitle}
      />
    </div>
  );
}

