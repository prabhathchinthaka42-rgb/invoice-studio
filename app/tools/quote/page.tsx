"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { User } from "@supabase/supabase-js";

// ⭐ මේක අලුතෙන් දැම්මා Company Details ටයිප් එක
type CompanyInfo = {
  name: string;
  address: string;
  email: string;
  phone: string;
  logo: string;
};

export default function QuoteGeneratorPage() {
  const quoteRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null); // ⭐ Company State එක
  
  const [clientName, setClientName] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("QTE-001");
  const [quoteDate, setQuoteDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [items, setItems] = useState([{ id: "1", description: "", quantity: 1, rate: 0 }]);
  const [copied, setCopied] = useState(false);

  // ⭐ මේකෙන් තමයි Company විස්තර Supabase එකෙන් ගන්නේ
  useEffect(() => {
    const loadCompany = async () => {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        setUser(currentUser);
        const { data: compData } = await supabase
          .from("companies")
          .select("name, address, email, phone, logo")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (compData) {
          setCompany(compData);
        }
      }
    };
    loadCompany();
  }, []);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setItems(newItems);
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);

  const downloadPDF = async () => {
    if (!quoteRef.current) return;
    const html2pdf = (await import("html2pdf.js")).default;
    const opt = {
      margin: 0,
      filename: `${quoteNumber || "quote"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };
    html2pdf().set(opt).from(quoteRef.current).save();
  };

  const copyText = async () => {
    const itemLines = items
      .filter((item) => item.description.trim() !== "")
      .map(
        (item) =>
          `${item.description}\n  ${item.quantity} × $${item.rate.toLocaleString()} = $${(
            item.quantity * item.rate
          ).toLocaleString()}`
      )
      .join("\n\n");

    const text = `📝 QUOTE #${quoteNumber || "QTE-001"}

From: ${company?.name || "Your Company"}

Prepared For: ${clientName || "(no client)"}

──────────────────
${itemLines || "(no items)"}
──────────────────

TOTAL: $${total.toLocaleString()}

Date: ${quoteDate || "—"}
Valid Until: ${validUntil || "—"}

Thank you!`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[140px] opacity-20 pointer-events-none" />
      
      <div className="relative z-10">
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
          <Link href="/tools" className="text-sm text-slate-400 hover:text-white mb-6 inline-block">
            ← Back to Tools
          </Link>

          <h1 className="text-3xl font-bold mb-8">📝 Quote Generator</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-200">Quote Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Client Name</label>
                  <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="Enter client name" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Quote Number</label>
                    <input type="text" value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Quote Date</label>
                    <input type="date" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Valid Until</label>
                  <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]" />
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-slate-200">Line Items</h3>
                    <button onClick={addItem} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white font-medium">+ Add Item</button>
                  </div>

                  {items.map((item, index) => (
                    <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-3 relative">
                      {items.length > 1 && (
                        <button onClick={() => removeItem(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xs">✕</button>
                      )}
                      <input type="text" value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white mb-2 text-sm" placeholder="Description" />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm" placeholder="Qty" />
                        <input type="number" value={item.rate} onChange={(e) => updateItem(index, "rate", Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm" placeholder="Rate" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex justify-end gap-2">
                <button onClick={copyText} className={`px-4 py-2 font-medium rounded-lg transition-colors ${copied ? "bg-green-100 text-green-800 border border-green-300" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}>
                  {copied ? "✓ Copied!" : "📋 Copy Quote"}
                </button>
                <button onClick={downloadPDF} className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                  ⬇ Download PDF
                </button>
              </div>

              <div ref={quoteRef} className="pdf-quote bg-white rounded-xl p-8 text-slate-900 shadow-2xl">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    {/* ⭐ මෙතන තමයි Company විස්තර දාන්නේ */}
                    {company?.logo && (
                      <img src={company.logo} alt="Logo" className="h-12 max-w-[150px] object-contain mb-3" />
                    )}
                    <h2 className="text-2xl font-bold">{company?.name || "Your Company"}</h2>
                    <p className="text-sm text-slate-500 mt-1 whitespace-pre-line">{company?.address || "123 Business Street, Colombo"}</p>
                    {company?.email && <p className="text-sm text-slate-500 mt-1">{company.email}</p>}
                    {company?.phone && <p className="text-sm text-slate-500">{company.phone}</p>}
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-bold text-blue-600 tracking-tight">QUOTE</h1>
                    <p className="text-sm text-slate-500 mt-2 font-mono">#{quoteNumber || "QTE-001"}</p>
                  </div>
                </div>

                <div className="flex justify-between mb-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Prepared For</p>
                    <p className="font-semibold">{clientName || "Client Name"}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p><span className="text-slate-500">Date: </span>{quoteDate || "—"}</p>
                    <p><span className="text-slate-500">Valid Until: </span>{validUntil || "—"}</p>
                  </div>
                </div>

                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b-2 border-slate-800">
                      <th className="text-left py-2 text-xs font-bold text-slate-400 uppercase">Description</th>
                      <th className="text-right py-2 text-xs font-bold text-slate-400 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200">
                        <td className="py-3 text-sm">
                          {item.description || "(no description)"} <br/>
                          <span className="text-xs text-slate-500">{item.quantity} × ${item.rate.toLocaleString()}</span>
                        </td>
                        <td className="py-3 text-sm text-right font-medium">${(item.quantity * item.rate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-48 border-t-2 border-slate-800 pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}