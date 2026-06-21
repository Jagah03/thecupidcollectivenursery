import React, { useState } from "react";
import { Mail, Sparkles, ShieldCheck, Heart, UserCheck, ChevronRight, Activity, Moon } from "lucide-react";
import { GlobalSettings, Testimonial } from "../types";
import { motion } from "motion/react";

interface HomeViewProps {
  settings: GlobalSettings;
  testimonials: Testimonial[];
  onNavigate: (view: string) => void;
}

export default function HomeView({ settings, testimonials, onNavigate }: HomeViewProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: "success", message: data.message });
        setEmail("");
      } else {
        setStatus({ type: "error", message: data.error || "Mailing subscription failed." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network connection failure. Please try again soon." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="home-view-container" className="space-y-16 py-4">
      {/* Hero Section */}
      <section id="hero-section" className="bg-vibrant-pink rounded-[40px] p-8 md:p-16 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-20 rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-vibrant-gold opacity-30 rounded-full"></div>
 
        <div className="relative max-w-3xl space-y-6 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-vibrant-charcoal shadow-xs border border-vibrant-pink/50">
            <Sparkles size={12} className="animate-pulse text-vibrant-gold" />
            <span>A Safe Space for Your Inner Child</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-vibrant-charcoal leading-tight font-display">
            Your Sanctuary for <br/>
            <span className="italic font-serif text-[#5A5A5A]">Therapeutic Regression</span>
          </h1>

          <p className="text-lg md:text-xl font-medium text-stone-600 max-w-2xl">
            {settings?.introSubheadline}
          </p>

          <p className="text-stone-500 leading-relaxed max-w-2xl font-sans text-sm">
            {settings?.introBody}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              id="hero-explore-sessions-btn"
              onClick={() => onNavigate("sessions")}
              className="group flex items-center gap-2 rounded-full bg-white text-vibrant-dark px-8 py-3.5 font-bold shadow-sm hover:shadow-md transition-all cursor-pointer text-sm"
            >
              Explore Sessions
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              id="hero-contact-btn"
              onClick={() => onNavigate("contact")}
              className="rounded-full bg-vibrant-charcoal text-white px-8 py-3.5 font-bold shadow-sm hover:bg-stone-600 transition-all cursor-pointer text-sm"
            >
              Inquire Privately
            </button>
          </div>
        </div>
      </section>
 
      {/* Core Values / Philosophy Badges (styled exactly like the Design HTML Cards) */}
      <section id="values-section" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 - Light Blue themed */}
        <div className="bg-vibrant-blue rounded-3xl p-8 flex flex-col gap-3 border-b-4 border-vibrant-blue-border shadow-xs">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-2 shadow-xs text-vibrant-blue-text">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-extrabold text-vibrant-charcoal font-display">Aesthetic Safety</h3>
          <p className="text-vibrant-blue-text text-sm leading-relaxed font-semibold">
            Strictly platonic, 100% legal, and bounded by formal dual-signed consent files before starting.
          </p>
          <span className="text-xs font-bold text-vibrant-blue-text mt-auto uppercase tracking-tighter cursor-pointer" onClick={() => onNavigate("sessions")}>
            Learn Boundaries &rarr;
          </span>
        </div>

        {/* Card 2 - Soft Gold themed */}
        <div className="bg-vibrant-gold rounded-3xl p-8 flex flex-col gap-3 border-b-4 border-vibrant-gold-border shadow-xs">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-2 shadow-xs text-vibrant-gold-text">
            <Heart size={24} />
          </div>
          <h3 className="text-xl font-extrabold text-vibrant-charcoal font-display">Therapeutic Focus</h3>
          <p className="text-vibrant-gold-text text-sm leading-relaxed font-semibold">
            Designed to comfort PTSD, mitigate sensory overload, and escape the exhaustion of adulthood safely.
          </p>
          <span className="text-xs font-bold text-vibrant-gold-text mt-auto uppercase tracking-tighter cursor-pointer" onClick={() => onNavigate("resources")}>
            Explore Coping Guides &rarr;
          </span>
        </div>

        {/* Card 3 - Minimal with Pink border */}
        <div className="bg-vibrant-bg rounded-3xl p-8 flex flex-col gap-3 border-4 border-vibrant-pink shadow-xs">
          <div className="w-12 h-12 bg-vibrant-pink rounded-2xl flex items-center justify-center mb-2 text-white shadow-xs">
            <UserCheck size={24} />
          </div>
          <h3 className="text-xl font-extrabold text-vibrant-charcoal font-display">Vetted Caregivers</h3>
          <p className="text-stone-500 text-sm leading-relaxed font-medium">
            Professionals certified in childhood comfort dynamics, support methodologies, and emotional guidance.
          </p>
          <span className="text-xs font-bold text-[#F4DADA] mt-auto uppercase tracking-tighter cursor-pointer" onClick={() => onNavigate("sessions")}>
            Meet Nanny & Mommy &rarr;
          </span>
        </div>
      </section>

      {/* Comfort Illustration Banner */}
      <section id="cozy-mood-card" className="bg-[#D0EAF5]/40 rounded-3xl p-8 border-b-4 border-[#A0CAD5]/80 flex flex-col md:flex-row items-center gap-8 shadow-xs">
        <div className="shrink-0 rounded-2xl overflow-hidden bg-white p-4 border border-[#A0CAD5]/30 flex items-center justify-center w-16 h-16 shadow-xs">
          <Moon size={32} className="text-[#4A6A7A] animate-pulse" />
        </div>
        <div className="space-y-1.5 text-center md:text-left flex-1">
          <h4 className="text-lg font-bold font-display text-slate-800">Need immediate grounding?</h4>
          <p className="text-[#4A6A7A] text-xs leading-relaxed max-w-xl font-sans">
            Quiet your environment, slow your breathing to matched counts, and explore our professional directory of crisis lifelines in the resources directory. Your mental well-being is our utmost focus.
          </p>
        </div>
        <button
          onClick={() => onNavigate("resources")}
          className="rounded-xl bg-[#4A6A7A] text-white px-5 py-3 text-xs font-bold hover:bg-[#3b5563] transition-all shadow-xs shrink-0 cursor-pointer uppercase tracking-wider"
        >
          View Resources
        </button>
      </section>

      {/* Testimonials Slider */}
      {testimonials && testimonials.length > 0 && (
        <section id="testimonials-section" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-vibrant-charcoal">Loved by the Little Ones</h2>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto font-sans">Listen to what members of our nursery group share about their therapeutic regression results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {testimonials.map((test) => (
              <div
                key={test.id}
                id={`testimonial-card-${test.id}`}
                className="flex flex-col justify-between p-6 bg-white rounded-3xl border border-vibrant-pink/40 shadow-xs relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-vibrant-pink/20 to-transparent rounded-bl-3xl -z-0" />
                <div className="relative z-10">
                  <div className="flex gap-0.5 text-vibrant-gold-text mb-3">
                    {Array.from({ length: test.rating }).map((_, i) => (
                      <Sparkles key={i} size={14} className="fill-vibrant-gold text-vibrant-gold-text" />
                    ))}
                  </div>
                  <p className="text-stone-600 text-xs italic font-sans leading-relaxed mb-4">
                    "{test.quote}"
                  </p>
                </div>
                <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-vibrant-charcoal font-display">{test.author}</span>
                  <span className="rounded-full bg-vibrant-pink/30 text-[9px] uppercase tracking-wider font-extrabold text-vibrant-charcoal px-2.5 py-0.5 font-mono">{test.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter signup form (styled with the design's stay connected dark theme) */}
      <section id="newsletter-section" className="rounded-3xl bg-vibrant-charcoal text-white p-8 md:p-12 text-center max-w-3xl mx-auto space-y-6 shadow-md relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-white opacity-5 rounded-full"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-vibrant-gold opacity-10 rounded-full"></div>
        
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-vibrant-pink">
          <Mail size={22} />
        </div>
        <div className="space-y-2 relative z-10">
          <h3 className="text-2xl font-bold font-display uppercase tracking-widest text-[#FDFBF7]">Join the Nursery Post</h3>
          <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
            Register your email to receive calming activities, printable coloring sheets, helpful coping articles, and safety announcements.
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 relative z-10">
          <input
            id="newsletter-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email..."
            required
            className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 border-none outline-none focus:ring-1 ring-vibrant-gold"
          />
          <button
            id="newsletter-submit-btn"
            type="submit"
            disabled={loading}
            className="bg-vibrant-gold text-[#4A4A4A] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </form>

        {status.type && (
          <p className={`text-xs font-bold ${status.type === "success" ? "text-vibrant-gold" : "text-vibrant-pink"} relative z-10`}>
            {status.message}
          </p>
        )}
      </section>
    </div>
  );
}
