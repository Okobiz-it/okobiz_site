"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Search,
  Briefcase,
  Users,
  Layers,
  ExternalLink
} from "lucide-react";
import { JobOpening, JobApplication, EmailTemplateItem } from "./types";
import CareerStatsHeader from "./components/CareerStatsHeader";
import JobOpeningsTab from "./components/JobOpeningsTab";
import JobFormModal from "./components/JobFormModal";
import CandidateApplicationsTab from "./components/CandidateApplicationsTab";
import ApplicationDetailsModal from "./components/ApplicationDetailsModal";
import EmailReplyModal from "./components/EmailReplyModal";
import EmailTemplatesTab from "./components/EmailTemplatesTab";
import { useCareerJobs } from "./hooks/useCareerJobs";
import { useCareerTemplates } from "./hooks/useCareerTemplates";
import { useCareerApplications } from "./hooks/useCareerApplications";

export default function CareerDashboardPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "applications" | "templates">("jobs");
  const [searchQuery, setSearchQuery] = useState("");

  // Main Data States
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Modular Custom Hooks for Workflows
  const jobsHook = useCareerJobs(jobs, setJobs, searchQuery);
  const templatesHook = useCareerTemplates(templates, setTemplates, searchQuery);
  const appsHook = useCareerApplications(applications, setApplications, templates, searchQuery);

  // Fetch Jobs & Applications
  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.allSettled([
        fetch("/api/jobs"),
        fetch("/api/applications")
      ]);

      if (jobsRes.status === "fulfilled" && jobsRes.value.ok) {
        try {
          const jobsData = await jobsRes.value.json();
          if (jobsData.success && Array.isArray(jobsData.data)) {
            setJobs(jobsData.data);
          }
        } catch (e) {
          console.error("Failed to parse jobs data:", e);
        }
      }

      if (appsRes.status === "fulfilled" && appsRes.value.ok) {
        try {
          const appsData = await appsRes.value.json();
          if (appsData.success && Array.isArray(appsData.data)) {
            setApplications(appsData.data);
          }
        } catch (e) {
          console.error("Failed to parse applications data:", e);
        }
      }
    } catch (err) {
      console.error("Failed to load career data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Email Templates
  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const res = await fetch("/api/jobs/templates");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setTemplates(data.data);
        }
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTemplates();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-gray-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[4px] bg-blue-100 dark:bg-[#3368B2]/20 text-[#0167D6] dark:text-[#3368B2] flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Career &amp; Talent Hub
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
            Manage job postings, review applicant resumes, edit rich-text email templates, and reply via SMTP.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/career"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition px-3 py-2 rounded-[4px] bg-white dark:bg-[#141518] border border-slate-200 dark:border-gray-800 shadow-sm"
          >
            <span>Live Site</span>
            <ExternalLink size={12} />
          </Link>

          {activeTab === "templates" ? (
            <button
              onClick={templatesHook.handleOpenCreateTemplate}
              className="flex items-center gap-2 bg-[#0167D6] hover:bg-blue-700 text-white text-white-always text-xs font-bold px-4 py-2.5 rounded-[4px] shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>New Email Template</span>
            </button>
          ) : (
            <button
              onClick={jobsHook.handleOpenCreateJob}
              className="flex items-center gap-2 bg-[#0167D6] hover:bg-blue-700 text-white text-white-always text-xs font-bold px-4 py-2.5 rounded-[4px] shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>Post New Job Opening</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Metrics Cards */}
      <CareerStatsHeader
        jobs={jobs}
        applications={applications}
        templates={templates}
      />

      {/* Main Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("jobs");
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === "jobs"
                ? "bg-[#0167D6] text-white text-white-always shadow-md shadow-blue-500/20"
                : "bg-slate-100 dark:bg-gray-800/60 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 border border-slate-200 dark:border-transparent"
            }`}
          >
            <Briefcase size={14} />
            <span>Job Openings ({jobs.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("applications");
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === "applications"
                ? "bg-[#0167D6] text-white text-white-always shadow-md shadow-blue-500/20"
                : "bg-slate-100 dark:bg-gray-800/60 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 border border-slate-200 dark:border-transparent"
            }`}
          >
            <Users size={14} />
            <span>Candidate Applications ({applications.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("templates");
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === "templates"
                ? "bg-[#0167D6] text-white text-white-always shadow-md shadow-blue-500/20"
                : "bg-slate-100 dark:bg-gray-800/60 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 border border-slate-200 dark:border-transparent"
            }`}
          >
            <Layers size={14} />
            <span>Email Templates ({templates.length})</span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={
              activeTab === "jobs"
                ? "Search roles..."
                : activeTab === "applications"
                ? "Search candidates..."
                : "Search templates..."
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#141518] border border-slate-300 dark:border-gray-800 rounded-[4px] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0167D6]"
          />
        </div>
      </div>

      {/* TAB 1: JOB OPENINGS */}
      {activeTab === "jobs" && (
        <JobOpeningsTab
          jobs={jobs}
          filteredJobs={jobsHook.filteredJobs}
          paginatedJobs={jobsHook.paginatedJobs}
          loading={loading}
          allAvailableDepartments={jobsHook.allAvailableDepartments}
          selectedDept={jobsHook.selectedDept}
          setSelectedDept={jobsHook.setSelectedDept}
          currentJobPage={jobsHook.currentJobPage}
          setCurrentJobPage={jobsHook.setCurrentJobPage}
          totalJobPages={jobsHook.totalJobPages}
          jobStartIndex={jobsHook.jobStartIndex}
          jobEndIndex={jobsHook.jobEndIndex}
          totalFilteredJobsCount={jobsHook.totalFilteredJobsCount}
          onOpenCreateJob={jobsHook.handleOpenCreateJob}
          onOpenEditJob={jobsHook.handleOpenEditJob}
          onToggleJobStatus={jobsHook.handleToggleJobStatus}
          onDeleteJob={jobsHook.handleDeleteJob}
          onViewApplicants={jobId => {
            appsHook.setAppJobFilter(jobId);
            setActiveTab("applications");
          }}
        />
      )}

      {/* TAB 2: CANDIDATE APPLICATIONS */}
      {activeTab === "applications" && (
        <CandidateApplicationsTab
          jobs={jobs}
          filteredApps={appsHook.filteredApps}
          appJobFilter={appsHook.appJobFilter}
          setAppJobFilter={appsHook.setAppJobFilter}
          appStatusFilter={appsHook.appStatusFilter}
          setAppStatusFilter={appsHook.setAppStatusFilter}
          searchQuery={searchQuery}
          onSelectViewingApp={app => appsHook.setViewingApp(app)}
          onUpdateAppStatus={appsHook.handleUpdateAppStatus}
          onOpenEmailModal={appsHook.handleOpenEmailModal}
          onDeleteApp={appsHook.handleDeleteApp}
          onClearFilters={() => {
            appsHook.setAppJobFilter("all");
            appsHook.setAppStatusFilter("all");
            setSearchQuery("");
          }}
        />
      )}

      {/* TAB 3: EMAIL TEMPLATES MANAGEMENT */}
      {activeTab === "templates" && (
        <EmailTemplatesTab
          templates={templates}
          filteredTemplates={templatesHook.filteredTemplates}
          loadingTemplates={loadingTemplates}
          searchQuery={searchQuery}
          onOpenCreateTemplate={templatesHook.handleOpenCreateTemplate}
          onOpenEditTemplate={templatesHook.handleOpenEditTemplate}
          onDeleteTemplate={templatesHook.handleDeleteTemplate}
          isTemplateModalOpen={templatesHook.isTemplateModalOpen}
          setIsTemplateModalOpen={templatesHook.setIsTemplateModalOpen}
          editingTemplate={templatesHook.editingTemplate}
          templateForm={templatesHook.templateForm}
          setTemplateForm={templatesHook.setTemplateForm}
          templateSaving={templatesHook.templateSaving}
          onSaveTemplate={templatesHook.handleSaveTemplate}
        />
      )}

      {/* MODAL 1: POST / EDIT JOB OPENING */}
      <JobFormModal
        isOpen={jobsHook.isJobModalOpen}
        onClose={() => jobsHook.setIsJobModalOpen(false)}
        editingJob={jobsHook.editingJob}
        jobForm={jobsHook.jobForm}
        setJobForm={jobsHook.setJobForm}
        isCustomDept={jobsHook.isCustomDept}
        setIsCustomDept={jobsHook.setIsCustomDept}
        customDeptInput={jobsHook.customDeptInput}
        setCustomDeptInput={jobsHook.setCustomDeptInput}
        onSaveJob={jobsHook.handleSaveJob}
        jobSaving={jobsHook.jobSaving}
      />

      {/* MODAL 2: REPLY VIA EMAIL WITH RICH TEXT & DYNAMIC TEMPLATES */}
      <EmailReplyModal
        isOpen={appsHook.isEmailModalOpen}
        onClose={() => appsHook.setIsEmailModalOpen(false)}
        selectedApp={appsHook.selectedApp}
        templates={templates}
        emailTemplateId={appsHook.emailTemplateId}
        onTemplateChange={appsHook.handleTemplateChange}
        onManageTemplates={() => {
          appsHook.setIsEmailModalOpen(false);
          setActiveTab("templates");
        }}
        emailSubject={appsHook.emailSubject}
        setEmailSubject={appsHook.setEmailSubject}
        emailBody={appsHook.emailBody}
        setEmailBody={appsHook.setEmailBody}
        emailFeedback={appsHook.emailFeedback}
        sendingEmail={appsHook.sendingEmail}
        onSendEmail={appsHook.handleSendEmail}
      />

      {/* MODAL 4: CANDIDATE APPLICATION DETAILS & RESUME/CV */}
      <ApplicationDetailsModal
        viewingApp={appsHook.viewingApp}
        onClose={() => appsHook.setViewingApp(null)}
        onUpdateStatus={appsHook.handleUpdateAppStatus}
        onOpenEmailModal={appsHook.handleOpenEmailModal}
      />
    </div>
  );
}
