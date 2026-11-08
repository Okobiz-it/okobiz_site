"use client";
import React, { useEffect, useState } from "react";
import { Settings, Save, CheckCircle2, Shield, Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    siteName: "okobiz",
    contactPhone: "01973-590937",
    contactEmail: "info@okobiz.com",
    contactAddress: "Uttara, Dhaka, Bangladesh",
    whatsappNumber: "+8801973590937",
    stats: {
      journeyStarted: "2018",
      happyClients: "150",
      teamMembers: "20",
      yearsOfExcellence: "6+",
    },
  });
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      });
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
        setTimeout(() => setSavedNotice(false), 3000);
      }
    } catch (e) {} finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="text-[#0167D6]" size={24} />
          Site Settings & Company Profile
        </h1>
        <p className="text-slate-600 dark:text-gray-400 text-xs mt-1">
          Configure official company phone numbers, email addresses, WhatsApp numbers, and live homepage counters
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-[4px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Settings saved and updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact info card */}
        <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-gray-800 pb-3">Company Contact Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Company / Brand Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Official Support Phone</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Official Support Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">WhatsApp Hotline Number</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Office Address</label>
            <input
              type="text"
              value={settings.contactAddress}
              onChange={e => setSettings({ ...settings, contactAddress: e.target.value })}
              className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
            />
          </div>
        </div>

        {/* Live Homepage Stats Counters */}
        <div className="bg-white dark:bg-[#131417] border border-slate-200 dark:border-gray-800 rounded-[4px] p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-gray-800 pb-3">Homepage Excellence Stats</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Journey Started</label>
              <input
                type="text"
                value={settings.stats?.journeyStarted || "2018"}
                onChange={e => setSettings({ ...settings, stats: { ...settings.stats, journeyStarted: e.target.value } })}
                className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Happy Clients</label>
              <input
                type="text"
                value={settings.stats?.happyClients || "150"}
                onChange={e => setSettings({ ...settings, stats: { ...settings.stats, happyClients: e.target.value } })}
                className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Team Members</label>
              <input
                type="text"
                value={settings.stats?.teamMembers || "20"}
                onChange={e => setSettings({ ...settings, stats: { ...settings.stats, teamMembers: e.target.value } })}
                className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Years of Excellence</label>
              <input
                type="text"
                value={settings.stats?.yearsOfExcellence || "6+"}
                onChange={e => setSettings({ ...settings, stats: { ...settings.stats, yearsOfExcellence: e.target.value } })}
                className="w-full bg-white dark:bg-[#181A1F] border border-slate-300 dark:border-gray-800 rounded-[4px] px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0167D6]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-[4px] bg-[#0167D6] hover:bg-blue-700 disabled:opacity-50 text-white text-white-always text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition"
          >
            <Save size={16} />
            <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
