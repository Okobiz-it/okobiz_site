"use client";

import React from "react";
import { Briefcase, X, Loader2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { createSlug } from "@/lib/slug";
import { JobOpening, DEPARTMENTS } from "../types";

export interface JobFormData {
  title: string;
  slug: string;
  department: string;
  employmentType: string;
  workplaceType: string;
  location: string;
  experience: string;
  salary: string;
  vacancies: number;
  deadline: string;
  description: string;
  status: "active" | "closed";
  order: number;
}

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingJob: JobOpening | null;
  jobForm: JobFormData;
  setJobForm: React.Dispatch<React.SetStateAction<JobFormData>>;
  isCustomDept: boolean;
  setIsCustomDept: (v: boolean) => void;
  customDeptInput: string;
  setCustomDeptInput: (v: string) => void;
  onSaveJob: (e: React.FormEvent) => void;
  jobSaving: boolean;
}

export default function JobFormModal({
  isOpen,
  onClose,
  editingJob,
  jobForm,
  setJobForm,
  isCustomDept,
  setIsCustomDept,
  customDeptInput,
  setCustomDeptInput,
  onSaveJob,
  jobSaving
}: JobFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#141518] border border-gray-800 rounded-[4px] max-w-4xl lg:max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="text-[#3368B2]" size={18} />
            <h2 className="text-base font-bold text-white">
              {editingJob ? `Edit Job: ${editingJob.title}` : "Post New Job Opening"}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSaveJob} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1 sm:col-span-2 lg:col-span-4">
              <label className="text-xs font-semibold text-gray-300">Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full-Stack Engineer (Next.js & Node.js)"
                value={jobForm.title}
                onChange={e => {
                  const newTitle = e.target.value;
                  setJobForm(f => ({
                    ...f,
                    title: newTitle,
                    slug: createSlug(newTitle)
                  }));
                }}
                className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2 lg:col-span-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#3368B2] font-mono">/career/{jobForm.slug || "..."}</span>
              </div>
              <input
                type="text"
                placeholder="e.g. senior-full-stack-engineer"
                value={jobForm.slug}
                onChange={e => setJobForm({ ...jobForm, slug: createSlug(e.target.value) })}
                className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#3368B2]"
              />
            </div>

            <div className="space-y-1 sm:col-span-1 lg:col-span-2">
              <label className="text-xs font-semibold text-gray-300">Department *</label>
              <select
                value={isCustomDept ? "Custom" : jobForm.department}
                onChange={e => {
                  const val = e.target.value;
                  if (val === "Custom") {
                    setIsCustomDept(true);
                    setJobForm({ ...jobForm, department: customDeptInput || "" });
                  } else {
                    setIsCustomDept(false);
                    setJobForm({ ...jobForm, department: val });
                  }
                }}
                className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white focus:outline-none focus:border-[#3368B2]"
              >
                {DEPARTMENTS.filter(d => d !== "All").map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                {/* Preserve existing custom department value if editing */}
                {jobForm.department &&
                  !DEPARTMENTS.includes(jobForm.department) &&
                  !isCustomDept && (
                    <option value={jobForm.department}>{jobForm.department}</option>
                  )}
                <option value="Custom">+ Custom Department</option>
              </select>

              {isCustomDept && (
                <div className="pt-1.5 space-y-1">
                  <input
                    type="text"
                    required
                    placeholder="Enter custom department name..."
                    value={customDeptInput}
                    onChange={e => {
                      const val = e.target.value;
                      setCustomDeptInput(val);
                      setJobForm({ ...jobForm, department: val });
                    }}
                    className="w-full px-3 py-2 bg-[#141518] border border-[#3368B2] rounded-[4px] text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#3368B2]"
                    autoFocus
                  />
                  <span className="text-[10px] text-gray-400 block">
                    Specify custom department (e.g. AI & Robotics, Customer Success, Legal)
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1 sm:col-span-1 lg:col-span-2">
              <label className="text-xs font-semibold text-gray-300">Employment Type *</label>
              <select
                value={jobForm.employmentType}
                onChange={e => setJobForm({ ...jobForm, employmentType: e.target.value })}
                className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white focus:outline-none focus:border-[#3368B2]"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-1 lg:col-span-2">
              <label className="text-xs font-semibold text-gray-300">Workplace Type</label>
              <select
                value={jobForm.workplaceType}
                onChange={e => setJobForm({ ...jobForm, workplaceType: e.target.value })}
                className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white focus:outline-none focus:border-[#3368B2]"
              >
                <option value="On-site">On-site (Office)</option>
                <option value="Hybrid">Hybrid (Flexible)</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-1 lg:col-span-2">
              <label className="text-xs font-semibold text-gray-300">Office Location</label>
              <input
                type="text"
                value={jobForm.location}
                onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
              />
            </div>

            <div className="space-y-1 sm:col-span-1 lg:col-span-2">
              <label className="text-xs font-semibold text-gray-300">Experience Level</label>
              <input
                type="text"
                placeholder="e.g. 2-4 Years or Fresh Graduate"
                value={jobForm.experience}
                onChange={e => setJobForm({ ...jobForm, experience: e.target.value })}
                className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
              />
            </div>

            <div className="space-y-1 sm:col-span-1 lg:col-span-2">
              <label className="text-xs font-semibold text-gray-300">Salary / Compensation</label>
              <input
                type="text"
                placeholder="e.g. ৳80,000 - ৳120,000 / month or Negotiable"
                value={jobForm.salary}
                onChange={e => setJobForm({ ...jobForm, salary: e.target.value })}
                className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
              />
            </div>

            <div className="space-y-1 sm:col-span-1 lg:col-span-2">
              <label className="text-xs font-semibold text-gray-300">Vacancies</label>
              <input
                type="number"
                min="1"
                value={jobForm.vacancies}
                onChange={e => setJobForm({ ...jobForm, vacancies: Number(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white focus:outline-none focus:border-[#3368B2]"
              />
            </div>

            <div className="space-y-1 sm:col-span-1 lg:col-span-2">
              <label className="text-xs font-semibold text-gray-300">Application Deadline</label>
              <input
                type="date"
                value={jobForm.deadline}
                onChange={e => setJobForm({ ...jobForm, deadline: e.target.value })}
                className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white focus:outline-none focus:border-[#3368B2]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-300">
                Job Description &amp; Specifications (Rich Text Editor) *
              </label>
              <span className="text-[11px] text-[#3368B2] font-semibold">
                Overview, Responsibilities, Requirements &amp; Perks
              </span>
            </div>
            <RichTextEditor
              value={jobForm.description}
              onChange={val => setJobForm(f => ({ ...f, description: val }))}
              placeholder="Enter the complete job details using headings, lists, bold text, colored text, highlights, and formatting..."
              minHeight="min-h-[300px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Status</label>
              <select
                value={jobForm.status}
                onChange={e => setJobForm({ ...jobForm, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white"
              >
                <option value="active">Active (Accepting Applications)</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Display Order</label>
              <input
                type="number"
                value={jobForm.order}
                onChange={e => setJobForm({ ...jobForm, order: Number(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-semibold rounded-[4px] hover:bg-gray-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={jobSaving}
              className="px-5 py-2 bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold rounded-[4px] flex items-center gap-2 cursor-pointer shadow-md"
            >
              {jobSaving && <Loader2 size={13} className="animate-spin" />}
              <span>{editingJob ? "Update Job" : "Publish Job"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

