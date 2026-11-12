"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Printer,
  Eye,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  Cpu,
  Layers,
  ArrowLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/lib/toast";
import {
  DEFAULT_SOFTWARE_COLUMNS,
  DEFAULT_SOFTWARE_ROWS,
  DEFAULT_UNIFIED_TERMS_AND_CONDITIONS,
  SoftwareRow,
  QuotationColumn,
} from "./quotation-defaults";
import { QuotationRichEditor } from "./quotation-rich-editor";
import { QuotationPrintSheet } from "./quotation-print-sheet";
import { numberToWords } from "@/lib/number-to-words";

interface QuotationFormProps {
  initialData?: any;
  isEdit?: boolean;
}

interface SyncedSoftwareRowProps {
  row: SoftwareRow;
  index: number;
  onUpdate: (index: number, field: keyof SoftwareRow, value: any) => void;
  onRemove: (index: number) => void;
}

function SyncedSoftwareRow({
  row,
  index,
  onUpdate,
  onRemove,
}: SyncedSoftwareRowProps) {
  const scopeRef = useRef<HTMLTextAreaElement>(null);
  const partRef = useRef<HTMLTextAreaElement>(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const scopeEl = scopeRef.current;
    const partEl = partRef.current;
    if (!scopeEl || !partEl) return;

    // Align initial height on mount if one is already taller
    const initH = Math.max(scopeEl.offsetHeight, partEl.offsetHeight, 38);
    if (initH > 38) {
      scopeEl.style.height = `${initH}px`;
      partEl.style.height = `${initH}px`;
    }

    if (typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver((entries) => {
      if (isSyncingRef.current) return;
      for (const entry of entries) {
        const target = entry.target as HTMLTextAreaElement;
        const newHeight = target.offsetHeight;
        if (newHeight <= 0) continue;

        if (target === scopeEl && Math.abs(partEl.offsetHeight - newHeight) > 1) {
          isSyncingRef.current = true;
          partEl.style.height = `${newHeight}px`;
          requestAnimationFrame(() => {
            isSyncingRef.current = false;
          });
        } else if (target === partEl && Math.abs(scopeEl.offsetHeight - newHeight) > 1) {
          isSyncingRef.current = true;
          scopeEl.style.height = `${newHeight}px`;
          requestAnimationFrame(() => {
            isSyncingRef.current = false;
          });
        }
      }
    });

    ro.observe(scopeEl);
    ro.observe(partEl);

    return () => {
      ro.disconnect();
    };
  }, []);

  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-gray-800/20 align-top">
      <td className="py-2 px-3 text-center border-r border-slate-200 dark:border-gray-800 align-top">
        <Input
          value={row.sl}
          onChange={(e) => onUpdate(index, "sl", e.target.value)}
          className="h-9 text-center text-xs font-bold"
        />
      </td>
      <td className="py-2 px-3 border-r border-slate-200 dark:border-gray-800 align-top">
        <Textarea
          ref={scopeRef}
          value={row.scope}
          onChange={(e) => onUpdate(index, "scope", e.target.value)}
          placeholder="e.g. Inventory Management System"
          className="min-h-[38px] text-xs py-2 px-3 resize-y font-semibold leading-snug rounded-[4px]"
          rows={1}
        />
      </td>
      <td className="py-2 px-3 border-r border-slate-200 dark:border-gray-800 align-top">
        <Textarea
          ref={partRef}
          value={row.particulars}
          onChange={(e) => onUpdate(index, "particulars", e.target.value)}
          placeholder="e.g. Real-time stock alerts, barcode generation, multi-warehouse transfer"
          className="min-h-[38px] text-xs py-2 px-3 resize-y leading-snug rounded-[4px]"
          rows={1}
        />
      </td>
      <td className="py-2 px-3 text-center align-top pt-2.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="h-8 w-8 text-slate-400 hover:text-red-600"
          title="Remove Row"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </td>
    </tr>
  );
}

