"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CompanySettings, { type CompanyInfo } from "@/components/CompanySettings";
import {
  canCreateInvoice,
  countInvoicesThisMonth,
  getLimitMessage,
  getRemainingInvoices,
} from "@/lib/plan-limits";
import type { User } from "@supabase/supabase-js";
import { saveClient, getClients, deleteClient } from "@/lib/actions/clients";
import { getServices, saveService, deleteService } from "@/lib/actions/services";

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
  currency: string;
  templateStyle: string;
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
  currency: string;
  template_style: string;
};

type SavedClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
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

type InvoiceDocProps = {
  company: CompanyInfo;
  isPro: boolean;
  clientName: string;
  clientAddress: string;
  clientCity: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  templateStyle: string;
  items: LineItem[];
  total: number;
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

const DODO_PRODUCT_ID = "pdt_0NqqsbOKEVdi49C2pzwvy"; 

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
// Design System
// ============================================
const INPUT_CLASS =
  "w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/60 transition-all duration-200 text-sm";

const SELECT_CLASS = INPUT_CLASS + " [color-scheme:dark] [&>option]:bg-slate-800 [&>option]:text-white";
const DATE_CLASS = INPUT_CLASS + " [color-scheme:dark]";
const LABEL_CLASS = "block text-sm font-medium text-slate-400 mb-1.5";

const PRIMARY_BTN =
  "inline-flex items-center justify-center gap-2 text-sm px-5 py-2.5 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-blue-600/25";

const SECONDARY_BTN =
  "inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 font-medium bg-white/5 text-slate-200 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 rounded-xl transition-all duration-200";

const CARD_CLASS =
  "rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl shadow-black/30";

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
    currency: row.currency || "USD",
    templateStyle: row.template_style || "classic",
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
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const [currency, setCurrency] = useState("USD");
  const [templateStyle, setTemplateStyle] = useState("classic");
  const [items, setItems] = useState<LineItem[]>(DEFAULT_ITEMS);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [clients, setClients] = useState<SavedClient[]>([]);
  const [savingClient, setSavingClient] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{id: string, name: string} | null>(null);

  const [copied, setCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [referenceTime, setReferenceTime] = useState(0);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Derived Values
  const isPro = company.plan === "pro";
  const monthlyCount = countInvoicesThisMonth(savedInvoices, referenceTime);
  const remaining = getRemainingInvoices(company.plan, monthlyCount);
  const canSave = canCreateInvoice(company.plan, monthlyCount);
  const limitMessage = getLimitMessage(company.plan, monthlyCount);
  const visibleInvoices = savedInvoices.filter((inv) => inv.deletedAt === null);

  // Effects
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

        // Load Saved Clients
        const { success, clients: fetchedClients } = await getClients();
        if (success && fetchedClients) {
          setClients(fetchedClients);
        }

        // Load Saved Services
        const { success: sSuccess, services: fetchedServices } = await getServices();
        if (sSuccess && fetchedServices) {
          setServices(fetchedServices);
        }
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (user) {
      setShowAuthModal(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoaded) return;
    setClientName("");
    setClientAddress("");
    setClientCity("");
    setInvoiceNumber("INV-001");
    setInvoiceDate("");
    setDueDate("");
    setCurrency("USD");
    setTemplateStyle("classic");
    setItems(DEFAULT_ITEMS);
    setCurrentInvoiceId(null);
    setError("");
  }, [user?.id, isLoaded]);

  // Item Handlers
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

  // Upgrade Handler
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

  // Save Company & Clients
  const handleSaveCurrentClient = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!clientName.trim()) {
      alert("Please enter a Client Name first.");
      return;
    }
    setSavingClient(true);
    
    const res = await saveClient({
      name: clientName,
      email: "",
      phone: "",
      address: clientAddress,
      city: clientCity
    });

    if (res.error) {
      alert(res.error);
    } else {
      const { success, clients: updatedClients } = await getClients();
      if (success && updatedClients) setClients(updatedClients);
    }
    setSavingClient(false);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    const res = await deleteClient(clientToDelete.id);
    if (res.success) {
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      if (clientName === clientToDelete.name) {
        setClientName("");
        setClientAddress("");
        setClientCity("");
      }
      setClientToDelete(null);
    } else {
      alert(res.error);
    }
  };

  const handleAddService = async (name: string, rate: number) => {
    if (!user) {
      setShowSettings(false);
      setShowAuthModal(true);
      return;
    }
    const res = await saveService({ name, rate });
    if (res.success) {
      const { success, services: fetched } = await getServices();
      if (success && fetched) setServices(fetched);
    } else {
      alert(res.error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!user) {
      setShowSettings(false);
      setShowAuthModal(true);
      return;
    }
    if (!confirm("Are you sure you want to delete this service?")) return;
    const res = await deleteService(id);
    if (res.success) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const saveCompany = async (newCompany: CompanyInfo) => {
    if (!user) {
      setShowSettings(false);
      setShowAuthModal(true);
      return;
    }
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

  // Save Invoice
  const saveInvoice = async () => {
    if (!user) {
      setShowAuthModal(true);
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
      currency: currency,
      template_style: templateStyle,
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
    } catch (err: any) {
      console.error("Save failed:", err);
      const errorMessage = err?.message || err?.details || JSON.stringify(err) || "Failed to save invoice. Please check your database connection.";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const newInvoice = () => {
    if (!confirm("Start a new invoice? Any unsaved changes will be lost.")) return;

    setClientName("");
    setClientAddress("");
    setClientCity("");
    setInvoiceNumber("INV-001");
    setInvoiceDate("");
    setDueDate("");
    setCurrency("USD");
    setTemplateStyle("classic");
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
    setCurrency(invoice.currency);
    setTemplateStyle(invoice.templateStyle || "classic");
    setItems(invoice.items);
    setCurrentInvoiceId(invoice.id);

    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightId(null);
    setTimeout(() => {
      setHighlightId(invoice.id);
      highlightTimer.current = setTimeout(() => setHighlightId(null), 1000);
    }, 0);

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

  // PDF Download
  const downloadPDF = async () => {
    if (!invoiceRef.current) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!currentInvoiceId && !canSave) {
      setShowUpgradeModal(true);
      return;
    }

    setGeneratingPDF(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      // Capture the hidden, clean DOM element
      const canvas = await html2canvas(invoiceRef.current!, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNumber || "invoice"}.pdf`);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      setError(err?.message || "Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
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

  // Loading State
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  const saveBtnClass = saving
    ? PRIMARY_BTN + " opacity-70"
    : justSaved
    ? "inline-flex items-center justify-center gap-2 text-sm px-5 py-2.5 font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg shadow-green-600/25 transition-all duration-200"
    : !currentInvoiceId && !canSave
    ? "inline-flex items-center justify-center gap-2 text-sm px-5 py-2.5 font-semibold bg-slate-800 text-slate-500 border border-slate-700 rounded-xl transition-all duration-200 cursor-not-allowed"
    : PRIMARY_BTN;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[140px] opacity-10 animate-pulse pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[130px] opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Invoice Studio" 
                className="h-14 w-auto object-contain" 
              />
              {isPro ? (
                <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold shadow-lg shadow-purple-500/25">
                  ⭐ PRO
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 bg-white/5 text-slate-300 border border-white/10 rounded-full font-medium">
                  Free
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-2">
              {user?.email
                ? `Signed in as ${user.email}`
                : "Create invoices in seconds"}
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {!isPro && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-sm">
                <div className="text-xs text-slate-300">{limitMessage}</div>
                <div
                  className={`text-xs font-bold ${
                    remaining === 0
                      ? "text-red-400"
                      : remaining <= 2
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {remaining === 0 ? "Limit reached" : `${remaining} left`}
                </div>
                {remaining === 0 && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="text-xs px-2.5 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:scale-[1.02] transition-all"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            )}
            {isPro && (
              <div className="px-3 py-2.5 bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-blue-500/20 rounded-xl text-xs text-slate-200 font-medium backdrop-blur-md">
                ✨ Unlimited invoices
              </div>
            )}
            {!user && (
              <Link
                href="/login?redirect=/app"
                className={PRIMARY_BTN}
              >
                🔑 Sign In
              </Link>
            )}
            <Link
              href="/tools"
              className={SECONDARY_BTN}
            >
              🛠️ Tools
            </Link>
            <button
              onClick={() => setShowSettings(true)}
              className={SECONDARY_BTN}
            >
              ⚙️ Settings
            </button>
            <button
              onClick={newInvoice}
              className={SECONDARY_BTN}
            >
              ✨ New
            </button>
            <button
              onClick={saveInvoice}
              disabled={saving || (!currentInvoiceId && !canSave)}
              className={saveBtnClass}
            >
              {saving ? (
                <>
                  <Spinner />
                  Saving...
                </>
              ) : justSaved ? (
                "✓ Saved!"
              ) : !currentInvoiceId && !canSave ? (
                "🔒 Upgrade to Save"
              ) : (
                "💾 Save Invoice"
              )}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex justify-between items-center backdrop-blur-md animate-fade-in-up">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-red-300 hover:text-red-100 text-lg leading-none transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT: Form */}
          <div className={`${CARD_CLASS} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Invoice Details
              </h2>
            </div>

            {/* Saved Clients Dropdown */}
            <div className="mb-5 p-4 bg-slate-800/30 border border-slate-800 rounded-xl">
              <label className={LABEL_CLASS}>
                Load Saved Client (Optional)
              </label>
              <details className="relative group">
                <summary className={`${SELECT_CLASS} cursor-pointer list-none flex justify-between items-center`}>
                  <span className="text-slate-300">-- Choose a client --</span>
                  <span className="text-xs text-slate-500">▼</span>
                </summary>
                <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl shadow-black/40 max-h-60 overflow-y-auto">
                  {clients.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500 text-center">No saved clients yet.</div>
                  ) : (
                    clients.map(c => (
                      <div key={c.id} className="flex justify-between items-center p-2 hover:bg-slate-700/50 border-b border-slate-800 last:border-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setClientName(c.name);
                            setClientAddress(c.address);
                            setClientCity(c.city || "");
                            (e.currentTarget.closest('details') as HTMLDetailsElement).removeAttribute('open');
                          }}
                          className="flex-1 text-left text-sm text-slate-200 font-medium px-2 py-1"
                        >
                          {c.name}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setClientToDelete({ id: c.id, name: c.name });
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete Client"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </details>
            </div>

            {/* Client Details */}
            <div className="border-t border-slate-800 pt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                Client Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={LABEL_CLASS}>Client Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter client name"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Client Address</label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="e.g. 123 Main Street"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Client City</label>
                  <input
                    type="text"
                    value={clientCity}
                    onChange={(e) => setClientCity(e.target.value)}
                    placeholder="e.g. Colombo"
                    className={INPUT_CLASS}
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleSaveCurrentClient}
                      disabled={savingClient || !clientName}
                      className={`${SECONDARY_BTN} text-xs px-3.5 py-2 disabled:opacity-50`}
                    >
                      {savingClient ? "Saving..." : "💾 Save this Client"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="border-t border-slate-800 pt-5 mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                Invoice Details
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className={SELECT_CLASS}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Template Style</label>
                  <select
                    value={templateStyle}
                    onChange={(e) => setTemplateStyle(e.target.value)}
                    className={SELECT_CLASS}
                  >
                    <option value="classic">Classic</option>
                    <option value="modern">Modern Blue</option>
                    <option value="minimal">Minimal Clean</option>
                    <option value="corporate">Corporate (Premium)</option>
                    <option value="creative">Creative (Premium)</option>
                    <option value="elegant">Elegant (Premium)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>Invoice Date</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className={DATE_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className={DATE_CLASS}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="border-t border-slate-800 pt-5 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Line Items
                </h3>
                <button
                  onClick={addItem}
                  className={`${SECONDARY_BTN} text-xs px-3.5 py-2`}
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 bg-slate-800/30 border border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Item #{index + 1}
                      </p>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div className="relative mb-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        placeholder="Description (e.g. Web Design)"
                        className={`${INPUT_CLASS} pr-10`}
                      />
                      {services.length > 0 && (
                        <select
                          onChange={(e) => {
                            const selected = services.find(s => s.id === e.target.value);
                            if (selected) {
                              setItems(prev => prev.map((it, i) => 
                                i === index ? { ...it, description: selected.name, rate: selected.rate } : it
                              ));
                            }
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 opacity-0 cursor-pointer [&>option]:bg-slate-800 [&>option]:text-white"
                          defaultValue=""
                          title="Auto-fill from saved services"
                        >
                          <option value="" disabled>Select</option>
                          {services.map(s => (
                            <option key={s.id} value={s.id}>{s.name} (${s.rate})</option>
                          ))}
                        </select>
                      )}
                      {services.length > 0 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                          ⚡
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", Number(e.target.value))
                        }
                        placeholder="Qty"
                        className={INPUT_CLASS}
                      />
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          updateItem(index, "rate", Number(e.target.value))
                        }
                        placeholder="Rate"
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div className="text-right text-xs text-slate-500">
                      Line total:{" "}
                      <span className="font-semibold text-slate-200">
                        {formatMoney(item.quantity * item.rate, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-base font-semibold text-white">
                  Total
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tabular-nums">
                  {formatMoney(total, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Invoice Document Preview (Only for visual) */}
          <div className={`${CARD_CLASS} p-4 sm:p-6`}>
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Invoice Preview
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyInvoiceText}
                  className={
                    copied
                      ? "inline-flex items-center gap-2 text-sm px-4 py-2.5 font-medium bg-green-500/15 text-green-400 border border-green-500/30 rounded-xl transition-all duration-200"
                      : SECONDARY_BTN
                  }
                >
                  {copied ? "✓ Copied!" : "📋 Copy Invoice"}
                </button>
                <button
                  onClick={downloadPDF}
                  disabled={generatingPDF}
                  className={PRIMARY_BTN}
                >
                  {generatingPDF ? (
                    <>
                      <Spinner />
                      Generating...
                    </>
                  ) : (
                    "⬇ Download PDF"
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 mb-2 md:hidden">
              ← Swipe to view full invoice →
            </p>

            <div className="relative">
              <div className="invoice-scroll overflow-x-auto pb-3">
                <div className="min-w-[550px] sm:min-w-[600px]">
                  {/* ⭐ මෙතනින් ref={invoiceRef} අයින් කළා */}
                  <div className="pdf-invoice overflow-hidden rounded-xl bg-white shadow-xl shadow-black/30 text-gray-900">
                    <InvoiceDocument
                      company={company}
                      isPro={isPro}
                      clientName={clientName}
                      clientAddress={clientAddress}
                      clientCity={clientCity}
                      invoiceNumber={invoiceNumber}
                      invoiceDate={invoiceDate}
                      dueDate={dueDate}
                      currency={currency}
                      templateStyle={templateStyle}
                      items={items}
                      total={total}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white">
              📁 Saved Invoices
              {visibleInvoices.length > 0 && (
                <span className="ml-2 text-base font-normal text-slate-500">
                  ({visibleInvoices.length})
                </span>
              )}
            </h2>
          </div>

          {visibleInvoices.length === 0 ? (
            <div className={`${CARD_CLASS} p-8 text-center text-slate-500`}>
              No saved invoices yet. Click the "💾 Save Invoice" button above!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleInvoices.map((inv) => {
                const invTotal = inv.items.reduce(
                  (sum, item) => sum + item.quantity * item.rate,
                  0
                );
                const isActive = currentInvoiceId === inv.id;

                return (
                  <div
                    key={inv.id}
                    className={`rounded-2xl border p-5 transition-all duration-200 cursor-pointer backdrop-blur-md ${
                      isActive
                        ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                        : "border-slate-800 bg-slate-900/50 hover:bg-slate-800/40 hover:border-slate-700 shadow-sm"
                    } ${highlightId === inv.id ? "invoice-highlight" : ""}`}
                    onClick={() => loadInvoice(inv)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-mono text-sm font-semibold text-slate-200">
                        #{inv.invoiceNumber}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteInvoice(inv.id);
                        }}
                        className="text-slate-600 hover:text-red-400 text-sm transition-colors"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-base font-medium text-white truncate">
                      {inv.clientName || "(no client)"}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Created: {new Date(inv.createdAt).toLocaleDateString()}
                    </p>

                    <div className="mt-3 flex justify-between items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(inv.id);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          inv.status === "paid"
                            ? "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                            : "bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25"
                        }`}
                      >
                        {inv.status === "paid" ? "✓ Paid" : "● Pending"}
                      </button>
                      <p className="text-lg font-bold text-white tabular-nums">
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

      <div className="relative z-10 text-center mt-12 pb-4">
        <p className="text-xs text-slate-500">
          Powered by <span className="font-semibold text-slate-400 hover:text-slate-300 transition-colors">ApexAI Company</span>
        </p>
      </div>

      {/* ⭐ මෙන්න මේකයි අලුත් වැඩේ: PDF එක හදන්න විතරක් පේන්නෙ නැති විදිහට හදපු Div එක */}
      <div style={{ position: "absolute", top: "-10000px", left: "-10000px", pointerEvents: "none", zIndex: -1 }}>
        <div
          ref={invoiceRef}
          className="pdf-invoice bg-white"
          style={{ width: "794px" }} // Standard A4 width
        >
          <InvoiceDocument
            company={company}
            isPro={isPro}
            clientName={clientName}
            clientAddress={clientAddress}
            clientCity={clientCity}
            invoiceNumber={invoiceNumber}
            invoiceDate={invoiceDate}
            dueDate={dueDate}
            currency={currency}
            templateStyle={templateStyle}
            items={items}
            total={total}
          />
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <CompanySettings
          company={company}
          onSave={saveCompany}
          onClose={() => setShowSettings(false)}
          onUpgrade={handleUpgrade}
          services={services}
          onAddService={handleAddService}
          onDeleteService={handleDeleteService}
        />
      )}

      {showUpgradeModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
              <span className="text-4xl">⭐</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              You've reached your limit
            </h2>
            <p className="text-slate-400 mb-6">
              The Free plan allows up to 5 invoices per month. You have reached your limit!
            </p>

            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-slate-700 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-white mb-3">
                ⭐ What you get with Pro:
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Unlimited invoices
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> No watermark
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Custom brand colors
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Company logo
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Tools tab access
                </li>
              </ul>
            </div>

            <button
              onClick={handleUpgrade}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] transition-all shadow-lg shadow-blue-600/30 mb-2"
            >
              Upgrade to Pro — $5/month
            </button>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {clientToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-fade-in-up">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Client?</h3>
            <p className="text-slate-400 mb-6 text-sm">
              Are you sure you want to delete <strong className="text-white">{clientToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setClientToDelete(null)} 
                className="flex-1 py-2.5 bg-white/5 text-slate-200 border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteClient} 
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-500 transition-colors shadow-lg shadow-red-500/30"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-blue-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sign In Required</h3>
            <p className="text-slate-400 mb-6 text-sm">
              You need to be logged in to save clients, generate invoices, and download PDFs. Don't worry, it's completely free!
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAuthModal(false)} 
                className="flex-1 py-2.5 bg-white/5 text-slate-200 border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <Link 
                href="/login?redirect=/app" 
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-[1.02] transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

// ============================================
// Invoice Templates
// ============================================
function InvoiceDocument(props: InvoiceDocProps) {
  switch (props.templateStyle) {
    case "corporate":
      return <CorporateTemplate {...props} />;
    case "creative":
      return <CreativeTemplate {...props} />;
    case "elegant":
      return <ElegantTemplate {...props} />;
    case "modern":
      return <ModernTemplate {...props} />;
    case "minimal":
      return <MinimalTemplate {...props} />;
    case "classic":
    default:
      return <ClassicTemplate {...props} />;
  }
}

function PaymentDetailsBlock({
  bankName,
  bankAccount,
}: {
  bankName: string;
  bankAccount: string;
}) {
  if (!bankName && !bankAccount) return null;
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Payment Details
      </p>
      {bankName && (
        <p className="text-sm text-gray-700">
          Bank:{" "}
          <span className="font-medium">{bankName}</span>
        </p>
      )}
      {bankAccount && (
        <p className="text-sm text-gray-700">
          Account:{" "}
          <span className="font-medium font-mono">{bankAccount}</span>
        </p>
      )}
    </div>
  );
}

function InvoiceWatermark({ isPro }: { isPro: boolean }) {
  if (isPro) return null;
  return (
    <div className="mt-6 pt-3 border-t border-dashed border-gray-300 text-center">
      <p className="text-[10px] text-gray-400 font-medium tracking-wide">
        Made with{" "}
        <span className="font-semibold text-gray-500">
          🧾 Invoice Studio
        </span>{" "}
        · Upgrade to remove
      </p>
    </div>
  );
}

function TableRows({
  items,
  currency,
  borderClass = "border-b border-gray-200",
}: {
  items: LineItem[];
  currency: string;
  borderClass?: string;
}) {
  return (
    <>
      {items.map((item) => (
        <tr key={item.id} className={borderClass}>
          <td className="py-3 text-sm">
            {item.description || (
              <span className="text-gray-400 italic">(no description)</span>
            )}
          </td>
          <td className="py-3 text-sm text-right tabular-nums">{item.quantity}</td>
          <td className="py-3 text-sm text-right tabular-nums">
            {formatMoney(item.rate, currency)}
          </td>
          <td className="py-3 text-sm text-right tabular-nums font-medium">
            {formatMoney(item.quantity * item.rate, currency)}
          </td>
        </tr>
      ))}
    </>
  );
}

function ClassicTemplate(props: InvoiceDocProps) {
  const { company, isPro, clientName, clientAddress, clientCity, invoiceNumber, invoiceDate, dueDate, currency, items, total } = props;
  const accent = isPro ? company.brandColor : "#2563eb";
  return (
    <div className="p-6 md:p-10">
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
            <p className="text-sm text-gray-600 mt-1">{company.email}</p>
          )}
          {company.phone && (
            <p className="text-sm text-gray-600">{company.phone}</p>
          )}
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: accent }}>
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
          <p className="font-semibold text-base">{clientName || "Client Name"}</p>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {clientAddress || "Client Address"}
          </p>
          <p className="text-sm text-gray-600">{clientCity || "Client City"}</p>
        </div>
        <div className="text-right text-sm space-y-2">
          <div>
            <span className="text-gray-500">Issue Date: </span>
            <span className="font-medium">{formatDate(invoiceDate)}</span>
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
            <th className="text-left py-3 text-xs uppercase tracking-wider font-semibold">Description</th>
            <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">Qty</th>
            <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">Rate</th>
            <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          <TableRows items={items} currency={currency} />
        </tbody>
      </table>

      <div className="flex justify-end mb-10">
        <div className="w-64">
          <div className="flex justify-between py-3 font-bold text-lg border-b-2 border-gray-800">
            <span>Total</span>
            <span className="tabular-nums" style={{ color: accent }}>
              {formatMoney(total, currency)}
            </span>
          </div>
        </div>
      </div>

      <PaymentDetailsBlock bankName={company.bankName} bankAccount={company.bankAccount} />

      <div className="border-t border-gray-200 pt-6 mt-8 text-center">
        <p className="text-sm font-medium text-gray-700">Thank you for your business!</p>
        <p className="text-xs text-gray-500 mt-1">{company.paymentTerms}</p>
      </div>

      <InvoiceWatermark isPro={isPro} />
    </div>
  );
}

