import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Free Invoice Generator — Create Professional Invoices in Seconds",
  description:
    "Create beautiful, professional invoices in seconds. Free to start, no signup required. Set up your company once and generate invoices instantly.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background: Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[140px] opacity-25 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-25" />
      <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[130px] opacity-20" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10">
        {/* ⭐ Navbar (component) */}
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Free to start · No credit card required
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Invoices in seconds,
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-200 bg-clip-text text-transparent">
              not minutes.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-4 font-light">
            Set Up Once, Generate in Seconds
          </p>

          <p className="text-base text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Professional invoices for freelancers and small businesses.
            Fast, simple, and ready in seconds — no complicated setup.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/app"
              className="group relative px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-blue-50 transition-all hover:scale-[1.03] shadow-2xl shadow-blue-500/30"
            >
              <span className="relative z-10">
                🚀 Start Creating{" "}
                <span className="inline-block group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </span>
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-white/5 backdrop-blur-sm text-white border border-white/20 font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 mt-16 text-sm text-slate-500 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Free to try
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> No credit card
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Instant PDF
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Setup in 1 minute
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto px-6 pb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Everything you need.
              <br />
              <span className="text-slate-500">Nothing you don't.</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Built for speed and simplicity — so you can focus on your work,
              not your invoice software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Set up your company once. Generate professional invoices in
                under 5 seconds — no forms to refill, no data to re-enter.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your data stays in your browser. No tracking, no selling your
                information — complete control over your business data.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant PDF</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Beautiful, professional PDFs generated instantly in your browser.
                Download, share, or copy as text — ready for WhatsApp or email.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-3xl mx-auto px-6 pb-32 text-center">
          <div className="relative bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Ready to try it?
              </h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                No credit card required. No signup needed to start. Just open
                the app and create your first invoice in seconds.
              </p>
              <Link
                href="/app"
                className="inline-block px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-2xl shadow-blue-500/30"
              >
                🚀 Open Invoice Studio
              </Link>
            </div>
          </div>
        </section>

        {/* ⭐ Footer (component) */}
        <Footer />
      </div>
    </div>
  );
}