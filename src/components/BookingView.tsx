import React, { useState } from "react";
import ContactForm from "./ContactForm";
import StripeCheckout from "./StripeCheckout";

interface BookingViewProps {
  subject: string;
  onSuccess: () => void;
}

export default function BookingView({ subject, onSuccess }: BookingViewProps) {
  const [stripeLoaded, setStripeLoaded] = useState(false);
  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-vibrant-charcoal font-display">Book Your Session</h2>
        <p className="text-sm text-stone-600 font-sans">
          Proceed with the nursery inquiry and booking form below. Your selected session details are pre-populated into the secure form.
        </p>
      </div>

      {subject && (
        <div className="bg-vibrant-pink/15 border-2 border-vibrant-pink rounded-3xl p-6 flex items-center gap-4 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-vibrant-pink flex items-center justify-center text-white text-lg">
            🎁
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-vibrant-dark font-extrabold block">Selected Package</span>
            <span className="text-lg font-extrabold text-vibrant-charcoal block">{subject}</span>
          </div>
        </div>
      )}

      <ContactForm initialSubject={subject} onSuccess={() => { onSuccess(); setStripeLoaded(false); }} />
      {/* Stripe payment placeholder */}
      {!stripeLoaded && (
        <StripeCheckout
          subject={subject}
          onPaymentStart={() => setStripeLoaded(true)}
        />
      )}
    </div>
  );
}
