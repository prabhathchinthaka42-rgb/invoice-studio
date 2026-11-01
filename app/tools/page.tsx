"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { User } from "@supabase/supabase-js";

export default function ToolsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        router.push("/login");
        return;
      }
      
      setUser(currentUser);

      // Check if user is Pro
      const { data: companyData } = await supabase
        .from("companies")
        .select("plan")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (companyData?.plan === "pro") {
        setIsPro(true);
      }
      
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="animate-pulse">Checking access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[140px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-5xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              🛠️ Extra Tools
            </h1>
            <p className="text-lg text-slate-400">
              Powerful utilities to speed up your business workflow.
            </p>
          </div>

          {!isPro ? (
            /* ⭐ Free User Lock Screen */
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-center max-w-2xl mx-auto mt-10">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔒</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Pro Feature Only</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                The Tools tab is exclusive to Pro members. Upgrade your plan to unlock the Quote Generator, Receipt Maker, and other upcoming tools.
              </p>
              <Link
                href="/app"
                className="inline-block px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-blue-50 transition-all hover:scale-105"
              >
                Upgrade to Pro — $5/month
              </Link>
            </div>
          ) : (
            /* ⭐ Pro User - Tools Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tool 1: Quote Generator */}
              <Link href="/tools/quote" className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📝</span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">Quote Generator</h3>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Available</span>
                </div>
                <p className="text-sm text-slate-400">
                  Create professional estimates and quotes for your clients instantly.
                </p>
              </Link>

              {/* Tool 2: Receipt Maker */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors cursor-not-allowed group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🧾</span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">Receipt Maker</h3>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">Coming Soon</span>
                </div>
                <p className="text-sm text-slate-400">
                  Generate payment receipts for your customers with just a few clicks.
                </p>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}