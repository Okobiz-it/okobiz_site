"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Loader2,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { EmailTemplateItem } from "../types";

export interface TemplateFormData {
  name: string;
  subject: string;
  body: string;
}

interface EmailTemplatesTabProps {
  templates: EmailTemplateItem[];
  filteredTemplates: EmailTemplateItem[];
  loadingTemplates: boolean;
  searchQuery: string;
  onOpenCreateTemplate: () => void;
  onOpenEditTemplate: (tmpl: EmailTemplateItem) => void;
  onDeleteTemplate: (id: string, name: string) => void;
  // Modal props
  isTemplateModalOpen: boolean;
  setIsTemplateModalOpen: (open: boolean) => void;
  editingTemplate: EmailTemplateItem | null;
  templateForm: TemplateFormData;
  setTemplateForm: React.Dispatch<React.SetStateAction<TemplateFormData>>;
  templateSaving: boolean;
  onSaveTemplate: (e: React.FormEvent) => void;
}

export default function EmailTemplatesTab({
  templates,
  filteredTemplates,
  loadingTemplates,
  searchQuery,
  onOpenCreateTemplate,
  onOpenEditTemplate,
  onDeleteTemplate,
  isTemplateModalOpen,
  setIsTemplateModalOpen,
  editingTemplate,
  templateForm,
  setTemplateForm,
  templateSaving,
  onSaveTemplate
}: EmailTemplatesTabProps) {
  // Pagination State (10 per page)
  const TEMPLATES_PER_PAGE = 10;
  const [templatePage, setTemplatePage] = useState(1);

  const totalTemplatePages = Math.max(1, Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE));
  const currentTemplatePage = Math.min(templatePage, totalTemplatePages);
  const templateStartIndex = (currentTemplatePage - 1) * TEMPLATES_PER_PAGE;
  const templateEndIndex = Math.min(templateStartIndex + TEMPLATES_PER_PAGE, filteredTemplates.length);
  const paginatedTemplates = filteredTemplates.slice(templateStartIndex, templateEndIndex);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141518] p-4 rounded-[4px] border border-gray-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers size={16} className="text-[#3368B2]" />
            Job Email Templates (Rich Text Editor)
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Edit, create, and manage the email responses sent to candidates. You can use placeholder tokens:{" "}
            <code className="text-[#3368B2] font-semibold">&#123;name&#125;</code> for candidate's name and{" "}
            <code className="text-[#3368B2] font-semibold">&#123;jobTitle&#125;</code> for the applied job title.
          </p>
        </div>
        <button
          onClick={onOpenCreateTemplate}
          className="px-3.5 py-2 bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold rounded-[4px] flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus size={14} />
          <span>Create Template</span>
        </button>
      </div>

      {loadingTemplates ? (
        <div className="p-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-[#3368B2]" size={16} />
          <span>Loading email templates...</span>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-[#141518] border border-gray-800/80 rounded-[4px] p-12 text-center">
          <Layers className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No Email Templates Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            You can create reusable email templates formatted with the rich-text editor.
          </p>
          <button
            onClick={onOpenCreateTemplate}
            className="px-4 py-2 bg-[#3368B2] text-white text-xs font-semibold rounded-[4px] hover:bg-blue-600 cursor-pointer"
          >
            Create First Template
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pagination Status & Range Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 bg-[#141518] px-4 py-2.5 rounded-[4px] border border-gray-800 gap-2">
            <div>
              Showing <span className="font-bold text-white">{filteredTemplates.length > 0 ? templateStartIndex + 1 : 0}</span> to{" "}
              <span className="font-bold text-white">{templateEndIndex}</span> of{" "}
              <span className="font-bold text-white">{filteredTemplates.length}</span> templates
              {searchQuery && <span className="text-gray-500"> (filtered from {templates.length} total)</span>}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span>Page <strong className="text-white">{currentTemplatePage}</strong> of <strong className="text-white">{totalTemplatePages}</strong></span>
              <span>•</span>
              <span>10 per page</span>
            </div>
          </div>

          {/* 10 Paginated Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedTemplates.map(tmpl => (
              <div
                key={tmpl._id}
                className="bg-[#141518] border border-gray-800/80 hover:border-gray-700 rounded-[4px] p-5 flex flex-col justify-between transition space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      {tmpl.name}
                    </span>
                    {tmpl.isDefault && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-blue-500/10 text-[#3368B2] border border-blue-500/30">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="text-xs">
                    <span className="text-gray-500 font-semibold">Subject: </span>
                    <span className="text-gray-200 font-medium">{tmpl.subject}</span>
                  </div>

                  {/* Preview of Rich Text Body */}
                  <div className="p-3 bg-black/40 rounded-[4px] border border-gray-800/80 text-xs text-gray-300 max-h-36 overflow-y-auto leading-relaxed space-y-1">
                    <div
                      dangerouslySetInnerHTML={{ __html: tmpl.body }}
                      className="prose prose-invert prose-xs max-w-none text-xs text-gray-300"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <span className="text-[10px] text-gray-500">
                    Tokens: &#123;name&#125;, &#123;jobTitle&#125;
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenEditTemplate(tmpl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-[4px] transition cursor-pointer"
                    >
                      <Edit2 size={12} />
                      <span>Edit Template</span>
                    </button>
                    <button
                      onClick={() => onDeleteTemplate(tmpl._id, tmpl.name)}
                      className="p-1.5 rounded-[4px] bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                      title="Delete Template"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls Bar */}
          {totalTemplatePages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-800 bg-[#141518] px-4 py-3 rounded-[4px]">
              <div className="text-xs text-gray-400">
                Showing <span className="font-semibold text-white">{templateStartIndex + 1}</span>-
                <span className="font-semibold text-white">{templateEndIndex}</span> of{" "}
                <span className="font-semibold text-white">{filteredTemplates.length}</span> templates
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTemplatePage(1)}
                  disabled={currentTemplatePage === 1}
                  className="p-1.5 rounded-[4px] bg-[#181A1D] border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="First Page"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  onClick={() => setTemplatePage(prev => Math.max(1, prev - 1))}
                  disabled={currentTemplatePage === 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-[#181A1D] border border-gray-800 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalTemplatePages }, (_, i) => i + 1)
                    .filter(pageNum => {
                      if (totalTemplatePages <= 7) return true;
                      if (pageNum === 1 || pageNum === totalTemplatePages) return true;
                      return Math.abs(pageNum - currentTemplatePage) <= 1;
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
                          <span key={`tmpl-ellipsis-${idx}`} className="px-1.5 py-1 text-xs text-gray-600 font-bold select-none">
                            ...
                          </span>
                        );
                      }
                      const isCurrent = pageItem === currentTemplatePage;
                      return (
                        <button
                          key={pageItem}
                          onClick={() => setTemplatePage(pageItem)}
                          className={`w-7 h-7 flex items-center justify-center rounded-[4px] text-xs font-bold transition ${
                            isCurrent
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
                  onClick={() => setTemplatePage(prev => Math.min(totalTemplatePages, prev + 1))}
                  disabled={currentTemplatePage === totalTemplatePages}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-[#181A1D] border border-gray-800 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Next Page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => setTemplatePage(totalTemplatePages)}
                  disabled={currentTemplatePage === totalTemplatePages}
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

      {/* CREATE / EDIT TEMPLATE MODAL */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#141518] border border-gray-800 rounded-[4px] max-w-4xl lg:max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="text-[#3368B2]" size={18} />
                <h2 className="text-base font-bold text-white">
                  {editingTemplate ? `Edit Template: ${editingTemplate.name}` : "Create New Email Template"}
                </h2>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSaveTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Interview Invitation"
                  value={templateForm.name}
                  onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-300">Email Subject *</label>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <span>Insert placeholder:</span>
                    <button
                      type="button"
                      onClick={() => setTemplateForm(f => ({ ...f, subject: f.subject + " {name}" }))}
                      className="px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-800/40 hover:bg-blue-800/40 font-mono text-[10px] cursor-pointer"
                    >
                      &#123;name&#125;
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateForm(f => ({ ...f, subject: f.subject + " {jobTitle}" }))}
                      className="px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-800/40 hover:bg-purple-800/40 font-mono text-[10px] cursor-pointer"
                    >
                      &#123;jobTitle&#125;
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Interview Invitation: {jobTitle} at okobiz"
                  value={templateForm.subject}
                  onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-[#181A1D] border border-gray-800 rounded-[4px] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3368B2]"
                />
              </div>

              {/* Rich Text Editor for Template Body */}
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-300">Template Message Body *</label>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <span>Available tokens:</span>
                    <button
                      type="button"
                      onClick={() => setTemplateForm(f => ({ ...f, body: f.body + " {name}" }))}
                      className="px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-800/40 hover:bg-blue-800/40 font-mono text-[10px] cursor-pointer"
                    >
                      &#123;name&#125;
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateForm(f => ({ ...f, body: f.body + " {jobTitle}" }))}
                      className="px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-800/40 hover:bg-purple-800/40 font-mono text-[10px] cursor-pointer"
                    >
                      &#123;jobTitle&#125;
                    </button>
                  </div>
                </div>
                <RichTextEditor
                  value={templateForm.body}
                  onChange={val => setTemplateForm({ ...templateForm, body: val })}
                  placeholder="Write the template message..."
                  minHeight="250px"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-semibold rounded-[4px] hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={templateSaving}
                  className="px-5 py-2 bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold rounded-[4px] flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {templateSaving && <Loader2 size={13} className="animate-spin" />}
                  <span>{editingTemplate ? "Update Template" : "Save Template"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

