"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "@/lib/date";
import {
  Receipt,
  Plus,
  Search,
  Printer,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Coins,
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

export default function ManageBillsPage() {
  const router = useRouter();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [nextBillRefNo, setNextBillRefNo] = useState("");

  const fetchBills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("doc_type", "BILL");
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/quotations?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setBills(data.data || []);
        if (data.nextBillRefNo) setNextBillRefNo(data.nextBillRefNo);
      }
    } catch {
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBills();
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
        toast.success("Bill deleted successfully");
        setBills((prev) => prev.filter((b) => (b._id || b.id) !== deleteId));
      } else {
        toast.error(data.message || "Failed to delete bill");
      }
    } catch {
      toast.error("An error occurred during deletion");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const totalBilled = bills.reduce((acc, b) => acc + (Number(b.grand_total) || 0), 0);

  return (
    <div className="space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            Bills Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, manage, print and track official company bill vouchers on the Okobiz letterhead pad
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/quotations/create-bill">
            <Button className="bg-[#0167D6] hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-xs cursor-pointer">
              <Plus className="w-4 h-4" /> Create Bill
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Bills Issued</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {bills.length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0167D6] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Next Bill Reference</p>
              <h3
                className="text-sm font-mono font-bold text-[#0167D6] dark:text-blue-400 mt-1 truncate max-w-[200px]"
                title={nextBillRefNo}
              >
                {nextBillRefNo || "okobiz/bill/..."}
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
              <p className="text-xs font-semibold text-slate-500">Total Billed Amount</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                ৳ {totalBilled.toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
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
                placeholder="Search by Ref No, Client, Organization, or Subject..."
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
                  fetchBills();
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
              <option value="PAID">Paid</option>
            </select>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 cursor-pointer"
              onClick={fetchBills}
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Ref No.</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client &amp; Organization</th>
                <th className="py-3 px-4">Bill Subject</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0167D6]" />
                    Loading bills...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No bills found. Click &quot;Create Bill&quot; to issue your first client bill voucher!
                  </td>
                </tr>
              ) : (
                bills.map((bill) => {
                  const billId = bill._id || bill.id;
                  return (
                    <tr
                      key={billId}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Ref No */}
                      <td className="py-3 px-4 font-mono font-bold text-[#0167D6] dark:text-blue-400">
                        {bill.ref_no}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {bill.quote_date
                          ? format(new Date(bill.quote_date), "dd MMM yyyy")
                          : "N/A"}
                      </td>

                      {/* Client & Organization */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {bill.client_name}
                        </div>
                        {bill.organization_name && (
                          <div className="text-slate-500 text-[11px]">
                            {bill.organization_name}
                          </div>
                        )}
                        {bill.phone && (
                          <div className="text-slate-400 text-[10px]">{bill.phone}</div>
                        )}
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium max-w-xs truncate" title={bill.subject}>
                        {bill.subject || "Due Bill for Web & Software Solution"}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                        ৳ {(Number(bill.grand_total) || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold uppercase ${
                            bill.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : bill.status === "SENT"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {bill.status || "SENT"}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/dashboard/quotations/${billId}/print`}
                            target="_blank"
                            title="Print / View Official Bill Pad"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs flex items-center gap-1 border-slate-200 hover:border-[#0167D6] hover:text-[#0167D6] cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Print</span>
                            </Button>
                          </Link>

                          <Link
                            href={`/dashboard/quotations/${billId}/edit`}
                            title="Edit Bill"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs flex items-center gap-1 border-slate-200 hover:border-amber-500 hover:text-amber-600 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </Link>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(billId)}
                            title="Delete Bill"
                            className="h-7 px-2 text-xs text-red-500 border-slate-200 hover:bg-red-50 hover:border-red-200 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this bill record from the database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Bill"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

