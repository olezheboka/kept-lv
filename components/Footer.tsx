import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="container-wide py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <span className="font-bold text-2xl text-[#9E1B34]">
                solijums.lv
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sekojam līdzi Latvijas politiķu solījumiem un to izpildei.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Pārlūkot</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/promises" className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors">
                  Solījumi
                </Link>
              </li>
              <li>
                <Link href="/politicians" className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors">
                  Politiķi
                </Link>
              </li>
              <li>
                <Link href="/parties" className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors">
                  Partijas
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors">
                  Kategorijas
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Par mums</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors">
                  Par Kept
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors">
                  Metodoloģija
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors">
                  Kontakti
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Juridiskā info</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors">
                  Privātuma politika
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors">
                  Lietošanas noteikumi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2025 solijums.lv. Visas tiesības aizsargātas.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              Made with ❤️ in Latvia
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
