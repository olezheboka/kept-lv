"use client";

import Link from "next/link";
import {
    Plus,
    Moon,
    FileText,
    User,
    Flag,
    Folder
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function AdminHeader() {

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-g-gray-200 flex items-center justify-between px-4 lg:px-6 z-40 shadow-sm">
            {/* Left: Logo & Branding */}
            {/* Left: Logo & Branding */}
            <div className="flex items-center gap-3 w-64 flex-shrink-0">
                <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="font-bold text-2xl text-[#2563EB]">
                        solījums.lv
                    </span>
                </Link>
                <span className="bg-g-gray-100 text-g-gray-500 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm leading-none self-center mt-1">Admin</span>
            </div>

            {/* Center: Search Removed */}

            {/* Right: Actions */}
            <div className="flex items-center gap-3 md:gap-4 ml-auto">
                {/* Dark Mode Toggle */}
                <button className="p-2 text-g-gray-500 hover:text-g-gray-900 hover:bg-g-gray-50 rounded-md transition-colors">
                    <Moon width={20} strokeWidth={1.5} />
                </button>

                {/* Add Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 bg-g-blue-600 hover:bg-g-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm outline-none active:scale-95">
                            <Plus width={18} strokeWidth={2.5} />
                            Quick add
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-1">
                        <DropdownMenuItem asChild>
                            <Link href="/admin/promises/new" className="cursor-pointer font-medium w-full">
                                <FileText className="mr-2 h-4 w-4 text-g-blue-600" />
                                <span>Add Promise</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/politicians/new" className="cursor-pointer font-medium w-full">
                                <User className="mr-2 h-4 w-4 text-g-blue-600" />
                                <span>Add Politician</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/parties/new" className="cursor-pointer font-medium w-full">
                                <Flag className="mr-2 h-4 w-4 text-g-blue-600" />
                                <span>Add Party</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/categories/new" className="cursor-pointer font-medium w-full">
                                <Folder className="mr-2 h-4 w-4 text-g-blue-600" />
                                <span>Add Category</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
