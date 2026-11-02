/**
 * Universal Rich Text / Markdown Formatter and Parser for Client Pages
 */

export function renderRichText(text?: string): string {
  if (!text || !text.trim()) {
    return "";
  }

  // If text already contains HTML tags from WYSIWYG editor, return directly
  if (/<\s*(?:p|strong|b|em|i|u|h[1-6]|ul|ol|li|blockquote|code|pre|br|a)\b/i.test(text)) {
    return text;
  }

  const raw = text.replace(/\r\n/g, "\n");
  const lines = raw.split("\n");

  const output: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) {
      output.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      output.push("</ol>");
      inOl = false;
    }
  };

  const formatInline = (str: string): string => {
    let s = str
      .replace(/&/g, "&amp;")
      .replace(/<(?!\/?u\b)/gi, "&lt;")
      .replace(/(?<!\b<\/?u)>/gi, "&gt;");

    // Inline code: `code`
    s = s.replace(
      /`([^`]+)`/g,
      '<code class="bg-[#22242a] text-amber-300 px-1.5 py-0.5 rounded-[2px] font-mono text-[0.88em] border border-gray-700/60">$1</code>'
    );

    // Bold: **text**
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

    // Italic: *text*
    s = s.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<em class="italic text-gray-200">$2</em>$3');

    // Underline: <u>text</u>
    s = s.replace(/<u>(.*?)<\/u>/gi, '<u class="underline decoration-1 underline-offset-2">$1</u>');

    // Link: [title](url)
    s = s.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#3368B2] hover:text-[#0077FF] underline decoration-1 underline-offset-2">$1</a>'
    );

    return s;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed === "") {
      closeList();
      output.push('<div class="h-3"></div>');
      continue;
    }

    // Heading 2: ## text
    if (/^##\s+(.+)$/.test(trimmed)) {
      closeList();
      const content = trimmed.replace(/^##\s+/, "");
      output.push(`<h2 class="text-xl sm:text-2xl font-bold text-white mt-5 mb-2">${formatInline(content)}</h2>`);
      continue;
    }

    // Heading 3: ### text
    if (/^###\s+(.+)$/.test(trimmed)) {
      closeList();
      const content = trimmed.replace(/^###\s+/, "");
      output.push(`<h3 class="text-lg sm:text-xl font-semibold text-white mt-4 mb-2">${formatInline(content)}</h3>`);
      continue;
    }

    // Blockquote: > text
    if (/^>\s*(.*)$/.test(trimmed)) {
      closeList();
      const content = trimmed.replace(/^>\s*/, "");
      output.push(
        `<blockquote class="border-l-4 border-[#3368B2] bg-[#1a1c22]/70 pl-3.5 py-2 my-2.5 italic text-gray-300 rounded-r-[2px]">${formatInline(
          content
        )}</blockquote>`
      );
      continue;
    }

    // Bullet List: - item or * item
    if (/^[-*]\s+(.+)$/.test(trimmed)) {
      if (inOl) {
        output.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        output.push('<ul class="my-2 space-y-1 list-disc list-inside text-gray-300">');
        inUl = true;
      }
      const content = trimmed.replace(/^[-*]\s+/, "");
      output.push(`<li class="leading-relaxed pl-1">${formatInline(content)}</li>`);
      continue;
    }

    // Numbered List: 1. item
    if (/^\d+\.\s+(.+)$/.test(trimmed)) {
      if (inUl) {
        output.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        output.push('<ol class="my-2 space-y-1 list-decimal list-inside text-gray-300">');
        inOl = true;
      }
      const content = trimmed.replace(/^\d+\.\s+/, "");
      output.push(`<li class="leading-relaxed pl-1">${formatInline(content)}</li>`);
      continue;
    }

    // Normal line
    closeList();
    output.push(`<p class="leading-relaxed my-1">${formatInline(rawLine)}</p>`);
  }

  closeList();
  return output.join("\n");
}

export function cleanSnippet(text?: string, maxLength?: number): string {
  if (!text) return "";
  let cleaned = text
    // Replace block-level tags with space so words don't merge
    .replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    // Remove all HTML tags
    .replace(/<[^>]*>/g, "")
    // Decode common HTML entities
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    // Remove markdown tokens
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, "$1$2$3")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    // Collapse multiple spaces
    .replace(/\s+/g, " ")
    .trim();

  if (maxLength && cleaned.length > maxLength) {
    return cleaned.slice(0, maxLength) + "...";
  }
  return cleaned;
}

export function stripMarkdown(text?: string): string {
  return cleanSnippet(text);
}
