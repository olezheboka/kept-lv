import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <h1 className="text-9xl font-black text-muted-foreground/20">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
            bg-primary text-primary-foreground font-medium 
            hover:bg-primary/90 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
