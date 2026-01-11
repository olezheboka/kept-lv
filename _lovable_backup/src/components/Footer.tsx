import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="container-wide py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-xl text-foreground">Kept</span>
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
                <Link to="/promises" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Solījumi
                </Link>
              </li>
              <li>
                <Link to="/politicians" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Politiķi
                </Link>
              </li>
              <li>
                <Link to="/parties" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Partijas
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Par Kept
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Metodoloģija
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privātuma politika
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Lietošanas noteikumi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2025 Kept. Visas tiesības aizsargātas.
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
