"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Package,
  BookOpen,
  FolderOpen,
  MessageSquare,
  Sliders,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    clients: 0,
    themes: 0,
    products: 0,
    blogs: 0,
    team: 0,
    media: 0,
    inquiries: 0,
    newInquiries: 0,
    heroSlides: 0,
  });
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then(r => r.json()),
      fetch("/api/inquiries").then(r => r.json()),
      fetch("/api/hero").then(r => r.json())
    ]).then(([statsRes, inqRes, heroRes]) => {
      if (statsRes.success) setStats(statsRes.data);
      if (inqRes.success) setInquiries(inqRes.data.slice(0, 5));
      if (heroRes.success) setHeroSlides(heroRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { title: "Products & SaaS", count: stats.products || 0, icon: Package, href: "/dashboard/products", color: "from-blue-600 to-cyan-600" },
    { title: "Client Partners", count: stats.clients, icon: Users, href: "/dashboard/clients", color: "from-blue-600 to-indigo-600" },
    { title: "Portfolio Projects", count: stats.themes, icon: Briefcase, href: "/dashboard/portfolio", color: "from-indigo-600 to-purple-600" },
    { title: "Blog Articles", count: stats.blogs, icon: BookOpen, href: "/dashboard/blogs", color: "from-emerald-600 to-teal-600" },
    { title: "Media Assets", count: stats.media, icon: FolderOpen, href: "/dashboard/media", color: "from-amber-600 to-orange-600" },
    { title: "Customer Leads", count: stats.inquiries, badge: stats.newInquiries ? `${stats.newInquiries} new` : null, icon: MessageSquare, href: "/dashboard/inquiries", color: "from-rose-600 to-pink-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#18263D] via-[#131417] to-[#131417] p-6 sm:p-8 border border-blue-900/30">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs uppercase font-bold tracking-widest text-[#3368B2] px-3 py-1 bg-blue-900/30 rounded-full inline-block mb-3 border border-blue-800/40">
            Control Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome to okobiz Admin
          </h1>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            Manage your corporate web presentation, client portfolio, blogs, team roster, and multimedia assets with instant live synchronization.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard/portfolio"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3368B2] hover:bg-blue-600 text-white text-xs font-bold transition shadow-lg shadow-blue-900/40"
            >
              <Plus size={16} /> Add Portfolio Project
            </Link>
            <Link
              href="/dashboard/media"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition"
            >
              <FolderOpen size={16} /> Upload Media
            </Link>
            <Link
              href="/dashboard/blogs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition"
            >
              <Plus size={16} /> Write Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              href={card.href}
              className="bg-[#131417] hover:bg-[#181A1F] border border-gray-800/80 hover:border-gray-700 p-5 rounded-2xl transition duration-200 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon size={18} />
                </div>
                {card.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {card.badge}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-white group-hover:text-[#3368B2] transition">
                  {loading ? "-" : card.count}
                </div>
                <div className="text-xs font-medium text-gray-400 mt-0.5">
                  {card.title}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two columns: Recent Inquiries & Live Hero Slides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inquiries */}
        <div className="bg-[#131417] border border-gray-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={18} className="text-[#3368B2]" />
              <h2 className="text-base font-bold text-white">Recent Customer Inquiries</h2>
            </div>
            <Link
              href="/dashboard/inquiries"
              className="text-xs text-[#3368B2] hover:text-blue-400 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {inquiries.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-xs">
              No inquiries received yet.
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq._id}
                  className="p-3.5 rounded-xl bg-[#181A1F] border border-gray-800/60 flex items-center justify-between gap-3"
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{inq.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        inq.status === 'new' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        inq.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{inq.service} - {inq.email}</p>
                  </div>
                  <Link
                    href="/dashboard/inquiries"
                    className="text-xs px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-medium shrink-0"
                  >
                    Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Hero Slides */}
        <div className="bg-[#131417] border border-gray-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Sliders size={18} className="text-[#3368B2]" />
              <h2 className="text-base font-bold text-white">Active Hero Slides</h2>
            </div>
            <Link
              href="/dashboard/hero"
              className="text-xs text-[#3368B2] hover:text-blue-400 font-semibold flex items-center gap-1"
            >
              <span>Manage Slides</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {heroSlides.slice(0, 4).map((slide, idx) => (
              <div
                key={slide._id || idx}
                className="p-3 rounded-xl bg-[#181A1F] border border-gray-800/60 flex items-center gap-3.5"
              >
                <div className="w-14 h-10 rounded-lg overflow-hidden bg-black shrink-0 relative">
                  <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-bold text-white truncate">{slide.title}</p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">Order #{slide.order} • Button: {slide.buttonText}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  slide.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                }`}>
                  {slide.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
