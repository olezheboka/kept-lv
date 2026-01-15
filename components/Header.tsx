"use client";

import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Search, Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from '@/components/NavLink';

const navLinks = [
  { href: '/', label: 'Sākums' },
  { href: '/promises', label: 'Solījumi' },
  { href: '/politicians', label: 'Politiķi' },
  { href: '/parties', label: 'Partijas' },
  { href: '/categories', label: 'Kategorijas' },

];

export const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    promises: {
      id: string;
      title: string;
      slug?: string;
      dateOfPromise: string;
      category: { slug: string }
    }[];
    politicians: { id: string; name: string; slug?: string }[];
    parties: { id: string; name: string; slug?: string }[];
    categories: { id: string; name: string; slug?: string }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (!res.ok) throw new Error('Search failed');
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

  // Close search results on click outside (simplified for now, mostly handled by navigation)
  useEffect(() => {
    const handleClick = () => setResults(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSearchKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Do nothing, just keep the dropdown open with results
      // If no search has happened yet (e.g. typing really fast), the useEffect will catch it.
    }
  };

  const handleLinkClick = () => {
    setResults(null);
    setIsSearchOpen(false);
    setQuery('');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="container-wide">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" suppressHydrationWarning>
            <span className="font-bold text-2xl text-[#2563EB]">
              solījums.lv
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                className={({ isActive }) => cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'text-[#2563EB] bg-[#2563EB]/10 font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop Search */}
            <div className="hidden md:flex relative" onClick={(e) => e.stopPropagation()}>
              <Input
                type="search"
                placeholder="Meklēt solījumus, politiķus..."
                className="w-64 pl-9 h-9 bg-muted/50 border-transparent focus:border-border focus:bg-background"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeys}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              {/* Results Dropdown */}
              <AnimatePresence>
                {query.length >= 2 && results && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
                  >
                    {isLoading ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Meklē...</div>
                    ) : (
                      <>
                        {(!results.promises.length && !results.politicians.length && !results.parties.length && !results.categories.length) && (
                          <div className="p-4 text-center text-sm text-muted-foreground">Nekas netika atrasts</div>
                        )}

                        {results.promises.length > 0 && (
                          <div className="py-2">
                            <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Solījumi</div>
                            {results.promises.map(item => {
                              const date = new Date(item.dateOfPromise);
                              const day = date.getDate().toString().padStart(2, '0');
                              const month = (date.getMonth() + 1).toString().padStart(2, '0');
                              const year = date.getFullYear();
                              const dateSlug = `${day}-${month}-${year}`;
                              const href = `/promises/${item.category.slug}/${dateSlug}-${item.slug}`;

                              return (
                                <Link
                                  key={item.id}
                                  href={href}
                                  onClick={handleLinkClick}
                                  className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                                >
                                  {item.title}
                                </Link>
                              );
                            })}
                          </div>
                        )}

                        {results.politicians.length > 0 && (
                          <div className="py-2 border-t border-border">
                            <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Politiķi</div>
                            {results.politicians.map(item => (
                              <Link
                                key={item.id}
                                href={`/politicians/${item.slug || item.id}`}
                                onClick={handleLinkClick}
                                className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        )}

                        {results.parties.length > 0 && (
                          <div className="py-2 border-t border-border">
                            <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Partijas</div>
                            {results.parties.map(item => (
                              <Link
                                key={item.id}
                                href={`/parties/${item.slug || item.id}`}
                                onClick={handleLinkClick}
                                className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        )}

                        {results.categories.length > 0 && (
                          <div className="py-2 border-t border-border">
                            <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Kategorijas</div>
                            {results.categories.map(item => (
                              <Link
                                key={item.id}
                                href={`/categories/${item.slug || item.id}`}
                                onClick={handleLinkClick}
                                className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 [&>button]:hidden">
                <SheetTitle className="sr-only">Navigācijas izvēlne</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <span className="font-semibold">Izvēlne</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <nav className="flex-1 p-4 space-y-1">
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => cn(
                          'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-[#2563EB]/10 text-[#2563EB] font-bold'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        {link.label}
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </NavLink>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden pb-4"
          >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Input
                type="search"
                placeholder="Meklēt solījumus, politiķus..."
                className="w-full pl-9 bg-muted/50"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeys}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              {/* Mobile Results Dropdown */}
              <AnimatePresence>
                {query.length >= 2 && results && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
                  >
                    {isLoading ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Meklē...</div>
                    ) : (
                      <>
                        {(!results.promises.length && !results.politicians.length && !results.parties.length && !results.categories.length) && (
                          <div className="p-4 text-center text-sm text-muted-foreground">Nekas netika atrasts</div>
                        )}

                        {results.promises.length > 0 && (
                          <div className="py-2">
                            <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Solījumi</div>
                            {results.promises.map(item => {
                              const date = new Date(item.dateOfPromise);
                              const day = date.getDate().toString().padStart(2, '0');
                              const month = (date.getMonth() + 1).toString().padStart(2, '0');
                              const year = date.getFullYear();
                              const dateSlug = `${day}-${month}-${year}`;
                              const href = `/promises/${item.category.slug}/${dateSlug}-${item.slug}`;

                              return (
                                <Link
                                  key={item.id}
                                  href={href}
                                  onClick={handleLinkClick}
                                  className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                                >
                                  {item.title}
                                </Link>
                              );
                            })}
                          </div>
                        )}

                        {results.politicians.length > 0 && (
                          <div className="py-2 border-t border-border">
                            <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Politiķi</div>
                            {results.politicians.map(item => (
                              <Link
                                key={item.id}
                                href={`/politicians/${item.slug || item.id}`}
                                onClick={handleLinkClick}
                                className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        )}

                        {results.parties.length > 0 && (
                          <div className="py-2 border-t border-border">
                            <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Partijas</div>
                            {results.parties.map(item => (
                              <Link
                                key={item.id}
                                href={`/parties/${item.slug || item.id}`}
                                onClick={handleLinkClick}
                                className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        )}

                        {results.categories.length > 0 && (
                          <div className="py-2 border-t border-border">
                            <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Kategorijas</div>
                            {results.categories.map(item => (
                              <Link
                                key={item.id}
                                href={`/categories/${item.slug || item.id}`}
                                onClick={handleLinkClick}
                                className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};
