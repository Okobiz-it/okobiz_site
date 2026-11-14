"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  X,
  Loader2,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Users,
  ArrowRight
} from "lucide-react";
import { JobItem } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

interface JobOpeningsSectionProps {
  jobs: JobItem[];
  filteredJobs: JobItem[];
  departments: string[];
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
  error?: boolean;
  onRetry?: () => void;
}

const JobOpeningsSection = forwardRef<HTMLElement, JobOpeningsSectionProps>(
  (
    {
      jobs,
      filteredJobs,
      departments,
      selectedDepartment,
      setSelectedDepartment,
      searchQuery,
      setSearchQuery,
      loading,
      error = false,
      onRetry
    },
    ref
  ) => {
    return (
      <section id="open-positions" ref={ref} className="py-20 bg-[#F8FAFC] dark:bg-black border-t border-slate-200/60 dark:border-transparent">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 xl:px-20">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#3368B2]/15 border border-[#3368B2]/40 text-[#0167D6] dark:text-[#3368B2] text-xs font-bold uppercase tracking-widest mb-3">
                <Briefcase className="w-3.5 h-3.5" /> Current Opportunities
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Open Job Positions
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 max-w-md">
              Find your next career leap at okobiz. Choose a department below or search by keywords.
            </p>
          </div>

          {/* Filtering & Search Bar - Only shown when live jobs are loaded */}
          {!loading && !error && jobs.length > 0 && (
            <>
              <div className="bg-white dark:bg-[#121316] p-4 rounded-[4px] border border-slate-200 dark:border-gray-800 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
                {/* Department Pills - Only rendered when multiple departments exist */}
                {departments.length > 1 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {departments.map((dept) => {
                      const isSelected = selectedDepartment.toLowerCase() === dept.toLowerCase();
                      return (
                        <button
                          key={dept}
                          onClick={() => setSelectedDepartment(dept)}
                          className={`px-4 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#0167D6] text-white shadow-md shadow-blue-500/20"
                              : "bg-slate-100 dark:bg-black/60 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-800"
                          }`}
                        >
                          {dept}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Search Input */}
                <div className="relative min-w-[280px]">
                  <Search className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by role, skills or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Job Counter */}
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-gray-400 mb-6 px-1">
                <span>
                  Showing <strong className="text-slate-900 dark:text-white">{filteredJobs.length}</strong> available opening{filteredJobs.length === 1 ? "" : "s"}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Actively Interviewing
                </span>
              </div>
            </>
          )}

          {/* Jobs Listing */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-[#0167D6] animate-spin mb-3" />
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">Fetching live openings...</p>
            </div>
          ) : error ? (
            <DataLoadError
              title="Openings Couldn't Load"
              message="We were unable to retrieve current job openings from the server. Please check your connection or try again."
              onRetry={onRetry}
            />
          ) : filteredJobs.length === 0 ? (
            <div className="py-16 px-6 text-center bg-white dark:bg-[#131418] border border-slate-200 dark:border-gray-800 rounded-[4px] shadow-sm">
              <Briefcase className="w-12 h-12 text-slate-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">No Matching Positions Found</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                We couldn't find any current vacancies matching your filters. You can always submit a spontaneous application!
              </p>
              <button
                onClick={() => {
                  setSelectedDepartment("All");
                  setSearchQuery("");
                }}
                className="px-5 py-2.5 bg-[#0167D6] text-white text-xs font-bold rounded-[4px] hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job._id || job.slug}
                  className="bg-white dark:bg-[#131418] border border-slate-200 dark:border-gray-800 hover:border-[#0167D6] dark:hover:border-[#3368B2]/80 hover:shadow-lg dark:hover:shadow-[#3368B2]/5 rounded-[4px] p-6 transition-all duration-300 group shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Job Meta & Info */}
                    <div className="space-y-3.5 flex-1">
                      {/* Department & Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-[#3368B2]/20 text-[#0167D6] dark:text-[#3368B2] border border-blue-200 dark:border-[#3368B2]/40">
                          {job.department}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-[4px] text-[11px] font-semibold bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-transparent">
                          {job.employmentType}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-[4px] text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                          {job.workplaceType}
                        </span>
                      </div>

                      {/* Job Title */}
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-[#0167D6] transition-colors">
                        <Link href={`/career/${job.slug}`}>{job.title}</Link>
                      </h3>

                      {/* Overview Preview */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 line-clamp-2 max-w-4xl leading-relaxed">
                        {job.description ? job.description.replace(/<[^>]*>?/gm, "").trim() : "Join our engineering team to architect and ship world-class software products for global brands."}
                      </p>

                      {/* Job Attributes Bar */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-slate-600 dark:text-gray-400 border-t border-slate-200/80 dark:border-gray-800/80">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-gray-300 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#0167D6]" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-gray-300 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                          <span>{job.experience}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{job.salary}</span>
                        </div>
                        {job.vacancies && (
                          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
                            <Users className="w-3.5 h-3.5" />
                            <span>{job.vacancies} Position{job.vacancies > 1 ? "s" : ""}</span>
                          </div>
                        )}
                        {job.deadline && (
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Deadline: {job.deadline}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Action CTA Button */}
                    <div className="shrink-0 flex items-center lg:self-center">
                      <Link
                        href={`/career/${job.slug}`}
                        className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0167D6] hover:bg-blue-600 !text-white text-white text-white-always text-xs font-bold uppercase tracking-wider rounded-[4px] shadow-md shadow-blue-500/20 transition-all cursor-pointer group-hover:scale-102"
                      >
                        <span>Apply For Position</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }
);

JobOpeningsSection.displayName = "JobOpeningsSection";
export default JobOpeningsSection;

