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
  RemoveFormatting
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  minHeight?: string;
}

// Converts legacy markdown to HTML on initial load so user sees formatted text immediately
function convertMarkdownToHtml(text: string): string {
  if (!text) return "";
  // If already contains HTML tags, return directly
  if (/<\s*(?:p|strong|b|em|i|u|h[1-6]|ul|ol|li|blockquote|code|pre|br|a)\b/i.test(text)) {
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

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing overview or description...",
  label,
  minHeight = "min-h-[200px]"
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isInternalChangeRef = useRef(false);

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

    const htmlContent = convertMarkdownToHtml(value || "");
    if (editor.innerHTML !== htmlContent) {
      editor.innerHTML = htmlContent;
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
    isInternalChangeRef.current = true;
    onChange(editorRef.current.innerHTML);
    updateActiveStates();
  };

  const handleInput = () => {
    triggerChange();
  };

  // Execute standard formatting commands (toggles on/off)
  const execFormat = (e: React.MouseEvent, command: string, arg: string | undefined = undefined) => {
    e.preventDefault();
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    triggerChange();
  };

  // Toggle Underline specifically
  const toggleUnderline = (e: React.MouseEvent) => {
    e.preventDefault();
    editorRef.current?.focus();
    document.execCommand("underline", false);
    triggerChange();
  };

  // Toggle Headings (H2 / H3)
  const toggleHeading = (e: React.MouseEvent, tag: "h2" | "h3") => {
    e.preventDefault();
    editorRef.current?.focus();
    const isCurrent = checkInsideTag(tag);
    if (isCurrent) {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, `<${tag}>`);
    }
    triggerChange();
  };

  // Toggle Blockquote
  const toggleBlockquote = (e: React.MouseEvent) => {
    e.preventDefault();
    editorRef.current?.focus();
    const isQuote = checkInsideTag("blockquote");
    if (isQuote) {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, "<blockquote>");
    }
    triggerChange();
  };

  // Toggle Inline Code
  const toggleCode = (e: React.MouseEvent) => {
    e.preventDefault();
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
    editorRef.current?.focus();
    document.execCommand("removeFormat", false);
    document.execCommand("formatBlock", false, "<p>");
    triggerChange();
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-gray-300">{label}</label>
          <span className="text-[11px] text-gray-500">MS Word-style WYSIWYG Editor</span>
        </div>
      )}

      <div className="border border-gray-800 rounded-[4px] bg-[#181A1F] overflow-hidden focus-within:border-[#3368B2] transition shadow-inner">
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#141518] border-b border-gray-800 select-none">
          {/* Undo / Redo */}
          <button
            type="button"
            onMouseDown={(e) => execFormat(e, "undo")}
            className="p-1.5 rounded-[4px] text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={13} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => execFormat(e, "redo")}
            className="p-1.5 rounded-[4px] text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={13} />
          </button>

          <span className="w-[1px] h-4 bg-gray-800 mx-0.5" />

          {/* Bold */}
          <button
            type="button"
            onMouseDown={(e) => execFormat(e, "bold")}
            className={`p-1.5 rounded-[4px] transition ${
              activeStates.bold
                ? "bg-[#3368B2] text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/10"
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
                ? "bg-[#3368B2] text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/10"
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
                ? "bg-[#3368B2] text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            title="Underline (Ctrl+U) - Click again to remove"
          >
            <Underline size={13} />
          </button>

          <span className="w-[1px] h-4 bg-gray-800 mx-0.5" />

          {/* Heading 2 */}
          <button
            type="button"
            onMouseDown={(e) => toggleHeading(e, "h2")}
            className={`p-1.5 rounded-[4px] transition ${
              activeStates.h2
                ? "bg-[#3368B2] text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/10"
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
                ? "bg-[#3368B2] text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            title="Heading 3 - Click again to revert"
          >
            <Heading3 size={13} />
          </button>

          <span className="w-[1px] h-4 bg-gray-800 mx-0.5" />

          {/* Bullet List */}
          <button
            type="button"
            onMouseDown={(e) => execFormat(e, "insertUnorderedList")}
            className={`p-1.5 rounded-[4px] transition ${
              activeStates.bullet
                ? "bg-[#3368B2] text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/10"
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
                ? "bg-[#3368B2] text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/10"
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
                ? "bg-[#3368B2] text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/10"
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
                ? "bg-[#3368B2] text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/10"
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
                ? "bg-[#3368B2] text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            title={activeStates.link ? "Remove Link" : "Insert Link"}
          >
            <LinkIcon size={13} />
          </button>

          <span className="w-[1px] h-4 bg-gray-800 mx-0.5" />

          {/* Clear Formatting */}
          <button
            type="button"
            onMouseDown={clearFormatting}
            className="p-1.5 rounded-[4px] text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
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
          onKeyUp={updateActiveStates}
          onMouseUp={updateActiveStates}
          data-placeholder={placeholder}
          className={`wysiwyg-editor w-full ${minHeight} p-4 text-xs sm:text-sm text-gray-200 focus:outline-none leading-relaxed overflow-y-auto`}
          style={{ minHeight: "210px" }}
        />
      </div>
    </div>
  );
}
