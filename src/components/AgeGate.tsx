import React, { useState, useEffect } from "react";
import { ShieldAlert, HeartHandshake, Baby } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AgeGateProps {
  onVerify: () => void;
}

export default function AgeGate({ onVerify }: AgeGateProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isVerified = localStorage.getItem("cupid_nursery_verified_18");
    if (!isVerified) {
      setIsOpen(true);
    } else {
      onVerify();
    }
  }, [onVerify]);

  const handleAccept = () => {
    localStorage.setItem("cupid_nursery_verified_18", "true");
    setIsOpen(false);
    onVerify();
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="age-gate-container"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#5A5A5A]/55 p-4 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -15 }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          id="age-gate-card"
          className="w-full max-w-sm overflow-hidden rounded-[40px] border-4 border-vibrant-pink bg-vibrant-bg shadow-2xl"
        >
          {/* Header Banner */}
          <div className="relative bg-vibrant-pink p-8 text-center">
            <div className="absolute top-3 right-3 rounded-md bg-vibrant-blue px-2.5 py-1 text-[9px] font-extrabold text-vibrant-blue-text tracking-wider uppercase shadow-xs select-none">
              SECURE
            </div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-vibrant-charcoal shadow-xs">
              <Baby size={28} />
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-vibrant-charcoal font-display">
              Welcome to the Nursery
            </h2>
            <p className="text-[10px] text-vibrant-gold-text font-extrabold mt-1 font-mono uppercase tracking-wider">
              THE CUPID COLLECTIVE NURSERY
            </p>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="rounded-2xl bg-white p-4 text-stone-600 text-xs leading-relaxed border border-vibrant-pink/40 font-medium">
              <div className="flex gap-2.5">
                <ShieldAlert className="text-vibrant-gold-text shrink-0 mt-0.5" size={18} />
                <p>
                  This space is dedicated strictly to **adult age-regression, anxiety relief counseling, and therapeutic mental health support**. Our caregiver sessions are 100% professional and platonic. We carry absolute non-sexual boundaries.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-stone-500 font-bold uppercase tracking-wide">
              You must be at least **18 years of age** to view or explore our resources.
            </p>

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                id="age-gate-decline-btn"
                onClick={handleDecline}
                className="w-full rounded-full border-2 border-stone-200 bg-white text-stone-500 py-3 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 transition-all cursor-pointer"
              >
                Under 18
              </button>
              <button
                id="age-gate-accept-btn"
                onClick={handleAccept}
                className="w-full flex items-center justify-center gap-1.5 rounded-full bg-vibrant-charcoal text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-stone-700 shadow-md transition-all cursor-pointer"
              >
                <HeartHandshake size={14} />
                Access App
              </button>
            </div>
          </div>

          {/* Verification Warning Footer */}
          <div className="bg-white border-t border-vibrant-pink/30 py-3 text-center text-[10px] text-stone-400 font-extrabold font-mono uppercase tracking-widest">
            ID Verification Required Prior to Any Booking.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
