import React, { useState, useEffect } from "react";
import { Send, Shield, Sparkles, Smile, Info, CreditCard } from "lucide-react";

interface ContactFormProps {
  initialSubject?: string;
  onSuccess: () => void;
}

export default function ContactForm({ initialSubject, onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    pronouns: "",
    email: "",
    subject: "",
    message: "",
    agreedBoundaries: false
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (initialSubject) {
      setFormData(prev => ({ ...prev, subject: initialSubject }));
    }
  }, [initialSubject]);

  const handlePayClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setErrorMessage("Please complete all required fields (marked *).");
      return;
    }

    if (!formData.agreedBoundaries) {
      setErrorMessage("You must read and agree to our Nursery Boundaries prior to submitting.");
      return;
    }

    setLoading(true);

    try {
      const inquiryRes = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const inquiryData = await inquiryRes.json();

      if (!inquiryData.success) {
        throw new Error(inquiryData.error || "Inquiry submission failed.");
      }

      onSuccess();

      const checkoutRes = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: formData.subject })
      });
      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok || !checkoutData.url) {
        throw new Error(checkoutData.error || "Failed to create checkout session. Your inquiry was saved.");
      }

      window.location.href = checkoutData.url;
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact-form-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto py-4">

      {/* Informational Guidelines Card */}
      <div className="lg:col-span-4 bg-vibrant-bg p-6 rounded-[32px] border-4 border-vibrant-pink shadow-xs space-y-6 self-start">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vibrant-pink text-white shadow-xs">
          <Info size={20} />
        </div>
        <h3 className="text-xl font-extrabold text-vibrant-charcoal font-display">Booking Procedures</h3>

        <div className="space-y-4 text-xs text-stone-600 leading-relaxed font-sans font-medium">
          <div className="flex gap-2">
            <Smile size={16} className="text-vibrant-gold-text shrink-0 mt-0.5" />
            <p><strong>1. Step-Wise Intake:</strong> All sessions are preceded by a strict consultation call to safely draft boundaries, limits, and expectation criteria.</p>
          </div>
          <div className="flex gap-2">
            <Shield size={16} className="text-vibrant-blue-text shrink-0 mt-0.5" />
            <p><strong>2. Age Proofs:</strong> Prior to completing any calendar bookings, state-issued pictorial identification cards must be provided privately.</p>
          </div>
          <div className="flex gap-2">
            <Sparkles size={16} className="text-vibrant-gold-text shrink-0 mt-0.5" />
            <p><strong>3. Deep Privacy:</strong> Your name, pronouns, email, and messages are guarded securely. They will never be shared externally.</p>
          </div>
        </div>

        <div className="bg-vibrant-pink/15 p-4 rounded-2xl border border-vibrant-pink/30 text-[11px] text-stone-500 leading-normal font-medium">
          <strong>Important notice:</strong> If you are feeling urgent psychological distress or crisis, please do not wait for booking review times. Go to our Resources menu and use the 988 or text support codes for instant, free care.
        </div>
      </div>

      {/* Actual Form Fields */}
      <form onSubmit={handlePayClick} className="lg:col-span-8 bg-white p-8 rounded-[32px] border-2 border-vibrant-pink shadow-xs space-y-6">
        <div className="space-y-2 mb-2">
          <h2 className="text-2xl font-extrabold font-display text-vibrant-charcoal">Private Nursery Inquiry</h2>
          <p className="text-xs text-stone-400 leading-relaxed font-semibold">Please state your therapeutic comfort goals so staff can configure agreements.</p>
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-500">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Alias / Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block text-[10px] uppercase tracking-wider">Name or Custom Alias *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Coby (Little Coby)"
              required
              className="w-full rounded-xl bg-vibrant-bg outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold focus:border-vibrant-gold-border border border-stone-200 px-4 py-2.5 text-xs text-[#4A4A4A] font-medium"
            />
          </div>

          {/* Pronouns */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block text-[10px] uppercase tracking-wider">Preferred Pronouns</label>
            <input
              type="text"
              value={formData.pronouns}
              onChange={(e) => setFormData(prev => ({ ...prev, pronouns: e.target.value }))}
              placeholder="e.g., He / Little Him"
              className="w-full rounded-xl bg-vibrant-bg outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold focus:border-vibrant-gold-border border border-stone-200 px-4 py-2.5 text-xs text-[#4A4A4A] font-medium"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 block text-[10px] uppercase tracking-wider">Target Email Address *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="e.g., mail@example.com"
            required
            className="w-full rounded-xl bg-vibrant-bg outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold focus:border-vibrant-gold-border border border-stone-200 px-4 py-2.5 text-xs text-[#4A4A4A] font-medium"
          />
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 block text-[10px] uppercase tracking-wider">Subject / Package Inquiry *</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="e.g., Inquiring about virtual story session"
            required
            className="w-full rounded-xl bg-vibrant-bg outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold focus:border-vibrant-gold-border border border-stone-200 px-4 py-2.5 text-xs text-[#4A4A4A] font-medium"
          />
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 block text-[10px] uppercase tracking-wider">Desired Goals & Session Messages *</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Tell us a little bit about what comfort style you seek, which sensory activities you prefer, any triggers we should safely avoid, and what regressed mental age model you tend to comfortably hover in..."
            rows={5}
            required
            className="w-full rounded-xl bg-vibrant-bg outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold focus:border-vibrant-gold-border border border-stone-200 px-4 py-2.5 text-xs text-[#4A4A4A] leading-relaxed font-medium"
          />
        </div>

        {/* Boundary agreement Checkbox */}
        <div className="rounded-2xl bg-vibrant-blue/30 border border-vibrant-blue-border/50 p-4.5 space-y-3">
          <div className="flex items-start gap-3">
            <input
              id="confirm-boundaries-checkbox"
              type="checkbox"
              checked={formData.agreedBoundaries}
              onChange={(e) => setFormData(prev => ({ ...prev, agreedBoundaries: e.target.checked }))}
              className="mt-1 shrink-0 rounded text-vibrant-blue-text focus:ring-vibrant-blue-border accent-vibrant-blue-text hover:border-vibrant-blue-border outline-none cursor-pointer"
            />
            <label htmlFor="confirm-boundaries-checkbox" className="text-[11px] font-semibold text-vibrant-blue-text leading-normal cursor-pointer select-none">
              I certify that I am **18 years of age or older** and have read, understood, and agreed to the nursery bounds. I understand Cupid Collective Nursery is strictly non-sexual and operates on platonic therapy standards.
            </label>
          </div>
        </div>

        {/* Stripe Payment Button */}
        <button
          id="pay-with-stripe-btn"
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-full cursor-pointer bg-vibrant-pink hover:bg-vibrant-pink/80 text-white py-4 text-xs font-bold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50"
        >
          <CreditCard size={15} />
          {loading ? "Processing…" : "Pay with Stripe & Submit"}
        </button>
      </form>
    </div>
  );
}
