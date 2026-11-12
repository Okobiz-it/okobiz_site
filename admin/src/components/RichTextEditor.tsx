"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Palette,
  Highlighter,
  ChevronDown,
  X,
  GripHorizontal,
  Save,
  RefreshCw
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  minHeight?: string;
  onSaveText?: () => void;
  isSavingText?: boolean;
  isSaveDisabled?: boolean;
}

// Converts legacy markdown to HTML on initial load so user sees formatted text immediately
function convertMarkdownToHtml(text: string): string {
  if (!text) return "";
  // If already contains HTML tags, return directly without mangling
  if (/<\s*(?:p|strong|b|em|i|u|h[1-6]|ul|ol|li|blockquote|code|pre|br|a|div|span|table|tr|td|th)\b/i.test(text)) {
    return text;
  }

  let s = text
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, "$1<em>$2</em>$3")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  const lines = s.split("\n");
  const result: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) {
      result.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      result.push("</ol>");
      inOl = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      result.push("<br/>");
      continue;
    }
    if (/^##\s+(.+)$/.test(trimmed)) {
      closeList();
      result.push(`<h2>${trimmed.replace(/^##\s+/, "")}</h2>`);
      continue;
    }
    if (/^###\s+(.+)$/.test(trimmed)) {
      closeList();
      result.push(`<h3>${trimmed.replace(/^###\s+/, "")}</h3>`);
      continue;
    }
    if (/^>\s*(.*)$/.test(trimmed)) {
      closeList();
      result.push(`<blockquote>${trimmed.replace(/^>\s*/, "")}</blockquote>`);
      continue;
    }
    if (/^[-*]\s+(.+)$/.test(trimmed)) {
      if (inOl) {
        result.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        result.push("<ul>");
        inUl = true;
      }
      result.push(`<li>${trimmed.replace(/^[-*]\s+/, "")}</li>`);
      continue;
    }
    if (/^\d+\.\s+(.+)$/.test(trimmed)) {
      if (inUl) {
        result.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        result.push("<ol>");
        inOl = true;
      }
      result.push(`<li>${trimmed.replace(/^\d+\.\s+/, "")}</li>`);
      continue;
    }
    closeList();
    result.push(`<p>${line}</p>`);
  }
  closeList();
  return result.join("");
}

