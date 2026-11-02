"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Sliders,
  Users,
  Briefcase,
  Package,
  BookOpen,
  UserCheck,
  Server,
  FolderOpen,
  HelpCircle,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

const MENU_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Hero Slides", href: "/dashboard/hero", icon: Sliders },
  { name: "Client Partners", href: "/dashboard/clients", icon: Users },
  { name: "Services", href: "/dashboard/services", icon: Server },
  { name: "Portfolio Projects", href: "/dashboard/portfolio", icon: Briefcase },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Blog Posts", href: "/dashboard/blogs", icon: BookOpen },
  { name: "Gallery", href: "/dashboard/gallery", icon: FolderOpen },
  { name: "Team & Advisors", href: "/dashboard/team", icon: UserCheck },
  { name: "Media Library", href: "/dashboard/media", icon: FolderOpen },
  { name: "FAQs", href: "/dashboard/faqs", icon: HelpCircle },
  { name: "Inquiries", href: "/dashboard/inquiries", icon: MessageSquare },
  { name: "Site Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      router.push("/login");
    }
  };

  return (
    <aside className="w-64 bg-[#111216] border-r border-gray-800/80 flex flex-col h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img
            src="/assets/okobiz-logo-C_Tt48xb.png"
            alt="okobiz"
            className="h-8 w-auto object-contain"
          />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#3368B2] px-2 py-0.5 rounded-[4px] bg-blue-900/20 border border-blue-800/30">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Management
        </div>

        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-[4px] text-sm font-medium transition duration-150 ${
                isActive
                  ? "bg-[#3368B2] text-white shadow-md shadow-blue-900/20 font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? "text-white" : "text-gray-400"} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-white/70" />}
            </Link>
          );
        })}

        <div className="pt-4 px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Quick Links
        </div>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2 rounded-[4px] text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-3">
            <ExternalLink size={16} className="text-[#3368B2]" />
            <span>View Client Site</span>
          </div>
          <span className="text-[10px] text-gray-500">:3000</span>
        </a>
      </nav>

      {/* User profile footer */}
      <div className="p-3 border-t border-gray-800/80 bg-[#0E0F12]">
        <div className="flex items-center justify-between p-2 rounded-[4px] bg-white/5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-[4px] bg-[#3368B2] text-white flex items-center justify-center font-bold text-xs shrink-0">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">Super Admin</p>
              <p className="text-[10px] text-gray-500 truncate">admin@okobiz.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-[4px] text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
