"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Sliders,
  Users,
  Briefcase,
  Package,
  BookOpen,
  GraduationCap,
  Server,
  FolderOpen,
  HelpCircle,
  MessageSquare,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface SubMenuItem {
  name: string;
  href: string;
}

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  subItems?: SubMenuItem[];
}

interface SidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const MENU_ITEMS: MenuItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Hero Slides", href: "/dashboard/hero", icon: Sliders },
  { name: "Client Partners", href: "/dashboard/clients", icon: Users },
  { name: "Services", href: "/dashboard/services", icon: Server },
  { name: "Portfolio Projects", href: "/dashboard/portfolio", icon: Briefcase },
  { name: "Products", href: "/dashboard/products", icon: Package },
  {
    name: "Quotation",
    href: "/dashboard/quotations",
    icon: FileText,
    subItems: [
      { name: "Create Quotation", href: "/dashboard/quotations/create" },
      { name: "Manage Quotations", href: "/dashboard/quotations" },
    ],
  },
  { name: "Blog Posts", href: "/dashboard/blogs", icon: BookOpen },
  { name: "Gallery", href: "/dashboard/gallery", icon: FolderOpen },
  { name: "Career", href: "/dashboard/career", icon: GraduationCap },
  { name: "Media Library", href: "/dashboard/media", icon: FolderOpen },
  { name: "FAQs", href: "/dashboard/faqs", icon: HelpCircle },
  { name: "Inquiries", href: "/dashboard/inquiries", icon: MessageSquare },
  { name: "Site Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({ onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isQuotationRoute = pathname.startsWith("/dashboard/quotations");
  const [quotationOpen, setQuotationOpen] = useState(isQuotationRoute);

  useEffect(() => {
    if (isQuotationRoute) {
      setQuotationOpen(true);
    }
  }, [isQuotationRoute]);

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
    <aside
      className={`bg-white dark:bg-[#111216] border-r border-slate-200 dark:border-gray-800/80 flex flex-col h-screen shrink-0 transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 border-b border-slate-200 dark:border-gray-800/80 flex items-center transition-all ${
          isCollapsed ? "justify-center px-2" : "justify-between px-4 sm:px-5"
        }`}
      >
        {!isCollapsed ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
              <img
                src="/assets/okobiz-logo-C_Tt48xb.png"
                alt="okobiz"
                className="h-8 w-auto object-contain shrink-0"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0167D6] dark:text-[#3368B2] px-2 py-0.5 rounded-[4px] bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 shrink-0">
                Admin
              </span>
            </Link>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-[4px] text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition items-center justify-center cursor-pointer"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            )}
          </>
        ) : (
          /* Collapsed state: Logo on top is the collapsable button.
             When hovered, the logo smoothly reveals the expand icon! */
          <button
            onClick={onToggleCollapse}
            className="relative group w-11 h-11 rounded-[4px] flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800/40 transition-all cursor-pointer overflow-hidden"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            {/* Default logo mark */}
            <img
              src="/okobiz-icon.png"
              alt="okobiz"
              className="w-7 h-7 object-contain rounded-[4px] transition-all duration-200 group-hover:opacity-0 group-hover:scale-75"
            />

            {/* Hover expand icon */}
            <div className="absolute inset-0 flex items-center justify-center text-[#0167D6] dark:text-[#3368B2] opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200">
              <PanelLeftOpen size={20} className="stroke-[2.2]" />
            </div>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {!isCollapsed ? (
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
            Management
          </div>
        ) : (
          <div className="w-8 h-[1px] bg-slate-200 dark:bg-gray-800/80 my-2 mx-auto" />
        )}

        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;

          // Item with submenus (e.g. Quotation)
          if (item.subItems && item.subItems.length > 0) {
            const hasActiveChild = pathname.startsWith(item.href);

            if (isCollapsed) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  title={`${item.name} (${item.subItems.map(s => s.name).join(", ")})`}
                  className={`flex items-center justify-center rounded-[4px] py-2.5 transition duration-150 ${
                    hasActiveChild
                      ? "bg-[#0167D6] text-white text-white-always shadow-md shadow-blue-500/20 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${
                      hasActiveChild ? "text-white text-white-always" : "text-slate-500 dark:text-gray-400"
                    }`}
                  />
                </Link>
              );
            }

            return (
              <div key={item.name} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setQuotationOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between rounded-[4px] text-sm font-medium transition duration-150 px-3.5 py-2.5 cursor-pointer ${
                    hasActiveChild
                      ? "bg-blue-50/70 text-[#0167D6] dark:bg-blue-900/20 dark:text-blue-400 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      size={18}
                      className={`shrink-0 ${
                        hasActiveChild ? "text-[#0167D6] dark:text-blue-400" : "text-slate-500 dark:text-gray-400"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {quotationOpen ? (
                    <ChevronDown size={15} className="text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight size={15} className="text-slate-400 shrink-0" />
                  )}
                </button>

                {quotationOpen && (
                  <div className="pl-9 pr-1 py-0.5 space-y-0.5 animate-in fade-in-50 duration-150">
                    {item.subItems.map((sub) => {
                      const isSubActive =
                        sub.href === "/dashboard/quotations/create"
                          ? pathname === "/dashboard/quotations/create"
                          : pathname === "/dashboard/quotations" ||
                            (pathname.startsWith("/dashboard/quotations/") &&
                              !pathname.endsWith("/create"));

                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={onClose}
                          className={`flex items-center rounded-[4px] text-xs font-medium py-2 px-3 transition duration-150 ${
                            isSubActive
                              ? "bg-[#0167D6] text-white text-white-always shadow-xs font-semibold"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
                          }`}
                        >
                          <span className="truncate">{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Regular flat item - active if exact match or nested sub-route (e.g. create, edit)
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center rounded-[4px] text-sm font-medium transition duration-150 ${
                isCollapsed ? "justify-center px-2 py-2.5" : "px-3.5 py-2.5 gap-3"
              } ${
                isActive
                  ? "bg-[#0167D6] text-white text-white-always shadow-md shadow-blue-500/20 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 ${
                  isActive ? "text-white text-white-always" : "text-slate-500 dark:text-gray-400"
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="p-3 border-t border-slate-200 dark:border-gray-800/80 bg-slate-50 dark:bg-[#0E0F12]">
        {!isCollapsed ? (
          <div className="flex items-center justify-between p-2 rounded-[4px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-[4px] bg-[#0167D6] text-white text-white-always flex items-center justify-center font-bold text-xs shrink-0">
                A
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">Super Admin</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-500 truncate">admin@okobiz.com</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 rounded-[4px] text-slate-400 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <div
              title="Super Admin (admin@okobiz.com)"
              className="w-9 h-9 rounded-[4px] bg-[#0167D6] text-white text-white-always flex items-center justify-center font-bold text-xs shadow-xs"
            >
              A
            </div>
            <button
              onClick={handleLogout}
              title="Log out (admin@okobiz.com)"
              className="p-2 rounded-[4px] text-slate-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
