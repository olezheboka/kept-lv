import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="container-wide py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2.5" suppressHydrationWarning>
              <span className="font-bold text-2xl text-[#2563EB]">
                solījums.lv
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Seko līdzi politiskajiem solījumiem.
            </p>
          </div>

          {/* Navigation - Inline */}
          <nav className="flex flex-wrap items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors" suppressHydrationWarning>
              Sākums
            </Link>
            <Link href="/promises" className="text-sm text-muted-foreground hover:text-foreground transition-colors" suppressHydrationWarning>
              Solījumi
            </Link>
            <Link href="/politicians" className="text-sm text-muted-foreground hover:text-foreground transition-colors" suppressHydrationWarning>
              Politiķi
            </Link>
            <Link href="/parties" className="text-sm text-muted-foreground hover:text-foreground transition-colors" suppressHydrationWarning>
              Partijas
            </Link>
            <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors" suppressHydrationWarning>
              Kategorijas
            </Link>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2026 solijums.lv. Visas tiesības aizsargātas.
          </p>
          <span className="text-xs text-muted-foreground">
            Made with ❤️ in Latvia
          </span>
        </div>
      </div>
    </footer>
  );
};

