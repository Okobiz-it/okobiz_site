import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * High-Fidelity Page-by-Page PDF Exporter for Okobiz Quotations
 * 
 * Guarantees:
 * 1. Zero slicing through text lines across page boundaries.
 * 2. Exactly 1:1 A4 page mapping (210mm x 297mm) with zero margin drift.
 * 3. Pristine, edge-to-edge header & footer banners without borders or strange gaps.
 * 4. High-resolution (2x scale) crisp output without squeezing.
 */
export async function exportQuotationToPdf(
  container: HTMLElement,
  fileName: string = "Quotation.pdf"
): Promise<void> {
  const pages = container.querySelectorAll<HTMLElement>(".quotation-page");
  if (!pages || pages.length === 0) {
    throw new Error("No quotation pages found to export.");
  }

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  const doc = container.querySelector<HTMLElement>(".quotation-document");
  const origDocStyle = doc
    ? {
        margin: doc.style.margin,
        padding: doc.style.padding,
        width: doc.style.width,
        maxWidth: doc.style.maxWidth,
      }
    : null;

  if (doc) {
    doc.style.margin = "0";
    doc.style.padding = "0";
    doc.style.width = "794px";
    doc.style.maxWidth = "794px";
  }

  // Temporarily strip screen borders, shadows, and margins so export is pristine A4
  const originalStyles: Array<{
    border: string;
    boxShadow: string;
    margin: string;
    width: string;
    height: string;
    minHeight: string;
    maxHeight: string;
  }> = [];

  pages.forEach((page) => {
    originalStyles.push({
      border: page.style.border,
      boxShadow: page.style.boxShadow,
      margin: page.style.margin,
      width: page.style.width,
      height: page.style.height,
      minHeight: page.style.minHeight,
      maxHeight: page.style.maxHeight,
    });

    page.style.border = "none";
    page.style.boxShadow = "none";
    page.style.margin = "0";
    page.style.width = "794px";
    page.style.height = "1123px";
    page.style.minHeight = "1123px";
    page.style.maxHeight = "1123px";
  });

  try {
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        pdf.addPage("a4", "portrait");
      }

      const pageEl = pages[i];
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
    }

    pdf.save(fileName);
  } finally {
    if (doc && origDocStyle) {
      doc.style.margin = origDocStyle.margin;
      doc.style.padding = origDocStyle.padding;
      doc.style.width = origDocStyle.width;
      doc.style.maxWidth = origDocStyle.maxWidth;
    }

    // Restore original styles for screen display
    pages.forEach((page, idx) => {
      const orig = originalStyles[idx];
      if (orig) {
        page.style.border = orig.border;
        page.style.boxShadow = orig.boxShadow;
        page.style.margin = orig.margin;
        page.style.width = orig.width;
        page.style.height = orig.height;
        page.style.minHeight = orig.minHeight;
        page.style.maxHeight = orig.maxHeight;
      }
    });
  }
}

