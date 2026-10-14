"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestSupabasePage() {
  const [status, setStatus] = useState("Click the button to test");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus("Testing...");

    try {
      const supabase = createClient();
      // Simple health check — try to get session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setStatus(`❌ Error: ${error.message}`);
      } else {
        setStatus(`✅ Connected! Session: ${data.session ? "Exists" : "None (not logged in yet — OK)"}`);
      }
    } catch (err) {
      setStatus(`❌ Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🧪 Supabase Connection Test
        </h1>

        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium mb-4"
        >
          {loading ? "Testing..." : "Test Connection"}
        </button>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{status}</p>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          This page is for development testing only. Delete it before production.
        </p>
      </div>
    </div>
  );
}