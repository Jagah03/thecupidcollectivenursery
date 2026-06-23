import React from "react";

interface StripeCheckoutProps {
  subject: string;
  onPaymentStart: () => void;
}

export default function StripeCheckout({ subject, onPaymentStart }: StripeCheckoutProps) {
  const handleClick = () => {
    // placeholder for Stripe integration – to be replaced later
    console.log("Initiating Stripe payment for subject: ", subject);
    onPaymentStart();
  };

  return (
    <div className="bg-white border-2 border-vibrant-pink rounded-[32px] p-6 shadow-xs">
      <h3 className="text-lg font-semibold text-vibrant-charcoal mb-4">Stripe Payment (Soon)</h3>
      <p className="text-sm text-stone-500 mb-4">This is a placeholder button for future Stripe checkout integration.</p>
      <button
        onClick={handleClick}
        className="rounded-full bg-vibrant-pink text-white px-6 py-3 font-medium hover:bg-vibrant-pink/80"
      >
        Pay with Stripe
      </button>
    </div>
  );
}
