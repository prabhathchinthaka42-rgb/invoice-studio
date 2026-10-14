"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CompanySettings, { type CompanyInfo } from "@/components/CompanySettings";
import type { User } from "@supabase/supabase-js";

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

type SavedInvoice = {
  id: string;
  clientName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: LineItem[];
  status: "pending" | "paid";
  createdAt: number;
};

type DBInvoiceRow = {
  id: string;
  user_id: string;
  client_name: string;
  invoice_number: string;
  invoice_date: string | null;
  due_date: string | null;
  items: LineItem[];
  status: "pending" | "paid";
  created_at: string;
  updated_at: string;
};

type DBCompanyRow = {
  id: string;
  user_id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  brand_color: string;
  bank_name: string;
  bank_account: string;
  payment_terms: string;
  logo: string;
};

const DEFAULT_ITEMS: LineItem[] = [
  { id: "item-1", description: "", quantity: 1, rate: 0 },
];

const DEFAULT_COMPANY: CompanyInfo = {
  name: "Your Company",
  address: "123 Business Street\nColombo, Sri Lanka",
  email: "",
  phone: "",
  brandColor: "#2563eb",
  bankName: "",
  bankAccount: "",
  paymentTerms: "Payment due within 14 days",
  logo: "",
};

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
}

function dbToSavedInvoice(row: DBInvoiceRow): SavedInvoice {
  return {
    id: row.id,
    clientName: row.client_name,
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date ?? "",
    dueDate: row.due_date ?? "",
    items: row.items ?? [],
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function dbToCompany(row: DBCompanyRow): CompanyInfo {
  return {
    name: row.name,
    address: row.address,
    email: row.email,
    phone: row.phone,
    brandColor: row.brand_color,
    bankName: row.bank_name,
    bankAccount: row.bank_account,
    paymentTerms: row.payment_terms,
    logo: row.logo,
  };
}

function companyToDb(company: CompanyInfo, userId: string) {
  return {
    user_id: userId,
    name: company.name,
    address: company.address,
    email: company.email,
    phone: company.phone,
    brand_color: company.brandColor,
    bank_name: company.bankName,
    bank_account: company.bankAccount,
    payment_terms: company.paymentTerms,
    logo: company.logo,
  };
}

export default function Home() {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [showSettings, setShowSettings] = useState(false);

  const [clientName, setClientName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<LineItem[]>(DEFAULT_ITEMS);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);

  const [copied, setCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // ============================================
  // Load user + invoices + company from Supabase
  // ============================================
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        // Load invoices
        const { data: invData, error: invError } = await supabase
          .from("invoices")
          .select("*")
          .order("created_at", { ascending: false });

        if (invError) {
          console.error("Load invoices failed:", invError);
          setError("Failed to load invoices");
        } else if (invData) {
          setSavedInvoices(invData.map((row) => dbToSavedInvoice(row)));
        }

        // Load company
        const { data: compData } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (compData) {
          setCompany(dbToCompany(compData));
        } else {
          // No company yet — create default one
          const { data: newComp } = await supabase
            .from("companies")
            .insert({
              ...companyToDb(DEFAULT_COMPANY, currentUser.id),
              email: currentUser.email ?? "",
            })
            .select()
            .single();

          if (newComp) {
            setCompany(dbToCompany(newComp));
          }
        }
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  // ============================================
  // Reset form when user changes
  // ============================================
  useEffect(() => {
    if (!isLoaded) return;
    setClientName("");
    setInvoiceNumber("INV-001");
    setInvoiceDate("");
    setDueDate("");
    setItems(DEFAULT_ITEMS);
    setCurrentInvoiceId(null);
    setError("");
  }, [user?.id, isLoaded]);

  // ============================================
  // Item handlers
  // ============================================
  const updateItem = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );

  // ============================================
  // Save Company (called from CompanySettings modal)
  // ============================================
  const saveCompany = async (newCompany: CompanyInfo) => {
    if (!user) return;

    // Optimistic update
    setCompany(newCompany);

    const supabase = createClient();
    const { error: saveError } = await supabase
      .from("companies")
      .upsert(companyToDb(newCompany, user.id), {
        onConflict: "user_id",
      });

    if (saveError) {
      console.error("Save company failed:", saveError);
      setError("Failed to save company settings");
    }
  };

  // ============================================
  // Save Invoice
  // ============================================
  const saveInvoice = async () => {
    if (!user) {
      setError("You must be logged in to save");
      return;
    }

    setSaving(true);
    setError("");

    const supabase = createClient();

    const invoiceData = {
      client_name: clientName,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate || null,
      due_date: dueDate || null,
      items,
      user_id: user.id,
    };

    try {
      if (currentInvoiceId) {
        const { data, error: updateError } = await supabase
          .from("invoices")
          .update(invoiceData)
          .eq("id", currentInvoiceId)
          .select()
          .single();

        if (updateError) throw updateError;

        if (data) {
          const updated = dbToSavedInvoice(data);
          setSavedInvoices(
            savedInvoices.map((inv) =>
              inv.id === currentInvoiceId ? updated : inv
            )
          );
        }
      } else {
        const { data, error: insertError } = await supabase
          .from("invoices")
          .insert(invoiceData)
          .select()
          .single();

        if (insertError) throw insertError;

        if (data) {
          const newInv = dbToSavedInvoice(data);
          setSavedInvoices([newInv, ...savedInvoices]);
          setCurrentInvoiceId(newInv.id);
        }
      }

      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      console.error("Save failed:", err);
      setError(err instanceof Error ? err.message : "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const newInvoice = () => {
    if (
      !confirm(
        "නව invoice එකක් පටන් ගන්නද? දැනට save නොකරපු දේවල් නැති වෙයි."
      )
    )
      return;

    setClientName("");
    setInvoiceNumber("INV-001");
    setInvoiceDate("");
    setDueDate("");
    setItems(DEFAULT_ITEMS);
    setCurrentInvoiceId(null);
    setError("");
  };

  const loadInvoice = (invoice: SavedInvoice) => {
    setClientName(invoice.clientName);
    setInvoiceNumber(invoice.invoiceNumber);
    setInvoiceDate(invoice.invoiceDate);
    setDueDate(invoice.dueDate);
    setItems(invoice.items);
    setCurrentInvoiceId(invoice.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("මේ invoice එක delete කරන්නද?")) return;

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Delete failed:", deleteError);
      setError("Failed to delete invoice");
      return;
    }

    setSavedInvoices(savedInvoices.filter((inv) => inv.id !== id));
    if (currentInvoiceId === id) {
      setCurrentInvoiceId(null);
    }
  };

  const toggleStatus = async (id: string) => {
    const target = savedInvoices.find((inv) => inv.id === id);
    if (!target) return;

    const newStatus = target.status === "paid" ? "pending" : "paid";

    setSavedInvoices(
      savedInvoices.map((inv) =>
        inv.id === id ? { ...inv, status: newStatus } : inv
      )
    );

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", id);

    if (updateError) {
      console.error("Toggle failed:", updateError);
      setSavedInvoices(
        savedInvoices.map((inv) =>
          inv.id === id ? { ...inv, status: target.status } : inv
        )
      );
      setError("Failed to update status");
    }
  };

  // ============================================
  // PDF / Copy
  // ============================================
  const downloadPDF = async () => {
    if (!invoiceRef.current) return;
    const html2pdf = (await import("html2pdf.js")).default;
    const opt = {
      margin: 0,
      filename: `${invoiceNumber || "invoice"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };
    html2pdf().set(opt).from(invoiceRef.current).save();
  };

  const copyInvoiceText = async () => {
    const itemLines = items
      .filter((item) => item.description.trim() !== "")
      .map(
        (item) =>
          `${item.description}\n  ${item.quantity} × ${item.rate.toLocaleString()} = ${(
            item.quantity * item.rate
          ).toLocaleString()}`
      )
      .join("\n\n");

    const text = `🧾 INVOICE #${invoiceNumber || "INV-001"}

From: ${company.name}

Bill To: ${clientName || "(no client)"}

──────────────────
${itemLines || "(no items)"}
──────────────────

TOTAL: ${total.toLocaleString()}

Issue Date: ${formatDate(invoiceDate)}
Due Date: ${formatDate(dueDate)}

${company.paymentTerms}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🧾 Invoice Studio
            </h1>
            <p className="text-gray-600">
              {user?.email
                ? `Signed in as ${user.email}`
                : "Create invoices in seconds"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="text-sm px-3 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium"
            >
              ⚙️ Settings
            </button>
            <button
              onClick={newInvoice}
              className="text-sm px-3 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium"
            >
              ✨ New
            </button>
            <button
              onClick={saveInvoice}
              disabled={saving}
              className={`text-sm px-4 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 ${
                justSaved
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {saving
                ? "Saving..."
                : justSaved
                ? "✓ Saved!"
                : "💾 Save Invoice"}
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700 text-lg leading-none"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Invoice Details
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Line Items
                </h3>
                <button
                  onClick={addItem}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add Item
                </button>
              </div>

              {items.map((item, index) => (
                <div key={item.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500">Item #{index + 1}</p>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    placeholder="Description (e.g. Web Design)"
                    className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                      placeholder="Qty"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(index, "rate", Number(e.target.value))
                      }
                      placeholder="Rate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="text-right text-xs text-gray-600">
                    Line total:{" "}
                    <span className="font-semibold text-gray-900">
                      {(item.quantity * item.rate).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Invoice Document */}
          <div>
            <div className="mb-3 flex justify-end gap-2">
              <button
                onClick={copyInvoiceText}
                className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                  copied
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {copied ? "✓ Copied!" : "📋 Copy Invoice"}
              </button>
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                ⬇ Download PDF
              </button>
            </div>

            <div
              ref={invoiceRef}
              className="pdf-invoice bg-white shadow-xl rounded-lg p-10 text-gray-900"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  {company.logo && (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-16 max-w-[200px] object-contain mb-3"
                    />
                  )}
                  <h2 className="text-2xl font-bold">{company.name}</h2>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                    {company.address}
                  </p>
                  {company.email && (
                    <p className="text-sm text-gray-600 mt-1">
                      {company.email}
                    </p>
                  )}
                  {company.phone && (
                    <p className="text-sm text-gray-600">{company.phone}</p>
                  )}
                </div>
                <div className="text-right">
                  <h1
                    className="text-4xl font-bold tracking-tight"
                    style={{ color: company.brandColor }}
                  >
                    INVOICE
                  </h1>
                  <p className="text-sm text-gray-600 mt-2 font-mono">
                    #{invoiceNumber || "INV-001"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between mb-8">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Bill To
                  </p>
                  <p className="font-semibold text-base">
                    {clientName || "Client Name"}
                  </p>
                  <p className="text-sm text-gray-600">Client Address</p>
                  <p className="text-sm text-gray-600">Client City</p>
                </div>
                <div className="text-right text-sm space-y-2">
                  <div>
                    <span className="text-gray-500">Issue Date: </span>
                    <span className="font-medium">
                      {formatDate(invoiceDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date: </span>
                    <span className="font-medium">{formatDate(dueDate)}</span>
                  </div>
                </div>
              </div>

              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-3 text-xs uppercase tracking-wider font-semibold">
                      Description
                    </th>
                    <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">
                      Qty
                    </th>
                    <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">
                      Rate
                    </th>
                    <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3 text-sm">
                        {item.description || (
                          <span className="text-gray-400 italic">
                            (no description)
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-sm text-right tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-sm text-right tabular-nums">
                        {item.rate.toLocaleString()}
                      </td>
                      <td className="py-3 text-sm text-right tabular-nums font-medium">
                        {(item.quantity * item.rate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-10">
                <div className="w-64">
                  <div className="flex justify-between py-3 font-bold text-lg border-b-2 border-gray-800">
                    <span>Total</span>
                    <span
                      className="tabular-nums"
                      style={{ color: company.brandColor }}
                    >
                      {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {(company.bankName || company.bankAccount) && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Payment Details
                  </p>
                  {company.bankName && (
                    <p className="text-sm text-gray-700">
                      Bank:{" "}
                      <span className="font-medium">{company.bankName}</span>
                    </p>
                  )}
                  {company.bankAccount && (
                    <p className="text-sm text-gray-700">
                      Account:{" "}
                      <span className="font-medium font-mono">
                        {company.bankAccount}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className="border-t border-gray-200 pt-6 mt-8 text-center">
                <p className="text-sm font-medium text-gray-700">
                  Thank you for your business!
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {company.paymentTerms}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              📁 Saved Invoices
              {savedInvoices.length > 0 && (
                <span className="ml-2 text-base font-normal text-gray-500">
                  ({savedInvoices.length})
                </span>
              )}
            </h2>
          </div>

          {savedInvoices.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              තාම invoices save කරලා නෑ. උඩ &quot;💾 Save Invoice&quot; button එක ඔබන්න!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedInvoices.map((inv) => {
                const invTotal = inv.items.reduce(
                  (sum, item) => sum + item.quantity * item.rate,
                  0
                );
                const isActive = currentInvoiceId === inv.id;

                return (
                  <div
                    key={inv.id}
                    className={`bg-white rounded-lg shadow p-4 transition-all cursor-pointer hover:shadow-lg ${
                      isActive ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => loadInvoice(inv)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-mono text-sm font-semibold text-gray-900">
                        #{inv.invoiceNumber}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteInvoice(inv.id);
                        }}
                        className="text-gray-400 hover:text-red-600 text-sm"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-base font-medium text-gray-900 truncate">
                      {inv.clientName || "(no client)"}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(inv.createdAt).toLocaleDateString()}
                    </p>

                    <div className="mt-3 flex justify-between items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(inv.id);
                        }}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          inv.status === "paid"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        }`}
                      >
                        {inv.status === "paid" ? "✓ Paid" : "● Pending"}
                      </button>
                      <p className="text-lg font-bold text-blue-600">
                        {invTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Company Settings Modal */}
      {showSettings && (
        <CompanySettings
          company={company}
          onSave={saveCompany}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}