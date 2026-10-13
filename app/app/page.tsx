"use client";

import { useEffect, useRef, useState } from "react";
import CompanySettings, { type CompanyInfo } from "@/components/CompanySettings";

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

const STORAGE_KEY = "invoice-studio-data";
const COMPANY_KEY = "invoice-studio-company";

const DEFAULT_ITEMS: LineItem[] = [
  { id: "item-1", description: "", quantity: 1, rate: 0 },
];

const DEFAULT_COMPANY: CompanyInfo = {
  name: "Your Company",
  address: "123 Business Street\nColombo, Sri Lanka",
  email: "prabhathchinthaka42@gmail.com",
  phone: "+94 77 123 4567",
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

export default function Home() {
  const invoiceRef = useRef<HTMLDivElement>(null);

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
  const [isLoaded, setIsLoaded] = useState(false);

  // ============================================
  // Load from localStorage
  // ============================================
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.current) {
          setClientName(data.current.clientName ?? "");
          setInvoiceNumber(data.current.invoiceNumber ?? "INV-001");
          setInvoiceDate(data.current.invoiceDate ?? "");
          setDueDate(data.current.dueDate ?? "");
          setItems(data.current.items ?? DEFAULT_ITEMS);
          setCurrentInvoiceId(data.current.currentInvoiceId ?? null);
        }
        if (Array.isArray(data.saved)) {
          setSavedInvoices(data.saved);
        }
      }

      const savedCompany = localStorage.getItem(COMPANY_KEY);
      if (savedCompany) {
        setCompany({ ...DEFAULT_COMPANY, ...JSON.parse(savedCompany) });
      }
    } catch (error) {
      console.error("Load failed:", error);
    }
    setIsLoaded(true);
  }, []);

  // ============================================
  // Save to localStorage
  // ============================================
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          current: {
            clientName,
            invoiceNumber,
            invoiceDate,
            dueDate,
            items,
            currentInvoiceId,
          },
          saved: savedInvoices,
        })
      );
    } catch (error) {
      console.error("Save failed:", error);
    }
  }, [
    isLoaded,
    clientName,
    invoiceNumber,
    invoiceDate,
    dueDate,
    items,
    currentInvoiceId,
    savedInvoices,
  ]);

  // Save company separately
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
    } catch (error) {
      console.error("Company save failed:", error);
    }
  }, [isLoaded, company]);

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
  // Save Invoice
  // ============================================
  const saveInvoice = () => {
    const existing = currentInvoiceId
      ? savedInvoices.find((inv) => inv.id === currentInvoiceId)
      : null;

    const invoice: SavedInvoice = {
      id: currentInvoiceId ?? crypto.randomUUID(),
      clientName,
      invoiceNumber,
      invoiceDate,
      dueDate,
      items,
      status: existing?.status ?? "pending",
      createdAt: existing?.createdAt ?? Date.now(),
    };

    if (currentInvoiceId) {
      setSavedInvoices(
        savedInvoices.map((inv) => (inv.id === currentInvoiceId ? invoice : inv))
      );
    } else {
      setSavedInvoices([invoice, ...savedInvoices]);
      setCurrentInvoiceId(invoice.id);
    }

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const newInvoice = () => {
    if (!confirm("නව invoice එකක් පටන් ගන්නද? දැනට save නොකරපු දේවල් නැති වෙයි."))
      return;

    setClientName("");
    setInvoiceNumber("INV-001");
    setInvoiceDate("");
    setDueDate("");
    setItems(DEFAULT_ITEMS);
    setCurrentInvoiceId(null);
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

  const deleteInvoice = (id: string) => {
    if (!confirm("මේ invoice එක delete කරන්නද?")) return;
    setSavedInvoices(savedInvoices.filter((inv) => inv.id !== id));
    if (currentInvoiceId === id) {
      setCurrentInvoiceId(null);
    }
  };

  const toggleStatus = (id: string) => {
    setSavedInvoices(
      savedInvoices.map((inv) =>
        inv.id === id
          ? { ...inv, status: inv.status === "paid" ? "pending" : "paid" }
          : inv
      )
    );
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
            <p className="text-gray-600">Create invoices in seconds</p>
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
              className={`text-sm px-4 py-2 font-medium rounded-lg transition-colors ${
                justSaved
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {justSaved ? "✓ Saved!" : "💾 Save Invoice"}
            </button>
          </div>
        </div>

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
              {/* Header — now uses company state */}
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
                  <p className="text-sm text-gray-600 mt-1">
                    {company.email}
                  </p>
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

              {/* Bank Details (if provided) */}
              {(company.bankName || company.bankAccount) && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Payment Details
                  </p>
                  {company.bankName && (
                    <p className="text-sm text-gray-700">
                      Bank: <span className="font-medium">{company.bankName}</span>
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
              තාම invoices save කරලා නෑ. උඩ "💾 Save Invoice" button එක ඔබන්න!
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

      {/* ⭐ Company Settings Modal */}
      {showSettings && (
        <CompanySettings
          company={company}
          onSave={setCompany}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}