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
      <h2 className="text-2xl font-extrabold text-vibrant-charcoal">Book Your Session</h2>
      <p className="text-sm text-stone-600">Proceed with the baby‑friendly form below. Your selected package is pre‑filled in the subject field.</p>
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
