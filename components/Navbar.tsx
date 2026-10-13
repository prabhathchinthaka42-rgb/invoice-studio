import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-2xl group-hover:scale-110 transition-transform">
          🧾
        </span>
        <span className="font-bold text-lg tracking-tight">
          Invoice Studio
        </span>
      </Link>

      {/* Center Links */}
      <div className="hidden md:flex gap-8 text-sm text-slate-400">
        <Link href="/about" className="hover:text-white transition-colors">
          About
        </Link>
        <Link href="/pricing" className="hover:text-white transition-colors">
          Pricing
        </Link>
        <Link href="/contact" className="hover:text-white transition-colors">
          Contact
        </Link>
      </div>

      {/* CTA */}
      <Link
        href="/app"
        className="px-4 py-2 text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all"
      >
        Open App →
      </Link>
    </nav>
  );
}