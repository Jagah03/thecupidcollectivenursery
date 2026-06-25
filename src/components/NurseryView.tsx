import React from "react";
import { Sparkles, Compass, MapPin, Shield, Calendar, UserCheck, CheckCircle2 } from "lucide-react";
import { NurseryGuidelines, NurseryPackage, Caregiver } from "../types";

interface NurseryViewProps {
  guidelines: NurseryGuidelines;
  packages: NurseryPackage[];
  caregivers: Caregiver[];
  onBookPackage: (packageName: string) => void;
}

// Simple internal Markdown parser helper
function renderSimpleMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("###")) {
      return (
        <h4 key={idx} className="text-md font-bold text-stone-800 mt-5 mb-2 font-display flex items-center gap-1.5 border-b border-stone-100 pb-1">
          <Sparkles size={14} className="text-pink-400" />
          {trimmed.replace(/^###\s*/, "")}
        </h4>
      );
    }
    if (trimmed.startsWith("##")) {
      return (
        <h3 key={idx} className="text-lg font-bold text-stone-800 mt-6 mb-3 font-display">
          {trimmed.replace(/^##\s*/, "")}
        </h3>
      );
    }
    if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      const content = trimmed.replace(/^[-*]\s*/, "");
      // Support simple bold like **text**
      const parts = content.split("**");
      return (
        <li key={idx} className="ml-5 list-disc text-stone-600 text-sm leading-relaxed mb-1.5 font-sans">
          {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-stone-800">{p}</strong> : p)}
        </li>
      );
    }
    if (trimmed.match(/^\d+\./)) {
      const content = trimmed.replace(/^\d+\.\s*/, "");
      const indexNum = trimmed.match(/^\d+/)?.[0] || "1";
      return (
        <div key={idx} className="flex gap-2.5 ml-1 my-2 text-stone-600 text-sm leading-relaxed font-sans">
          <span className="font-bold text-rose-400 font-mono">{indexNum}.</span>
          <p>{content}</p>
        </div>
      );
    }
    if (trimmed === "") {
      return <div key={idx} className="h-2" />;
    }
    // Normal paragraph
    const parts = trimmed.split("**");
    return (
      <p key={idx} className="text-stone-600 text-sm leading-relaxed mb-2.5 font-sans">
        {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-stone-900">{p}</strong> : p)}
      </p>
    );
  });
}

export default function NurseryView({ guidelines, packages, caregivers, onBookPackage }: NurseryViewProps) {
  const inPersonPackages = packages.filter(p => !p.isVirtual);
  const virtualPackages = packages.filter(p => p.isVirtual);

  return (
    <div id="nursery-view-container" className="space-y-16 py-4">
      
      {/* Title Intro */}
      <section id="nursery-intro" className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-stone-800 font-display">
          Inside The Nursery
        </h1>
        <p className="text-stone-500 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-sans">
          Welcome to our private play sanctuary. Designed with specialized childhood sensory items, clean toys, comforting textures, and dedicated care, we offer both in-person rest sessions and virtual story hours.
        </p>
      </section>

      {/* Nursery Guidelines Columns */}
      <section id="physical-nursery-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Physical Description (styled after Card 3) */}
        <div className="lg:col-span-5 bg-vibrant-bg border-4 border-vibrant-pink rounded-[32px] p-8 space-y-6 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-vibrant-pink text-white shadow-xs">
            <MapPin size={24} />
          </div>
          <h3 className="text-2xl font-extrabold text-vibrant-charcoal font-display">Our Physical Sanctuary</h3>
          <p className="text-stone-600 text-sm leading-relaxed font-sans font-medium">
            {guidelines?.locationDescription || "Our physical space resides inside a discrete, professional location. Rigorously cleaned and secured daily, it supplies sensory relaxation and structured emotional coping resources."}
          </p>
          
          <div className="bg-white/60 rounded-2xl p-5 border border-vibrant-pink/35 space-y-3">
            <h4 className="text-xs font-extrabold text-[#8D7A4D] uppercase tracking-wider font-mono">Available Sanctuary Amenities</h4>
            <div className="grid grid-cols-2 gap-2 text-stone-600 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="text-vibrant-gold-text" size={12} /> Soft beanbags</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="text-vibrant-gold-text" size={12} /> Toy storage chests</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="text-vibrant-gold-text" size={12} /> Watercolor stations</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="text-vibrant-gold-text" size={12} /> Comforting storybooks</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="text-vibrant-gold-text" size={12} /> Sleeping cribs / beds</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="text-vibrant-gold-text" size={12} /> Safe snacks / cereal</div>
            </div>
          </div>
        </div>

        {/* Right Rules & Parameters Dynamic Content (styled after Card 1) */}
        <div className="lg:col-span-7 bg-vibrant-blue rounded-[32px] p-8 flex flex-col gap-6 border-b-4 border-vibrant-blue-border shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-vibrant-blue-text shadow-xs">
            <Shield size={24} />
          </div>
          <h3 className="text-2xl font-extrabold text-[#4A6A7A] font-display">Nursery Safety & Rules</h3>
          
          <div className="space-y-4 text-vibrant-blue-text font-medium text-sm">
            <div className="prose-h3:text-lg prose-h3:font-semibold prose-h3:text-[#4A6A7A]">
              {renderSimpleMarkdown(guidelines?.sessionBoundaries)}
            </div>
            <div className="border-t border-vibrant-blue-border/40 pt-5 mt-5">
              {renderSimpleMarkdown(guidelines?.rules)}
            </div>
          </div>
        </div>

</section>

        {/* What to Expect standalone section */}
        <section id="what-to-expect-section" className="mt-12 bg-vibrant-bg rounded-[32px] p-8 border-4 border-vibrant-pink shadow-xs">
          <div className="space-y-4 text-vibrant-blue-text font-medium text-sm">
            {renderSimpleMarkdown(guidelines?.expectations)}
          </div>
        </section>

        {/* Packages Section */}
      <section id="packages-sessions" className="space-y-12">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl md:text-3xl font-extrabold text-vibrant-charcoal font-display">Service Packages & Pricing</h2>
          <p className="text-stone-500 text-xs max-w-sm mx-auto leading-relaxed">
            All details dynamically managed in real-time by nursery administrators. Secure booking with total privacy.
          </p>
        </div>

        {/* In-Person Packages */}
        {inPersonPackages.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold font-display text-vibrant-blue-text border-l-4 border-vibrant-blue-border pl-3">In-Person Nursery Session Packages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {inPersonPackages.map(pkg => (
                <div
                  key={pkg.id}
                  id={`pkg-card-${pkg.id}`}
                  className="bg-vibrant-gold rounded-3xl p-4 md:p-6 flex flex-col justify-between border-b-4 border-vibrant-gold-border shadow-xs hover:opacity-95 transition-all"
                >
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-start gap-3 md:gap-4">
                      <h4 className="text-base md:text-lg font-extrabold text-vibrant-charcoal font-display">{pkg.name}</h4>
                      <span className="shrink-0 bg-white text-vibrant-gold-text text-[11px] md:text-xs px-2 md:px-2.5 py-1 font-bold rounded-lg font-mono">
                        ${pkg.price}
                      </span>
                    </div>
                    <p className="text-vibrant-gold-text text-[11px] md:text-xs leading-relaxed font-sans font-medium">{pkg.description}</p>
                  </div>

                  <div className="border-t border-vibrant-gold-border/30 pt-3 md:pt-4 mt-4 md:mt-6 flex justify-between items-center bg-white/40 -mx-4 md:-mx-6 -mb-4 md:-mb-6 p-3 md:p-4 rounded-b-3xl">
                    <span className="text-[11px] md:text-xs text-[#8D7A4D] font-semibold flex items-center gap-1 font-mono">
                      <Calendar size={12} className="text-vibrant-gold-text" />
                      {pkg.duration} Min Session
                    </span>
                    <button
                      onClick={() => onBookPackage(`In-Person Package: ${pkg.name}`)}
                      className="rounded-full cursor-pointer bg-vibrant-charcoal hover:bg-stone-700 text-white font-bold text-[11px] md:text-xs px-4 md:px-5 py-2 md:py-2.5 shadow-sm transition-all uppercase tracking-wider"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Virtual Packages */}
        {virtualPackages.length > 0 && (
          <div className="space-y-6 pt-4">
            <h3 className="text-xl font-extrabold font-display text-vibrant-blue-text border-l-4 border-vibrant-blue-border pl-3">Virtual Distance Packages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {virtualPackages.map(pkg => (
                <div
                  key={pkg.id}
                  id={`pkg-card-${pkg.id}`}
                  className="bg-vibrant-gold rounded-3xl p-4 md:p-6 flex flex-col justify-between border-b-4 border-vibrant-gold-border shadow-xs hover:opacity-95 transition-all"
                >
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-start gap-3 md:gap-4">
                      <h4 className="text-base md:text-lg font-extrabold text-vibrant-charcoal font-display">{pkg.name}</h4>
                      <span className="shrink-0 bg-white text-vibrant-gold-text text-[11px] md:text-xs px-2 md:px-2.5 py-1 font-extrabold rounded-lg font-mono">
                        ${pkg.price}
                      </span>
                    </div>
                    <p className="text-vibrant-gold-text text-[11px] md:text-xs leading-relaxed font-sans font-semibold">{pkg.description}</p>
                  </div>

                  <div className="border-t border-vibrant-gold-border/30 pt-3 md:pt-4 mt-4 md:mt-6 flex justify-between items-center bg-white/40 -mx-4 md:-mx-6 -mb-4 md:-mb-6 p-3 md:p-4 rounded-b-3xl">
                    <span className="text-[11px] md:text-xs text-[#8D7A4D] font-bold flex items-center gap-1 font-mono">
                      <Compass size={12} className="text-[#8D7A4D]" />
                      {pkg.duration} Mins Online
                    </span>
                    <button
                      onClick={() => onBookPackage(`Virtual Package: ${pkg.name}`)}
                      className="rounded-full cursor-pointer bg-vibrant-charcoal hover:bg-stone-700 text-white font-bold text-[11px] md:text-xs px-4 md:px-5 py-2 md:py-2.5 shadow-sm transition-all uppercase tracking-wider"
                    >
                      Inquire Online
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Staff Caregivers Roster Section */}
      <section id="caregivers-sec" className="space-y-8">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-stone-800">Meet Your Caregivers</h2>
          <p className="text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
            Our nurturing staff prioritize boundaries, emotional safety models, and professional counseling dynamics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-4">
          {caregivers && caregivers.map(cg => (
            <div
              key={cg.id}
              id={`caregiver-card-${cg.id}`}
              className="bg-white border-2 border-vibrant-pink rounded-3xl p-6 flex flex-col md:flex-row gap-6 shadow-xs hover:shadow-sm transition-all"
            >
              <div className="w-full md:w-36 h-36 rounded-2xl overflow-hidden shrink-0 border-2 border-vibrant-gold relative bg-rose-50/20">
                <img
                  src={cg.imageUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"}
                  alt={cg.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center scale-100 hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-xl font-bold text-stone-800 font-display flex items-center gap-1.5">
                    <UserCheck className="text-vibrant-gold-text" size={16} />
                    {cg.name}
                  </h3>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-vibrant-blue-text font-extrabold bg-vibrant-blue px-2.5 py-0.5 rounded-full mt-1 inline-block">
                    Dedicated Nanny
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-stone-500 text-xs leading-relaxed font-sans italic font-medium">
                    "{cg.bio}"
                  </p>
                  
                  {cg.philosophy && (
                    <div className="bg-vibrant-pink/10 p-3 rounded-xl border border-vibrant-pink/30">
                      <p className="text-[#8D7A4D] text-xs font-extrabold leading-relaxed font-display uppercase tracking-widest">Philosophy of Comfort:</p>
                      <p className="text-stone-600 text-[11px] mt-1 leading-relaxed font-sans font-medium">{cg.philosophy}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
