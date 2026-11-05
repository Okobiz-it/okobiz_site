"use client";

import { useState, useMemo } from "react";
import { JobApplication, EmailTemplateItem } from "../types";

export function useCareerApplications(
  applications: JobApplication[],
  setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>,
  templates: EmailTemplateItem[],
  searchQuery: string
) {
  const [viewingApp, setViewingApp] = useState<JobApplication | null>(null);
  const [appJobFilter, setAppJobFilter] = useState("all");
  const [appStatusFilter, setAppStatusFilter] = useState("all");

  // Email Reply Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [emailTemplateId, setEmailTemplateId] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesJob = appJobFilter === "all" || app.jobId === appJobFilter;
      const matchesStatus = appStatusFilter === "all" || app.status === appStatusFilter;
      const matchesSearch =
        !searchQuery ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.phone && app.phone.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesJob && matchesStatus && matchesSearch;
    });
  }, [applications, appJobFilter, appStatusFilter, searchQuery]);

  const handleUpdateAppStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status })
      });
      if (res.ok) {
        setApplications(prev => prev.map(a => (a._id === id ? { ...a, status: status as any } : a)));
        if (viewingApp && viewingApp._id === id) {
          setViewingApp(prev => (prev ? { ...prev, status: status as any } : null));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteApp = async (id: string, name: string) => {
    if (!confirm(`Delete application for ${name}?`)) return;
    try {
      const res = await fetch(`/api/applications?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setApplications(prev => prev.filter(a => a._id !== id));
        if (viewingApp && viewingApp._id === id) setViewingApp(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEmailModal = (app: JobApplication) => {
    setSelectedApp(app);
    setEmailFeedback(null);
    if (templates.length > 0) {
      const def = templates.find(t => t.isDefault) || templates[0];
      setEmailTemplateId(def._id);
      setEmailSubject(def.subject.replace(/{name}/g, app.name).replace(/{jobTitle}/g, app.jobTitle));
      setEmailBody(def.body.replace(/{name}/g, app.name).replace(/{jobTitle}/g, app.jobTitle));
    } else {
      setEmailTemplateId("");
      setEmailSubject(`Application Update: ${app.jobTitle} at okobiz`);
      setEmailBody(
        `<p>Dear ${app.name},</p><p>Thank you for applying for the <strong>${app.jobTitle}</strong> position at okobiz. We were very impressed by your qualifications...</p><p>Warm regards,<br>Talent Acquisition Team, okobiz</p>`
      );
    }
    setIsEmailModalOpen(true);
  };

  const handleTemplateChange = (templateId: string) => {
    setEmailTemplateId(templateId);
    const tmpl = templates.find(t => t._id === templateId);
    if (tmpl && selectedApp) {
      setEmailSubject(tmpl.subject.replace(/{name}/g, selectedApp.name).replace(/{jobTitle}/g, selectedApp.jobTitle));
      setEmailBody(tmpl.body.replace(/{name}/g, selectedApp.name).replace(/{jobTitle}/g, selectedApp.jobTitle));
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSendingEmail(true);
    setEmailFeedback(null);

    try {
      const res = await fetch("/api/jobs/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp._id,
          toEmail: selectedApp.email,
          toName: selectedApp.name,
          jobTitle: selectedApp.jobTitle,
          subject: emailSubject,
          message: emailBody,
          templateId: emailTemplateId || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setEmailFeedback({
          success: true,
          message: data.simulated
            ? "Email logged & simulated successfully! (Live SMTP credentials not detected in environment, so email was safely stored in database history)."
            : "Email successfully delivered to candidate via SMTP server!"
        });
        if (data.application) {
          setApplications(prev => prev.map(a => (a._id === data.application._id ? data.application : a)));
          if (viewingApp && viewingApp._id === data.application._id) {
            setViewingApp(data.application);
          }
        }
      } else {
        setEmailFeedback({ success: false, message: data.message || "Failed to send email." });
      }
    } catch (err: any) {
      setEmailFeedback({ success: false, message: err.message || "Network error while sending email." });
    } finally {
      setSendingEmail(false);
    }
  };

  return {
    viewingApp,
    setViewingApp,
    appJobFilter,
    setAppJobFilter,
    appStatusFilter,
    setAppStatusFilter,
    filteredApps,
    handleUpdateAppStatus,
    handleDeleteApp,
    isEmailModalOpen,
    setIsEmailModalOpen,
    selectedApp,
    emailTemplateId,
    emailSubject,
    setEmailSubject,
    emailBody,
    setEmailBody,
    sendingEmail,
    emailFeedback,
    handleOpenEmailModal,
    handleTemplateChange,
    handleSendEmail
  };
}

