"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  Plus,
  Trash2,
  Save,
  Printer,
  Eye,
  RefreshCw,
  ArrowLeft,
  X,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";
import { BillPrintSheet, BillRow } from "./bill-print-sheet";
import { numberToWords } from "@/lib/number-to-words";
import { parseRevisionRef } from "@/lib/quotation-revisions";

interface BillFormProps {
  initialData?: any;
  isEdit?: boolean;
  reviseFromId?: string;
  sourceRefNo?: string;
}

export function BillForm({
  initialData,
  isEdit = false,
  reviseFromId,
  sourceRefNo,
}: BillFormProps) {
  const router = useRouter();
  const isRevise = Boolean(reviseFromId);

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
    initialData?.subject || "Due Bill for Website Design & Development"
  );
  const [additionalNotes, setAdditionalNotes] = useState(initialData?.additional_notes || "");

  // Synchronize state when initialData updates or loads
  useEffect(() => {
    if (!initialData) return;
    if (initialData.ref_no) setRefNo(initialData.ref_no);
    if (initialData.quote_date) {
      setQuoteDate(new Date(initialData.quote_date).toISOString().split("T")[0]);
    }
    if (initialData.client_name) setClientName(initialData.client_name);
    if (initialData.organization_name !== undefined) setOrganizationName(initialData.organization_name || "");
    if (initialData.address !== undefined) setAddress(initialData.address || "");
    if (initialData.phone !== undefined) setPhone(initialData.phone || "");
    if (initialData.email !== undefined) setEmail(initialData.email || "");
    if (initialData.subject) setSubject(initialData.subject);
  }, [initialData]);

  // Handle phone input: strictly numeric digits only
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, "");
    setPhone(numericOnly);
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Enter" ||
      (e.ctrlKey || e.metaKey)
    ) {
      return;
    }
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Bill Rows (Expense Head & Amount)
  const [billRows, setBillRows] = useState<BillRow[]>(() => {
    if (Array.isArray(initialData?.bill_rows) && initialData.bill_rows.length > 0) {
      return initialData.bill_rows;
    }
    if (Array.isArray(initialData?.software_rows) && initialData.software_rows.length > 0) {
      return initialData.software_rows.map((r: any, idx: number) => ({
        sl: idx + 1,
        expense_head: r.expense_head || r.scope || "Website Design & Development",
        amount: r.amount || 0,
      }));
    }
    return [
      {
        sl: 1,
        expense_head: "Website Design & Development",
        amount: 5000,
      },
    ];
  });

  // Calculate Subtotal (Total of all bill expenses)
  const subTotal = billRows.reduce((sum, r) => {
    const val = typeof r.amount === "string" ? parseFloat(r.amount.replace(/[^0-9.-]/g, "")) : r.amount;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // Advance / Already Paid State
  const [hasAdvancePayment, setHasAdvancePayment] = useState<boolean>(
    Boolean(initialData?.has_advance_payment || (initialData?.advance_amount && Number(initialData.advance_amount) > 0))
  );
  const [advanceAmount, setAdvanceAmount] = useState<number>(() => {
    return initialData?.advance_amount !== undefined ? Number(initialData.advance_amount) : 0;
  });
  const [advanceLabel, setAdvanceLabel] = useState<string>(
    initialData?.advance_label || "Already Paid / Advance"
  );

  // Calculate Net Grand Total (Deduct advance if enabled)
  const grandTotal = Math.max(0, subTotal - (hasAdvancePayment ? advanceAmount : 0));

  // Amount In Words (Based on Net Due Grand Total)
  const [inWords, setInWords] = useState<string>(() => {
    if (initialData?.in_words && initialData.in_words.trim().length > 0) {
      return initialData.in_words;
    }
    const val = Number(initialData?.grand_total || initialData?.software_amount) || grandTotal;
    return numberToWords(val).replace(" Taka Only", " Taka Only.");
  });

  // Automatically update inWords when grandTotal changes (unless manually edited)
  const [isWordsManuallyEdited, setIsWordsManuallyEdited] = useState(false);
  useEffect(() => {
    if (!isWordsManuallyEdited && grandTotal > 0) {
      setInWords(numberToWords(grandTotal).replace(" Taka Only", " Taka Only."));
    }
  }, [grandTotal, isWordsManuallyEdited]);

  // Submission & Preview state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Fetch next Ref No if creating new
  useEffect(() => {
    if (!isEdit && !isRevise && !refNo) {
      fetch("/api/quotations")
        .then((res) => res.json())
        .then((data) => {
          if (data?.nextBillRefNo) {
            setRefNo(data.nextBillRefNo);
          } else if (data?.nextRefNo) {
            setRefNo(data.nextRefNo.replace("bizpos", "bill"));
          }
        })
        .catch(() => {});
    }
  }, [isEdit, refNo]);

  // Keyboard navigation for preview modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showPreviewModal) {
        setShowPreviewModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPreviewModal]);

  // Row operations
  const handleAddRow = () => {
    setBillRows((prev) => [
      ...prev,
      {
        sl: prev.length + 1,
        expense_head: "",
        amount: 0,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (billRows.length === 1) {
      toast.error("A bill must contain at least one expense item");
      return;
    }
    setBillRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof BillRow, value: any) => {
    setBillRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Live preview data
  const previewData = {
    id: initialData?._id || initialData?.id || "preview-bill",
    ref_no: refNo,
    quote_date: quoteDate,
    client_name: clientName,
    organization_name: organizationName,
    address,
    phone,
    email,
    subject,
    doc_type: "BILL",
    bill_rows: billRows,
    sub_total: subTotal,
    has_advance_payment: hasAdvancePayment,
    advance_amount: hasAdvancePayment ? advanceAmount : 0,
    advance_label: advanceLabel,
    grand_total: grandTotal,
    in_words: inWords,
    additional_notes: additionalNotes,
    company_phone: "+880 1973590937",
    company_email: "info@okobiz.com",
  };

  const currentSnapshot = JSON.stringify({
    quoteDate,
    clientName: clientName.trim(),
    organizationName: organizationName.trim(),
    address: address.trim(),
    phone: phone.trim(),
    email: email.trim(),
    subject: subject.trim(),
    billRows,
    hasAdvancePayment,
    advanceAmount: hasAdvancePayment ? advanceAmount : 0,
    advanceLabel: advanceLabel.trim(),
    grandTotal,
    inWords: inWords.trim(),
    additionalNotes: additionalNotes.trim(),
  });
  const initialReviseSnapshotRef = useRef<string | null>(null);
  if (isRevise && initialReviseSnapshotRef.current === null) {
    initialReviseSnapshotRef.current = currentSnapshot;
  }
  const isReviseUnchanged = isRevise && currentSnapshot === initialReviseSnapshotRef.current;

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!refNo.trim()) {
      toast.error("Bill Reference Number is required");
      return;
    }
    if (!clientName.trim()) {
      toast.error("Client Name is required");
      return;
    }
    if (phone.trim()) {
      if (!/^\d+$/.test(phone.trim())) {
        toast.error("Client Phone / Mobile must contain numeric digits only");
        return;
      }
      if (phone.trim().length < 6) {
        toast.error("Client Phone / Mobile must be at least 6 digits");
        return;
      }
    }
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast.error("Please enter a valid Client Email Address (e.g. client@example.com)");
        return;
      }
    }
    if (!subject.trim()) {
      toast.error("Bill Subject is required");
      return;
    }
    if (billRows.length === 0 || billRows.some((r) => !r.expense_head.trim())) {
      toast.error("Please provide a valid Expense Head for every item");
      return;
    }
    if (hasAdvancePayment && advanceAmount < 0) {
      toast.error("Advance amount cannot be negative");
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = toast.loading(
      isEdit ? "Updating bill..." : isRevise ? "Saving revised bill..." : "Creating official bill..."
    );

    try {
      const { baseRef, revNumber } = parseRevisionRef(refNo);
      const payload = {
        ref_no: refNo,
        quote_date: quoteDate,
        client_name: clientName,
        organization_name: organizationName,
        address,
        phone,
        email,
        subject,
        doc_type: "BILL",
        ...(isRevise
          ? {
              parent_id: reviseFromId,
              root_ref_no: baseRef,
              revision_number: revNumber,
              is_revised: false,
            }
          : {}),
        bill_rows: billRows,
        software_rows: billRows.map((r, idx) => ({
          sl: idx + 1,
          scope: r.expense_head,
          particulars: "",
          amount: Number(r.amount) || 0,
        })),
        sub_total: subTotal,
        has_advance_payment: hasAdvancePayment,
        advance_amount: hasAdvancePayment ? advanceAmount : 0,
        advance_label: advanceLabel,
        grand_total: grandTotal,
        software_amount: grandTotal,
        in_words: inWords,
        additional_notes: additionalNotes,
        company_signatory_name: "Admin & Accounts",
        company_signatory_title: "Okobiz",
        status: initialData?.status || "SENT",
      };

      const url = isEdit ? `/api/quotations/${initialData._id || initialData.id}` : "/api/quotations";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      toast.dismiss(loadingToastId);

      if (resData.success) {
        toast.success(
          isEdit
            ? "Bill updated successfully"
            : isRevise
            ? "Revised bill saved successfully"
            : "Bill created successfully"
        );
        router.push("/dashboard/quotations/manage-bills");
        router.refresh();
      } else {
        toast.error(resData.message || "Failed to save bill");
      }
    } catch (err: any) {
      toast.dismiss(loadingToastId);
      toast.error(err.message || "An error occurred while saving the bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full space-y-6 pb-20 print:hidden">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#111216] p-5 rounded-lg border border-slate-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/quotations/manage-bills")}
            className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#0167D6]" />
              {isRevise
                ? `Revise Official Bill (${refNo})`
                : isEdit
                ? "Edit Official Bill"
                : "Create Official Bill"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              {isRevise && sourceRefNo ? (
                <>
                  Creating revision from <span className="font-mono font-semibold">{sourceRefNo}</span>
                </>
              ) : (
                "Issue company bill vouchers on official Okobiz letterhead pad with automated amount calculations"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreviewModal(true)}
            className="flex-1 sm:flex-none border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800"
          >
            <Eye className="w-4 h-4 mr-2 text-[#0167D6]" />
            Live Preview
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isReviseUnchanged}
            title={isReviseUnchanged ? "Make at least one change to save a revised bill" : undefined}
            className="flex-1 sm:flex-none bg-[#0167D6] hover:bg-blue-700 text-white font-medium shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "Update Bill" : isRevise ? "Save Revised Bill" : "Save Bill"}
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Client & Quotation Reference Details */}
        <Card className="border-slate-200 dark:border-gray-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-gray-800/80">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/40 text-xs font-bold text-[#0167D6]">
                1
              </span>
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                  Client &amp; Quotation Reference Details
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-gray-400">
                  Basic client contact details and official quotation reference number
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1.5">
                  Reference No. <span className="text-red-500">*</span>
                </label>
                <Input
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  placeholder="e.g. okobiz/bizpos/003/12/26 or okobiz/bill/oct/004/26"
                  required
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1.5">
                  Quotation Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1.5">
                  Client Name (Person) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Mr. Rafiqul Islam or Brit Bangla (BD Legal)"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1.5">
                  Organization / Company
                </label>
                <Input
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Apex Corporation Ltd."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1.5">
                  Client Phone / Mobile
                </label>
                <Input
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyDown={handlePhoneKeyDown}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 01712345678 (numeric digits only)"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1.5">
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

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1.5">
                Client Full Address
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. House #12, Road #4, Sector #3, Uttara, Dhaka"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1.5">
                Quotation Subject <span className="text-red-500">*</span>
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Due Bill for Website Design & Development of (bdlegal.org)"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: Software Expense Head & Amount */}
        <Card className="border-slate-200 dark:border-gray-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-gray-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/40 text-xs font-bold text-[#0167D6]">
                  2
                </span>
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                    Software Expense Head &amp; Amount
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-gray-400">
                    Expense heads and payable amounts itemized in official 2-column table format
                  </CardDescription>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                className="text-xs text-[#0167D6] hover:bg-blue-50 border-blue-200"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Expense Head
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="border border-slate-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#B4C6E7] text-zinc-900 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12 text-xs uppercase tracking-wider">#</th>
                    <th className="py-2.5 px-4 text-xs uppercase tracking-wider">Expense Head *</th>
                    <th className="py-2.5 px-4 text-center w-48 text-xs uppercase tracking-wider">
                      Amount (BDT) *
                    </th>
                    <th className="py-2.5 px-3 text-center w-14 text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-gray-800 bg-white dark:bg-[#111216]">
                  {billRows.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-gray-850 align-top">
                      <td className="py-2.5 px-3 text-center text-xs font-semibold text-slate-400 align-top pt-3">
                        {index + 1}
                      </td>
                      <td className="py-2 px-4 align-top">
                        <Textarea
                          value={row.expense_head}
                          onChange={(e) => handleUpdateRow(index, "expense_head", e.target.value)}
                          placeholder="e.g. Website Design & Development or Cloud Hosting Renewal"
                          className="min-h-[38px] text-xs sm:text-sm py-2 px-3 resize-y font-medium leading-snug rounded-[4px]"
                          rows={1}
                          required
                        />
                      </td>
                      <td className="py-2 px-4 align-top">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            Tk.
                          </span>
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={row.amount}
                            onChange={(e) =>
                              handleUpdateRow(index, "amount", parseFloat(e.target.value) || 0)
                            }
                            className="pl-9 text-right font-semibold text-sm h-9"
                            required
                          />
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center align-top pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRow(index)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Advance / Already Paid Amount Section */}
            <div className="p-4 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="has-advance-payment"
                    checked={hasAdvancePayment}
                    onCheckedChange={(checked) => {
                      const isChecked = Boolean(checked);
                      setHasAdvancePayment(isChecked);
                      if (!isChecked) {
                        setAdvanceAmount(0);
                      }
                    }}
                  />
                  <label
                    htmlFor="has-advance-payment"
                    className="text-xs sm:text-sm font-bold text-slate-800 dark:text-gray-200 cursor-pointer select-none"
                  >
                    Client Has Already Paid Some Amount (Advance / Partial Payment)
                  </label>
                </div>
                {hasAdvancePayment && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300 text-[11px] font-semibold">
                    Advance Active
                  </Badge>
                )}
              </div>

              {hasAdvancePayment && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-gray-800 animate-in fade-in-50 duration-150">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1">
                      Already Paid / Advance Amount (BDT) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">
                        Tk.
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={advanceAmount || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setAdvanceAmount(val);
                        }}
                        placeholder="e.g. 2500"
                        className="pl-9 font-bold text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-800"
                        required={hasAdvancePayment}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      This amount is subtracted from total expenses and displayed in green on the bill.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1">
                      Expense Head / Payment Title
                    </label>
                    <Input
                      value={advanceLabel}
                      onChange={(e) => setAdvanceLabel(e.target.value)}
                      placeholder="e.g. Already Paid / Advance or Advance Received"
                      className="text-xs font-medium"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Label shown in the bill table expense head column.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Total and In Words Summary Card */}
            <div className="bg-slate-50 dark:bg-gray-900/50 p-4 rounded-lg border border-slate-200 dark:border-gray-800 space-y-3">
              {hasAdvancePayment && advanceAmount > 0 ? (
                <>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-gray-400 pb-1.5 border-b border-slate-200/70 dark:border-gray-800">
                    <span>Total Expense Amount (Subtotal):</span>
                    <span className="font-semibold text-slate-800 dark:text-gray-200 font-mono">
                      Tk. {subTotal.toLocaleString("en-IN")}/-
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 pb-1.5 border-b border-slate-200/70 dark:border-gray-800">
                    <span>(-) {advanceLabel || "Already Paid / Advance"}:</span>
                    <span className="font-mono">
                      - Tk. {advanceAmount.toLocaleString("en-IN")}/-
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
                    <span className="text-sm font-bold text-slate-800 dark:text-gray-200">
                      Total Due Bill Amount (Net Payable):
                    </span>
                    <span className="text-lg font-extrabold text-[#0167D6] font-mono">
                      Tk. {grandTotal.toLocaleString("en-IN")}/-
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
                  <span className="text-sm font-bold text-slate-800 dark:text-gray-200">
                    Total Bill Amount:
                  </span>
                  <span className="text-lg font-extrabold text-[#0167D6] font-mono">
                    Tk. {grandTotal.toLocaleString("en-IN")}/-
                  </span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block mb-1">
                  Amount in Words:
                </label>
                <Input
                  value={inWords}
                  onChange={(e) => {
                    setInWords(e.target.value);
                    setIsWordsManuallyEdited(true);
                  }}
                  placeholder="e.g. Five Thousand Taka Only."
                  className="font-semibold text-sm text-slate-800 dark:text-gray-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/quotations/manage-bills")}
            className="border-slate-300 dark:border-gray-700"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreviewModal(true)}
            className="border-slate-300 dark:border-gray-700 text-[#0167D6]"
          >
            <Eye className="w-4 h-4 mr-2" />
            Live Preview
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || isReviseUnchanged}
            title={isReviseUnchanged ? "Make at least one change to save a revised bill" : undefined}
            className="bg-[#0167D6] hover:bg-blue-700 text-white font-medium shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "Update Bill" : isRevise ? "Save Revised Bill" : "Save Bill"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>

      {/* Live Preview Modal (Prints strictly vector A4 with quotation print fidelity) */}
      {showPreviewModal && (
        <div
          onClick={() => setShowPreviewModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto cursor-pointer print:static print:p-0 print:m-0 print:bg-white print:overflow-visible print:block"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-zinc-100 dark:bg-zinc-900 rounded-[4px] p-6 max-h-[94vh] overflow-y-auto shadow-2xl my-6 cursor-default print:static print:p-0 print:m-0 print:bg-transparent print:shadow-none print:border-none print:max-w-none print:overflow-visible print:max-h-none print:w-full"
          >
            <div className="flex justify-between items-center pb-4 border-b border-zinc-300 dark:border-zinc-800 mb-6 no-print print:hidden">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#0167D6]" />
                Official Bill Document Preview
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

            <div className="bg-white shadow-md border border-zinc-300 p-2 sm:p-6 overflow-x-auto print:p-0 print:m-0 print:border-none print:shadow-none print:overflow-visible print:w-full flex justify-center">
              <BillPrintSheet data={previewData} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