// Preset color options for rich text editor
const TEXT_COLORS = [
  { value: "#FFFFFF", label: "Pure White" },
  { value: "#E2E8F0", label: "Light Slate" },
  { value: "#94A3B8", label: "Muted Slate" },
  { value: "#3368B2", label: "Okobiz Blue" },
  { value: "#38BDF8", label: "Sky Blue" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#34D399", label: "Emerald Green" },
  { value: "#10B981", label: "Forest Green" },
  { value: "#FBBF24", label: "Amber Gold" },
  { value: "#FB923C", label: "Warm Orange" },
  { value: "#F87171", label: "Coral Red" },
  { value: "#EF4444", label: "Crimson Red" },
  { value: "#C084FC", label: "Purple" },
  { value: "#F472B6", label: "Rose Pink" },
  { value: "#1E293B", label: "Dark Navy" }
];

const HIGHLIGHT_COLORS = [
  { value: "rgba(250, 204, 21, 0.45)", preview: "#facc15", label: "Yellow Highlighter", text: "#000" },
  { value: "rgba(52, 211, 153, 0.45)", preview: "#34d399", label: "Green Highlighter", text: "#000" },
  { value: "rgba(51, 104, 178, 0.55)", preview: "#3368b2", label: "Blue Highlighter", text: "#fff" },
  { value: "rgba(56, 189, 248, 0.45)", preview: "#38bdf8", label: "Sky Highlighter", text: "#000" },
  { value: "rgba(168, 85, 247, 0.45)", preview: "#c084fc", label: "Purple Highlighter", text: "#fff" },
  { value: "rgba(244, 63, 94, 0.45)", preview: "#fb7185", label: "Rose Highlighter", text: "#fff" },
  { value: "rgba(249, 115, 22, 0.45)", preview: "#fb923c", label: "Orange Highlighter", text: "#000" },
  { value: "rgba(100, 116, 139, 0.55)", preview: "#64748b", label: "Slate Highlighter", text: "#fff" }
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing overview or description...",
  label,
  minHeight = "min-h-[440px]",
  onSaveText,
  isSavingText = false,
  isSaveDisabled = false
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isInternalChangeRef = useRef(false);
  const lastEmittedValueRef = useRef<string>(value || "");
  const savedRangeRef = useRef<Range | null>(null);

  // Dynamic user height resizing
  const [customHeight, setCustomHeight] = useState<number | null>(null);
  const isDraggingResizeRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingResizeRef.current = true;
    startYRef.current = e.clientY;
    const currentH = editorRef.current ? editorRef.current.offsetHeight : 440;
    startHeightRef.current = currentH;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDraggingResizeRef.current) return;
      const delta = ev.clientY - startYRef.current;
      const newHeight = Math.max(180, Math.min(1600, startHeightRef.current + delta));
      setCustomHeight(newHeight);
    };

    const handleMouseUp = () => {
      isDraggingResizeRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const isColorPickerOpenRef = useRef(false);

  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [customTextHex, setCustomTextHex] = useState("#38BDF8");
  const [customHighlightHex, setCustomHighlightHex] = useState("#facc15");

  const customTextHexRef = useRef(customTextHex);
  customTextHexRef.current = customTextHex;

  const customHighlightHexRef = useRef(customHighlightHex);
  customHighlightHexRef.current = customHighlightHex;

  const showTextColorPickerRef = useRef(showTextColorPicker);
  showTextColorPickerRef.current = showTextColorPicker;

  const showHighlightPickerRef = useRef(showHighlightPicker);
  showHighlightPickerRef.current = showHighlightPicker;

  const textColorRef = useRef<HTMLDivElement | null>(null);
  const highlightColorRef = useRef<HTMLDivElement | null>(null);

  // Active state indicator for toolbar buttons (like MS Word ribbon)
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    h2: false,
    h3: false,
    bullet: false,
    number: false,
    quote: false,
    code: false,
    link: false
  });

  const saveSelection = () => {
    if (typeof window === "undefined") return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current) {
      const node = selection.anchorNode;
      if (node && (editorRef.current === node || editorRef.current.contains(node))) {
        savedRangeRef.current = selection.getRangeAt(0).cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (typeof window === "undefined" || !savedRangeRef.current) return;
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
  };

  const applyTextColor = (color: string, closeDropdown: boolean = false, skipFocus: boolean = false) => {
    if (!editorRef.current) return;

    let targetRange = savedRangeRef.current ? savedRangeRef.current.cloneRange() : null;

    if (!skipFocus) {
      editorRef.current.focus();
    }

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      if (targetRange) {
        // If selection was collapsed at a word, expand to the whole word so color is immediately visible!
        if (targetRange.collapsed && targetRange.startContainer.nodeType === Node.TEXT_NODE) {
          const textNode = targetRange.startContainer as Text;
          const text = textNode.textContent || "";
          let start = targetRange.startOffset;
          let end = targetRange.startOffset;
          while (start > 0 && /\S/.test(text[start - 1])) start--;
          while (end < text.length && /\S/.test(text[end])) end++;
          if (end > start) {
            const wordRange = document.createRange();
            wordRange.setStart(textNode, start);
            wordRange.setEnd(textNode, end);
            targetRange = wordRange;
          }
        }
        selection.addRange(targetRange);
      }
    }

    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch (e) {}

    document.execCommand("foreColor", false, color);

    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }

    if (color.startsWith("#")) {
      setCustomTextHex(color);
    }
    triggerChange();
    if (closeDropdown) {
      setShowTextColorPicker(false);
    }
  };

  const applyHighlightColor = (color: string, closeDropdown: boolean = false, skipFocus: boolean = false) => {
    if (!editorRef.current) return;

    let targetRange = savedRangeRef.current ? savedRangeRef.current.cloneRange() : null;

    if (!skipFocus) {
      editorRef.current.focus();
    }

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      if (targetRange) {
        // If selection was collapsed at a word, expand to the whole word so highlight is immediately visible!
        if (targetRange.collapsed && targetRange.startContainer.nodeType === Node.TEXT_NODE) {
          const textNode = targetRange.startContainer as Text;
          const text = textNode.textContent || "";
          let start = targetRange.startOffset;
          let end = targetRange.startOffset;
          while (start > 0 && /\S/.test(text[start - 1])) start--;
          while (end < text.length && /\S/.test(text[end])) end++;
          if (end > start) {
            const wordRange = document.createRange();
            wordRange.setStart(textNode, start);
            wordRange.setEnd(textNode, end);
            targetRange = wordRange;
          }
        }
        selection.addRange(targetRange);
      }
    }

    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch (e) {}

    if (!color || color === "transparent") {
      const ok = document.execCommand("hiliteColor", false, "transparent");
      if (!ok) document.execCommand("backColor", false, "transparent");
    } else {
      const ok = document.execCommand("hiliteColor", false, color);
      if (!ok) document.execCommand("backColor", false, color);
    }

    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }

    if (color.startsWith("#")) {
      setCustomHighlightHex(color);
    }
    triggerChange();
    if (closeDropdown) {
      setShowHighlightPicker(false);
    }
  };

  // Close color popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isColorPickerOpenRef.current) return;
      const target = e.target as Node;

      // If clicked inside the text color popover or highlight color popover, don't close
      if (textColorRef.current?.contains(target) || highlightColorRef.current?.contains(target)) {
        return;
      }

      if (showTextColorPickerRef.current) {
        setShowTextColorPicker(false);
      }

      if (showHighlightPickerRef.current) {
        setShowHighlightPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const checkInsideTag = (tagName: string): boolean => {
    if (typeof window === "undefined") return false;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    let node: Node | null = selection.anchorNode;
    const target = tagName.toLowerCase();
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName.toLowerCase() === target) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  };

  const updateActiveStates = useCallback(() => {
    if (typeof document === "undefined") return;
    try {
      saveSelection();
      setActiveStates({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        h2: checkInsideTag("h2"),
        h3: checkInsideTag("h3"),
        bullet: document.queryCommandState("insertUnorderedList"),
        number: document.queryCommandState("insertOrderedList"),
        quote: checkInsideTag("blockquote"),
        code: checkInsideTag("code"),
        link: checkInsideTag("a")
      });
    } catch (e) {}
  }, []);

  // Sync value from props into editor only when external change occurs
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }

    // If incoming value is identical to what this editor last emitted or current DOM, do nothing
    if (value === lastEmittedValueRef.current || value === editor.innerHTML) {
      return;
    }

    const htmlContent = convertMarkdownToHtml(value || "");
    if (editor.innerHTML !== htmlContent) {
      editor.innerHTML = htmlContent;
      lastEmittedValueRef.current = value || "";
    }
  }, [value]);

  // Listen to selection changes to update toolbar active states in real time
  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current || editorRef.current?.contains(document.activeElement)) {
        updateActiveStates();
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [updateActiveStates]);

  const triggerChange = () => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    lastEmittedValueRef.current = currentHtml;
    isInternalChangeRef.current = true;
    onChange(currentHtml);
    updateActiveStates();
  };

  const handleInput = () => {
    saveSelection();
    triggerChange();
  };

  // Execute standard formatting commands (toggles on/off)
  const execFormat = (e: React.MouseEvent, command: string, arg: string | undefined = undefined) => {
    e.preventDefault();
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    saveSelection();
    triggerChange();
  };

  // Toggle Underline specifically
  const toggleUnderline = (e: React.MouseEvent) => {
    e.preventDefault();
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand("underline", false);
    saveSelection();
    triggerChange();
  };

  // Toggle Headings (H2 / H3)
  const toggleHeading = (e: React.MouseEvent, tag: "h2" | "h3") => {
    e.preventDefault();
    restoreSelection();
    editorRef.current?.focus();
    const isCurrent = checkInsideTag(tag);
    if (isCurrent) {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, `<${tag}>`);
    }
    saveSelection();
    triggerChange();
  };

  // Toggle Blockquote
  const toggleBlockquote = (e: React.MouseEvent) => {
    e.preventDefault();
    restoreSelection();
    editorRef.current?.focus();
    const isQuote = checkInsideTag("blockquote");
    if (isQuote) {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, "<blockquote>");
    }
    saveSelection();
    triggerChange();
  };

  // Toggle Inline Code
  const toggleCode = (e: React.MouseEvent) => {
    e.preventDefault();
    restoreSelection();
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    let node: Node | null = selection.anchorNode;
    let codeElement: HTMLElement | null = null;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName.toLowerCase() === "code") {
        codeElement = node as HTMLElement;
        break;
      }
      node = node.parentNode;
    }

    if (codeElement) {
      // Remove code styling (unwrap)
      const parent = codeElement.parentNode;
      while (codeElement.firstChild) {
        parent?.insertBefore(codeElement.firstChild, codeElement);
      }
      parent?.removeChild(codeElement);
    } else {
      // Apply code styling
      const range = selection.getRangeAt(0);
      const selectedContent = range.extractContents();
      const codeNode = document.createElement("code");
      if (selectedContent.textContent) {
        codeNode.appendChild(selectedContent);
      } else {
        codeNode.textContent = "code";
      }
      range.insertNode(codeNode);
      // Select the code content
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(codeNode);
      selection.addRange(newRange);
    }
    triggerChange();
  };

  // Toggle Link
  const toggleLink = (e: React.MouseEvent) => {
    e.preventDefault();
    editorRef.current?.focus();
    const isLink = checkInsideTag("a");
    if (isLink) {
      document.execCommand("unlink", false);
      triggerChange();
    } else {
      const url = window.prompt("Enter link URL (e.g. https://example.com):", "https://");
      if (url && url.trim() && url !== "https://") {
        document.execCommand("createLink", false, url.trim());
        // Ensure links open safely in a new tab
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
          let node: Node | null = selection.anchorNode;
          while (node && node !== editorRef.current) {
            if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName.toLowerCase() === "a") {
              (node as HTMLElement).setAttribute("target", "_blank");
              (node as HTMLElement).setAttribute("rel", "noopener noreferrer");
              break;
            }
            node = node.parentNode;
          }
        }
        triggerChange();
      }
    }
  };

  // Remove Formatting
  const clearFormatting = (e: React.MouseEvent) => {
    e.preventDefault();
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand("removeFormat", false);
    document.execCommand("formatBlock", false, "<p>");
    saveSelection();
    triggerChange();
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800 dark:text-gray-300">{label}</label>
        </div>
      )}

      <div className="border border-slate-300 dark:border-gray-800 rounded-[4px] bg-white dark:bg-[#181A1F] relative focus-within:border-[#0167D6] dark:focus-within:border-[#3368B2] transition shadow-xs">
        {/* Formatting Toolbar */}
        <div className="rich-text-toolbar flex flex-wrap items-center gap-1 p-1.5 bg-slate-100 dark:bg-[#141518] border-b border-slate-200 dark:border-gray-800 select-none rounded-t-[4px]">
          {/* Undo / Redo */}
          <button
            type="button"
            onMouseDown={(e) => execFormat(e, "undo")}
            className="p-1.5 rounded-[4px] text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={13} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => execFormat(e, "redo")}
            className="p-1.5 rounded-[4px] text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={13} />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 dark:bg-gray-800 mx-0.5" />

          {/* Bold */}
          <button
            type="button"
            onMouseDown={(e) => execFormat(e, "bold")}
            className={`p-1.5 rounded-[4px] transition ${
              activeStates.bold
                ? "editor-btn-active bg-[#0167D6] text-white text-white-always shadow-xs"
                : "text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
            title="Bold (Ctrl+B) - Click again to remove"
          >
            <Bold size={13} />
          </button>

          {/* Italic */}
          <button
            type="button"
            onMouseDown={(e) => execFormat(e, "italic")}
            className={`p-1.5 rounded-[4px] transition ${
              activeStates.italic
                ? "editor-btn-active bg-[#0167D6] text-white text-white-always shadow-xs"
                : "text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
            title="Italic (Ctrl+I) - Click again to remove"
          >
            <Italic size={13} />
          </button>

          {/* Underline */}
          <button
            type="button"
            onMouseDown={toggleUnderline}
            className={`p-1.5 rounded-[4px] transition ${
              activeStates.underline
                ? "editor-btn-active bg-[#0167D6] text-white text-white-always shadow-xs"
                : "text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
            title="Underline (Ctrl+U) - Click again to remove"
          >
            <Underline size={13} />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 dark:bg-gray-800 mx-0.5" />

          {/* Text Color Picker */}
          <div className="relative" ref={textColorRef}>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
                setShowTextColorPicker(prev => !prev);
                setShowHighlightPicker(false);
              }}
              className={`flex items-center gap-1 px-1.5 py-1 rounded-[4px] transition ${
                showTextColorPicker
                  ? "editor-btn-active bg-[#0167D6] text-white text-white-always shadow-xs"
                  : "text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
              title="Change Text Color"
            >
              <div className="flex flex-col items-center">
                <span className="font-bold text-xs leading-none">A</span>
                <span className="w-3.5 h-[2px] mt-0.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-blue-500" />
              </div>
              <ChevronDown size={10} className="text-slate-500 dark:text-gray-400" />
            </button>

            {showTextColorPicker && (
              <div
                onMouseDown={(e) => {
                  if ((e.target as HTMLElement).tagName !== "INPUT") {
                    e.preventDefault();
                  }
                }}
                className="absolute top-full left-0 mt-1 z-50 p-3 bg-white dark:bg-[#141518] border border-slate-300 dark:border-gray-700 rounded-[4px] shadow-2xl w-64 space-y-2.5 select-none"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-gray-400 font-semibold border-b border-slate-200 dark:border-gray-800 pb-1.5">
                  <span className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                    <Palette size={12} className="text-[#0167D6]" />
                    <span>Text Color</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyTextColor("#0F172A", false);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        applyTextColor("#0F172A", false);
                      }}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setShowTextColorPicker(false);
                        editorRef.current?.focus();
                      }}
                      className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white p-0.5 rounded-[4px]"
                      title="Close"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {TEXT_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyTextColor(c.value, false);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        applyTextColor(c.value, false);
                      }}
                      className="w-8 h-7 rounded-[4px] border border-slate-300 dark:border-gray-700/80 hover:scale-110 hover:border-blue-500 transition flex items-center justify-center relative group"
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>

                {/* Custom Color Selector & Hex Input */}
                <div className="pt-2 border-t border-slate-200 dark:border-gray-800 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-600 dark:text-gray-400 flex items-center justify-between">
                    <span>Custom Text Color</span>
                    <span className="font-mono text-slate-500 text-[10px]">{customTextHex}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      className="relative w-8 h-8 rounded-[4px] border border-slate-300 dark:border-gray-700 overflow-hidden shrink-0 cursor-pointer shadow-inner block"
                      style={{ backgroundColor: customTextHex }}
                      title="Click to open color picker"
                    >
                      <input
                        type="color"
                        value={customTextHex.startsWith("#") ? customTextHex : "#38bdf8"}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          saveSelection();
                          isColorPickerOpenRef.current = true;
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          saveSelection();
                          isColorPickerOpenRef.current = true;
                        }}
                        onInput={(e) => {
                          isColorPickerOpenRef.current = true;
                          const hex = (e.target as HTMLInputElement).value;
                          setCustomTextHex(hex);
                          applyTextColor(hex, false, true);
                        }}
                        onChange={(e) => {
                          const hex = (e.target as HTMLInputElement).value;
                          setCustomTextHex(hex);
                          applyTextColor(hex, false, true);
                          setTimeout(() => {
                            isColorPickerOpenRef.current = false;
                          }, 1000);
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            isColorPickerOpenRef.current = false;
                          }, 1000);
                        }}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>
                    <input
                      type="text"
                      value={customTextHex}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        saveSelection();
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomTextHex(val);
                        if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
                          applyTextColor(val, false);
                        }
                      }}
                      placeholder="#38BDF8"
                      className="w-full px-2 py-1 bg-white dark:bg-[#181A1D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs font-mono text-slate-900 dark:text-white uppercase focus:outline-none focus:border-[#0167D6]"
                    />
                  </div>
                </div>

                {/* Done Button */}
                <div className="pt-1 border-t border-slate-200 dark:border-gray-800/80">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyTextColor(customTextHex, true);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      applyTextColor(customTextHex, true);
                    }}
                    className="w-full py-1.5 bg-[#0167D6] hover:bg-blue-600 text-white text-white-always rounded-[4px] text-xs font-bold transition shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Highlight Color Picker */}
          <div className="relative" ref={highlightColorRef}>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
                setShowHighlightPicker(prev => !prev);
                setShowTextColorPicker(false);
              }}
              className={`flex items-center gap-1 px-1.5 py-1 rounded-[4px] transition ${
                showHighlightPicker
                  ? "editor-btn-active bg-[#0167D6] text-white text-white-always shadow-xs"
                  : "text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
              title="Text Highlight Marker"
            >
              <Highlighter size={13} />
              <ChevronDown size={10} className="text-slate-500 dark:text-gray-400" />
            </button>

            {showHighlightPicker && (
              <div
                onMouseDown={(e) => {
                  if ((e.target as HTMLElement).tagName !== "INPUT") {
                    e.preventDefault();
                  }
                }}
                className="absolute top-full left-0 mt-1 z-50 p-3 bg-white dark:bg-[#141518] border border-slate-300 dark:border-gray-700 rounded-[4px] shadow-2xl w-64 space-y-2.5 select-none"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-gray-400 font-semibold border-b border-slate-200 dark:border-gray-800 pb-1.5">
                  <span className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                    <Highlighter size={12} className="text-amber-500" />
                    <span>Highlight Color</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyHighlightColor("transparent", false);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        applyHighlightColor("transparent", false);
                      }}
                      className="text-[10px] text-red-500 hover:underline font-semibold"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setShowHighlightPicker(false);
                        editorRef.current?.focus();
                      }}
                      className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white p-0.5 rounded-[4px]"
                      title="Close"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {HIGHLIGHT_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyHighlightColor(c.value, false);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        applyHighlightColor(c.value, false);
                      }}
                      className="w-12 h-7 rounded-[4px] border border-slate-300 dark:border-gray-700/80 hover:scale-105 hover:border-blue-500 transition flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: c.preview, color: c.text }}
                      title={c.label}
                    >
                      ab
                    </button>
                  ))}
                </div>

                {/* Custom Highlight Selector & Hex Input */}
                <div className="pt-2 border-t border-slate-200 dark:border-gray-800 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-600 dark:text-gray-400 flex items-center justify-between">
                    <span>Custom Highlight</span>
                    <span className="font-mono text-slate-500 text-[10px]">{customHighlightHex}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      className="relative w-8 h-8 rounded-[4px] border border-slate-300 dark:border-gray-700 overflow-hidden shrink-0 cursor-pointer shadow-inner block"
                      style={{ backgroundColor: customHighlightHex }}
                      title="Click to open color picker"
                    >
                      <input
                        type="color"
                        value={customHighlightHex.startsWith("#") ? customHighlightHex : "#facc15"}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          saveSelection();
                          isColorPickerOpenRef.current = true;
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          saveSelection();
                          isColorPickerOpenRef.current = true;
                        }}
                        onInput={(e) => {
                          isColorPickerOpenRef.current = true;
                          const hex = (e.target as HTMLInputElement).value;
                          setCustomHighlightHex(hex);
                          applyHighlightColor(hex, false, true);
                        }}
                        onChange={(e) => {
                          const hex = (e.target as HTMLInputElement).value;
                          setCustomHighlightHex(hex);
                          applyHighlightColor(hex, false, true);
                          setTimeout(() => {
                            isColorPickerOpenRef.current = false;
                          }, 1000);
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            isColorPickerOpenRef.current = false;
                          }, 1000);
                        }}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>
                    <input
                      type="text"
                      value={customHighlightHex}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        saveSelection();
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomHighlightHex(val);
                        if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
                          applyHighlightColor(val, false);
                        }
                      }}
                      placeholder="#FACC15"
                      className="w-full px-2 py-1 bg-white dark:bg-[#181A1D] border border-slate-300 dark:border-gray-700 rounded-[4px] text-xs font-mono text-slate-900 dark:text-white uppercase focus:outline-none focus:border-[#0167D6]"
                    />
                  </div>
                </div>

                {/* Done Button */}
                <div className="pt-1 border-t border-slate-200 dark:border-gray-800/80">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyHighlightColor(customHighlightHex, true);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      applyHighlightColor(customHighlightHex, true);
                    }}
                    className="w-full py-1.5 bg-[#0167D6] hover:bg-blue-600 text-white text-white-always rounded-[4px] text-xs font-bold transition shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          <span className="w-[1px] h-4 bg-slate-300 dark:bg-gray-800 mx-0.5" />

          {/* Heading 2 */}
          <button
            type="button"
            onMouseDown={(e) => toggleHeading(e, "h2")}
            className={`p-1.5 rounded-[4px] transition ${
              activeStates.h2
                ? "editor-btn-active bg-[#0167D6] text-white text-white-always shadow-xs"
                : "text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
            title="Heading 2 - Click again to revert"
          >
            <Heading2 size={13} />
          </button>

          {/* Heading 3 */}
          <button
            type="button"
            onMouseDown={(e) => toggleHeading(e, "h3")}
            className={`p-1.5 rounded-[4px] transition ${
              activeStates.h3
                ? "editor-btn-active bg-[#0167D6] text-white text-white-always shadow-xs"
                : "text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
            title="Heading 3 - Click again to revert"
          >
            <Heading3 size={13} />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 dark:bg-gray-800 mx-0.5" />

          {/* Bullet List */}
          <button
            type="button"
            onMouseDown={(e) => execFormat(e, "insertUnorderedList")}
            className={`p-1.5 rounded-[4px] transition ${
              activeStates.bullet
                ? "editor-btn-active bg-[#0167D6] text-white text-white-always shadow-xs"
                : "text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
            title="Bullet List - Click again to remove"
          >
            <List size={13} />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onMouseDown={(e) => execFormat(e, "insertOrderedList")}
            className={`p-1.5 rounded-[4px] transition ${
              activeStates.number
                ? "editor-btn-active bg-[#0167D6] text-white text-white-always shadow-xs"
                : "text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
            title="Numbered List - Click again to remove"
          >
            <ListOrdered size={13} />
          </button>

          {/* Quote */}
          <button
            type="button"
            onMouseDown={toggleBlockquote}
            className={`p-1.5 rounded-[4px] transition ${
              activeStates.quote
                ? "editor-btn-active bg-[#0167D6] text-white text-white-always shadow-xs"
                : "text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
            title="Blockquote - Click again to revert"
          >
            <Quote size={13} />
          </button>

          {/* Inline Code */}
          <button
            type="button"
            onMouseDown={toggleCode}
            className={`p-1.5 rounded-[4px] transition ${
              activeStates.code
                ? "editor-btn-active bg-[#0167D6] text-white text-white-always shadow-xs"
                : "text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
            title="Inline Code - Click again to remove"
          >
            <Code size={13} />
          </button>

          {/* Link */}
          <button
            type="button"
            onMouseDown={toggleLink}
            className={`p-1.5 rounded-[4px] transition ${
              activeStates.link
                ? "editor-btn-active bg-[#0167D6] text-white text-white-always shadow-xs"
                : "text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
            title={activeStates.link ? "Remove Link" : "Insert Link"}
          >
            <LinkIcon size={13} />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 dark:bg-gray-800 mx-0.5" />

          {/* Clear Formatting */}
          <button
            type="button"
            onMouseDown={clearFormatting}
            className="p-1.5 rounded-[4px] text-slate-700 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
            title="Remove All Formatting"
          >
            <RemoveFormatting size={13} />
          </button>
        </div>

        {/* Real-time WYSIWYG Document Canvas (Single editing surface, exactly like MS Word) */}
        <div
          ref={editorRef}
          contentEditable={true}
          onInput={handleInput}
          onKeyUp={() => {
            updateActiveStates();
            saveSelection();
          }}
          onMouseUp={() => {
            updateActiveStates();
            saveSelection();
          }}
          onKeyDown={(e) => {
            // Tab key: insert tab indent (&emsp;&emsp;) instead of moving focus
            if (e.key === "Tab") {
              e.preventDefault();
              document.execCommand("insertHTML", false, "&emsp;&emsp;");
              saveSelection();
              triggerChange();
              return;
            }

            // Backspace key: ensure empty blocks and containers are deleted cleanly
            if (e.key === "Backspace") {
              const selection = window.getSelection();
              if (selection && selection.isCollapsed && editorRef.current) {
                let node: Node | null = selection.anchorNode;
                let blockEl: HTMLElement | null = null;
                while (node && node !== editorRef.current) {
                  if (node.nodeType === Node.ELEMENT_NODE && /^(P|DIV|H[1-6]|LI|BLOCKQUOTE)$/i.test((node as HTMLElement).tagName)) {
                    blockEl = node as HTMLElement;
                    break;
                  }
                  node = node.parentNode;
                }
                if (blockEl && blockEl !== editorRef.current) {
                  const rawText = (blockEl.textContent || "").replace(/[\s\u00a0]/g, "");
                  const rawHtml = blockEl.innerHTML.trim().toLowerCase();
                  if (!rawText && (rawHtml === "<br>" || rawHtml === "<br/>" || rawHtml === "&nbsp;" || rawHtml === "")) {
                    const prevEl = blockEl.previousElementSibling as HTMLElement | null;
                    e.preventDefault();
                    blockEl.remove();
                    if (prevEl) {
                      const range = document.createRange();
                      range.selectNodeContents(prevEl);
                      range.collapse(false);
                      selection.removeAllRanges();
                      selection.addRange(range);
                    }
                    saveSelection();
                    triggerChange();
                    return;
                  }
                }
              }
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedHtml = e.clipboardData.getData("text/html");
            const pastedText = e.clipboardData.getData("text/plain");

            if (pastedHtml) {
              // Strip outer <html>/<head>/<body> wrappers and unwrap <div> containers (e.g. lipsum div)
              // that add extra spacing. Preserve block-level content (<p>, <h*>, <ul>, etc.)
              let clean = pastedHtml
                .replace(/<!--[\s\S]*?-->/gi, "")
                .replace(/<style[\s\S]*?<\/style>/gi, "")
                .replace(/<script[\s\S]*?<\/script>/gi, "")
                .replace(/<\/?(?:html|head|body|meta|link)[^>]*>/gi, "");

              // Recursively unwrap all <div> wrappers (e.g. <div id="lipsum">)
              let prev = "";
              let count = 0;
              while (clean !== prev && count < 10) {
                count++;
                prev = clean;
                clean = clean.replace(/<div(?:\s+[^>]*)?>([\s\S]*?)<\/div>/gi, "$1");
              }

              // Strip id and class from <p> tags so imported styles don't create phantom margins
              clean = clean.replace(/<p\s+[^>]*>/gi, "<p>");

              // Strip leading/trailing empty paragraphs
              clean = clean.replace(/^(\s*<p>\s*(?:<br\s*\/?>|&nbsp;|\u00a0|\s)*<\/p>\s*)+/gi, "");
              clean = clean.replace(/(\s*<p>\s*(?:<br\s*\/?>|&nbsp;|\u00a0|\s)*<\/p>\s*)+$/gi, "");
              clean = clean.trim();

              if (clean) {
                document.execCommand("insertHTML", false, clean);
              } else if (pastedText) {
                const paras = pastedText
                  .split(/\r?\n\r?\n+/)
                  .map((p) => `<p>${p.trim().replace(/\r?\n/g, "<br>")}</p>`)
                  .filter((p) => p !== "<p></p>")
                  .join("");
                document.execCommand("insertHTML", false, paras || pastedText);
              }
            } else if (pastedText) {
              const paras = pastedText
                .split(/\r?\n\r?\n+/)
                .map((p) => `<p>${p.trim().replace(/\r?\n/g, "<br>")}</p>`)
                .filter((p) => p !== "<p></p>")
                .join("");
              document.execCommand("insertHTML", false, paras || pastedText);
            }

            saveSelection();
            triggerChange();
          }}
          data-placeholder={placeholder}
          className={`wysiwyg-editor w-full ${minHeight} p-4 text-xs sm:text-sm text-slate-900 dark:text-gray-200 bg-white dark:bg-[#181A1F] focus:outline-none leading-relaxed overflow-y-auto block`}
          style={{
            minHeight: customHeight ? `${customHeight}px` : undefined,
            height: customHeight ? `${customHeight}px` : undefined,
            resize: "vertical"
          }}
        />

        {/* Dynamic User Resize Handle Bar */}
        <div
          onMouseDown={handleResizeStart}
          className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-[#141518] border-t border-slate-200 dark:border-gray-800 text-[11px] text-slate-500 dark:text-gray-400 select-none cursor-row-resize hover:bg-slate-100 dark:hover:bg-gray-800/60 transition rounded-b-[4px] group"
          title="Drag up or down to adjust editor height"
        >
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-gray-200 transition">
            <GripHorizontal size={14} className="text-slate-400 group-hover:text-[#0167D6] transition" />
            <span className="text-[10px] font-medium hidden sm:inline">Drag to adjust editor size</span>
          </div>

          <div className="flex items-center gap-2">
            {onSaveText && (
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={onSaveText}
                disabled={isSaveDisabled || isSavingText}
                title={
                  isSaveDisabled
                    ? "No changes to save"
                    : "Save current text as default terms & conditions"
                }
                className={`text-[10px] font-semibold transition px-2.5 py-0.5 rounded shadow-2xs flex items-center gap-1 ${
                  isSaveDisabled || isSavingText
                    ? "text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 cursor-not-allowed opacity-60"
                    : "text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 cursor-pointer"
                }`}
              >
                {isSavingText ? (
                  <>
                    <RefreshCw size={10} className="animate-spin text-slate-400" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save
                      size={10}
                      className={
                        isSaveDisabled
                          ? "text-slate-400 dark:text-gray-500"
                          : "text-emerald-600 dark:text-emerald-400"
                      }
                    />
                    <span>Save Text</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setCustomHeight(prev => (!prev || prev < 560 ? 720 : 380))}
              className="text-[10px] font-semibold text-slate-600 dark:text-gray-400 hover:text-[#0167D6] dark:hover:text-blue-400 transition px-2 py-0.5 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-2xs"
            >
              {customHeight && customHeight > 560 ? "Compact View" : "Expand View"}
            </button>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-gray-700" />
            <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400">
              {customHeight || (editorRef.current ? editorRef.current.offsetHeight : 440)}px
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
