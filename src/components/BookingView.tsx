import React, { useState, useEffect } from "react";
import ContactForm from "./ContactForm";
import StripeCheckout from "./StripeCheckout";

interface BookingViewProps {
  subject: string;
  onSuccess: () => void;
}

export default function BookingView({ subject, onSuccess }: BookingViewProps) {
  const [paymentStatus, setPaymentStatus] = useState<"success" | "canceled" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setPaymentStatus("success");
      window.history.replaceState({}, "", "/bookings");
    } else if (params.get("canceled") === "true") {
      setPaymentStatus("canceled");
      window.history.replaceState({}, "", "/bookings");
    }
  }, []);

  if (paymentStatus === "success") {
    return (
      <div className="max-w-5xl mx-auto py-6 space-y-8">
        <div className="bg-green-50 border-2 border-green-400 rounded-[32px] p-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold font-display text-vibrant-charcoal">Payment Successful!</h2>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Thank you! Your payment has been received. Our caregivers will be in touch with you shortly to confirm your session details.
          </p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "canceled") {
    return (
      <div className="max-w-5xl mx-auto py-6 space-y-8">
        <div className="bg-amber-50 border-2 border-amber-400 rounded-[32px] p-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold font-display text-vibrant-charcoal">Payment Canceled</h2>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Your payment was canceled. No charges have been made. You can fill out the form again when you&apos;re ready to proceed.
          </p>
        </div>
      </div>
    );
  }

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

      <ContactForm initialSubject={subject} onSuccess={() => { onSuccess(); }} />
      <StripeCheckout subject={subject} />
    </div>
  );
}