function ModernTemplate(props: InvoiceDocProps) {
  const { company, isPro, clientName, clientAddress, clientCity, invoiceNumber, invoiceDate, dueDate, currency, items, total } = props;
  return (
    <div className="p-6 md:p-10">
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
          <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{company.address}</p>
          {company.email && <p className="text-sm text-gray-600 mt-1">{company.email}</p>}
          {company.phone && <p className="text-sm text-gray-600">{company.phone}</p>}
        </div>
        <div className="text-right">
          <h1 className="inline-block text-3xl font-bold tracking-tight bg-slate-800 text-white px-4 py-2 rounded-lg">
            INVOICE
          </h1>
          <p className="text-sm text-gray-600 mt-2 font-mono">#{invoiceNumber || "INV-001"}</p>
        </div>
      </div>

      <div className="flex justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</p>
          <p className="font-semibold text-base">{clientName || "Client Name"}</p>
          <p className="text-sm text-gray-600 whitespace-pre-line">{clientAddress || "Client Address"}</p>
          <p className="text-sm text-gray-600">{clientCity || "Client City"}</p>
        </div>
        <div className="text-right text-sm space-y-2">
          <div>
            <span className="text-gray-500">Issue Date: </span>
            <span className="font-medium">{formatDate(invoiceDate)}</span>
          </div>
          <div>
            <span className="text-gray-500">Due Date: </span>
            <span className="font-medium">{formatDate(dueDate)}</span>
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="text-left py-3 pl-3 text-xs uppercase tracking-wider font-semibold">Description</th>
            <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">Qty</th>
            <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">Rate</th>
            <th className="text-right py-3 pr-3 text-xs uppercase tracking-wider font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          <TableRows items={items} currency={currency} />
        </tbody>
      </table>

      <div className="flex justify-end mb-10">
        <div className="w-64">
          <div className="flex justify-between py-3 font-bold text-lg border-b-2 border-gray-800">
            <span>Total</span>
            <span className="tabular-nums" style={{ color: isPro ? company.brandColor : "#2563eb" }}>
              {formatMoney(total, currency)}
            </span>
          </div>
        </div>
      </div>

      <PaymentDetailsBlock bankName={company.bankName} bankAccount={company.bankAccount} />

      <div className="border-t border-gray-200 pt-6 mt-8 text-center">
        <p className="text-sm font-medium text-gray-700">Thank you for your business!</p>
        <p className="text-xs text-gray-500 mt-1">{company.paymentTerms}</p>
      </div>

      <InvoiceWatermark isPro={isPro} />
    </div>
  );
}

