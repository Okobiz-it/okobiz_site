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
  FilePlus,
  Files,
  Layers,
  Image,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface SubMenuItem {
  name: string;
  href: string;
  icon?: any;
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

// Menu Hierarchy: 1. Overview -> 2. Client CMS -> 3. Quotation
const MENU_ITEMS: MenuItem[] = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Client CMS",
    href: "/dashboard/hero",
    icon: Layers,
    subItems: [
      { name: "Hero Slides", href: "/dashboard/hero", icon: Sliders },
      { name: "Client Partners", href: "/dashboard/clients", icon: Users },
      { name: "Services", href: "/dashboard/services", icon: Server },
      { name: "Portfolio Projects", href: "/dashboard/portfolio", icon: Briefcase },
      { name: "Products", href: "/dashboard/products", icon: Package },
      { name: "Blog Posts", href: "/dashboard/blogs", icon: BookOpen },
      { name: "Gallery", href: "/dashboard/gallery", icon: FolderOpen },
      { name: "Career", href: "/dashboard/career", icon: GraduationCap },
      { name: "Media Library", href: "/dashboard/media", icon: Image },
      { name: "FAQs", href: "/dashboard/faqs", icon: HelpCircle },
      { name: "Inquiries", href: "/dashboard/inquiries", icon: MessageSquare },
      { name: "Site Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
  {
    name: "Quotation",
    href: "/dashboard/quotations",
    icon: FileText,
    subItems: [
      { name: "Create Quotation", href: "/dashboard/quotations/create", icon: FilePlus },
      { name: "Manage Quotations", href: "/dashboard/quotations", icon: Files },
    ],
  },
];

export default function Sidebar({ onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Helper to check route active status
  const isRouteActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/dashboard/quotations") {
      return (
        pathname === "/dashboard/quotations" ||
        (pathname.startsWith("/dashboard/quotations/") && !pathname.endsWith("/create"))
      );
    }
    if (href === "/dashboard/quotations/create") {
      return pathname === "/dashboard/quotations/create";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Check if a parent menu has an active subitem
  const hasActiveSubItem = (item: MenuItem) => {
    if (!item.subItems) return false;
    return item.subItems.some((sub) => isRouteActive(sub.href));
  };

  // Expandable menus state
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      Quotation: false,
      "Client CMS": true,
    };
    MENU_ITEMS.forEach((item) => {
      if (item.subItems) {
        initial[item.name] = hasActiveSubItem(item);
      }
    });
    return initial;
  });

  // Keep active section expanded on route changes
  useEffect(() => {
    MENU_ITEMS.forEach((item) => {
      if (item.subItems && hasActiveSubItem(item)) {
        setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
      }
    });
  }, [pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

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
                className="hidden lg:flex p-1.5 rounded-[4px] text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800/40 transition items-center justify-center cursor-pointer border-0 !border-none !bg-transparent !shadow-none"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            )}
          </>
        ) : (
          /* Collapsed state: Logo on top is the collapsable button */
          <button
            onClick={onToggleCollapse}
            className="relative group w-11 h-11 rounded-[4px] flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 border-0 !border-none !bg-transparent transition-all cursor-pointer overflow-hidden !shadow-none"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <img
              src="/okobiz-icon.png"
              alt="okobiz"
              className="w-7 h-7 object-contain rounded-[4px] transition-all duration-200 group-hover:opacity-0 group-hover:scale-75"
            />
            <div className="absolute inset-0 flex items-center justify-center text-[#0167D6] dark:text-[#3368B2] opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200">
              <PanelLeftOpen size={20} className="stroke-[2.2]" />
            </div>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 p-3 space-y-1 ${
          isCollapsed ? "overflow-visible" : "overflow-y-auto"
        }`}
      >
        {!isCollapsed ? (
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
            Management
          </div>
        ) : (
          <div className="w-8 h-[1px] bg-slate-200 dark:bg-gray-800/80 my-2 mx-auto" />
        )}

        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const hasChildren = Boolean(item.subItems && item.subItems.length > 0);
          const activeChild = hasActiveSubItem(item);
          const isItemActive = isRouteActive(item.href) || activeChild;

          // ─────────────────────────────────────────────────────────────
          // 1. COLLAPSED VIEW: ICONS WITH HOVER FLYOUT SUBMENUS
          // ─────────────────────────────────────────────────────────────
          if (isCollapsed) {
            if (hasChildren && item.subItems) {
              return (
                <div key={item.name} className="relative group">
                  <button
                    type="button"
                    className={`w-full flex items-center justify-center rounded-[4px] py-2.5 transition duration-150 cursor-pointer border-0 !border-none !shadow-none ${
                      activeChild
                        ? "!bg-[#0167D6] text-white text-white-always shadow-md shadow-blue-500/20 font-semibold"
                        : "!bg-transparent text-slate-600 hover:text-slate-900 hover:!bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:!bg-gray-800/40"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 ${
                        activeChild ? "text-white text-white-always" : "text-slate-500 dark:text-gray-400"
                      }`}
                    />
                  </button>

                  {/* Flyout popover with invisible hover bridge (pl-2.5) */}
                  <div className="absolute left-full top-0 pl-2.5 -mt-1 z-50 pointer-events-none group-hover:pointer-events-auto opacity-0 invisible -translate-x-2 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-150 ease-out">
                    <div className="w-64 max-h-[calc(100vh-100px)] overflow-y-auto bg-white dark:bg-[#141518] border border-slate-200 dark:border-gray-800 rounded-lg shadow-xl p-1.5 space-y-0.5">
                      <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider border-b border-slate-100 dark:border-gray-800/80 mb-1 flex items-center justify-between">
                        <span className="truncate">{item.name}</span>
                        <span className="text-[10px] font-medium bg-blue-50 text-[#0167D6] dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                          {item.subItems.length}
                        </span>
                      </div>
                      {item.subItems.map((sub) => {
                        const SubIcon = sub.icon || Icon;
                        const isSubActive = isRouteActive(sub.href);

                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={onClose}
                            className={`flex items-center gap-2.5 rounded-[4px] text-[13.5px] font-medium py-2 px-2.5 transition duration-150 ${
                              isSubActive
                                ? "bg-[#0167D6] text-white text-white-always font-semibold shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/40"
                            }`}
                          >
                            <SubIcon
                              size={16}
                              className={`shrink-0 ${
                                isSubActive ? "text-white text-white-always" : "text-slate-400 dark:text-gray-400"
                              }`}
                            />
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            // Collapsed single item tooltip
            return (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-center rounded-[4px] py-2.5 transition duration-150 border-0 !border-none !shadow-none ${
                    isItemActive
                      ? "!bg-[#0167D6] text-white text-white-always shadow-md shadow-blue-500/20 font-semibold"
                      : "!bg-transparent text-slate-600 hover:text-slate-900 hover:!bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:!bg-gray-800/40"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${
                      isItemActive ? "text-white text-white-always" : "text-slate-500 dark:text-gray-400"
                    }`}
                  />
                </Link>
                <div className="absolute left-full top-1/2 -translate-y-1/2 pl-2.5 z-50 pointer-events-none opacity-0 invisible -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-150">
                  <div className="bg-slate-900 dark:bg-gray-800 text-white text-xs font-medium px-2.5 py-1 rounded shadow-md whitespace-nowrap">
                    {item.name}
                  </div>
                </div>
              </div>
            );
          }

          // ─────────────────────────────────────────────────────────────
          // 2. EXPANDED VIEW: ACCORDION MENUS & REGULAR ITEMS
          // ─────────────────────────────────────────────────────────────
          if (hasChildren && item.subItems) {
            const isOpen = Boolean(openMenus[item.name]);

            return (
              <div key={item.name} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center justify-between rounded-[4px] text-sm font-medium transition duration-150 px-3.5 py-2.5 cursor-pointer border-0 !border-none !shadow-none ${
                    activeChild
                      ? "!bg-blue-50/70 text-[#0167D6] dark:!bg-blue-900/20 dark:text-blue-400 font-semibold"
                      : "!bg-transparent text-slate-600 hover:text-slate-900 hover:!bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:!bg-gray-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      size={18}
                      className={`shrink-0 ${
                        activeChild ? "text-[#0167D6] dark:text-blue-400" : "text-slate-500 dark:text-gray-400"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown size={15} className="text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight size={15} className="text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="pl-3.5 pr-1 py-0.5 space-y-0.5 animate-in fade-in-50 duration-150">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon || Icon;
                      const isSubActive = isRouteActive(sub.href);

                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={onClose}
                          className={`flex items-center gap-2.5 rounded-[4px] text-[13.5px] font-medium py-2 px-3 transition duration-150 border-0 !border-none !shadow-none ${
                            isSubActive
                              ? "!bg-[#0167D6] text-white text-white-always shadow-xs font-semibold"
                              : "!bg-transparent text-slate-600 hover:text-slate-900 hover:!bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:!bg-gray-800/40"
                          }`}
                        >
                          <SubIcon
                            size={16}
                            className={`shrink-0 ${
                              isSubActive ? "text-white text-white-always" : "text-slate-400 dark:text-gray-400"
                            }`}
                          />
                          <span className="truncate">{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Expanded single item (e.g. Overview)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center rounded-[4px] text-sm font-medium transition duration-150 px-3.5 py-2.5 gap-3 border-0 !border-none !shadow-none ${
                isItemActive
                  ? "!bg-[#0167D6] text-white text-white-always shadow-md shadow-blue-500/20 font-semibold"
                  : "!bg-transparent text-slate-600 hover:text-slate-900 hover:!bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:!bg-gray-800/40"
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 ${
                  isItemActive ? "text-white text-white-always" : "text-slate-500 dark:text-gray-400"
                }`}
              />
              <span className="truncate">{item.name}</span>
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
              className="p-1.5 rounded-[4px] text-slate-400 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer border-0 !border-none !bg-transparent !shadow-none"
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
              className="p-2 rounded-[4px] text-slate-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer border-0 !border-none !bg-transparent !shadow-none"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
