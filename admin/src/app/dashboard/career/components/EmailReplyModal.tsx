"use client";

import React from "react";
import {
  Mail,
  X,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { JobApplication, EmailTemplateItem } from "../types";

interface EmailReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp: JobApplication | null;
  templates: EmailTemplateItem[];
  emailTemplateId: string;
  onTemplateChange: (templateId: string) => void;
  onManageTemplates: () => void;
  emailSubject: string;
  setEmailSubject: (s: string) => void;
  emailBody: string;
  setEmailBody: (b: string) => void;
  emailFeedback: { success: boolean; message: string } | null;
  sendingEmail: boolean;
  onSendEmail: (e: React.FormEvent) => void;
}

export default function EmailReplyModal({
  isOpen,
  onClose,
  selectedApp,
  templates,
  emailTemplateId,
  onTemplateChange,
  onManageTemplates,
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody,
  emailFeedback,
  sendingEmail,
  onSendEmail
}: EmailReplyModalProps) {
  if (!isOpen || !selectedApp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#141518] border border-gray-800 rounded-[4px] max-w-4xl lg:max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <Mail className="text-[#3368B2]" size={18} />
            <h2 className="text-base font-bold text-white">
              Send Email to Candidate
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Candidate Summary Header */}
        <div className="bg-[#181A1D] border border-gray-800/80 rounded-[4px] p-3 text-xs flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-gray-400">To Candidate: </span>
            <strong className="text-white">{selectedApp.name}</strong> ({selectedApp.email})
          </div>
          <div>
            <span className="text-gray-400">Applied Role: </span>
            <strong className="text-blue-400">{selectedApp.jobTitle}</strong>
          </div>
        </div>

        {/* Dynamic Templates Selector */}
        {templates.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
              <span>Select Template:</span>
              <button
                type="button"
                onClick={onManageTemplates}
                className="text-[11px] text-[#3368B2] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Manage / Edit Templates</span>
                <ExternalLink size={10} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {templates.map(tmpl => (
                <button
                  key={tmpl._id}
                  type="button"
                  onClick={() => onTemplateChange(tmpl._id)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-[4px] text-center truncate transition cursor-pointer ${
                    emailTemplateId === tmpl._id
                      ? "bg-[#3368B2] text-white shadow"
                      : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                  title={tmpl.name}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={onSendEmail} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Email Subject *</label>
            <input
              type="text"
              required
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white focus:outline-none focus:border-[#3368B2]"
            />
          </div>

          {/* Rich Text Editor for Candidate Email Body */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Message Body (Rich Text Editor) *</label>
            <RichTextEditor
              value={emailBody}
              onChange={setEmailBody}
              placeholder="Compose your reply to the candidate..."
              minHeight="220px"
            />
          </div>

          {/* SMTP Guidance Callout */}
          <div className="p-3 bg-blue-950/30 border border-blue-900/40 rounded-[4px] text-xs text-blue-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-300">
              <AlertCircle size={14} />
              <span>SMTP Configuration &amp; Auto-Simulation</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              You can configure live SMTP anytime by adding <code>SMTP_HOST</code>, <code>SMTP_PORT</code>, <code>SMTP_USER</code>, and <code>SMTP_PASS</code> into your environment. When not configured, emails will be safely simulated, logged, and tracked in the candidate's history.
            </p>
          </div>

          {emailFeedback && (
            <div
              className={`p-3 rounded-[4px] text-xs flex items-start gap-2 ${
                emailFeedback.success
                  ? "bg-emerald-950/40 border border-emerald-800/40 text-emerald-300"
                  : "bg-red-950/40 border border-red-800/40 text-red-300"
              }`}
            >
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{emailFeedback.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-semibold rounded-[4px] hover:bg-gray-700 cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={sendingEmail}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-[4px] flex items-center gap-2 shadow-lg shadow-emerald-950/60 cursor-pointer"
            >
              {sendingEmail ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
              <span>Send Email Response</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