function MinimalTemplate(props: InvoiceDocProps) {
  const { company, isPro, clientName, clientAddress, clientCity, invoiceNumber, invoiceDate, dueDate, currency, items, total } = props;
  return (
    <div className="p-6 md:p-10">
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
          <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{company.address}</p>
          {company.email && <p className="text-sm text-gray-600 mt-1">{company.email}</p>}
          {company.phone && <p className="text-sm text-gray-600">{company.phone}</p>}
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-light text-gray-900">INVOICE</h1>
          <p className="text-sm text-gray-600 mt-2 font-mono">#{invoiceNumber || "INV-001"}</p>
        </div>
      </div>

      <div className="flex justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</p>
          <p className="font-semibold text-base">{clientName || "Client Name"}</p>
          <p className="text-sm text-gray-600 whitespace-pre-line">{clientAddress || "Client Address"}</p>
          <p className="text-sm text-gray-600">{clientCity || "Client City"}</p>
        </div>
        <div className="text-right text-sm space-y-2">
          <div>
            <span className="text-gray-500">Issue Date: </span>
            <span className="font-medium">{formatDate(invoiceDate)}</span>
          </div>
          <div>
            <span className="text-gray-500">Due Date: </span>
            <span className="font-medium">{formatDate(dueDate)}</span>
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b border-gray-300 text-gray-500">
            <th className="text-left py-3 text-xs uppercase tracking-wider font-semibold">Description</th>
            <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">Qty</th>
            <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">Rate</th>
            <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          <TableRows items={items} currency={currency} />
        </tbody>
      </table>

      <div className="flex justify-end mb-10">
        <div className="w-64">
          <div className="flex justify-between py-3 font-bold text-lg border-b-2 border-gray-800">
            <span>Total</span>
            <span className="tabular-nums" style={{ color: isPro ? company.brandColor : "#2563eb" }}>
              {formatMoney(total, currency)}
            </span>
          </div>
        </div>
      </div>

      <PaymentDetailsBlock bankName={company.bankName} bankAccount={company.bankAccount} />

      <div className="border-t border-gray-200 pt-6 mt-8 text-center">
        <p className="text-sm font-medium text-gray-700">Thank you for your business!</p>
        <p className="text-xs text-gray-500 mt-1">{company.paymentTerms}</p>
      </div>

      <InvoiceWatermark isPro={isPro} />
    </div>
  );
}

