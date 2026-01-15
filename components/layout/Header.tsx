"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    promises: { id: string; title: string; slug?: string }[];
    politicians: { id: string; name: string; slug?: string }[];
    parties: { id: string; name: string; slug?: string }[];
    categories: { id: string; name: string; slug?: string }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close search on path change
  useEffect(() => {
    setIsSearchOpen(false);
    setQuery("");
    setResults(null);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Sākums" },
    { href: "/promises", label: "Solījumi" },
    { href: "/politicians", label: "Politiķi" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.includes(href);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 glass border-b border-white/10"
    >
      <div className="container-wide py-4">
        <div className="flex items-center justify-between relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" suppressHydrationWarning>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-500
                bg-clip-text text-transparent"
            >
              SOLĪJUMS
            </motion.div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} suppressHydrationWarning>
                <motion.span
                  whileHover={{ y: -2 }}
                  className={`text-base font-medium transition-colors
                    ${isActive(item.href)
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                    }`}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeNav"
                      className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 mt-1"
                    />
                  )}
                </motion.span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Search - Desktop */}
            <div className="relative hidden md:block">
              <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? "w-64" : "w-8"}`}>
                {isSearchOpen ? (
                  <div className="relative w-full">
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full h-9 pr-8 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/30"
                      autoFocus
                    />
                    <button
                      onClick={() => { setIsSearchOpen(false); setQuery(""); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>

                    {/* Results Dropdown */}
                    <AnimatePresence>
                      {query.length >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
                        >
                          {isLoading ? (
                            <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
                          ) : results ? (
                            <>
                              {(!results.promises.length && !results.politicians.length && !results.parties.length && !results.categories.length) && (
                                <div className="p-4 text-center text-sm text-gray-400">No results found</div>
                              )}

                              {results.promises.length > 0 && (
                                <div className="py-2">
                                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Promises</div>
                                  {results.promises.map(item => (
                                    <Link
                                      key={item.id}
                                      href={`/promises`} // Linking to list for now as slug structure might vary
                                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white"
                                    >
                                      {item.title}
                                    </Link>
                                  ))}
                                </div>
                              )}

                              {results.politicians.length > 0 && (
                                <div className="py-2 border-t border-white/10">
                                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Politicians</div>
                                  {results.politicians.map(item => (
                                    <Link
                                      key={item.id}
                                      href={`/politicians/${item.id}`} // Using ID as public route likely supports it or uses it
                                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white"
                                    >
                                      {item.name}
                                    </Link>
                                  ))}
                                </div>
                              )}

                              {results.parties.length > 0 && (
                                <div className="py-2 border-t border-white/10">
                                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Parties</div>
                                  {results.parties.map(item => (
                                    <Link
                                      key={item.id}
                                      href={`/parties/${item.id}`} // Using ID
                                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white"
                                    >
                                      {item.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : null}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Search size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
