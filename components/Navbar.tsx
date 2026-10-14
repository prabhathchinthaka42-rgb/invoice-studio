"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

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

      {/* Right side — Auth-aware */}
      <div className="flex items-center gap-3">
        {loading ? (
          // Loading placeholder — empty space
          <div className="w-24 h-9 bg-white/5 rounded-lg animate-pulse" />
        ) : user ? (
          <>
            <Link
              href="/app"
              className="px-4 py-2 text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all"
            >
              Open App →
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-white text-slate-900 rounded-lg hover:bg-blue-50 transition-all"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}