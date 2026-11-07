"use client";

import React from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { JobOpening } from "../types";

interface JobOpeningsTabProps {
  jobs: JobOpening[];
  filteredJobs: JobOpening[];
  paginatedJobs: JobOpening[];
  loading: boolean;
  allAvailableDepartments: string[];
  selectedDept: string;
  setSelectedDept: (dept: string) => void;
  currentJobPage: number;
  setCurrentJobPage: React.Dispatch<React.SetStateAction<number>>;
  totalJobPages: number;
  jobStartIndex: number;
  jobEndIndex: number;
  totalFilteredJobsCount: number;
  onOpenCreateJob: () => void;
  onOpenEditJob: (job: JobOpening) => void;
  onToggleJobStatus: (job: JobOpening) => void;
  onDeleteJob: (id: string, title: string) => void;
  onViewApplicants: (jobId: string) => void;
}

export default function JobOpeningsTab({
  filteredJobs,
  paginatedJobs,
  loading,
  allAvailableDepartments,
  selectedDept,
  setSelectedDept,
  currentJobPage,
  setCurrentJobPage,
  totalJobPages,
  jobStartIndex,
  jobEndIndex,
  totalFilteredJobsCount,
  onOpenCreateJob,
  onOpenEditJob,
  onToggleJobStatus,
  onDeleteJob,
  onViewApplicants
}: JobOpeningsTabProps) {
  return (
    <div className="space-y-4">
      {/* Department Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {allAvailableDepartments.map(dept => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition cursor-pointer ${
              selectedDept === dept
                ? "bg-[#0167D6] text-white text-white-always shadow-sm"
                : "bg-slate-100 dark:bg-[#141518] border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-gray-800"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 dark:text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-[#0167D6]" size={16} />
          <span>Loading job postings...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-gray-800/80 rounded-[4px] p-12 text-center shadow-sm">
          <Briefcase className="w-10 h-10 text-slate-400 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Job Postings Found</h3>
          <p className="text-xs text-slate-600 dark:text-gray-400 max-w-sm mx-auto mb-4">
            No job postings match your filters. Click below to publish your first vacancy.
          </p>
          <button
            onClick={onOpenCreateJob}
            className="px-4 py-2 bg-[#0167D6] text-white text-white-always text-xs font-semibold rounded-[4px] hover:bg-blue-700 transition cursor-pointer shadow-md shadow-blue-500/20"
          >
            Post New Job
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {paginatedJobs.map(job => (
            <div
              key={job._id}
              className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-gray-800/80 hover:border-slate-300 dark:hover:border-gray-700 rounded-[4px] p-5 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-[4px] bg-blue-50 text-[#0167D6] border border-blue-200 dark:bg-[#3368B2]/20 dark:text-[#3368B2] dark:border-[#3368B2]/30">
                    {job.department}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30">
                    {job.workplaceType}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-[4px] bg-slate-100 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-transparent">
                    {job.employmentType}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase ${
                      job.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                        : "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-500"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{job.title}</h3>

                <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {job.description ? job.description.replace(/<[^>]*>?/gm, "").trim() : ""}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-gray-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400 dark:text-gray-500" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-slate-400 dark:text-gray-500" />
                    Exp: {job.experience}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <DollarSign size={13} />
                    {job.salary}
                  </span>
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    <Users size={13} />
                    {job.applicantsCount || 0} Applicant(s)
                  </span>
                </div>
              </div>

              <div className="flex items-center lg:flex-col lg:items-end justify-between gap-2.5 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200 dark:border-gray-800">
                <button
                  onClick={() => onViewApplicants(job._id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-transparent rounded-[4px] transition cursor-pointer"
                >
                  <Eye size={13} />
                  <span>View Applicants ({job.applicantsCount || 0})</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleJobStatus(job)}
                    className={`px-2.5 py-1.5 rounded-[4px] text-xs font-semibold transition cursor-pointer ${
                      job.status === "active"
                        ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {job.status === "active" ? "Close Role" : "Activate"}
                  </button>
                  <button
                    onClick={() => onOpenEditJob(job)}
                    className="p-1.5 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white border border-slate-200 dark:border-transparent transition cursor-pointer"
                    title="Edit Job"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => onDeleteJob(job._id, job.title)}
                    className="p-1.5 rounded-[4px] bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition cursor-pointer"
                    title="Delete Job"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Job Postings Pagination Controls (10 jobs per page) */}
        {totalJobPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-[#141518] px-4 py-3 rounded-[4px]">
            <div className="text-xs text-slate-600 dark:text-gray-400">
              Showing <span className="font-semibold text-slate-900 dark:text-white">{jobStartIndex + 1}</span>-
              <span className="font-semibold text-slate-900 dark:text-white">{jobEndIndex}</span> of{" "}
              <span className="font-semibold text-slate-900 dark:text-white">{totalFilteredJobsCount}</span> job postings
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentJobPage(1)}
                disabled={currentJobPage === 1}
                className="p-1.5 rounded-[4px] bg-white dark:bg-[#181A1D] border border-slate-300 dark:border-gray-800 text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="First Page"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentJobPage(prev => Math.max(1, prev - 1))}
                disabled={currentJobPage === 1}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-white dark:bg-[#181A1D] border border-slate-300 dark:border-gray-800 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Previous Page"
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalJobPages }, (_, i) => i + 1)
                  .filter(pageNum => {
                    if (totalJobPages <= 7) return true;
                    if (pageNum === 1 || pageNum === totalJobPages) return true;
                    return Math.abs(pageNum - currentJobPage) <= 1;
                  })
                  .reduce<(number | string)[]>((acc, pageNum, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === "number" && (pageNum as number) - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(pageNum);
                    return acc;
                  }, [])
                  .map((pageItem, idx) => {
                    if (typeof pageItem === "string") {
                      return (
                        <span key={`job-ellipsis-${idx}`} className="px-1.5 py-1 text-xs text-slate-400 dark:text-gray-600 font-bold select-none">
                          ...
                        </span>
                      );
                    }
                    const isCurrent = pageItem === currentJobPage;
                    return (
                      <button
                        key={pageItem}
                        onClick={() => setCurrentJobPage(pageItem)}
                        className={`w-7 h-7 flex items-center justify-center rounded-[4px] text-xs font-bold transition ${
                          isCurrent
                            ? "bg-[#0167D6] text-white text-white-always shadow-md shadow-blue-500/20"
                            : "bg-white dark:bg-[#181A1D] border border-slate-300 dark:border-gray-800 text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {pageItem}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentJobPage(prev => Math.min(totalJobPages, prev + 1))}
                disabled={currentJobPage === totalJobPages}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-[#181A1D] border border-gray-800 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setCurrentJobPage(totalJobPages)}
                disabled={currentJobPage === totalJobPages}
                className="p-1.5 rounded-[4px] bg-[#181A1D] border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Last Page"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

