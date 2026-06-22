import React, { useState, useEffect } from "react";

const getSectionFromPath = () => {
  const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
  const parts = path.split("/");
  if (parts[0] === "resources" && parts[1]) {
    const valid = ["all", "hotlines", "safety", "articles", "faqs"];
    if (valid.includes(parts[1] as any)) return parts[1] as any;
  }
  return "all";
};
import { Phone, AlertTriangle, BookOpen, HelpCircle, HeartPulse, ChevronDown, ChevronUp, ShieldAlert, CheckCircle, ExternalLink } from "lucide-react";
import { BlogArticle, SafetyAlert, MentalHealthResource, FAQItem } from "../types";

interface ResourcesViewProps {
  blogArticles: BlogArticle[];
  safetyAlerts: SafetyAlert[];
  hotlines: MentalHealthResource[];
  faqs: FAQItem[];
}

export default function ResourcesView({ blogArticles, safetyAlerts, hotlines, faqs }: ResourcesViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "hotlines" | "safety" | "articles" | "faqs">(getSectionFromPath());
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
  setExpandedFaq(expandedFaq === id ? null : id);
};

React.useEffect(() => {
  const targetPath = activeTab === "all" ? "/resources/hotlines" : "/resources/" + activeTab;
  if (window.location.pathname !== targetPath) {
    window.history.pushState({}, "", targetPath);
  }
}, [activeTab]);


  // Group hotlines by category
  const hotlineCategories = hotlines.reduce((acc, current) => {
    const cat = current.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(current);
    return acc;
  }, {} as Record<string, MentalHealthResource[]>);

  return (
    <div id="resources-view-container" className="space-y-12 py-4">
      {/* Header Statement */}
      <section id="resources-heading" className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl md:text-5xl font-extrabold text-stone-800 font-display">
          Support & Safety Resources
        </h1>
        <p className="text-stone-500 text-sm leading-relaxed font-sans">
          Access specialized crisis text lines, community watch reports, therapeutic guidelines, and collapsible FAQ menus dynamically.
        </p>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {[
            { id: "all", label: "All Resources", icon: HeartPulse },
            { id: "hotlines", label: "Crisis Hotlines", icon: Phone },
            { id: "safety", label: "Safety Alerts", icon: AlertTriangle },
            { id: "articles", label: "Guides & Logs", icon: BookOpen },
            { id: "faqs", label: "FAQs Accordion", icon: HelpCircle }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex cursor-pointer items-center gap-1.5 px-4.5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                  isActive
                    ? "bg-vibrant-charcoal text-white border-vibrant-charcoal shadow-xs"
                    : "bg-white text-stone-650 border-stone-200 hover:bg-stone-50"
                }`}
              >
                <Icon size={12} className={isActive ? "text-white" : "text-stone-400"} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* RENDER CHOSEN RESOURCE CATEGORY */}

      {/* 1. MENTAL HEALTH CRISIS LINES */}
      {(activeTab === "all" || activeTab === "hotlines") && (
        <section id="mental-health-section" className="space-y-6">
          <div className="border-l-4 border-vibrant-blue-border pl-3">
            <h2 className="text-xl md:text-2xl font-extrabold text-vibrant-charcoal font-display flex items-center gap-2">
              <HeartPulse className="text-vibrant-blue-text" size={22} />
              Professional Crisis Directories
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">Confidential crisis care with 24/7 call and text support directories.</p>
          </div>

          <div className="space-y-8">
            {Object.keys(hotlineCategories).map(category => (
              <div key={category} className="space-y-4">
                <h3 className="text-xs font-extrabold text-vibrant-blue-text uppercase tracking-widest font-mono bg-vibrant-blue px-3 py-1.5 rounded-lg inline-block h-auto">
                  {category} Support Networks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hotlineCategories[category].map(hl => (
                    <div
                      key={hl.id}
                      id={`hotline-card-${hl.id}`}
                      className="bg-white border-2 border-vibrant-blue rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:border-vibrant-blue-border transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="text-base font-extrabold text-vibrant-charcoal font-display">{hl.name}</h4>
                          {hl.link && (
                            <a
                              href={hl.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-stone-400 hover:text-vibrant-blue-text shrink-0"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        <p className="text-stone-500 text-xs leading-relaxed font-sans font-medium">{hl.description}</p>
                      </div>

                      <div className="border-t border-vibrant-blue-border/30 pt-4 mt-5 grid grid-cols-2 gap-3 bg-vibrant-blue/20 -mx-6 -mb-6 p-4 rounded-b-2xl">
                        <div className="text-vibrant-blue-text text-xs font-bold font-mono">
                          <span className="text-[10px] text-stone-500 block font-sans font-medium">To Call:</span>
                          {hl.phone}
                        </div>
                        {hl.textCode && (
                          <div className="text-vibrant-blue-text text-xs font-bold font-mono">
                            <span className="text-[10px] text-stone-500 block font-sans font-medium">To Text:</span>
                            {hl.textCode}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. SAFETY & SCAM BOARD WARNINGS */}
      {(activeTab === "all" || activeTab === "safety") && (
        <section id="safety-warnings" className="space-y-6 pt-4">
          <div className="border-l-4 border-vibrant-gold-border pl-3">
            <h2 className="text-xl md:text-2xl font-extrabold text-vibrant-charcoal font-display flex items-center gap-2">
              <AlertTriangle className="text-vibrant-gold-text animate-bounce" size={22} />
              Nursery Safety Watch Alertboard
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">Dynamic watch alerts published by caregivers to keep users safe from malicious actors.</p>
          </div>

          {safetyAlerts && safetyAlerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {safetyAlerts.map(alert => (
                <div
                  key={alert.id}
                  id={`safety-alert-${alert.id}`}
                  className="bg-white border-b-4 border-vibrant-gold-border rounded-[32px] p-6 space-y-4 shadow-xs"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className="text-md font-extrabold text-vibrant-charcoal font-display flex items-center gap-1.5">
                        <ShieldAlert className="text-vibrant-gold-text shrink-0" size={16} />
                        {alert.title}
                      </h4>
                      <span className="text-[10px] font-mono text-stone-400 block font-medium">Published: {alert.date}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-vibrant-gold text-vibrant-gold-text">
                      Alert Case
                    </span>
                  </div>

                  <p className="text-stone-600 text-xs leading-relaxed font-sans bg-vibrant-gold/20 p-3 rounded-xl border border-vibrant-gold-border/30 font-medium">
                    {alert.details}
                  </p>

                  {alert.recommendations && (
                    <div className="space-y-1.5 pt-2">
                      <h5 className="text-xs font-bold text-[#8D7A4D] flex items-center gap-1.5 font-display uppercase tracking-widest">
                        <CheckCircle className="text-[#8D7A4D] shrink-0" size={14} />
                        How to Protect Yourself:
                      </h5>
                      <p className="text-stone-500 text-xs leading-relaxed font-sans font-medium">{alert.recommendations}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-400 text-xs text-center py-6">No current active scam reports filed. Stay safe!</p>
          )}
        </section>
      )}

      {/* 3. ARTICLES / BLOG COPIES */}
      {(activeTab === "all" || activeTab === "articles") && (
        <section id="articles-blogs" className="space-y-6 pt-4">
          <div className="border-l-4 border-vibrant-pink pl-3">
            <h2 className="text-xl md:text-2xl font-extrabold text-vibrant-charcoal font-display flex items-center gap-2">
              <BookOpen className="text-vibrant-pink" size={22} />
              Educational Notes & ABDL Logistics
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">Reviews, product guides, and insights to assist your adult regression path.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogArticles && blogArticles.map(art => (
              <article
                key={art.id}
                id={`blog-article-${art.id}`}
                className="bg-white border-2 border-vibrant-pink rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:border-vibrant-pink/80 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-vibrant-pink/20 -mx-6 -mt-6 p-4 rounded-t-[22px] border-b border-vibrant-pink/30">
                    <span className="bg-white text-[10px] text-vibrant-charcoal font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-mono">
                      {art.category || "General"}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono font-medium">{art.date}</span>
                  </div>
                  <h3 className="text-md font-extrabold text-[#4A4A4A] font-display leading-snug">{art.title}</h3>
                  <p className="text-stone-500 text-xs leading-relaxed font-sans line-clamp-4 font-medium">{art.content}</p>
                </div>

                <div className="border-t border-stone-100 pt-4 mt-6 text-right">
                  <p className="text-[10px] text-vibrant-gold-text font-extrabold uppercase tracking-wider">Published by caregivers</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 4. COLLAPSIBLE ACCORDION FAQS */}
      {(activeTab === "all" || activeTab === "faqs") && (
        <section id="faqs-block" className="space-y-6 pt-4 max-w-4xl mx-auto">
          <div className="text-center space-y-1 bg-vibrant-blue/35 p-6 rounded-3xl border border-vibrant-blue-border/80 shadow-xs max-w-md mx-auto">
            <HelpCircle className="text-vibrant-blue-text mx-auto" size={32} />
            <h2 className="text-xl font-extrabold text-[#4A6A7A] font-display">Nursery Frequently Asked Questions</h2>
            <p className="text-xs text-vibrant-blue-text font-medium">Find answers supporting terminology, bounds and booking.</p>
          </div>

          <div className="space-y-4 pt-4">
            {faqs && faqs.map(item => {
              const isOpen = expandedFaq === item.id;
              return (
                <div
                  key={item.id}
                  id={`faq-accordion-item-${item.id}`}
                  className="bg-white border-2 border-vibrant-blue rounded-2xl overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(item.id)}
                    className="w-full flex justify-between items-center text-left p-5 text-stone-750 font-bold text-sm tracking-wide font-display hover:bg-stone-50/50 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-vibrant-blue text-[10px] text-vibrant-blue-text font-bold flex items-center justify-center font-mono">?</span>
                      {item.question}
                    </span>
                    {isOpen ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1.5 text-stone-600 text-xs leading-relaxed font-sans border-t border-stone-100 bg-[#FDFBF7]">
                      <p className="max-w-3xl font-medium">{item.answer}</p>
                      {item.category && (
                        <div className="mt-3">
                          <span className="inline-block rounded bg-vibrant-blue/20 text-[9px] uppercase tracking-wider font-bold text-vibrant-blue-text px-1.5 py-0.5 font-mono">
                            Category: {item.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
