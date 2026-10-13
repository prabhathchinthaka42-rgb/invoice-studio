"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  message?: string;
};

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormData, value: string) => {
    setForm({ ...form, [field]: value });
    // Clear error for this field when user types
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Please enter your name";
    }

    if (!form.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.message.trim()) {
      newErrors.message = "Please enter a message";
    } else if (form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Build mailto link
    const subject = form.subject.trim() || "Contact from Invoice Studio";
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    const mailtoLink = `mailto:prabhathchinthaka42@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm(INITIAL_FORM);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[140px] opacity-20" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] opacity-20" />

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
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
          <p className="text-sm font-medium text-blue-400 mb-4 tracking-wider uppercase">
            Contact
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Get in touch.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Have a question, feedback, or feature request? We'd love to hear
            from you.
          </p>
        </section>

        {/* Form + Info */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form (2/3) */}
            <div className="lg:col-span-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              {submitted ? (
                /* Success State */
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✓</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Thank you!
                  </h3>
                  <p className="text-slate-400">
                    Your email client should have opened with your message
                    ready to send.
                  </p>
                </div>
              ) : (
                /* Form State */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Your name"
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors ${
                        errors.name
                          ? "border-red-500/50"
                          : "border-white/10"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-400 mt-1.5">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors ${
                        errors.email
                          ? "border-red-500/50"
                          : "border-white/10"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-400 mt-1.5">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      placeholder="What's this about? (optional)"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Tell us what's on your mind..."
                      rows={6}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors resize-none ${
                        errors.message
                          ? "border-red-500/50"
                          : "border-white/10"
                      }`}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-400 mt-1.5">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-blue-50 transition-all hover:scale-[1.01] shadow-2xl shadow-blue-500/20"
                  >
                    Send Message →
                  </button>
                </form>
              )}
            </div>

            {/* Info Sidebar (1/3) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Email */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4">
                  <span className="text-xl">📧</span>
                </div>
                <h3 className="font-semibold mb-1">Email</h3>
                <a
                  href="mailto:prabhathchinthaka42@gmail.com"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors break-all"
                >
                  prabhathchinthaka42@gmail.com
                </a>
              </div>

              {/* Location */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                  <span className="text-xl">📍</span>
                </div>
                <h3 className="font-semibold mb-1">Location</h3>
                <p className="text-sm text-slate-400">
                  Colombo, Sri Lanka
                </p>
              </div>

              {/* Response Time */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
                  <span className="text-xl">⏱️</span>
                </div>
                <h3 className="font-semibold mb-1">Response Time</h3>
                <p className="text-sm text-slate-400">
                  Usually within 24 hours
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}