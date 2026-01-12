import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-9xl font-black text-white/20 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
            bg-gradient-to-r from-blue-500 to-blue-600
            text-white font-semibold hover:shadow-lg transition-all"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
