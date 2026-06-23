import React, { useState } from "react";

interface StripeCheckoutProps {
  subject: string;
  onPaymentStart: () => void;
}

export default function StripeCheckout({ subject, onPaymentStart }: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");
    onPaymentStart();

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });
      const data = await res.json();

      if (!res.ok || !data.sessionId) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-vibrant-pink rounded-[32px] p-6 shadow-xs">
      <h3 className="text-lg font-semibold text-vibrant-charcoal mb-4">Complete Payment</h3>
      <p className="text-sm text-stone-500 mb-4">
        You will be redirected to Stripe&#39;s secure checkout to complete your payment.
      </p>

      {error && (
        <p className="text-sm text-red-600 mb-4 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-vibrant-pink text-white px-6 py-3 font-medium hover:bg-vibrant-pink/80 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirecting…
          </span>
        ) : (
          "Pay with Stripe"
        )}
      </button>
    </div>
  );
}
