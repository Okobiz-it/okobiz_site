"use client";

import { useState, useMemo } from "react";
import { EmailTemplateItem } from "../types";
import { TemplateFormData } from "../components/EmailTemplatesTab";

export function useCareerTemplates(
  templates: EmailTemplateItem[],
  setTemplates: React.Dispatch<React.SetStateAction<EmailTemplateItem[]>>,
  searchQuery: string
) {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateItem | null>(null);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateForm, setTemplateForm] = useState<TemplateFormData>({
    name: "",
    subject: "",
    body: ""
  });

  const filteredTemplates = useMemo(() => {
    return templates.filter(tmpl => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        tmpl.name.toLowerCase().includes(q) ||
        tmpl.subject.toLowerCase().includes(q) ||
        tmpl.body.toLowerCase().includes(q)
      );
    });
  }, [templates, searchQuery]);

  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: "",
      subject: "Update regarding your application for {jobTitle} at okobiz",
      body: `<p>Dear {name},</p><p>Thank you for applying for the <strong>{jobTitle}</strong> position at okobiz.</p><p>We have carefully reviewed your profile...</p><p>Best regards,<br>Talent Acquisition Team<br>okobiz</p>`
    });
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (tmpl: EmailTemplateItem) => {
    setEditingTemplate(tmpl);
    setTemplateForm({
      name: tmpl.name,
      subject: tmpl.subject,
      body: tmpl.body
    });
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.body.trim()) {
      alert("All fields are required.");
      return;
    }
    setTemplateSaving(true);
    try {
      if (editingTemplate) {
        const res = await fetch("/api/jobs/templates", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: editingTemplate._id, ...templateForm })
        });
        const data = await res.json();
        if (data.success) {
          setTemplates(prev => prev.map(t => (t._id === editingTemplate._id ? data.data : t)));
          setIsTemplateModalOpen(false);
        } else {
          alert(data.message || "Failed to update template.");
        }
      } else {
        const res = await fetch("/api/jobs/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(templateForm)
        });
        const data = await res.json();
        if (data.success) {
          setTemplates(prev => [data.data, ...prev]);
          setIsTemplateModalOpen(false);
        } else {
          alert(data.message || "Failed to create template.");
        }
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"?`)) return;
    try {
      const res = await fetch(`/api/jobs/templates?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTemplates(prev => prev.filter(t => t._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return {
    filteredTemplates,
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    editingTemplate,
    templateForm,
    setTemplateForm,
    templateSaving,
    handleOpenCreateTemplate,
    handleOpenEditTemplate,
    handleSaveTemplate,
    handleDeleteTemplate
  };
}

