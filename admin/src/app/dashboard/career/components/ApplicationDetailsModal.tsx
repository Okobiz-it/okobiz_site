"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Check
} from "lucide-react";
import { JobApplication, STATUS_COLORS } from "../types";

interface ApplicationDetailsModalProps {
  viewingApp: JobApplication | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onOpenEmailModal: (app: JobApplication) => void;
}

export default function ApplicationDetailsModal({
  viewingApp,
  onClose,
  onUpdateStatus,
  onOpenEmailModal
}: ApplicationDetailsModalProps) {
  const [copiedResume, setCopiedResume] = useState(false);

  if (!viewingApp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-gray-800 rounded-[4px] max-w-4xl lg:max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-gray-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{viewingApp.name}</h2>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-[4px] border ${
                  STATUS_COLORS[viewingApp.status] || "bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-400 border-slate-200 dark:border-gray-700"
                }`}
              >
                {viewingApp.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-400">
              Applied for <strong className="text-[#0167D6] dark:text-blue-400">{viewingApp.jobTitle}</strong> • Applied on{" "}
              {new Date(viewingApp.createdAt).toLocaleDateString()} at{" "}
              {new Date(viewingApp.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white p-1 rounded-[4px] transition cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-[#181A1D] border border-slate-200 dark:border-gray-800 rounded-[4px]">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 dark:text-gray-400 font-semibold">Change Stage:</span>
            <select
              value={viewingApp.status}
              onChange={e => onUpdateStatus(viewingApp._id, e.target.value)}
              className="bg-white dark:bg-[#121316] border border-slate-300 dark:border-gray-700 text-xs rounded-[4px] px-3 py-1.5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-[#0167D6]"
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenEmailModal(viewingApp);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0167D6] hover:bg-blue-700 text-white text-white-always text-xs font-bold rounded-[4px] transition cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Mail size={13} />
              <span>Reply via Email</span>
            </button>
          </div>
        </div>

        {/* Candidate Key Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-[#181A1D] border border-slate-200 dark:border-gray-800 rounded-[4px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-500 block mb-1">Email Address</span>
            <a
              href={`mailto:${viewingApp.email}`}
              className="text-xs text-[#0167D6] dark:text-blue-400 hover:underline font-semibold flex items-center gap-1.5"
            >
              <Mail size={13} className="shrink-0" />
              <span className="truncate">{viewingApp.email}</span>
            </a>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#181A1D] border border-slate-200 dark:border-gray-800 rounded-[4px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-500 block mb-1">Phone / WhatsApp</span>
            <a
              href={`tel:${viewingApp.phone}`}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1.5"
            >
              <Phone size={13} className="shrink-0" />
              <span>{viewingApp.phone}</span>
            </a>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#181A1D] border border-slate-200 dark:border-gray-800 rounded-[4px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-500 block mb-1">Total Experience</span>
            <span className="text-xs text-slate-900 dark:text-white font-bold">{viewingApp.experienceYears || "Not specified"}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#181A1D] border border-slate-200 dark:border-gray-800 rounded-[4px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-500 block mb-1">Current Company</span>
            <span className="text-xs text-slate-800 dark:text-gray-200 font-semibold">{viewingApp.currentCompany || "Not specified"}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#181A1D] border border-slate-200 dark:border-gray-800 rounded-[4px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-500 block mb-1">Expected Salary</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{viewingApp.expectedSalary || "Negotiable"}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#181A1D] border border-slate-200 dark:border-gray-800 rounded-[4px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-500 block mb-1">Notice Period</span>
            <span className="text-xs text-slate-800 dark:text-gray-200 font-semibold">{viewingApp.noticePeriod || "Immediate"}</span>
          </div>
        </div>

        {/* Cover Letter Section (First) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <FileText className="text-[#0167D6] w-4 h-4 shrink-0" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider">
              Cover Letter
            </h4>
          </div>
          {viewingApp.coverNote ? (
            <div className="p-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-gray-800 rounded-[4px] text-xs text-slate-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {viewingApp.coverNote}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-gray-500 italic p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-gray-800/60 rounded-[4px]">
              No cover letter provided by candidate.
            </p>
          )}
        </div>

        {/* Portfolio & Social Links */}
        {(viewingApp.portfolioUrl || viewingApp.githubUrl || viewingApp.linkedinUrl) && (
          <div className="flex flex-wrap items-center gap-2">
            {viewingApp.portfolioUrl && (
              <a
                href={viewingApp.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#0167D6] dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-[4px] border border-blue-200 dark:border-blue-900/30 font-semibold transition"
              >
                <span>Portfolio Link</span>
                <ExternalLink size={12} />
              </a>
            )}
            {viewingApp.githubUrl && (
              <a
                href={viewingApp.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-gray-900 px-3 py-1.5 rounded-[4px] border border-slate-200 dark:border-gray-800 font-semibold transition"
              >
                <span>GitHub Profile</span>
                <ExternalLink size={12} />
              </a>
            )}
            {viewingApp.linkedinUrl && (
              <a
                href={viewingApp.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#0167D6] dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-[4px] border border-blue-200 dark:border-blue-900/30 font-semibold transition"
              >
                <span>LinkedIn Profile</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        {/* Candidate Resume / CV Section (Comes Later, No Document Viewer) */}
        <div className="p-4 bg-emerald-50/50 dark:bg-[#181A1D] border border-emerald-200 dark:border-emerald-500/30 rounded-[4px] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="text-emerald-600 dark:text-emerald-400 w-5 h-5 shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Candidate Resume / CV</h4>
                <p className="text-[11px] text-slate-600 dark:text-gray-400">
                  {viewingApp.resumeUrl ? "Google Drive / Cloud URL provided by applicant" : "No resume URL provided"}
                </p>
              </div>
            </div>

            {viewingApp.resumeUrl && (
              <div className="flex items-center gap-2">
                <a
                  href={viewingApp.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-white-always text-xs font-bold rounded-[4px] transition shadow"
                >
                  <ExternalLink size={13} />
                  <span>Open Resume / CV</span>
                </a>
              </div>
            )}
          </div>

          {viewingApp.resumeUrl ? (
            <div className="p-2.5 bg-white dark:bg-black/50 border border-slate-200 dark:border-gray-800 rounded-[4px] flex items-center justify-between text-xs text-slate-700 dark:text-gray-300 font-mono break-all gap-2">
              <span className="truncate">{viewingApp.resumeUrl}</span>
              <button
                type="button"
                onClick={() => {
                  if (navigator?.clipboard) {
                    navigator.clipboard.writeText(viewingApp.resumeUrl);
                    setCopiedResume(true);
                    setTimeout(() => setCopiedResume(false), 2000);
                  }
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white rounded-[4px] shrink-0 text-[11px] font-sans font-semibold transition cursor-pointer flex items-center gap-1 border border-slate-200 dark:border-transparent"
              >
                {copiedResume ? (
                  <>
                    <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <span>Copy Link</span>
                )}
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-gray-500 italic">No CV document link attached.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-transparent transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenEmailModal(viewingApp);
            }}
            className="px-5 py-2 bg-[#0167D6] hover:bg-blue-700 text-white text-white-always text-xs font-bold rounded-[4px] transition flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Mail size={13} />
            <span>Reply via Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}

