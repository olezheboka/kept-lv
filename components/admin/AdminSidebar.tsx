"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { format } from "date-fns";
import {
    LayoutGrid,
    FileText,
    User,
    Flag,
    Folder,
    LogOut,
    ExternalLink,
    Activity,
    ChevronLeft,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const platformItems = [
    { href: "/admin", icon: LayoutGrid, label: "Dashboard" },
    { href: "/admin/promises", icon: FileText, label: "Promises" },
    { href: "/admin/politicians", icon: User, label: "Politicians" },
    { href: "/admin/parties", icon: Flag, label: "Parties" },
    { href: "/admin/categories", icon: Folder, label: "Categories" },
    { href: "/admin/config", icon: Settings, label: "Config" },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin";
        }
        return pathname.startsWith(href);
    };

    return (
        <aside
            id="sidebar"
            className={cn(
                "sticky top-16 h-[calc(100vh-4rem)] z-30 bg-white border-r border-g-gray-200 transition-[width] duration-300 ease-in-out flex flex-col group flex-shrink-0",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Collapse Toggle Arrow - Top right of sidebar content */}
            <div className="absolute -right-3 top-4 z-50">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="bg-white border border-g-gray-200 rounded-full p-1 text-g-blue-600 hover:text-g-blue-700 shadow-sm flex items-center justify-center transform hover:scale-110 transition-all"
                >
                    <ChevronLeft width={14} className={cn("transition-transform", collapsed && "rotate-180")} />
                </button>
            </div>


            {/* Public Site Link */}
            <div className={cn("px-3 py-4 border-b border-g-gray-200 mb-2", collapsed && "px-2 flex justify-center")}>
                <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Visit Public Site"
                    className={cn(
                        "flex items-center gap-3 text-sm font-medium text-g-gray-600 hover:text-g-blue-600 transition-colors w-full px-3 py-2 rounded-md hover:bg-g-blue-50",
                        collapsed && "justify-center px-0"
                    )}
                >
                    <ExternalLink width={18} strokeWidth={1.5} />
                    {!collapsed && <span className="whitespace-nowrap">Visit Public Site</span>}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-8">
                {/* Primary */}
                <div>
                    <ul className="space-y-1">
                        {platformItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        title={collapsed ? item.label : ""}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md group transition-all",
                                            active
                                                ? "bg-g-blue-50 text-g-blue-600"
                                                : "text-g-gray-600 hover:bg-g-gray-50 hover:text-g-gray-900",
                                            collapsed && "justify-center px-0"
                                        )}
                                    >
                                        <item.icon width={20} strokeWidth={active ? 2 : 1.5} className="flex-shrink-0" />
                                        {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>



            {/* User Profile */}
            <div className={cn("p-4 border-t border-g-gray-200 bg-g-gray-50/50", collapsed && "p-2")}>
                {!collapsed ? (
                    <>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-g-blue-100 text-g-blue-600 flex items-center justify-center font-bold text-sm">
                                {session?.user?.email?.slice(0, 2).toUpperCase() || "AD"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-g-gray-900 truncate">
                                    {session?.user?.email || "Admin User"}
                                </p>
                                <p className="text-xs text-g-gray-500 truncate">
                                    Last login: {session?.user?.lastLogin ? format(new Date(session.user.lastLogin), "dd.MM.yyyy HH:mm") : "First login"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex items-center gap-2 text-xs font-medium text-g-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors px-2 py-1.5 rounded-md w-full"
                        >
                            <LogOut width={14} strokeWidth={1.5} />
                            Logout
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-g-blue-100 text-g-blue-600 flex items-center justify-center font-bold text-xs">
                            {session?.user?.email?.slice(0, 2).toUpperCase() || "AD"}
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            title="Logout"
                            className="text-g-gray-400 hover:text-red-600 transition-colors"
                        >
                            <LogOut width={18} strokeWidth={1.5} />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
