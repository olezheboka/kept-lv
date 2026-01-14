"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    FileText,
    Users,
    Building2,
    Tag,
    LogOut,
    ExternalLink,
    Settings,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/promises", icon: FileText, label: "Promises" },
    { href: "/admin/politicians", icon: Users, label: "Politicians" },
    { href: "/admin/parties", icon: Building2, label: "Parties" },
    { href: "/admin/categories", icon: Tag, label: "Categories" },
];

export function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin";
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
            {/* Branding */}
            <div className="h-14 flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <Link href="/admin" className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    <div className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 flex items-center justify-center">
                        <span className="text-xs font-bold">S</span>
                    </div>
                    Solījums/Admin
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                <div className="text-xs font-medium text-zinc-500 uppercase px-3 py-2">
                    Main
                </div>
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                                active
                                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200 dark:border-zinc-700"
                                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            )}
                        >
                            <item.icon className={cn("w-4 h-4", active ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400")} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}

                <div className="text-xs font-medium text-zinc-500 uppercase px-3 py-2 mt-6">
                    System
                </div>
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Site</span>
                </Link>
            </nav>

            {/* User Footer */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <Avatar className="h-8 w-8 rounded-md border border-zinc-200 dark:border-zinc-800">
                        <AvatarFallback className="text-xs rounded-md bg-zinc-100 text-zinc-500">AD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate text-zinc-900 dark:text-zinc-50">Admin User</span>
                        <span className="text-xs text-zinc-500 truncate">admin@solijums.lv</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 font-normal"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}
