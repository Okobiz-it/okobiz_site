"use client";

import React from "react";
import { Briefcase, Users, Layers, Mail } from "lucide-react";
import { JobOpening, JobApplication, EmailTemplateItem } from "../types";

interface CareerStatsHeaderProps {
  jobs: JobOpening[];
  applications: JobApplication[];
  templates: EmailTemplateItem[];
}

export default function CareerStatsHeader({
  jobs,
  applications,
  templates
}: CareerStatsHeaderProps) {
  const activeRolesCount = jobs.filter(j => j.status === "active").length;
  const emailRepliesCount = applications.reduce((acc, a) => acc + (a.emailsSent?.length || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-gray-800/80 rounded-[4px] p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-600 dark:text-gray-400 text-xs font-semibold mb-2">
          <span>Active Roles</span>
          <Briefcase size={16} className="text-[#0167D6]" />
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white">{activeRolesCount}</div>
        <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Out of {jobs.length} total postings</p>
      </div>

      <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-gray-800/80 rounded-[4px] p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-600 dark:text-gray-400 text-xs font-semibold mb-2">
          <span>Total Applicants</span>
          <Users size={16} className="text-emerald-500 dark:text-emerald-400" />
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white">{applications.length}</div>
        <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Candidates across all roles</p>
      </div>

      <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-gray-800/80 rounded-[4px] p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-600 dark:text-gray-400 text-xs font-semibold mb-2">
          <span>Email Templates</span>
          <Layers size={16} className="text-purple-500 dark:text-purple-400" />
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white">{templates.length}</div>
        <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Rich-text response templates</p>
      </div>

      <div className="bg-white dark:bg-[#141518] border border-slate-200 dark:border-gray-800/80 rounded-[4px] p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-600 dark:text-gray-400 text-xs font-semibold mb-2">
          <span>Email Replies</span>
          <Mail size={16} className="text-amber-500 dark:text-amber-400" />
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white">{emailRepliesCount}</div>
        <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Sent / simulated notifications</p>
      </div>
    </div>
  );
}

