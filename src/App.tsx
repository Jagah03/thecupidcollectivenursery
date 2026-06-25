/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Baby, Home, Layers, CalendarHeart, Sparkles, RefreshCw, LogOut, ShieldCheck, Heart, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { DBStore } from "./types";
import AgeGate from "./components/AgeGate";
import HomeView from "./components/HomeView";
import NurseryView from "./components/NurseryView";
import ResourcesView from "./components/ResourcesView";
import ContactForm from "./components/ContactForm";
import PrivateInquiryForm from "./components/PrivateInquiryForm";
import AdminPanel from "./components/AdminPanel";
import BookingView from "./components/BookingView";
import { useTheme } from "./contexts/ThemeContext";

export default function App() {
  const { isDark, toggle } = useTheme();

  const [dbData, setDbData] = useState<DBStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Age verification gate
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  // Active Navigation Tab
  // Options: "home" | "sessions" | "resources" | "contact" | "admin" | "bookings"
  const [activeTab, setActiveTab] = useState<string>("home");

  // State to support clicking "Book" on a package to auto-populate contact subject
  const [selectedPackageSubject, setSelectedPackageSubject] = useState("");
  // New tab for booking page
  const [bookingSubject, setBookingSubject] = useState("");

  // Clean navigation helper that updates browser address bar path
  const navigateToTab = (tabName: string) => {
    setActiveTab(tabName);
    const targetPath = tabName === "home" ? "/" : tabName === "resources" ? "/resources/hotlines" : `/${tabName}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, "", targetPath);
    }
  };

  // URL path listener to allow back/forward navigation and direct entry endpoints
  useEffect(() => {
    const handleLocationCheck = () => {
      const path = window.location.pathname.replace(/^\//, "");
      if (path === "admin") {
        setActiveTab("admin");
      } else if (path === "sessions" || path.startsWith("nursery")) {
        setActiveTab("sessions");
      } else if (path === "contact") {
        setActiveTab("contact");
      } else if (path.startsWith("resources")) {
        setActiveTab("resources");
      } else if (path === "bookings") {
        setActiveTab("bookings");
      } else {
        setActiveTab("home");
      }
    };

    handleLocationCheck();
    window.addEventListener("popstate", handleLocationCheck);
    return () => window.removeEventListener("popstate", handleLocationCheck);
  }, []);

  const loadPublicData = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const res = await fetch("/api/public-content");
      const data = await res.json();
      if (data.success && data.data) {
        setDbData(data.data);
      } else {
        setErrorState(data.error || "Database content parsing error.");
      }
    } catch (err) {
      setErrorState("Database connection disruption. Showing backup details shortly.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublicData();
  }, []);

  const handleBookPackage = (packageSubject: string) => {
    // Store subject for form pre‑population
    setBookingSubject(packageSubject);
    // Navigate to the new bookings page
    navigateToTab("bookings");
    // Reset selectedPackageSubject to avoid stale state
    setSelectedPackageSubject("");
    // Scroll to top of the booking page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getFallbackSettings = () => ({
    introHeadline: "A Safe, Nurturing Sanctuary for Age-Regression",
    introSubheadline: "Step into a professionally-guided, non-sexual space designed to relieve anxiety and PTSD.",
    introBody: "The Cupid Collective Nursery offers a welcoming environment where adults (18+) can safely utilize childhood regression as a healthy, guided coping mechanism. Led by professional, compassionate caregivers, our programs offer a peaceful escape from everyday demands.",
    routingEmail: "care@thecupidcollectivenursery.com"
  });

  const getFallbackGuidelines = () => ({
    locationDescription: "Our primary physical sanctuary is nestled inside a comforting discrete private layout.",
    sessionBoundaries: "### Absolute Non-Sexual Boundaries\nPlatonic care only.",
    rules: "### Rules\nKindness first.",
    expectations: "### What to Expect\nIntake consultation and snack time."
  });

  const finalSettings = dbData?.globalSettings || getFallbackSettings();
  const finalGuidelines = dbData?.nurseryGuidelines || getFallbackGuidelines();
  const finalPackages = dbData?.packages || [];
  const finalCaregivers = dbData?.caregivers || [];
  const finalBlogArticles = dbData?.blogArticles || [];
  const finalSafetyAlerts = dbData?.safetyAlerts || [];
  const finalHotlines = dbData?.hotlines || [];
  const finalFaqs = dbData?.faqs || [];
  const finalTestimonials = dbData?.testimonials || [];

  const resourceSubLinks = [
    { id: "safety", label: "Support & Safety Resources", href: "/resources/safety" },
    { id: "hotlines", label: "Crisis Hotlines", href: "/resources/hotlines" },
    { id: "articles", label: "Guides & Logs", href: "/resources/articles" },
    { id: "faqs", label: "FAQs Accordion", href: "/resources/faqs" }
  ];

  return (
    <div id="application-root" className="min-h-screen flex flex-col bg-vibrant-bg text-[#4A4A4A] antialiased font-sans transition-colors selection:bg-vibrant-pink/40 selection:text-vibrant-charcoal">
      <AgeGate onVerify={() => setIsAgeVerified(true)} />

      {isAgeVerified && (
        <>
          <header id="main-header" className="sticky top-0 z-50 bg-vibrant-bg/95 backdrop-blur-md border-b border-vibrant-pink/30 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <div
                  id="header-brand"
                  onClick={() => navigateToTab("home")}
                  className="flex items-center gap-2.5 cursor-pointer select-none group"
                >
                  <div className="w-10 h-10 bg-vibrant-gold rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                    <div className="w-6 h-6 bg-white rounded-full opacity-70 flex items-center justify-center">
                      <Baby size={13} className="text-vibrant-charcoal" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-lg font-extrabold tracking-tight text-vibrant-charcoal block font-display">
                      The Cupid <span className="text-vibrant-pink bg-vibrant-charcoal px-2 py-0.5 rounded-lg text-sm font-bold">Collective</span>
                    </span>
                    <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-vibrant-gold-text block leading-none">
                      Therapeutic Nursery
                    </span>
                  </div>
                </div>
                <nav id="desktop-routing-links" className="hidden md:flex items-center gap-6">
                  {[
                    { id: "home", label: "Home", icon: Home },
                    { id: "sessions", label: "The Nursery", icon: Sparkles },
                    { id: "resources", label: "Resources", icon: Layers },
                    { id: "contact", label: "Contact", icon: CalendarHeart }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isSel = activeTab === tab.id;
                    return (
                      <div key={tab.id} className="relative group">
                        <button
                          id={`nav-link-${tab.id}`}
                          onClick={() => {
                            navigateToTab(tab.id);
                            if (tab.id !== "contact") setSelectedPackageSubject("");
                          }}
                          className={`flex cursor-pointer items-center gap-1.5 px-2 py-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 hover:text-vibrant-dark ${isSel
                            ? "border-vibrant-gold text-vibrant-dark font-extrabold"
                            : "border-transparent text-stone-500 hover:border-vibrant-gold/40"
                            }`}
                        >
                          <Icon size={12} className={isSel ? "text-vibrant-charcoal" : "text-stone-400"} />
                          {tab.label}
                        </button>
                        {tab.id === "resources" && (
                          <div className="absolute top-full left-0 pt-2 hidden group-hover:block z-50">
                            <div className="bg-vibrant-bg border border-vibrant-pink/30 shadow-xl rounded-2xl py-1 min-w-56 overflow-hidden">
                              {resourceSubLinks.map(r => (
                                <a
                                  key={r.id}
                                  href={r.href}
                                  className="block px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-vibrant-pink/30 hover:text-vibrant-dark transition-colors"
                                >
                                  {r.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
                <button
                  onClick={toggle}
                  className="cursor-pointer p-2 rounded-full hover:bg-vibrant-pink/40 transition-colors"
                  aria-label="Toggle dark mode"
                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? <Sun size={16} className="text-vibrant-gold-text" /> : <Moon size={16} className="text-vibrant-charcoal" />}
                </button>
                <div className="h-4 w-px bg-stone-200 mx-1" />
                <span className="text-[10px] font-bold px-2.5 py-1 bg-vibrant-blue rounded text-vibrant-blue-text select-none uppercase tracking-wide">
                  18+ CERTIFIED
                </span>
              </div>
            </div>
          </header>

          {errorState && (
            <div className="bg-amber-50 border-b border-amber-100 py-3 text-center px-4">
              <p className="text-xs text-amber-700 font-medium">
                Note: Offline safety fallbacks enabled. You are browsing the nursery's handbook securely offline.
              </p>
            </div>
          )}

          <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "home" && (
                  <HomeView
                    settings={finalSettings}
                    testimonials={finalTestimonials}
                    onNavigate={(tab) => {
                      navigateToTab(tab);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                )}

                {activeTab === "sessions" && (
                  <NurseryView
                    guidelines={finalGuidelines}
                    packages={finalPackages}
                    caregivers={finalCaregivers}
                    onBookPackage={handleBookPackage}
                  />
                )}

                {activeTab === "resources" && (
                  <ResourcesView
                    blogArticles={finalBlogArticles}
                    safetyAlerts={finalSafetyAlerts}
                    hotlines={finalHotlines}
                    faqs={finalFaqs}
                  />
                )}

                {activeTab === "contact" && (
                  <PrivateInquiryForm
                    onSuccess={() => setSelectedPackageSubject("")}
                  />
                )}

                {activeTab === "bookings" && (
                  <BookingView
                    subject={bookingSubject}
                    onSuccess={() => setBookingSubject("")}
                  />
                )}

                {activeTab === "admin" && (
                  <AdminPanel />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer id="main-footer" className="bg-white border-t border-vibrant-pink/50 py-12 mt-16 text-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex justify-center items-center gap-1 text-vibrant-charcoal">
                <Heart size={14} className="fill-vibrant-pink text-vibrant-pink animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono text-stone-500">
                  Comfort. Heal. Grow.
                </span>
              </div>
              <p className="text-xs text-stone-500 max-w-2xl mx-auto leading-relaxed">
                The Cupid Collective Nursery is a professional website providing informational coping and age-regression counseling guidelines. We are **100% platonic, ethical, and strictly secure**. No sexual behaviors, implications, or services are provided under any terms.
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
