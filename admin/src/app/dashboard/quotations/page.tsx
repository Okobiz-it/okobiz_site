"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "@/lib/date";
import {
  FileText,
  Plus,
  Search,
  Printer,
  Mail,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ManageQuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [nextRefNo, setNextRefNo] = useState("");

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Email resend state
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("doc_type", "QUOTATION");
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/quotations?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setQuotations(data.data || []);
        if (data.nextRefNo) setNextRefNo(data.nextRefNo);
      }
    } catch (err) {
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuotations();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/quotations/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Quotation deleted successfully");
        setQuotations((prev) =>
          prev.filter((q) => (q._id || q.id) !== deleteId)
        );
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch {
      toast.error("An error occurred during deletion");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSendEmail = async (quote: any) => {
    const quoteId = quote._id || quote.id;
    if (!quote.email) {
      toast.error("No client email found on this quotation. Please edit and add an email.");
      return;
    }

    setSendingEmailId(quoteId);
    const toastId = toast.loading(`Sending quotation PDF to ${quote.email}...`);

    try {
      const res = await fetch(`/api/quotations/${quoteId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: quote.email }),
      });
      const result = await res.json();
      toast.dismiss(toastId);

      if (result.success) {
        toast.success(`Quotation successfully dispatched to ${quote.email}`);
        fetchQuotations();
      } else {
        toast.error(result.message || "Failed to send email");
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to send email");
    } finally {
      setSendingEmailId(null);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-[#0167D6] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            Quotations Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, manage, print and email professional client quotations for Okobiz software, web & hardware solutions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/quotations/create">
            <Button className="bg-[#0167D6] hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-xs cursor-pointer">
              <Plus className="w-4 h-4" /> Create Quotation
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Quotations</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {quotations.length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0167D6] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Next Reference Number</p>
              <h3 className="text-sm font-mono font-bold text-[#0167D6] dark:text-blue-400 mt-1 truncate max-w-[200px]" title={nextRefNo}>
                {nextRefNo || "okobiz/bizpos/..."}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Emailed to Clients</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {quotations.filter((q) => q.email_sent_at).length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Ref No, Client, Organization, Email or Phone..."
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" className="h-9 text-xs cursor-pointer">
              Search
            </Button>
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  fetchQuotations();
                }}
                className="h-9 text-xs cursor-pointer"
              >
                Clear
              </Button>
            )}
          </form>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="ALL">All Status</option>
              <option value="SENT">Sent</option>
              <option value="DRAFT">Draft</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 cursor-pointer"
              onClick={fetchQuotations}
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Ref No.</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client & Organization</th>
                <th className="py-3 px-4">Scope & Package</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Email Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0167D6]" />
                    Loading quotations...
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No quotations found. Click "Create Quotation" to generate your first client quotation!
                  </td>
                </tr>
              ) : (
                quotations.map((quote) => {
                  const quoteId = quote._id || quote.id;
                  return (
                    <tr
                      key={quoteId}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Ref No */}
                      <td className="py-3 px-4 font-mono font-bold text-[#0167D6] dark:text-blue-400">
                        {quote.ref_no}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {quote.quote_date
                          ? format(new Date(quote.quote_date), "dd MMM yyyy")
                          : "N/A"}
                      </td>

                      {/* Client & Organization */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {quote.client_name}
                        </div>
                        {quote.organization_name && (
                          <div className="text-slate-500 text-[11px]">
                            {quote.organization_name}
                          </div>
                        )}
                        {quote.email && (
                          <div className="text-slate-400 text-[10px] font-mono mt-0.5">
                            {quote.email}
                          </div>
                        )}
                      </td>

                      {/* Scope & Package */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="truncate font-medium text-slate-800 dark:text-slate-200" title={quote.subject}>
                          {quote.subject}
                        </div>
                        {(quote.billing_cycle || quote.has_hardware) && (
                          <div className="flex items-center gap-1.5 mt-1">
                            {quote.billing_cycle && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                                {quote.billing_cycle}
                              </Badge>
                            )}
                            {quote.has_hardware && (
                              <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] py-0 px-1.5">
                                Hardware Incl.
                              </Badge>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3 px-4 text-right font-bold text-sm text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {Number(quote.grand_total || 0) > 0
                          ? `৳ ${Number(quote.grand_total).toLocaleString("en-BD")}`
                          : "—"}
                      </td>

                      {/* Email Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {quote.email_sent_at ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Sent ({format(new Date(quote.email_sent_at), "dd MMM, hh:mm a")})
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not sent</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View & Print PDF */}
                          <Link
                            href={`/dashboard/quotations/${quoteId}/print`}
                            target="_blank"
                            title="View & Print Official PDF"
                          >
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-[#0167D6] cursor-pointer">
                              <Printer className="w-4 h-4" />
                            </Button>
                          </Link>

                          {/* Send / Resend Email */}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Email PDF to Client"
                            onClick={() => handleSendEmail(quote)}
                            disabled={sendingEmailId === quoteId}
                            className="h-8 w-8 text-slate-600 hover:text-emerald-600 cursor-pointer"
                          >
                            {sendingEmailId === quoteId ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                          </Button>

                          {/* Edit */}
                          <Link
                            href={`/dashboard/quotations/${quoteId}/edit`}
                            title="Edit Quotation"
                          >
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-amber-600 cursor-pointer">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Quotation"
                            onClick={() => setDeleteId(quoteId)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this quotation record from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Quotation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

