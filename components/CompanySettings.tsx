"use client";

import { useRef, useState } from "react";

export type CompanyInfo = {
  name: string;
  address: string;
  email: string;
  phone: string;
  brandColor: string;
  bankName: string;
  bankAccount: string;
  paymentTerms: string;
  logo: string; // ⭐ Base64 data URL (හෝ empty string)
};

type Props = {
  company: CompanyInfo;
  onSave: (company: CompanyInfo) => void;
  onClose: () => void;
};

const MAX_LOGO_SIZE = 1 * 1024 * 1024; // 1 MB

export default function CompanySettings({ company, onSave, onClose }: Props) {
  const [form, setForm] = useState<CompanyInfo>(company);
  const [logoError, setLogoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof CompanyInfo, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Size check
    if (file.size > MAX_LOGO_SIZE) {
      setLogoError("Logo file must be under 1 MB");
      return;
    }

    // Type check
    if (!file.type.startsWith("image/")) {
      setLogoError("Please select an image file (PNG, JPG, SVG)");
      return;
    }

    // FileReader — read file as base64 data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setForm((prev) => ({ ...prev, logo: dataUrl }));
    };
    reader.onerror = () => {
      setLogoError("Failed to read the file");
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setForm((prev) => ({ ...prev, logo: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            ⚙️ Company Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* ⭐ Logo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                {form.logo ? (
                  <img
                    src={form.logo}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400 text-center px-2">
                    No logo
                  </span>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium text-sm"
                >
                  📤 Upload Logo
                </button>
                {form.logo && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>
            </div>
            {logoError && (
              <p className="text-red-600 text-sm mt-2">{logoError}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Max 1 MB · PNG, JPG, or SVG
            </p>
          </div>

          {/* Company Name + Brand Color */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Color
              </label>
              <input
                type="color"
                value={form.brandColor}
                onChange={(e) => update("brandColor", e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bank Details */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Bank Details (Optional)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => update("bankName", e.target.value)}
                  placeholder="e.g. Commercial Bank"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={form.bankAccount}
                  onChange={(e) => update("bankAccount", e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Terms
            </label>
            <input
              type="text"
              value={form.paymentTerms}
              onChange={(e) => update("paymentTerms", e.target.value)}
              placeholder="e.g. Payment due within 14 days"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}