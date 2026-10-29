import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 mt-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <p>© 2026 Invoice Studio. A product of <span className="text-slate-300 font-medium">ApexAI Company</span>.</p>
        <div className="flex gap-6">
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
      </div>
    </footer>
  );
}