export function QuotationForm({ initialData, isEdit = false }: QuotationFormProps) {
  const router = useRouter();

  // Basic Details
  const [refNo, setRefNo] = useState(initialData?.ref_no || "");
  const [quoteDate, setQuoteDate] = useState(
    initialData?.quote_date
      ? new Date(initialData.quote_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [clientName, setClientName] = useState(initialData?.client_name || "");
  const [organizationName, setOrganizationName] = useState(initialData?.organization_name || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [subject, setSubject] = useState(
    initialData?.subject || "Quotation for Web & Software Solution"
  );

  // Software Scope Table
  const [softwareColumns, setSoftwareColumns] = useState<QuotationColumn[]>(
    initialData?.software_columns || DEFAULT_SOFTWARE_COLUMNS
  );
  const [softwareRows, setSoftwareRows] = useState<SoftwareRow[]>(
    initialData?.software_rows || DEFAULT_SOFTWARE_ROWS
  );

  // Unified Rich Terms Content
  const [termsContent, setTermsContent] = useState<string>(() => {
    if (initialData?.terms_conditions) {
      if (
        initialData.project_breakdown ||
        initialData.client_requirements ||
        initialData.deliverables
      ) {
        return [
          initialData.project_breakdown,
          initialData.terms_conditions,
          initialData.client_requirements,
          initialData.deliverables,
        ]
          .filter(Boolean)
          .join("\n\n");
      }
      return initialData.terms_conditions;
    }
    return DEFAULT_UNIFIED_TERMS_AND_CONDITIONS;
  });

  // Pricing
  const [grandTotal, setGrandTotal] = useState<number>(() => {
    const val = Number(initialData?.grand_total || initialData?.software_amount);
    return !isNaN(val) && val > 0 ? val : 30000;
  });
  const [inWords, setInWords] = useState<string>(() => {
    if (initialData?.in_words && initialData.in_words.trim().length > 0) {
      return initialData.in_words;
    }
    const val = Number(initialData?.grand_total || initialData?.software_amount) || 30000;
    return numberToWords(val).replace(" Taka Only", " Taka Only.");
  });

  // Automatically update inWords dynamically when grandTotal changes (unless manually edited)
  const [isWordsManuallyEdited, setIsWordsManuallyEdited] = useState(false);
  useEffect(() => {
    if (!isWordsManuallyEdited && grandTotal > 0) {
      setInWords(numberToWords(grandTotal).replace(" Taka Only", " Taka Only."));
    }
  }, [grandTotal, isWordsManuallyEdited]);

  // Signatory
  const [signatoryName, setSignatoryName] = useState(
    initialData?.company_signatory_name || "Md. Sorower Jahan"
  );
  const [signatoryTitle, setSignatoryTitle] = useState(
    initialData?.company_signatory_title || "CEO, okobiz"
  );
  const [signatoryPhone, setSignatoryPhone] = useState(
    initialData?.company_phone || "+880 1973590937"
  );

  // Submission & Preview state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSavingDefaultTerms, setIsSavingDefaultTerms] = useState<boolean>(false);
  const [savedTermsBaseline, setSavedTermsBaseline] = useState<string>(() => {
    return initialData?.terms_conditions || DEFAULT_UNIFIED_TERMS_AND_CONDITIONS;
  });
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const printSheetHiddenRef = useRef<HTMLDivElement>(null);

  // Automatically load saved default terms and conditions from database for new quotations
  useEffect(() => {
    if (isEdit || initialData?.terms_conditions) return;
    let isMounted = true;
    fetch("/api/quotations/default-terms")
      .then((res) => res.json())
      .then((resData) => {
        if (isMounted && resData.success && resData.defaultTerms) {
          setTermsContent(resData.defaultTerms);
          setSavedTermsBaseline(resData.defaultTerms);
        }
      })
      .catch((err) => {
        console.warn("Failed to load saved default terms:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [isEdit, initialData]);

  // Check if terms & conditions text has been modified from saved baseline
  const normalizeTermsHtml = (val: string) => (val || "").trim().replace(/\s+/g, " ");
  const isTermsDirty =
    Boolean(termsContent && termsContent.trim().length > 0) &&
    normalizeTermsHtml(termsContent) !== normalizeTermsHtml(savedTermsBaseline);

  // Save current terms & conditions as default in database
  const handleSaveDefaultTerms = async () => {
    if (!isTermsDirty || !termsContent || termsContent.trim().length === 0) {
      return;
    }

    setIsSavingDefaultTerms(true);
    const loadingId = toast.loading("Saving default terms & conditions to database...");
    try {
      const res = await fetch("/api/quotations/default-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultTerms: termsContent }),
      });
      toast.dismiss(loadingId);
      const resData = await res.json();
      if (resData.success) {
        setSavedTermsBaseline(termsContent);
        toast.success(
          "Default terms & conditions saved successfully! They will now appear automatically on the create quotation page."
        );
      } else {
        toast.error(resData.message || "Failed to save default terms");
      }
    } catch (err: any) {
      toast.dismiss(loadingId);
      toast.error(err.message || "An error occurred while saving default terms");
    } finally {
      setIsSavingDefaultTerms(false);
    }
  };

  // Close preview modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showPreviewModal) {
        setShowPreviewModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPreviewModal]);

  // Fetch next Ref No if creating new
  useEffect(() => {
    if (!isEdit && !refNo) {
      fetch("/api/quotations")
        .then((res) => res.json())
        .then((data) => {
          if (data?.nextRefNo) {
            setRefNo(data.nextRefNo);
          }
        })
        .catch(() => {});
    }
  }, [isEdit, refNo]);

  // Row operations
  const handleAddSoftwareRow = () => {
    setSoftwareRows((prev) => [
      ...prev,
      {
        sl: prev.length + 1,
        scope: "",
        particulars: "",
      },
    ]);
  };

  const handleRemoveSoftwareRow = (index: number) => {
    setSoftwareRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSoftwareRow = (
    index: number,
    field: keyof SoftwareRow,
    value: any
  ) => {
    setSoftwareRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const currentQuotationData = {
    id: initialData?._id || initialData?.id,
    ref_no: refNo,
    quote_date: quoteDate,
    client_name: clientName,
    organization_name: organizationName,
    address,
    phone,
    email,
    subject,
    software_columns: softwareColumns,
    software_rows: softwareRows,
    software_amount: grandTotal,
    plan_name: "",
    billing_cycle: "",
    license_fee_title: "",
    license_fee_amount: 0,
    subscription_amount: 0,
    recurring_note: "",
    has_hardware: false,
    hardware_columns: [],
    hardware_rows: [],
    hardware_amount: 0,
    grand_total: grandTotal,
    in_words: inWords,
    project_breakdown: null,
    terms_conditions: termsContent,
    client_requirements: null,
    deliverables: null,
    company_signatory_name: signatoryName,
    company_signatory_title: signatoryTitle,
    company_phone: signatoryPhone,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error("Please enter Client Name");
      return;
    }
    if (!refNo.trim()) {
      toast.error("Please enter Reference Number");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(isEdit ? "Updating quotation..." : "Saving quotation...");

    try {
      const payload = {
        ...currentQuotationData,
        send_email: false,
      };

      const quoteId = initialData?._id || initialData?.id;
      const url = isEdit ? `/api/quotations/${quoteId}` : "/api/quotations";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save quotation");
      }

      toast.dismiss(toastId);
      toast.success(isEdit ? "Quotation updated successfully!" : "Quotation saved successfully!");

      router.push("/dashboard/quotations");
      router.refresh();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={`w-full space-y-6 pb-20 ${showPreviewModal ? "print:hidden" : ""}`}>
      {/* Top Action Bar */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#131417] p-4 rounded-[4px] border border-slate-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/quotations")}
            className="h-9 px-2 text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0167D6]" />
              {isEdit ? `Edit Quotation (${refNo})` : "Create New Quotation"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-slate-600 dark:text-gray-400" /> Live Preview
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#0167D6] hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEdit ? "Update Quotation" : "Save Quotation"}</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 print:hidden">
        {/* Section 1: Client & Quotation Meta */}
        <Card className="border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#131417]">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs">
                1
              </span>
              Client &amp; Quotation Reference Details
            </CardTitle>
            <CardDescription>
              Basic client contact details and official quotation reference number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  Reference No. *
                </label>
                <Input
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  placeholder="e.g. okobiz/quote/001/08/26"
                  required
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  Quotation Date
                </label>
                <Input
                  type="date"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  Client Name (Person) *
                </label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Mr. Rafiqul Islam"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  Organization / Company
                </label>
                <Input
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Apex Corporation Ltd."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  Client Phone / Mobile
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +880 1712 345678"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  Client Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. client@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  Client Full Address
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House #12, Road #4, Sector #3, Uttara, Dhaka"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  Quotation Subject *
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Quotation for Custom ERP & POS Software System"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Software Scope of Work */}
        <Card className="border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#131417]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs">
                  2
                </span>
                Software Scope of Work &amp; Modules
              </CardTitle>
              <CardDescription>
                Tabular breakdown of software features and scope of deliverables
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSoftwareRow}
              className="flex items-center gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Scope Row
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="overflow-x-auto border border-slate-200 dark:border-gray-800 rounded-[4px]">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-[#181A1F] border-b border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center border-r border-slate-200 dark:border-gray-800">SL</th>
                    <th className="py-2.5 px-3 w-1/3 text-left border-r border-slate-200 dark:border-gray-800">Scope of Work</th>
                    <th className="py-2.5 px-3 text-left border-r border-slate-200 dark:border-gray-800">Particulars &amp; Features</th>
                    <th className="py-2.5 px-3 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-gray-800">
                  {softwareRows.map((row, index) => (
                    <SyncedSoftwareRow
                      key={index}
                      row={row}
                      index={index}
                      onUpdate={handleUpdateSoftwareRow}
                      onRemove={handleRemoveSoftwareRow}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Step 2 Pricing Configuration */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-gray-800 bg-slate-50/70 dark:bg-gray-800/40 p-4 rounded-[4px] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-gray-200">
                    Quotation Pricing &amp; Grand Total
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    Set the software quotation amount. Displays in the right AMOUNT column and bottom Grand Total row.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">Grand Total:</span>
                  <span className="text-sm font-extrabold text-[#0167D6] bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded border border-blue-200 dark:border-blue-800">
                    ৳ {Number(grandTotal || 0).toLocaleString("en-IN")}/-
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                    Total Quotation Amount (৳) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={grandTotal || ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setGrandTotal(val);
                      if (!isWordsManuallyEdited) {
                        setInWords(val > 0 ? numberToWords(val).replace(" Taka Only", " Taka Only.") : "");
                      }
                    }}
                    placeholder="e.g. 30000"
                    className="h-9 font-bold text-sm bg-white dark:bg-gray-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                    Amount in Words
                  </label>
                  <Input
                    value={inWords}
                    onChange={(e) => {
                      setInWords(e.target.value);
                      setIsWordsManuallyEdited(true);
                    }}
                    placeholder="e.g. Thirty Thousand Taka Only."
                    className="h-9 text-xs font-semibold bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Terms & Conditions (Rich Text Editor) */}
        <Card className="border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#131417]">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs">
                3
              </span>
              Terms &amp; Conditions, Project Timeline &amp; Deliverables
            </CardTitle>
            <CardDescription>
              Full WYSIWYG formatted terms, milestone stages, and client requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <QuotationRichEditor
              value={termsContent}
              onChange={setTermsContent}
              onSaveText={handleSaveDefaultTerms}
              isSavingText={isSavingDefaultTerms}
              isSaveDisabled={!isTermsDirty}
            />
          </CardContent>
        </Card>

        {/* Section 4: Company Signatory & Dispatch Options */}
        <Card className="border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#131417]">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-[4px] bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 flex items-center justify-center text-xs">
                4
              </span>
              Company Signatory &amp; Email Dispatch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  Authorized Signatory Name
                </label>
                <Input
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  placeholder="Md. Sorower Jahan"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  Signatory Title / Designation
                </label>
                <Input
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                  placeholder="CEO, okobiz"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  Contact Phone Number
                </label>
                <Input
                  value={signatoryPhone}
                  onChange={(e) => setSignatoryPhone(e.target.value)}
                  placeholder="+880 1973590937"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-gray-800 flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-[#0167D6] shrink-0" />
              <span>
                Saving will store this quotation in <strong>Manage Quotations</strong> where you can print, email, edit, or delete it anytime.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/quotations")}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> Live Preview
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0167D6] hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 px-6 cursor-pointer shadow-xs"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEdit ? "Update Quotation" : "Save Quotation"}</span>
          </Button>
        </div>
      </form>

      {/* Hidden Offscreen Render for PDF Export Generation */}
      <div className="hidden print:hidden">
        <div ref={printSheetHiddenRef}>
          <QuotationPrintSheet data={currentQuotationData} />
        </div>
      </div>
    </div>

      {/* Live Preview Modal */}
      {showPreviewModal && (
        <div
          onClick={() => setShowPreviewModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto cursor-pointer print:static print:p-0 print:m-0 print:bg-white print:overflow-visible print:block"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-zinc-100 dark:bg-zinc-900 rounded-[4px] p-6 max-h-[92vh] overflow-y-auto shadow-2xl my-6 cursor-default print:static print:p-0 print:m-0 print:bg-transparent print:shadow-none print:border-none print:max-w-none print:overflow-visible print:max-h-none print:w-full"
          >
            <div className="flex justify-between items-center pb-4 border-b border-zinc-300 dark:border-zinc-800 mb-6 no-print print:hidden">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0167D6]" />
                Official Quotation Document Preview
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    toast.info("In Destination, select 'Save as PDF' to save a pristine vector PDF.");
                    window.print();
                  }}
                  className="bg-[#0167D6] text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreviewModal(false)}
                  className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-white shadow-md border border-zinc-300 p-2 sm:p-6 overflow-x-auto print:p-0 print:m-0 print:border-none print:shadow-none print:overflow-visible print:w-full">
              <QuotationPrintSheet data={currentQuotationData} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
