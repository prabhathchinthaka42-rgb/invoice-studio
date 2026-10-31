"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CompanySettings, { type CompanyInfo } from "@/components/CompanySettings";
import {
  canCreateInvoice,
  countInvoicesThisMonth,
  getLimitMessage,
  getRemainingInvoices,
} from "@/lib/plan-limits";
import type { User } from "@supabase/supabase-js";

// ============================================
// Types
// ============================================
type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

type SavedInvoice = {
  id: string;
  clientName: string;
  clientAddress: string;
  clientCity: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: LineItem[];
  status: "pending" | "paid";
  createdAt: number;
  deletedAt: number | null;
  currency: string; // ⭐ NEW
};

type DBInvoiceRow = {
  id: string;
  user_id: string;
  client_name: string;
  client_address: string;
  client_city: string;
  invoice_number: string;
  invoice_date: string | null;
  due_date: string | null;
  items: LineItem[];
  status: "pending" | "paid";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  currency: string; // ⭐ NEW
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
  plan: "free" | "pro";
  pro_since: string | null;
};

// ============================================
// Constants
// ============================================
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
  plan: "free",
};

const DODO_PRODUCT_ID = "pdt_0NpmLub4sWRnkMX96ubJB"; // ⚠️ Live mode එකේදී වෙනස් කරන්න

const CURRENCIES = [
  { code: "USD", label: "USD ($)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "LKR", label: "LKR (Rs)" },
  { code: "INR", label: "INR (₹)" },
  { code: "AUD", label: "AUD ($)" },
  { code: "CAD", label: "CAD ($)" },
];

// ============================================
// Helper Functions
// ============================================
function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
}

// ⭐ NEW: Format numbers with currency
function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch (e) {
    return `${currency || "USD"} ${amount.toLocaleString()}`;
  }
}

