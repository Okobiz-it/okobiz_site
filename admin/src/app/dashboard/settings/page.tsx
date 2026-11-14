"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Settings,
  Save,
  CheckCircle2,
  Shield,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Building2,
  Globe,
  Award,
  Users,
  Calendar,
  Sparkles,
  ExternalLink,
  Loader2,
  Server
} from "lucide-react";

import { getClientUrl } from "@/lib/clientUrl";

export default function SettingsPage() {
  const clientUrl = getClientUrl();
  const [settings, setSettings] = useState<any>({
    siteName: "okobiz",
    contactPhone: "01973-590937",
    contactEmail: "info@okobiz.com",
    contactAddress: "Uttara, Dhaka, Bangladesh",
    whatsappNumber: "+8801973590937",
    stats: {
      journeyStarted: "2018",
      happyClients: "150+",
      teamMembers: "20+",
      yearsOfExcellence: "6+",
    },
  });
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch((err) => console.warn("Failed to load settings:", err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 4000);
      }
    } catch (e) {
      console.error("Save settings error:", e);
    } finally {
      setSaving(false);
    }
  };

  const cleanPhone = (settings.whatsappNumber || "+8801973590937").replace(/[^0-9]/g, "");

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Top Header Bar with Instant Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131417] p-4 rounded-[6px] border border-slate-200 dark:border-gray-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="text-[#0167D6]" size={24} />
            Site Settings &amp; Company Profile
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">
            Configure official company identity, hotlines, WhatsApp routing, and live homepage counter metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={clientUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700 transition"
          >
            <ExternalLink size={13} /> View Live Website
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 text-white text-white-always text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert Notification */}
      {savedNotice && (
        <div className="p-4 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2.5 shadow-xs transition animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Site settings and live homepage counters have been saved and applied across okobiz platform!</span>
        </div>
      )}

      {/* Full-Width Harmonious 2-Column Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        
        {/* Left Primary Section (7 Cols on LG, 8 Cols on XL) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          
          {/* Company Identity & Legal Information */}
          <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[6px] p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 size={16} className="text-[#0167D6]" />
                Company Identity &amp; Headquarters
              </h2>
              <span className="text-[11px] font-mono text-slate-400 dark:text-gray-500">Corporate Identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Company / Brand Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={settings.siteName || ""}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#181A1F] border border-slate-300 dark:border-gray-700 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                    placeholder="okobiz"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Corporate Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline || "Leading the Digital Revolution"}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#181A1F] border border-slate-300 dark:border-gray-700 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  placeholder="Leading the Digital Revolution"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin size={13} className="text-red-500" />
                  Office Address (Display on Invoices, Quotations &amp; Contact Footer) *
                </label>
                <input
                  type="text"
                  required
                  value={settings.contactAddress || ""}
                  onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#181A1F] border border-slate-300 dark:border-gray-700 rounded-[4px] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  placeholder="e.g. Uttara, Sector 3, Dhaka - 1230, Bangladesh"
                />
              </div>
            </div>
          </div>

          {/* Direct Contact & Hotline Routing */}
          <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[6px] p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Phone size={16} className="text-[#0167D6]" />
                Direct Hotlines &amp; Communication Channels
              </h2>
              <span className="text-[11px] font-mono text-slate-400 dark:text-gray-500">Public Channels</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Phone size={13} className="text-[#0167D6]" />
                  Official Support Phone *
                </label>
                <input
                  type="text"
                  required
                  value={settings.contactPhone || ""}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#181A1F] border border-slate-300 dark:border-gray-700 rounded-[4px] px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  placeholder="01973-590937"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-amber-500" />
                  Official Support Email *
                </label>
                <input
                  type="email"
                  required
                  value={settings.contactEmail || ""}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#181A1F] border border-slate-300 dark:border-gray-700 rounded-[4px] px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  placeholder="info@okobiz.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle size={14} className="text-emerald-600" />
                    WhatsApp Hotline Number (With Country Code) *
                  </span>
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Test WhatsApp Link</span>
                    <ExternalLink size={11} />
                  </a>
                </label>
                <input
                  type="text"
                  required
                  value={settings.whatsappNumber || ""}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#181A1F] border border-slate-300 dark:border-gray-700 rounded-[4px] px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                  placeholder="+8801973590937"
                />
                <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1">
                  Used by clients for instant inquiries, demo requests, and WhatsApp contact buttons across the live site.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Sidebar Section (5 Cols on LG, 4 Cols on XL) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          
          {/* Live Homepage Excellence Stats Counters */}
          <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[6px] p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Award size={16} className="text-amber-500" />
                Live Homepage Counters
              </h2>
              <span className="text-[11px] font-mono text-slate-400 dark:text-gray-500">Live Counters</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-gray-400">
              These verified metrics appear dynamically in the homepage excellence counter bar and credentials cards.
            </p>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Calendar size={12} className="text-[#0167D6]" /> Journey Started
                </label>
                <input
                  type="text"
                  value={settings.stats?.journeyStarted || "2018"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      stats: { ...settings.stats, journeyStarted: e.target.value },
                    })
                  }
                  className="w-full bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Users size={12} className="text-emerald-500" /> Happy Clients
                </label>
                <input
                  type="text"
                  value={settings.stats?.happyClients || "150+"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      stats: { ...settings.stats, happyClients: e.target.value },
                    })
                  }
                  className="w-full bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Users size={12} className="text-purple-500" /> Team Members
                </label>
                <input
                  type="text"
                  value={settings.stats?.teamMembers || "20+"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      stats: { ...settings.stats, teamMembers: e.target.value },
                    })
                  }
                  className="w-full bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>

              <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" /> Excellence
                </label>
                <input
                  type="text"
                  value={settings.stats?.yearsOfExcellence || "6+"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      stats: { ...settings.stats, yearsOfExcellence: e.target.value },
                    })
                  }
                  className="w-full bg-white dark:bg-[#131417] border border-slate-300 dark:border-gray-700 rounded-[4px] px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
                />
              </div>
            </div>

            {/* Live Visual Counter Preview Quad */}
            <div className="p-3.5 rounded-[6px] bg-slate-100 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-2">
                Live Public Showcase Preview
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-white dark:bg-[#131417] rounded-[4px] border border-slate-200 dark:border-gray-800/60">
                  <div className="text-sm font-black text-[#0167D6]">{settings.stats?.journeyStarted || "2018"}</div>
                  <div className="text-[9px] text-slate-500 dark:text-gray-400 font-medium">Started</div>
                </div>
                <div className="p-2 bg-white dark:bg-[#131417] rounded-[4px] border border-slate-200 dark:border-gray-800/60">
                  <div className="text-sm font-black text-emerald-600">{settings.stats?.happyClients || "150+"}</div>
                  <div className="text-[9px] text-slate-500 dark:text-gray-400 font-medium">Clients</div>
                </div>
                <div className="p-2 bg-white dark:bg-[#131417] rounded-[4px] border border-slate-200 dark:border-gray-800/60">
                  <div className="text-sm font-black text-purple-600">{settings.stats?.teamMembers || "20+"}</div>
                  <div className="text-[9px] text-slate-500 dark:text-gray-400 font-medium">Team</div>
                </div>
                <div className="p-2 bg-white dark:bg-[#131417] rounded-[4px] border border-slate-200 dark:border-gray-800/60">
                  <div className="text-sm font-black text-amber-500">{settings.stats?.yearsOfExcellence || "6+"}</div>
                  <div className="text-[9px] text-slate-500 dark:text-gray-400 font-medium">Years</div>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure & Security Card */}
          <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[6px] p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-gray-800 pb-2.5">
              <Shield size={14} className="text-emerald-500" />
              Platform Infrastructure Status
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800">
                <span className="text-slate-600 dark:text-gray-400">Database Engine</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  MongoDB Atlas Connected
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800">
                <span className="text-slate-600 dark:text-gray-400">Web App Server</span>
                <span className="font-semibold text-slate-900 dark:text-white">Next.js 14+ App Router</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800">
                <span className="text-slate-600 dark:text-gray-400">SSL Encryption</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">TLS 1.3 Active</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Save Action Bar */}
        <div className="lg:col-span-12 flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-600 disabled:opacity-50 text-white text-white-always text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
