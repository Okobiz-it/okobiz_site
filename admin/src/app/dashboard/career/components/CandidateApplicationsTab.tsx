"use client";

import React, { useState } from "react";
import {
  Users,
  Eye,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { JobOpening, JobApplication, STATUS_COLORS } from "../types";

interface CandidateApplicationsTabProps {
  jobs: JobOpening[];
  filteredApps: JobApplication[];
  appJobFilter: string;
  setAppJobFilter: (v: string) => void;
  appStatusFilter: string;
  setAppStatusFilter: (v: string) => void;
  searchQuery: string;
  onSelectViewingApp: (app: JobApplication) => void;
  onUpdateAppStatus: (id: string, status: string) => void;
  onOpenEmailModal: (app: JobApplication) => void;
  onDeleteApp: (id: string, name: string) => void;
  onClearFilters: () => void;
}

export default function CandidateApplicationsTab({
  jobs,
  filteredApps,
  appJobFilter,
  setAppJobFilter,
  appStatusFilter,
  setAppStatusFilter,
  onSelectViewingApp,
  onUpdateAppStatus,
  onOpenEmailModal,
  onDeleteApp,
  onClearFilters
}: CandidateApplicationsTabProps) {
  // Pagination State (10 per page)
  const APPLICATIONS_PER_PAGE = 10;
  const [appPage, setAppPage] = useState(1);

  const totalAppPages = Math.max(1, Math.ceil(filteredApps.length / APPLICATIONS_PER_PAGE));
  const currentAppPage = Math.min(appPage, totalAppPages);
  const appStartIndex = (currentAppPage - 1) * APPLICATIONS_PER_PAGE;
  const appEndIndex = Math.min(appStartIndex + APPLICATIONS_PER_PAGE, filteredApps.length);
  const paginatedApps = filteredApps.slice(appStartIndex, appEndIndex);

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-[#141518] p-3.5 rounded-[4px] border border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-gray-400">
            <span>Filter by Job:</span>
            <select
              value={appJobFilter}
              onChange={e => {
                setAppJobFilter(e.target.value);
                setAppPage(1);
              }}
              className="bg-[#181A1D] border border-gray-700 rounded-[4px] px-2.5 py-1 text-white text-xs font-semibold focus:outline-none focus:border-[#3368B2]"
            >
              <option value="all">All Jobs ({jobs.length})</option>
              {jobs.map(j => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-gray-400">
            <span>Status Stage:</span>
            <select
              value={appStatusFilter}
              onChange={e => {
                setAppStatusFilter(e.target.value);
                setAppPage(1);
              }}
              className="bg-[#181A1D] border border-gray-700 rounded-[4px] px-2.5 py-1 text-white text-xs font-semibold focus:outline-none focus:border-[#3368B2]"
            >
              <option value="all">All Stages</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="offered">Offered</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="text-gray-400 text-xs">
          Showing <strong className="text-white">{filteredApps.length}</strong> applicant(s)
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="bg-[#141518] border border-gray-800/80 rounded-[4px] p-12 text-center">
          <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No Applications Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            No candidates have applied matching this filter criteria yet.
          </p>
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-semibold rounded-[4px] hover:bg-gray-700 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 10 Applications List */}
          <div className="space-y-3">
            {paginatedApps.map(app => (
              <div
                key={app._id}
                onClick={() => onSelectViewingApp(app)}
                className="bg-[#141518] border border-gray-800/80 hover:border-[#3368B2]/70 rounded-[4px] p-5 transition flex flex-col lg:flex-row lg:items-start justify-between gap-5 cursor-pointer group"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-[#3368B2] transition-colors flex items-center gap-1.5">
                      <span>{app.name}</span>
                      <Eye size={13} className="text-gray-500 group-hover:text-[#3368B2] transition-colors" />
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-[4px] border ${STATUS_COLORS[app.status] || "bg-gray-800 text-gray-400"
                        }`}
                    >
                      {app.status}
                    </span>
                    <span className="text-xs text-gray-500">• Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="text-blue-400 font-semibold">{app.jobTitle}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-300">
                      <Mail size={12} className="text-gray-500" />
                      {app.email}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-300">
                      <Phone size={12} className="text-gray-500" />
                      {app.phone}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-400 pt-1">
                    <div>
                      <span className="text-gray-500 block">Experience</span>
                      <strong className="text-gray-200">{app.experienceYears || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Expected Salary</span>
                      <strong className="text-emerald-400">{app.expectedSalary || "Negotiable"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Current Company</span>
                      <strong className="text-gray-200">{app.currentCompany || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Notice Period</span>
                      <strong className="text-gray-200">{app.noticePeriod || "Immediate"}</strong>
                    </div>
                  </div>

                  {app.coverNote && (
                    <p className="text-xs text-gray-300 bg-black/30 p-2.5 rounded-[4px] border border-gray-800/80 leading-relaxed italic line-clamp-2">
                      "{app.coverNote}"
                    </p>
                  )}

                  {/* Applicant Links & Resume */}
                  <div className="flex flex-wrap items-center gap-2 pt-1" onClick={e => e.stopPropagation()}>
                    {app.resumeUrl && (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-[4px] transition shadow"
                      >
                        <FileText size={12} />
                        <span>View Resume / CV</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                    {app.portfolioUrl && (
                      <a
                        href={app.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-950/40 px-2.5 py-1 rounded-[4px] border border-blue-900/30"
                      >
                        <span>Portfolio</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                    {app.githubUrl && (
                      <a
                        href={app.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white bg-gray-900 px-2.5 py-1 rounded-[4px] border border-gray-800"
                      >
                        <span>GitHub</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                    {app.linkedinUrl && (
                      <a
                        href={app.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-950/40 px-2.5 py-1 rounded-[4px] border border-blue-900/30"
                      >
                        <span>LinkedIn</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                    {app.emailsSent && app.emailsSent.length > 0 && (
                      <span className="text-[11px] font-semibold text-purple-400 bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded-[4px] flex items-center gap-1">
                        <CheckCircle2 size={11} /> {app.emailsSent.length} Email(s) Replied
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Status Dropdown & Email Reply */}
                <div
                  className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2.5 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-800"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onSelectViewingApp(app)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 hover:text-white rounded-[4px] transition cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>View Details</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500 font-semibold">Stage:</span>
                    <select
                      value={app.status}
                      onChange={e => onUpdateAppStatus(app._id, e.target.value)}
                      className="bg-[#181A1D] border border-gray-700 text-xs rounded-[4px] px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-[#3368B2]"
                    >
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview</option>
                      <option value="offered">Offered</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <button
                    onClick={() => onOpenEmailModal(app)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#3368B2] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold rounded-[4px] shadow-md shadow-blue-950/50 transition cursor-pointer"
                  >
                    <Mail size={13} />
                    <span>Reply via Email</span>
                  </button>

                  <button
                    onClick={() => onDeleteApp(app._id, app.name)}
                    className="text-xs text-gray-500 hover:text-red-400 transition text-right px-1 cursor-pointer"
                  >
                    Delete Application
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Applications Pagination Controls */}
          {totalAppPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-800 bg-[#141518] px-4 py-3 rounded-[4px]">
              <div className="text-xs text-gray-400">
                Showing <span className="font-semibold text-white">{appStartIndex + 1}</span>-
                <span className="font-semibold text-white">{appEndIndex}</span> of{" "}
                <span className="font-semibold text-white">{filteredApps.length}</span> applicants
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAppPage(1)}
                  disabled={currentAppPage === 1}
                  className="p-1.5 rounded-[4px] bg-[#181A1D] border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="First Page"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  onClick={() => setAppPage(prev => Math.max(1, prev - 1))}
                  disabled={currentAppPage === 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-[#181A1D] border border-gray-800 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalAppPages }, (_, i) => i + 1)
                    .filter(pageNum => {
                      if (totalAppPages <= 7) return true;
                      if (pageNum === 1 || pageNum === totalAppPages) return true;
                      return Math.abs(pageNum - currentAppPage) <= 1;
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
                          <span key={`app-ellipsis-${idx}`} className="px-1.5 py-1 text-xs text-gray-600 font-bold select-none">
                            ...
                          </span>
                        );
                      }
                      const isCurrent = pageItem === currentAppPage;
                      return (
                        <button
                          key={pageItem}
                          onClick={() => setAppPage(pageItem)}
                          className={`w-7 h-7 flex items-center justify-center rounded-[4px] text-xs font-bold transition ${isCurrent
                              ? "bg-[#3368B2] text-white shadow-md shadow-blue-900/30"
                              : "bg-[#181A1D] border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                        >
                          {pageItem}
                        </button>
                      );
                    })}
                </div>

                <button
                  onClick={() => setAppPage(prev => Math.min(totalAppPages, prev + 1))}
                  disabled={currentAppPage === totalAppPages}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-[#181A1D] border border-gray-800 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Next Page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => setAppPage(totalAppPages)}
                  disabled={currentAppPage === totalAppPages}
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

