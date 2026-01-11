"use client";

import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Search, Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navLinks = [
  { href: '/', label: 'Sākums' },
  { href: '/promises', label: 'Solījumi' },
  { href: '/politicians', label: 'Politiķi' },
  { href: '/parties', label: 'Partijas' },
  { href: '/categories', label: 'Kategorijas' },
  { href: '/about', label: 'Par mums' },
];

export const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="container-wide">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:block">
              Kept
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActiveLink(link.href)
                    ? 'text-[#9E1B34] bg-[#9E1B34]/10 font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop Search */}
            <div className="hidden md:flex relative">
              <Input
                type="search"
                placeholder="Meklēt solījumus..."
                className="w-64 pl-9 h-9 bg-muted/50 border-transparent focus:border-border focus:bg-background"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              <SheetContent side="right" className="w-80 p-0">
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
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                          isActiveLink(link.href)
                            ? 'bg-[#9E1B34]/10 text-[#9E1B34] font-bold'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        {link.label}
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </Link>
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
            <div className="relative">
              <Input
                type="search"
                placeholder="Meklēt solījumus, politiķus..."
                className="w-full pl-9 bg-muted/50"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};
