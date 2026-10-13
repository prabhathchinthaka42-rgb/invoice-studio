import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Invoice Studio is a fast, private, and beautifully simple invoicing tool built for freelancers and small businesses. Learn about our mission and values.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[140px] opacity-20" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <p className="text-sm font-medium text-blue-400 mb-4 tracking-wider uppercase">
            About Us
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Built for makers,
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-200 bg-clip-text text-transparent">
              not paperwork.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Invoice Studio is a fast, private, and beautifully simple invoicing
            tool — created for freelancers and small businesses who'd rather
            spend time on their craft than on admin work.
          </p>
        </section>

        {/* The Story */}
        <section className="max-w-3xl mx-auto px-6 pb-20">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
              The Story
            </h2>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                Invoice Studio started with a simple frustration: creating a
                single invoice shouldn't require signing up, filling out endless
                forms, or handing over your data to yet another SaaS platform.
              </p>
              <p>
                We wanted a tool that just works — open it, type a few details,
                download a professional PDF, and get back to work.
              </p>
              <p>
                So we built it. Fast, private, and free to start. No bloat, no
                dark patterns, no hidden tricks.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              What we stand for
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Three principles that guide every decision we make.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Value 1 */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Speed Matters</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every second wasted on admin is a second not spent creating.
                We obsess over making every interaction faster than the last.
              </p>
            </div>

            {/* Value 2 */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Privacy by Default</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your business data is yours. We don't track you, we don't sell
                your information, and we give you control over what's stored.
              </p>
            </div>

            {/* Value 3 */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">✋</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Honest Pricing</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                No hidden fees, no forced subscriptions. Start free, and only
                upgrade if you actually need more. Simple as that.
              </p>
            </div>
          </div>
        </section>

        {/* Built With — Tech Transparency */}
        <section className="max-w-3xl mx-auto px-6 pb-20">
          <div className="bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
              Built with modern tools
            </h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              We believe in using tools that are fast, safe, and built to last.
              Here's what powers Invoice Studio:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Next.js", icon: "▲" },
                { name: "React", icon: "⚛" },
                { name: "TypeScript", icon: "TS" },
                { name: "Tailwind", icon: "🎨" },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-colors"
                >
                  <div className="text-2xl mb-2">{tech.icon}</div>
                  <div className="text-sm font-medium text-slate-300">
                    {tech.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="max-w-3xl mx-auto px-6 pb-20">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-10 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-blue-500/50 mx-auto mb-4">
            <Image
              src="/chinthaka.jpg"
              alt="Chinthaka — Founder of Invoice Studio"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight">
              Hi, I'm Chinthaka 👋
            </h2>
            <p className="text-sm text-blue-400 mb-4">Founder & Developer</p>
            <p className="text-slate-400 leading-relaxed max-w-xl mx-auto">
              I'm a developer from Sri Lanka who got tired of bloated invoicing
              software. I built Invoice Studio to be the tool I always wanted —
              fast, simple, and respectful of your time and privacy.
            </p>
            <div className="flex justify-center gap-4 mt-6 text-sm">
              <a
                href="mailto:prabhathchinthaka42@gmail.com"
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
              >
                📧 prabhathchinthaka42@gmail.com
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
            Ready to try it?
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Open the app and create your first invoice in seconds.
          </p>
          <Link
            href="/app"
            className="inline-block px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-2xl shadow-blue-500/30"
          >
            🚀 Open Invoice Studio
          </Link>
        </section>

        <Footer />
      </div>
    </div>
  );
}