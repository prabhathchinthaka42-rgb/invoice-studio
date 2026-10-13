import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, honest pricing. Start free with 5 invoices per month, or upgrade to Pro for unlimited invoices and premium features at just $5/month.",
  alternates: {
    canonical: "/pricing",
  },
};

const FREE_FEATURES = [
  { text: "5 invoices per month", included: true },
  { text: "Basic PDF export", included: true },
  { text: "Copy to clipboard", included: true },
  { text: "3 saved invoices", included: true },
  { text: "Company logo", included: false },
  { text: "Custom brand colors", included: false },
  { text: "Watermark-free invoices", included: false },
  { text: "Tools tab access", included: false },
];

const PRO_FEATURES = [
  { text: "Unlimited invoices", included: true },
  { text: "Basic PDF export", included: true },
  { text: "Copy to clipboard", included: true },
  { text: "Unlimited saved invoices", included: true },
  { text: "Company logo", included: true },
  { text: "Custom brand colors", included: true },
  { text: "Watermark-free invoices", included: true },
  { text: "Tools tab access", included: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[140px] opacity-20" />
      <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20" />

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
            Pricing
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Simple, honest,
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-200 bg-clip-text text-transparent">
              and affordable.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Start free, upgrade when you need more. No hidden fees, no
            surprises — just a tool that works.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FREE PLAN */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <p className="text-sm text-slate-400">
                  Perfect for trying things out
                </p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-slate-400 ml-2">/ month</span>
              </div>

              <Link
                href="/app"
                className="w-full py-3 text-center bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors font-medium mb-8"
              >
                Start Free
              </Link>

              <ul className="space-y-3 flex-1">
                {FREE_FEATURES.map((feature) => (
                  <li
                    key={feature.text}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs mt-0.5 ${
                        feature.included
                          ? "bg-green-500/20 text-green-400"
                          : "bg-slate-700/50 text-slate-500"
                      }`}
                    >
                      {feature.included ? "✓" : "✕"}
                    </span>
                    <span
                      className={
                        feature.included
                          ? "text-slate-300"
                          : "text-slate-500 line-through"
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PRO PLAN — Highlighted */}
            <div className="relative bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm border-2 border-blue-500/50 rounded-2xl p-8 flex flex-col">
              {/* "Most Popular" Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-xs font-semibold tracking-wider uppercase shadow-lg shadow-blue-500/30">
                ⭐ Most Popular
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-sm text-slate-400">
                  For professionals & growing businesses
                </p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold">$5</span>
                <span className="text-slate-400 ml-2">/ month</span>
              </div>

              <Link
                href="/app"
                className="w-full py-3 text-center bg-white text-slate-900 rounded-lg hover:bg-blue-50 transition-all font-semibold mb-8 shadow-2xl shadow-blue-500/30"
              >
                🚀 Upgrade to Pro
              </Link>

              <ul className="space-y-3 flex-1">
                {PRO_FEATURES.map((feature) => (
                  <li
                    key={feature.text}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs mt-0.5 bg-green-500/20 text-green-400">
                      ✓
                    </span>
                    <span className="text-slate-300">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 pb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center tracking-tight">
            Frequently asked questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "What happens after 5 invoices on the Free plan?",
                a: "You can still view and download your existing invoices, but you'll need to upgrade to Pro to create new ones. Your data is never deleted.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes — Pro is a month-to-month subscription. Cancel anytime, and you'll keep Pro access until the end of your billing period.",
              },
              {
                q: "Is my data safe?",
                a: "Your invoice data stays in your browser by default. We don't sell or share your information with third parties.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes — if you're not satisfied within 14 days, we'll refund your Pro subscription, no questions asked.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit and debit cards through Stripe. Payments are secure and encrypted.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-colors"
              >
                <summary className="cursor-pointer px-6 py-4 font-medium flex justify-between items-center list-none">
                  <span>{faq.q}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-sm text-slate-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
            Still have questions?
          </h2>
          <p className="text-slate-400 mb-8">
            We're happy to help. Get in touch.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 font-semibold rounded-lg hover:bg-white/20 transition-colors"
          >
            📧 Contact Us
          </Link>
        </section>

        <Footer />
      </div>
    </div>
  );
}