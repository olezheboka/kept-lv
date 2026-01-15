"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Search,
    Plus,
    Moon
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function AdminHeader() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{
        promises: { id: string, title: string }[],
        politicians: { id: string, name: string }[],
        parties: { id: string, name: string }[],
        categories: { id: string, name: string }[]
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Simple debounce effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setIsLoading(true);
                setIsOpen(true);
                try {
                    const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    setResults(data);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults(null);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on click outside (simplified)
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as Element).closest(".w-full.max-w-xl")) {
                setIsOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

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

            {/* Center: Search - Absolutely positioned to ensure true center relative to screen */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-xl hidden md:block">
                <div className="relative">
                    <Input
                        type="search"
                        className="w-full pl-9 h-9 bg-muted/50 border-transparent focus:border-border focus:bg-background"
                        placeholder="Search promises, politicians, parties..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                    {isOpen && query.length >= 2 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                            ) : results ? (
                                <>
                                    {(!results.promises.length && !results.politicians.length && !results.parties.length && !results.categories.length) && (
                                        <div className="p-4 text-center text-sm text-gray-500">No results found.</div>
                                    )}

                                    {results.promises.length > 0 && (
                                        <div className="py-2">
                                            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Promises</div>
                                            {results.promises.map(item => (
                                                <Link
                                                    key={item.id}
                                                    href={`/admin/promises/${item.id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                                >
                                                    {item.title}
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {results.politicians.length > 0 && (
                                        <div className="py-2 border-t border-gray-100">
                                            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Politicians</div>
                                            {results.politicians.map(item => (
                                                <Link
                                                    key={item.id}
                                                    href={`/admin/politicians/${item.id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {results.parties.length > 0 && (
                                        <div className="py-2 border-t border-gray-100">
                                            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Parties</div>
                                            {results.parties.map(item => (
                                                <Link
                                                    key={item.id}
                                                    href={`/admin/parties/${item.id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {results.categories.length > 0 && (
                                        <div className="py-2 border-t border-gray-100">
                                            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Categories</div>
                                            {results.categories.map(item => (
                                                <Link
                                                    key={item.id}
                                                    href={`/admin/categories/${item.id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>

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
                            Add
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white rounded-lg shadow-xl border border-g-gray-100 py-1 mt-1">
                        <DropdownMenuItem asChild>
                            <Link href="/admin/promises/new" className="cursor-pointer px-4 py-2 text-sm text-g-gray-700 hover:bg-g-gray-50 hover:text-g-blue-600 w-full block font-medium">
                                Add Promise
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/politicians/new" className="cursor-pointer px-4 py-2 text-sm text-g-gray-700 hover:bg-g-gray-50 hover:text-g-blue-600 w-full block font-medium">
                                Add Politician
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/parties/new" className="cursor-pointer px-4 py-2 text-sm text-g-gray-700 hover:bg-g-gray-50 hover:text-g-blue-600 w-full block font-medium">
                                Add Party
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/categories/new" className="cursor-pointer px-4 py-2 text-sm text-g-gray-700 hover:bg-g-gray-50 hover:text-g-blue-600 w-full block font-medium">
                                Add Category
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
