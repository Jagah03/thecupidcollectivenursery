import React, { useState, useEffect } from "react";
import { Send, Info, CreditCard } from "lucide-react";

interface PrivateInquiryFormProps {
  onSuccess: () => void;
}

export default function PrivateInquiryForm({ onSuccess }: PrivateInquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    pronouns: "",
    email: "",
    fantasy: "",
    specialRequest: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isFormComplete =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.fantasy.trim() &&
    formData.specialRequest.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!isFormComplete) {
      setErrorMessage("Please complete all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/private-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Submission failed.");
      }
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto py-4">
      <div className="lg:col-span-4 bg-vibrant-bg p-6 rounded-[32px] border-4 border-vibrant-pink shadow-xs space-y-6 self-start">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vibrant-pink text-white shadow-xs">
          <Info size={20} />
        </div>
        <h3 className="text-xl font-extrabold text-vibrant-charcoal font-display">Private Inquiry</h3>
        <p className="text-xs text-stone-600 leading-relaxed font-sans font-medium">
          Submit a private request without payment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white p-8 rounded-[32px] border-2 border-vibrant-pink shadow-xs space-y-6">
        <div className="space-y-2 mb-2">
          <h2 className="text-2xl font-extrabold font-display text-vibrant-charcoal">Private Nursery Inquiry</h2>
          <p className="text-xs text-stone-400 leading-relaxed font-semibold">Provide details for a private, non‑payment inquiry.</p>
        </div>
        {errorMessage && (
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-500">
            {errorMessage}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name / Alias */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block text-[10px] uppercase tracking-wider">Name or Alias *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Coby (Little Coby)"
              required
              className="w-full rounded-xl bg-vibrant-bg outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold focus:border-vibrant-gold-border border border-stone-200 px-4 py-2.5 text-xs text-[#4A4A4A] font-medium"
            />
          </div>
          {/* Pronouns */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block text-[10px] uppercase tracking-wider">Pronouns</label>
            <input
              type="text"
              value={formData.pronouns}
              onChange={e => setFormData(prev => ({ ...prev, pronouns: e.target.value }))}
              placeholder="e.g., He / Little Him"
              className="w-full rounded-xl bg-vibrant-bg outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold focus:border-vibrant-gold-border border border-stone-200 px-4 py-2.5 text-xs text-[#4A4A4A] font-medium"
            />
          </div>
        </div>
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 block text-[10px] uppercase tracking-wider">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="e.g., mail@example.com"
            required
            className="w-full rounded-xl bg-vibrant-bg outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold focus:border-vibrant-gold-border border border-stone-200 px-4 py-2.5 text-xs text-[#4A4A4A] font-medium"
          />
        </div>
        {/* Fantasy */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 block text-[10px] uppercase tracking-wider">Desired Fantasy / Experience *</label>
          <input
            type="text"
            value={formData.fantasy}
            onChange={e => setFormData(prev => ({ ...prev, fantasy: e.target.value }))}
            placeholder="e.g., Virtual storytime with a caregiver"
            required
            className="w-full rounded-xl bg-vibrant-bg outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold focus:border-vibrant-gold-border border border-stone-200 px-4 py-2.5 text-xs text-[#4A4A4A] font-medium"
          />
        </div>
        {/* Special Request */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 block text-[10px] uppercase tracking-wider">Special Request *</label>
          <textarea
            value={formData.specialRequest}
            onChange={e => setFormData(prev => ({ ...prev, specialRequest: e.target.value }))}
            placeholder="Any additional details or requirements"
            rows={4}
            required
            className="w-full rounded-xl bg-vibrant-bg outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold focus:border-vibrant-gold-border border border-stone-200 px-4 py-2.5 text-xs text-[#4A4A4A] font-medium"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 rounded-full cursor-pointer text-white py-4 text-xs font-bold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 ${isFormComplete ? "bg-rose-600 hover:bg-rose-700" : "bg-vibrant-pink/40"}`}
        >
          {loading ? "Processing…" : "Submit Inquiry"}
        </button>
      </form>
    </div>
  );
}