function dbToSavedInvoice(row: DBInvoiceRow): SavedInvoice {
  return {
    id: row.id,
    clientName: row.client_name,
    clientAddress: row.client_address ?? "",
    clientCity: row.client_city ?? "",
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date ?? "",
    dueDate: row.due_date ?? "",
    items: row.items ?? [],
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
    deletedAt: row.deleted_at ? new Date(row.deleted_at).getTime() : null,
    currency: row.currency || "USD", // ⭐ NEW
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
    plan: row.plan,
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

// ============================================
// Main Component
// ============================================
export default function Home() {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("USD"); // ⭐ NEW
  const [items, setItems] = useState<LineItem[]>(DEFAULT_ITEMS);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);

  const [copied, setCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [referenceTime, setReferenceTime] = useState(0);

  // ============================================
  // Derived Values
  // ============================================
  const isPro = company.plan === "pro";
  const monthlyCount = countInvoicesThisMonth(savedInvoices, referenceTime);
  const remaining = getRemainingInvoices(company.plan, monthlyCount);
  const canSave = canCreateInvoice(company.plan, monthlyCount);
  const limitMessage = getLimitMessage(company.plan, monthlyCount);
  const visibleInvoices = savedInvoices.filter((inv) => inv.deletedAt === null);

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    setReferenceTime(Date.now());
    const interval = setInterval(() => setReferenceTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
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

        const { data: compData } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (compData) {
          setCompany(dbToCompany(compData));
        } else {
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

  useEffect(() => {
    if (!isLoaded) return;
    setClientName("");
    setClientAddress("");
    setClientCity("");
    setInvoiceNumber("INV-001");
    setInvoiceDate("");
    setDueDate("");
    setCurrency("USD"); // Reset currency
    setItems(DEFAULT_ITEMS);
    setCurrentInvoiceId(null);
    setError("");
  }, [user?.id, isLoaded]);

  // ============================================
  // Item Handlers
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
  // Upgrade Handler (Dodo Checkout)
  // ============================================
  const handleUpgrade = async () => {
    if (!user?.email) {
      alert("Please sign in first");
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_cart: [
            {
              product_id: DODO_PRODUCT_ID,
              quantity: 1,
            },
          ],
          customer: {
            email: user.email,
          },
        }),
      });

      const data = await response.json();
      console.log("Checkout response:", data);

      const checkoutUrl = data.checkout_url || data.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        alert("Failed to create checkout session. Check console for details.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  // ============================================
  // Save Company
  // ============================================
  const saveCompany = async (newCompany: CompanyInfo) => {
    if (!user) return;
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

    if (!currentInvoiceId && !canSave) {
      setShowUpgradeModal(true);
      return;
    }

    setSaving(true);
    setError("");

    const supabase = createClient();

    const invoiceData = {
      client_name: clientName,
      client_address: clientAddress,
      client_city: clientCity,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate || null,
      due_date: dueDate || null,
      currency: currency, // ⭐ NEW
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
        "Start a new invoice? Any unsaved changes will be lost."
      )
    )
      return;

    setClientName("");
    setClientAddress("");
    setClientCity("");
    setInvoiceNumber("INV-001");
    setInvoiceDate("");
    setDueDate("");
    setCurrency("USD");
    setItems(DEFAULT_ITEMS);
    setCurrentInvoiceId(null);
    setError("");
  };

  const loadInvoice = (invoice: SavedInvoice) => {
    setClientName(invoice.clientName);
    setClientAddress(invoice.clientAddress);
    setClientCity(invoice.clientCity);
    setInvoiceNumber(invoice.invoiceNumber);
    setInvoiceDate(invoice.invoiceDate);
    setDueDate(invoice.dueDate);
    setCurrency(invoice.currency); // ⭐ NEW
    setItems(invoice.items);
    setCurrentInvoiceId(invoice.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    const supabase = createClient();
    const { data, error: deleteError } = await supabase
      .from("invoices")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (deleteError) {
      console.error("Delete failed:", deleteError);
      setError("Failed to delete invoice");
      return;
    }

    if (data) {
      setSavedInvoices(
        savedInvoices.map((inv) =>
          inv.id === id ? dbToSavedInvoice(data) : inv
        )
      );
      if (currentInvoiceId === id) {
        setCurrentInvoiceId(null);
      }
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

    if (!currentInvoiceId && !canSave) {
      setShowUpgradeModal(true);
      return;
    }

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
          `${item.description}\n  ${item.quantity} × ${formatMoney(item.rate, currency)} = ${formatMoney(
            item.quantity * item.rate, currency
          )}`
      )
      .join("\n\n");

    const watermark = !isPro ? "\n\n— Made with Invoice Studio —" : "";

    const text = `🧾 INVOICE #${invoiceNumber || "INV-001"}

From: ${company.name}

Bill To: ${clientName || "(no client)"}

──────────────────
${itemLines || "(no items)"}
──────────────────

TOTAL: ${formatMoney(total, currency)}

Issue Date: ${formatDate(invoiceDate)}
Due Date: ${formatDate(dueDate)}

${company.paymentTerms}${watermark}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================
  // Loading State
  // ============================================
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // ============================================
  // Render
  // ============================================
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                🧾 Invoice Studio
              </h1>
              {isPro ? (
                <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold">
                  ⭐ PRO
                </span>
              ) : (
                <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-medium">
                  Free
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mt-1">
              {user?.email
                ? `Signed in as ${user.email}`
                : "Create invoices in seconds"}
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {!isPro && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                <div className="text-xs text-gray-600">{limitMessage}</div>
                <div
                  className={`text-xs font-bold ${
                    remaining === 0
                      ? "text-red-600"
                      : remaining <= 2
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {remaining === 0 ? "Limit reached" : `${remaining} left`}
                </div>
                {remaining === 0 && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="text-xs px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded font-semibold hover:from-blue-700 hover:to-purple-700"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            )}
            {isPro && (
              <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg text-xs text-gray-700 font-medium">
                ✨ Unlimited invoices
              </div>
            )}
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
              disabled={saving || (!currentInvoiceId && !canSave)}
              className={`text-sm px-4 py-2 font-medium rounded-lg transition-colors disabled:cursor-not-allowed ${
                justSaved
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : !currentInvoiceId && !canSave
                  ? "bg-gray-200 text-gray-500"
                  : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              }`}
            >
              {saving
                ? "Saving..."
                : justSaved
                ? "✓ Saved!"
                : !currentInvoiceId && !canSave
                ? "🔒 Upgrade to Save"
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
                Client Address
              </label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="e.g. 123 Main Street"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client City
              </label>
              <input
                type="text"
                value={clientCity}
                onChange={(e) => setClientCity(e.target.value)}
                placeholder="e.g. Colombo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
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
              <div>
                {/* ⭐ NEW: Currency Selector */}
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
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
                      {formatMoney(item.quantity * item.rate, currency)}
                    </span>
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {formatMoney(total, currency)}
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
                  {company.logo && isPro && (
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
                    style={{ color: isPro ? company.brandColor : "#2563eb" }}
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
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {clientAddress || "Client Address"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {clientCity || "Client City"}
                  </p>
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
                        {formatMoney(item.rate, currency)}
                      </td>
                      <td className="py-3 text-sm text-right tabular-nums font-medium">
                        {formatMoney(item.quantity * item.rate, currency)}
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
                      style={{ color: isPro ? company.brandColor : "#2563eb" }}
                    >
                      {formatMoney(total, currency)}
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

              {/* Watermark for Free users */}
              {!isPro && (
                <div className="mt-6 pt-3 border-t border-dashed border-gray-300 text-center">
                  <p className="text-[10px] text-gray-400 font-medium tracking-wide">
                    Made with{" "}
                    <span className="font-semibold text-gray-500">
                      🧾 Invoice Studio
                    </span>{" "}
                    · Upgrade to remove
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              📁 Saved Invoices
              {visibleInvoices.length > 0 && (
                <span className="ml-2 text-base font-normal text-gray-500">
                  ({visibleInvoices.length})
                </span>
              )}
            </h2>
          </div>

          {visibleInvoices.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No saved invoices yet. Click the "💾 Save Invoice" button above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleInvoices.map((inv) => {
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
                        {formatMoney(invTotal, inv.currency)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ApexAI Branding Footer */}
      <div className="text-center mt-12 pb-4">
        <p className="text-xs text-gray-400">
          Powered by <span className="font-semibold text-gray-500 hover:text-gray-700 transition-colors">ApexAI Company</span>
        </p>
      </div>

      {/* Company Settings Modal */}
      {showSettings && (
        <CompanySettings
          company={company}
          onSave={saveCompany}
          onClose={() => setShowSettings(false)}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⭐</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              You've reached your limit
            </h2>
            <p className="text-gray-600 mb-6">
              The Free plan allows up to 5 invoices per month. You have reached your limit!
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                ⭐ What you get with Pro:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Unlimited invoices
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> No watermark
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Custom brand colors
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Company logo
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Tools tab access
                </li>
              </ul>
            </div>

            <button
              onClick={handleUpgrade}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all mb-2"
            >
              Upgrade to Pro — $5/month
            </button>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full py-2 text-gray-600 hover:text-gray-900 text-sm"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}