function CorporateTemplate(props: InvoiceDocProps) {
  const { company, isPro, clientName, clientAddress, clientCity, invoiceNumber, invoiceDate, dueDate, currency, items, total } = props;
  const accent = isPro ? company.brandColor : "#2563eb";
  return (
    <div className="bg-white text-gray-900">
      {/* Top accent bar */}
      <div className="h-1.5" style={{ background: accent }} />

      {/* Navy header */}
      <div className="bg-slate-900 text-white px-8 md:px-10 py-8">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              Invoice
            </p>
            <h1 className="text-3xl font-bold tracking-tight mt-1.5">INVOICE</h1>
            <p className="text-sm text-slate-300 mt-3 font-medium">{company.name}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xl font-bold font-mono tracking-wide">
              #{invoiceNumber || "INV-001"}
            </p>
            <div className="mt-3 space-y-1 text-sm text-slate-300">
              <p>
                <span className="text-slate-500">Issue Date:</span> {formatDate(invoiceDate)}
              </p>
              <p>
                <span className="text-slate-500">Due Date:</span> {formatDate(dueDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 md:px-10 py-8">
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bill To</p>
            <p className="font-semibold text-base">{clientName || "Client Name"}</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{clientAddress || "Client Address"}</p>
            <p className="text-sm text-gray-600">{clientCity || "Client City"}</p>
          </div>
          <div className="text-right text-sm space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Details</p>
            <p>
              <span className="text-gray-500">Currency: </span>
              <span className="font-medium">{currency}</span>
            </p>
            {company.email && <p className="text-gray-600">{company.email}</p>}
            {company.phone && <p className="text-gray-600">{company.phone}</p>}
          </div>
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="text-left py-3 pl-3 text-xs uppercase tracking-wider font-semibold">Description</th>
              <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">Qty</th>
              <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">Rate</th>
              <th className="text-right py-3 pr-3 text-xs uppercase tracking-wider font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <TableRows items={items} currency={currency} />
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-full sm:w-72 bg-slate-900 text-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Total Due
              </span>
              <span className="text-2xl font-bold tabular-nums">{formatMoney(total, currency)}</span>
            </div>
          </div>
        </div>

        <PaymentDetailsBlock bankName={company.bankName} bankAccount={company.bankAccount} />

        <div className="border-t border-gray-200 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-sm font-medium text-gray-700">Thank you for your business.</p>
          <p className="text-xs text-gray-500">{company.paymentTerms}</p>
        </div>

        <InvoiceWatermark isPro={isPro} />
      </div>
    </div>
  );
}

function CreativeTemplate(props: InvoiceDocProps) {
  const { company, isPro, clientName, clientAddress, clientCity, invoiceNumber, invoiceDate, dueDate, currency, items, total } = props;
  return (
    <div className="bg-white text-gray-900 flex">
      {/* Colorful accent sidebar */}
      <div className="w-14 sm:w-16 shrink-0 bg-gradient-to-b from-blue-600 via-purple-600 to-fuchsia-500" />

      <div className="flex-1 min-w-0 p-6 md:p-10">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight gradient-text leading-none">
              INVOICE
            </h1>
            <p className="text-sm font-mono mt-3 text-gray-500">#{invoiceNumber || "INV-001"}</p>
          </div>
          <div className="text-right">
            {company.logo && isPro && (
              <img
                src={company.logo}
                alt={company.name}
                className="h-12 max-w-[160px] object-contain mb-2 ml-auto"
              />
            )}
            <p className="font-bold text-base">{company.name}</p>
            <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">{company.address}</p>
          </div>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bill To</p>
            <p className="font-semibold text-base">{clientName || "Client Name"}</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{clientAddress || "Client Address"}</p>
            <p className="text-sm text-gray-600">{clientCity || "Client City"}</p>
          </div>
          <div className="text-right text-sm space-y-2">
            <div>
              <span className="text-gray-500">Issue: </span>
              <span className="font-medium">{formatDate(invoiceDate)}</span>
            </div>
            <div>
              <span className="text-gray-500">Due: </span>
              <span className="font-medium">{formatDate(dueDate)}</span>
            </div>
          </div>
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <th className="text-left py-3 pl-3 text-xs uppercase tracking-wider font-semibold">Description</th>
              <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">Qty</th>
              <th className="text-right py-3 text-xs uppercase tracking-wider font-semibold">Rate</th>
              <th className="text-right py-3 pr-3 text-xs uppercase tracking-wider font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <TableRows items={items} currency={currency} />
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-full sm:w-72 rounded-xl p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold uppercase tracking-wider">Total</span>
              <span className="text-2xl font-bold tabular-nums">{formatMoney(total, currency)}</span>
            </div>
          </div>
        </div>

        <PaymentDetailsBlock bankName={company.bankName} bankAccount={company.bankAccount} />

        <div className="border-t border-gray-200 pt-6 mt-8 text-center">
          <p className="text-sm font-medium text-gray-700">Thank you for your business!</p>
          <p className="text-xs text-gray-500 mt-1">{company.paymentTerms}</p>
        </div>

        <InvoiceWatermark isPro={isPro} />
      </div>
    </div>
  );
}

function ElegantTemplate(props: InvoiceDocProps) {
  const { company, isPro, clientName, clientAddress, clientCity, invoiceNumber, invoiceDate, dueDate, currency, items, total } = props;
  return (
    <div className="bg-white text-gray-900 font-serif p-10 md:p-14">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl tracking-[0.15em] text-gray-900">INVOICE</h1>
        <p className="text-xs tracking-[0.35em] uppercase text-slate-400 mt-3">
          No. {invoiceNumber || "INV-001"}
        </p>
      </div>

      <div className="h-px w-full bg-slate-200 my-10" />

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">From</p>
          <p className="text-lg text-gray-900">{company.name}</p>
          <p className="text-sm text-gray-500 whitespace-pre-line mt-1">{company.address}</p>
          {company.email && <p className="text-sm text-gray-500 mt-1">{company.email}</p>}
          {company.phone && <p className="text-sm text-gray-500">{company.phone}</p>}
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">Bill To</p>
          <p className="text-lg text-gray-900">{clientName || "Client Name"}</p>
          <p className="text-sm text-gray-500 whitespace-pre-line mt-1">{clientAddress || "Client Address"}</p>
          <p className="text-sm text-gray-500">{clientCity || "Client City"}</p>
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p>Issued {formatDate(invoiceDate)}</p>
            <p>Due {formatDate(dueDate)}</p>
          </div>
        </div>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 text-[11px] uppercase tracking-[0.15em] font-medium text-slate-400">Description</th>
            <th className="text-right py-3 text-[11px] uppercase tracking-[0.15em] font-medium text-slate-400">Qty</th>
            <th className="text-right py-3 text-[11px] uppercase tracking-[0.15em] font-medium text-slate-400">Rate</th>
            <th className="text-right py-3 text-[11px] uppercase tracking-[0.15em] font-medium text-slate-400">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-4 text-sm">
                {item.description || <span className="text-gray-300 italic">(no description)</span>}
              </td>
              <td className="py-4 text-sm text-right tabular-nums">{item.quantity}</td>
              <td className="py-4 text-sm text-right tabular-nums">{formatMoney(item.rate, currency)}</td>
              <td className="py-4 text-sm text-right tabular-nums">{formatMoney(item.quantity * item.rate, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-10">
        <div className="w-full sm:w-72">
          <div className="flex justify-between items-baseline pt-4 border-t border-slate-200">
            <span className="text-sm uppercase tracking-[0.2em] text-slate-400">Total</span>
            <span className="text-2xl text-gray-900 tabular-nums">{formatMoney(total, currency)}</span>
          </div>
        </div>
      </div>

      {company.bankName || company.bankAccount ? (
        <div className="mb-8 py-4 border-t border-slate-200">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-2">Payment Details</p>
          {company.bankName && (
            <p className="text-sm text-gray-600">
              Bank: <span className="text-gray-900">{company.bankName}</span>
            </p>
          )}
          {company.bankAccount && (
            <p className="text-sm text-gray-600">
              Account: <span className="font-mono text-gray-900">{company.bankAccount}</span>
            </p>
          )}
        </div>
      ) : null}

      <div className="text-center pt-8">
        <p className="text-sm text-gray-600 italic">Thank you for your business.</p>
        <p className="text-xs text-slate-400 mt-2">{company.paymentTerms}</p>
      </div>

      <InvoiceWatermark isPro={isPro} />
    </div>
  );
}