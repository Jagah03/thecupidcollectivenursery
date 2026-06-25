import React, { useState, useEffect } from "react";
import { 
  KeyRound, ShieldAlert, Sparkles, Building, Briefcase, Users, HelpCircle, 
  Settings, Mail, MailOpen, FileDown, PlusCircle, Trash2, Check, RefreshCw, Layers, Phone, Eye, EyeOff, Save, CheckCircle
} from "lucide-react";
import { DBStore, GlobalSettings, NurseryGuidelines, NurseryPackage, Caregiver, BlogArticle, SafetyAlert, MentalHealthResource, FAQItem, Testimonial, Inquiry } from "../types";

export default function AdminPanel() {
  const [token, setToken] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"copy" | "packages" | "caregivers" | "safety" | "resources" | "inquiries" | "settings">("copy");

  // DB Full State
  const [db, setDb] = useState<DBStore | null>(null);
  const [actionStatus, setActionStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  // Temp form editing states
  const [editingPackage, setEditingPackage] = useState<Partial<NurseryPackage> | null>(null);
  const [editingCaregiver, setEditingCaregiver] = useState<Partial<Caregiver> | null>(null);
  const [editingAlert, setEditingAlert] = useState<Partial<SafetyAlert> | null>(null);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogArticle> | null>(null);
  const [editingHotline, setEditingHotline] = useState<Partial<MentalHealthResource> | null>(null);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQItem> | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);

  // Supabase test connection states
  const [supabaseTestLoading, setSupabaseTestLoading] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<any | null>(null);

  const testSupabaseConnection = async () => {
    if (!token) return;
    setSupabaseTestLoading(true);
    setSupabaseTestResult(null);
    try {
      const res = await fetch("/api/admin/supabase-status", {
        headers: { "Authorization": token }
      });
      const data = await res.json();
      setSupabaseTestResult(data);
    } catch (err: any) {
      setSupabaseTestResult({
        success: false,
        error: "Failed to connect to backend server endpoint."
      });
    } finally {
      setSupabaseTestLoading(false);
    }
  };

  useEffect(() => {
    // Sync state login if previously stored in memory
    const storedToken = sessionStorage.getItem("cupid_admin_token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  const showStatus = (type: "success" | "error", message: string) => {
    setActionStatus({ type, message });
    setTimeout(() => {
      setActionStatus({ type: null, message: "" });
    }, 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();
      if (data.success && data.token) {
        setToken(data.token);
        sessionStorage.setItem("cupid_admin_token", data.token);
        setPasswordInput("");
      } else {
        setLoginError(data.error || "Login credentials rejected.");
      }
    } catch (err) {
      setLoginError("Could not reach authentication authority.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setDb(null);
    sessionStorage.removeItem("cupid_admin_token");
  };

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data", {
        headers: { "Authorization": token }
      });
      const data = await res.json();
      if (data.success) {
        setDb(data.data);
      } else {
        // Token expired/rejected reset
        handleLogout();
      }
    } catch (err) {
      showStatus("error", "Failed to retrieve management schema.");
    } finally {
      setLoading(false);
    }
  };

  // Submissions: UPDATE GLOBAL COPY SETTINGS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !token) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/update-settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(db.globalSettings)
      });
      const data = await res.json();
      if (data.success) {
        showStatus("success", "Global headlines, routing, and access password updated!");
        fetchAdminData();
      } else {
        showStatus("error", data.error || "Failed to save configuration.");
      }
    } catch (err) {
      showStatus("error", "Network save error.");
    } finally {
      setLoading(false);
    }
  };

  // Submissions: UPDATE NURSERY PHYSICAL GUIDELINES
  const handleSaveGuidelines = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !token) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/update-guidelines", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(db.nurseryGuidelines)
      });
      const data = await res.json();
      if (data.success) {
        showStatus("success", "Physical nursery playroom rules and limits saved!");
        fetchAdminData();
      } else {
        showStatus("error", data.error || "Failed to save guidelines.");
      }
    } catch (err) {
      showStatus("error", "Network save error.");
    } finally {
      setLoading(false);
    }
  };

  // PACKAGES CRUD
  const savePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage || !token) return;
    
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token },
        body: JSON.stringify(editingPackage)
      });
      const data = await res.json();
      if (data.success) {
        showStatus("success", `Service package "${data.package.name}" updated successfully!`);
        setEditingPackage(null);
        fetchAdminData();
      } else {
        showStatus("error", data.error);
      }
    } catch (err) {
      showStatus("error", "Save request failed.");
    }
  };

  const deletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this package?") || !token) return;
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      const data = await res.json();
      if (data.success) {
        showStatus("success", "Package removed.");
        fetchAdminData();
      }
    } catch (err) {
      showStatus("error", "Deletion failed.");
    }
  };

  // CAREGIVERS CRUD
  const saveCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCaregiver || !token) return;
    try {
      const res = await fetch("/api/admin/caregivers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token },
        body: JSON.stringify(editingCaregiver)
      });
      const data = await res.json();
      if (data.success) {
        showStatus("success", `Caregiver ${data.caregiver.name} saved successfully!`);
        setEditingCaregiver(null);
        fetchAdminData();
      } else {
        showStatus("error", data.error);
      }
    } catch (err) {
      showStatus("error", "Save caregiver request failed.");
    }
  };

  const deleteCaregiver = async (id: string) => {
    if (!confirm("Delete this caregiver profile? This cannot be undone.") || !token) return;
    try {
      const res = await fetch(`/api/admin/caregivers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      const data = await res.json();
      if (data.success) {
        showStatus("success", "Caregiver profile removed.");
        fetchAdminData();
      }
    } catch (err) {
      showStatus("error", "Deletion failed.");
    }
  };

  // SAFETY WARNINGS CRUD
  const saveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlert || !token) return;
    try {
      const res = await fetch("/api/admin/safety-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token },
        body: JSON.stringify(editingAlert)
      });
      const data = await res.json();
      if (data.success) {
        showStatus("success", "Safety alertboard item updated!");
        setEditingAlert(null);
        fetchAdminData();
      }
    } catch (err) {
      showStatus("error", "Save failed.");
    }
  };

  const deleteAlert = async (id: string) => {
    if (!confirm("Permanently delete this safety alert?") || !token) return;
    try {
      const res = await fetch(`/api/admin/safety-alerts/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      if ((await res.json()).success) {
        showStatus("success", "Alert deleted.");
        fetchAdminData();
      }
    } catch (err) {
      showStatus("error", "Deletion failed.");
    }
  };

  // ARTICLES CRUD
  const saveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog || !token) return;
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token },
        body: JSON.stringify(editingBlog)
      });
      if ((await res.json()).success) {
        showStatus("success", "Guide article updated successfully.");
        setEditingBlog(null);
        fetchAdminData();
      }
    } catch (err) {
      showStatus("error", "Save article failed.");
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm("Delete this article listing?") || !token) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      if ((await res.json()).success) {
        showStatus("success", "Article removed.");
        fetchAdminData();
      }
    } catch (err) {
      showStatus("error", "Deletion failed.");
    }
  };

  // HOTLINES DIRECTORY CRUD
  const saveHotline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotline || !token) return;
    try {
      const res = await fetch("/api/admin/hotlines", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token },
        body: JSON.stringify(editingHotline)
      });
      if ((await res.json()).success) {
        showStatus("success", "Crisis service directory entry saved!");
        setEditingHotline(null);
        fetchAdminData();
      }
    } catch (err) {
      showStatus("error", "Save hotline failed.");
    }
  };

  const deleteHotline = async (id: string) => {
    if (!confirm("Remove this mental health resource directory?") || !token) return;
    try {
      const res = await fetch(`/api/admin/hotlines/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      if ((await res.json()).success) {
        showStatus("success", "Crisis directory entry removed.");
        fetchAdminData();
      }
    } catch (err) {
      showStatus("error", "Deletion failed.");
    }
  };

  // FAQS CRUD
  const saveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !token) return;
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token },
        body: JSON.stringify(editingFaq)
      });
      if ((await res.json()).success) {
        showStatus("success", "FAQ entry saved!");
        setEditingFaq(null);
        fetchAdminData();
      }
    } catch (err) {
      showStatus("error", "Save FAQ failed.");
    }
  };

  const deleteFaq = async (id: string) => {
    if (!confirm("Delete this FAQ?") || !token) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      if ((await res.json()).success) {
        showStatus("success", "FAQ entry deleted.");
        fetchAdminData();
      }
    } catch (err) {
      showStatus("error", "Deletion failed.");
    }
  };

  // INQUIRY READ TOGGLE
  const toggleInquiryRead = async (id: string, currentRead: boolean) => {
  // Existing toggle for public inquiries

    if (!token) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token },
        body: JSON.stringify({ read: !currentRead })
      });
      if ((await res.json()).success) {
        fetchAdminData();
      }
    } catch (err) {
      showStatus("error", "Error setting read tag.");
    }
  };

  const togglePrivateRead = async (id: string, currentRead: boolean) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/private-inquiries/${id}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token },
        body: JSON.stringify({ read: !currentRead })
      });
      if ((await res.json()).success) {
        fetchAdminData();
      }
    } catch (err) {
      showStatus("error", "Error setting private read tag.");
    }
  };

  const handleDeletePrivate = async (id: string) => {
    if (!token) return;
    if (!confirm('Delete this private inquiry permanently?')) return;
    try {
      const res = await fetch(`/api/admin/private-inquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (data.success) {
        showStatus('success', 'Private inquiry removed.');
        fetchAdminData();
      } else {
        showStatus('error', data.error || 'Failed to delete.');
      }
    } catch (e: any) {
      showStatus('error', e.message || 'Network error.');
    }
  };

  const triggerExportCSV = () => {
    if (!token) return;
    window.open(`/api/admin/mailing-list/export?authorization=${token}`);
  };

  // ===================================
  // UNAUTHENTICATED RENDER (LOGIN STATE)
  // ===================================
  if (!token) {
    return (
      <div id="admin-login-overlay" className="max-w-md mx-auto py-12">
        <div className="bg-white border-4 border-vibrant-pink rounded-[40px] p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-vibrant-gold text-vibrant-gold-text">
              <KeyRound size={24} />
            </div>
            <h2 className="text-2xl font-extrabold font-display text-vibrant-charcoal">Administrative Control</h2>
            <p className="text-xs text-stone-500 font-medium">Authenticating access requires the workspace dashboard password key.</p>
          </div>

          {loginError && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-center font-semibold text-rose-500">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block text-[10px] uppercase tracking-wider">Dashboard Password Key *</label>
              <input
                id="admin-password-input"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                required
                className="w-full rounded-xl bg-vibrant-bg outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold focus:border-vibrant-gold border border-stone-200 px-4 py-2.5 text-xs text-stone-700 font-medium"
              />
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full rounded-full cursor-pointer bg-vibrant-charcoal text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-stone-700 transition active:scale-[0.98]"
            >
              {loading ? "Verifying..." : "Authorize Portal"}
            </button>
          </form>

          <p className="text-[10px] text-stone-450 text-center uppercase tracking-wider font-mono">
            Default sandbox key is <b className="text-vibrant-pink font-bold font-sans capitalize">admin</b>
          </p>
        </div>
      </div>
    );
  }

  if (!db) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 bg-[#FDFBF7] rounded-[40px] border-4 border-vibrant-pink shadow-xs max-w-sm mx-auto">
        <RefreshCw size={36} className="text-vibrant-pink animate-spin" />
        <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Validating schema details...</p>
      </div>
    );
  }

  // ===================================
  // AUTHENTICATED PORTAL VIEW
  // ===================================
  return (
    <div id="admin-authenticated-portal" className="space-y-8">
      
      {/* Top Banner Control */}
      <div className="bg-vibrant-charcoal text-white rounded-[40px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md border-4 border-vibrant-pink">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] bg-vibrant-blue text-vibrant-blue-text font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Mommy/Nanny Console</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white">The Cupid Collective Admin Workspace</h1>
          <p className="text-xs text-stone-400 font-sans max-w-md font-medium">Dynamically update all written content, packages, warnings, guidelines, caregiver profiles, and view newsletter logs instantly.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchAdminData}
            id="admin-refresh-payload-btn"
            className="flex items-center gap-1.5 rounded-full border border-vibrant-pink/40 bg-white/10 hover:bg-white/20 text-[#FDFBF7] px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition"
          >
            <RefreshCw size={12} />
            Fetch Data
          </button>
          <button
            onClick={handleLogout}
            id="admin-logout-btn"
            className="rounded-full bg-vibrant-pink text-white px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-95 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Global Action Banner Status */}
      {actionStatus.type && (
        <div className={`p-4 rounded-xl border flex items-center gap-2 text-xs font-bold text-center justify-center animate-pulse ${
          actionStatus.type === "success" 
            ? "bg-emerald-50 text-emerald-600 border-emerald-150" 
            : "bg-rose-50 text-rose-500 border-rose-150"
        }`}>
          {actionStatus.type === "success" ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
          {actionStatus.message}
        </div>
      )}

      {/* Primary layout dividing submenus */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar sub-tab selectors */}
        <div className="lg:col-span-1 bg-vibrant-bg p-5 rounded-[32px] border border-vibrant-pink/55 shadow-xs space-y-1.5 self-start">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-mono mb-4 px-2">CMS Sections</h3>
          {[
            { id: "copy", label: "Intro & Rules", icon: Building },
            { id: "packages", label: "Nursery Packages", icon: Briefcase },
            { id: "caregivers", label: "Caregiver Staff", icon: Users },
            { id: "safety", label: "Safety Board", icon: ShieldAlert },
            { id: "resources", label: "FAQs & Directory", icon: Layers },
            { id: "inquiries", label: "Private Inquiries", icon: Mail },
            { id: "settings", label: "Panel Access key", icon: Settings }
          ].map(sb => {
            const Icon = sb.icon;
            const isSel = activeSubTab === sb.id;
            return (
              <button
                key={sb.id}
                onClick={() => {
                  setActiveSubTab(sb.id as any);
                  setEditingPackage(null);
                  setEditingCaregiver(null);
                  setEditingAlert(null);
                  setEditingBlog(null);
                  setEditingHotline(null);
                  setEditingFaq(null);
                }}
                className={`w-full flex cursor-pointer items-center gap-2 px-3.5 py-3 rounded-full text-left text-xs font-bold uppercase tracking-wider border transition-all ${
                  isSel 
                    ? "bg-vibrant-charcoal text-[#FDFBF7] border-vibrant-charcoal font-bold shadow-xs" 
                    : "bg-transparent text-stone-600 border-transparent hover:bg-vibrant-pink/20"
                }`}
              >
                <Icon size={14} className={isSel ? "text-white" : "text-stone-450"} />
                {sb.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Context Workspace Panel */}
        <div className="lg:col-span-3 bg-white p-6 md:p-8 rounded-3xl border border-pink-50/60 shadow-sm">
          
          {/* TAB 1: SITE INTRO & HANDBOOK POLICIES */}
          {activeSubTab === "copy" && (
            <div className="space-y-8">
              {/* Introduction Details */}
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-stone-800">Landing Page Copy Configuration</h3>
                  <p className="text-xs text-stone-450 mt-0.5">Control the primary content blocks visitors encounter instantly.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">Landing Intro Title *</label>
                    <input
                      type="text"
                      value={db.globalSettings.introHeadline}
                      onChange={(e) => setDb({ ...db, globalSettings: { ...db.globalSettings, introHeadline: e.target.value } })}
                      className="w-full rounded-xl bg-stone-50 outline-none focus:bg-white focus:ring-2 focus:ring-pink-300 border border-stone-100 px-4 py-2.5 text-xs text-stone-700"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">Subtitle Tagline *</label>
                    <input
                      type="text"
                      value={db.globalSettings.introSubheadline}
                      onChange={(e) => setDb({ ...db, globalSettings: { ...db.globalSettings, introSubheadline: e.target.value } })}
                      className="w-full rounded-xl bg-stone-50 outline-none focus:bg-white focus:ring-2 focus:ring-pink-300 border border-stone-100 px-4 py-2.5 text-xs text-stone-700"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">Introduction Main Narrative Paragraph *</label>
                    <textarea
                      value={db.globalSettings.introBody}
                      onChange={(e) => setDb({ ...db, globalSettings: { ...db.globalSettings, introBody: e.target.value } })}
                      rows={4}
                      className="w-full rounded-xl bg-stone-50 outline-none focus:bg-white focus:ring-2 focus:ring-pink-300 border border-stone-100 px-4 py-2.5 text-xs text-stone-700 leading-normal"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-xl cursor-pointer bg-slate-800 hover:bg-stone-700 text-white font-semibold text-xs px-5 py-3 shadow-md flex items-center gap-1.5"
                >
                  <Save size={12} />
                  Save General Content
                </button>
              </form>

              {/* Physical Playroom Policies */}
              <form onSubmit={handleSaveGuidelines} className="border-t border-stone-100 pt-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-stone-800">Physical Guidelines & Handbooks</h3>
                  <p className="text-xs text-stone-450 mt-0.5">Edit locations, strict boundary rules, and what to expect menus (supports markdown format).</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">Our Physical Location Details</label>
                    <textarea
                      value={db.nurseryGuidelines.locationDescription}
                      onChange={(e) => setDb({ ...db, nurseryGuidelines: { ...db.nurseryGuidelines, locationDescription: e.target.value } })}
                      rows={3}
                      className="w-full rounded-xl bg-stone-50 outline-none focus:bg-white focus:ring-2 focus:ring-pink-300 border border-stone-100 px-4 py-2.5 text-xs text-stone-700 leading-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">Strict Non-Sexual Boundaries (Markdown)</label>
                    <textarea
                      value={db.nurseryGuidelines.sessionBoundaries}
                      onChange={(e) => setDb({ ...db, nurseryGuidelines: { ...db.nurseryGuidelines, sessionBoundaries: e.target.value } })}
                      rows={5}
                      className="w-full rounded-xl bg-stone-50 font-mono outline-none focus:bg-white focus:ring-2 focus:ring-pink-300 border border-stone-100 px-4 py-2.5 text-xs text-stone-700 leading-normal"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 block">Nursery House Rules (Markdown)</label>
                      <textarea
                        value={db.nurseryGuidelines.rules}
                        onChange={(e) => setDb({ ...db, nurseryGuidelines: { ...db.nurseryGuidelines, rules: e.target.value } })}
                        rows={5}
                        className="w-full rounded-xl bg-stone-50 font-mono outline-none focus:bg-white focus:ring-2 focus:ring-pink-300 border border-stone-100 px-4 py-2.5 text-xs text-stone-700 leading-normal"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 block">Client Expectations (Markdown)</label>
                      <textarea
                        value={db.nurseryGuidelines.expectations}
                        onChange={(e) => setDb({ ...db, nurseryGuidelines: { ...db.nurseryGuidelines, expectations: e.target.value } })}
                        rows={5}
                        className="w-full rounded-xl bg-stone-50 font-mono outline-none focus:bg-white focus:ring-2 focus:ring-pink-300 border border-stone-100 px-4 py-2.5 text-xs text-stone-700 leading-normal"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-xl cursor-pointer bg-slate-800 hover:bg-stone-700 text-white font-semibold text-xs px-5 py-3 shadow-md flex items-center gap-1.5"
                >
                  <Save size={12} />
                  Save Guidelines & Rules
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: PACKAGES EDITOR */}
          {activeSubTab === "packages" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-stone-50 -mx-6 md:-mx-8 -mt-6 md:-mt-8 p-5 rounded-t-3xl border-b border-stone-100">
                <div>
                  <h3 className="text-lg font-bold font-display text-stone-850">Service Packages Manager</h3>
                  <p className="text-xs text-stone-450 mt-0.5">Control pricing tiers, durations, and visibility listings.</p>
                </div>
                {!editingPackage && (
                  <button
                    onClick={() => setEditingPackage({ name: "", description: "", duration: 60, price: 50, isActive: true, isVirtual: false })}
                    className="flex cursor-pointer items-center gap-1 bg-rose-400 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm shadow-rose-300/30"
                  >
                    <PlusCircle size={14} />
                    Add Session Package
                  </button>
                )}
              </div>

              {/* RENDER ACTIVE/EDITABLE FORMS */}
              {editingPackage ? (
                <form onSubmit={savePackage} className="bg-stone-50 border border-stone-100 p-6 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-stone-800 font-display">
                    {editingPackage.id ? "Edit Package Parameters" : "Create New Session Package"}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Package Name</label>
                      <input
                        type="text"
                        value={editingPackage.name}
                        onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                        required
                        className="w-full rounded-lg bg-white border border-stone-150 px-3 py-2 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Duration (Mins)</label>
                        <input
                          type="number"
                          value={editingPackage.duration}
                          onChange={(e) => setEditingPackage({ ...editingPackage, duration: Number(e.target.value) })}
                          required
                          className="w-full rounded-lg bg-white border border-stone-150 px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Price ($ USD)</label>
                        <input
                          type="number"
                          value={editingPackage.price}
                          onChange={(e) => setEditingPackage({ ...editingPackage, price: Number(e.target.value) })}
                          required
                          className="w-full rounded-lg bg-white border border-stone-150 px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Package Explanation</label>
                    <textarea
                      value={editingPackage.description}
                      onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                      required
                      rows={3}
                      className="w-full rounded-lg bg-white border border-stone-150 px-3 py-2 text-xs leading-normal"
                    />
                  </div>

                  <div className="flex gap-6 items-center pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isVirtualFlag"
                        checked={editingPackage.isVirtual}
                        onChange={(e) => setEditingPackage({ ...editingPackage, isVirtual: e.target.checked })}
                      />
                      <label htmlFor="isVirtualFlag" className="text-xs text-stone-700 font-semibold cursor-pointer select-none">Virtual Session Package</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActiveFlag"
                        checked={editingPackage.isActive}
                        onChange={(e) => setEditingPackage({ ...editingPackage, isActive: e.target.checked })}
                      />
                      <label htmlFor="isActiveFlag" className="text-xs text-stone-700 font-semibold cursor-pointer select-none">Active Visibility (Draft vs Live)</label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 justify-end border-t border-stone-150">
                    <button
                      type="button"
                      onClick={() => setEditingPackage(null)}
                      className="rounded-lg border border-stone-200 text-stone-500 px-4 py-2 text-xs font-semibold hover:bg-stone-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-slate-800 text-white font-bold px-5 py-2 text-xs hover:bg-stone-700 cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {db.packages.map(pkg => (
                    <div key={pkg.id} className="flex justify-between items-center border border-stone-100 rounded-xl p-4 bg-stone-50/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-stone-800">{pkg.name}</h4>
                          <span className={`text-[9px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded-full ${
                            pkg.isVirtual ? "bg-sky-50 text-sky-600" : "bg-purple-50 text-purple-600"
                          }`}>
                            {pkg.isVirtual ? "Virtual" : "In-Person"}
                          </span>
                          {!pkg.isActive && (
                            <span className="bg-stone-150 text-stone-500 text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full">Draft</span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">{pkg.description}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-semibold text-stone-800 font-mono">${pkg.price} / {pkg.duration}m</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setEditingPackage(pkg)}
                            className="bg-white border border-stone-200 text-stone-600 rounded-lg p-1.5 hover:bg-stone-100 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePackage(pkg.id)}
                            className="bg-white border border-stone-200 text-rose-500 rounded-lg p-1.5 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CAREGIVERS ROSTER */}
          {activeSubTab === "caregivers" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-stone-50 -mx-6 md:-mx-8 -mt-6 md:-mt-8 p-5 rounded-t-3xl border-b border-stone-100">
                <div>
                  <h3 className="text-lg font-bold font-display text-stone-850">Caregiver Roster Management</h3>
                  <p className="text-xs text-stone-450 mt-0.5">Edit names, staff headshots, biographies and philosophies.</p>
                </div>
                {!editingCaregiver && (
                  <button
                    onClick={() => setEditingCaregiver({ name: "", imageUrl: "", bio: "", philosophy: "" })}
                    className="flex cursor-pointer items-center gap-1 bg-rose-400 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm"
                  >
                    <PlusCircle size={14} />
                    Add Caregiver Staff
                  </button>
                )}
              </div>

              {editingCaregiver ? (
                <form onSubmit={saveCaregiver} className="bg-stone-50 border border-stone-100 p-6 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-stone-850 font-display">
                    {editingCaregiver.id ? "Edit Caregiver Profile" : "Register New Caregiver Staff"}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Caregiver Name</label>
                      <input
                        type="text"
                        value={editingCaregiver.name}
                        onChange={(e) => setEditingCaregiver({ ...editingCaregiver, name: e.target.value })}
                        required
                        className="w-full rounded-lg bg-white border border-stone-150 px-3 py-2 text-xs font-semibold"
                        placeholder="e.g., Mommy Wendy"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Image Asset URL (Unsplash or URL Link)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingCaregiver.imageUrl}
                          onChange={(e) => setEditingCaregiver({ ...editingCaregiver, imageUrl: e.target.value })}
                          className="flex-1 rounded-lg bg-white border border-stone-150 px-3 py-2 text-xs font-mono"
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            // Comfort caregiver random unsplash picture array
                            const ids = [
                              "photo-1544005313-94ddf0286df2", // Emma
                              "photo-1573496359142-b8d87734a5a2", // Clara
                              "photo-1508214751196-bcfd4ca60f91", // Lisa
                              "photo-1534528741775-53994a69daeb"  // Tina
                            ];
                            const randomId = ids[Math.floor(Math.random() * ids.length)];
                            setEditingCaregiver({
                              ...editingCaregiver,
                              imageUrl: `https://images.unsplash.com/${randomId}?auto=format&fit=crop&q=80&w=400`
                            });
                          }}
                          className="shrink-0 rounded-lg bg-pink-100 text-rose-500 px-3.5 text-xs font-bold hover:bg-pink-150 transition"
                        >
                          Auto Image
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Detailed Biography</label>
                    <textarea
                      value={editingCaregiver.bio}
                      onChange={(e) => setEditingCaregiver({ ...editingCaregiver, bio: e.target.value })}
                      required
                      rows={3}
                      className="w-full rounded-lg bg-white border border-stone-150 px-3 py-2 text-xs leading-normal"
                      placeholder="Emma is an incredible certified facilitator supporting..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Therapeutic Care Philosophy</label>
                    <textarea
                      value={editingCaregiver.philosophy}
                      onChange={(e) => setEditingCaregiver({ ...editingCaregiver, philosophy: e.target.value })}
                      required
                      rows={2}
                      className="w-full rounded-lg bg-white border border-stone-150 px-3 py-2 text-xs leading-normal"
                      placeholder="My goal is to provide a safe, cozy cocoon free of adult armored stresses..."
                    />
                  </div>

                  <div className="flex gap-2 justify-end border-t border-stone-150 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingCaregiver(null)}
                      className="rounded-lg border border-stone-200 text-stone-500 px-4 py-2 text-xs font-medium hover:bg-stone-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-slate-800 text-white font-bold px-5 py-2 text-xs hover:bg-stone-700 cursor-pointer"
                    >
                      Save Caregiver
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {db.caregivers.map(cg => (
                    <div key={cg.id} className="border border-stone-100 rounded-2xl p-4 bg-stone-50/50 flex gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border bg-white">
                        <img src={cg.imageUrl} alt={cg.name} className="w-full h-full object-cover object-center" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-2 flex-grow">
                        <div>
                          <h4 className="text-xs font-bold text-stone-850">{cg.name}</h4>
                          <p className="text-[10px] text-stone-400 font-sans line-clamp-1">{cg.bio}</p>
                        </div>

                        <div className="flex gap-1.5 pt-1.5 border-t border-stone-100/40">
                          <button
                            onClick={() => setEditingCaregiver(cg)}
                            className="bg-white border text-stone-600 rounded-lg px-2.5 py-1 text-[10px] hover:bg-stone-100 cursor-pointer"
                          >
                            Edit Profile
                          </button>
                          <button
                            onClick={() => deleteCaregiver(cg.id)}
                            className="bg-white border text-rose-500 rounded-lg p-1.5 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAFETY ALERTBOARD WARNINGS */}
          {activeSubTab === "safety" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-stone-50 -mx-6 md:-mx-8 -mt-6 md:-mt-8 p-5 rounded-t-3xl border-b border-stone-100">
                <div>
                  <h3 className="text-lg font-bold font-display text-stone-850">Community Watch Alertboard</h3>
                  <p className="text-xs text-stone-450 mt-0.5">Post warnings to secure community safety against scam groomers.</p>
                </div>
                {!editingAlert && (
                  <button
                    onClick={() => setEditingAlert({ title: "", details: "", recommendations: "" })}
                    className="flex cursor-pointer items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm"
                  >
                    <PlusCircle size={14} />
                    New Safety Report
                  </button>
                )}
              </div>

              {editingAlert ? (
                <form onSubmit={saveAlert} className="bg-stone-50 border border-stone-100 p-6 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-stone-800 font-display">Create/Edit Safety Board warning</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Alert Subject Title</label>
                    <input
                      type="text"
                      value={editingAlert.title}
                      onChange={(e) => setEditingAlert({ ...editingAlert, title: e.target.value })}
                      required
                      className="w-full rounded-lg bg-white border border-stone-150 px-3 py-2 text-xs"
                      placeholder="e.g., Financial groomer posing as caregiver online"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Threat details & incidents</label>
                    <textarea
                      value={editingAlert.details}
                      onChange={(e) => setEditingAlert({ ...editingAlert, details: e.target.value })}
                      required
                      rows={3}
                      className="w-full rounded-lg bg-white border border-stone-150 px-3 py-2 text-xs leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Caregiver safety recommendations</label>
                    <textarea
                      value={editingAlert.recommendations}
                      onChange={(e) => setEditingAlert({ ...editingAlert, recommendations: e.target.value })}
                      required
                      rows={2}
                      className="w-full rounded-lg bg-white border border-stone-150 px-3 py-2 text-xs leading-relaxed"
                      placeholder="Always verify state identity, never route upfront transfers offline..."
                    />
                  </div>

                  <div className="flex gap-2 justify-end border-t border-stone-150 pt-2">
                    <button type="button" onClick={() => setEditingAlert(null)} className="rounded-lg border px-4 py-2 text-xs hover:bg-stone-50">Cancel</button>
                    <button type="submit" className="rounded-lg bg-slate-800 text-white font-bold px-5 py-2 text-xs">Save Alert</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {db.safetyAlerts.map(alert => (
                    <div key={alert.id} className="border border-stone-100 rounded-xl p-4 bg-stone-50/50 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-stone-850 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          {alert.title}
                        </h4>
                        <p className="text-[10px] text-stone-400 mt-0.5">Alert date: {alert.date}</p>
                      </div>

                      <div className="flex gap-1">
                        <button onClick={() => setEditingAlert(alert)} className="bg-white border text-stone-600 rounded-lg px-2.5 py-1 text-[10px] hover:bg-stone-100 cursor-pointer">Edit</button>
                        <button onClick={() => deleteAlert(alert.id)} className="bg-white border text-rose-500 rounded-lg p-1.5 hover:bg-rose-50 cursor-pointer"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CRISIS SCHEMAS & FAQS CREATOR */}
          {activeSubTab === "resources" && (
            <div className="space-y-8">
              {/* Hotlines Manager */}
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-stone-50 -mx-6 md:-mx-8 -mt-6 md:-mt-8 p-5 rounded-t-3xl border-b border-stone-100">
                  <div>
                    <h3 className="text-lg font-bold font-display text-stone-850">Relief Crisis Directory</h3>
                    <p className="text-xs text-stone-450 mt-0.5">Control national support text lines and emergency organizations.</p>
                  </div>
                  {!editingHotline && (
                    <button
                      onClick={() => setEditingHotline({ name: "", phone: "", textCode: "", description: "", category: "General", link: "" })}
                      className="flex cursor-pointer items-center gap-1 bg-rose-400 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm"
                    >
                      <PlusCircle size={14} />
                      Add Registry Listing
                    </button>
                  )}
                </div>

                {editingHotline ? (
                  <form onSubmit={saveHotline} className="bg-stone-50 border border-stone-100 p-6 rounded-2xl space-y-4">
                    <h4 className="text-sm font-bold text-stone-800">Configure Support Hotline</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Help Line Name</label>
                        <input
                          type="text"
                          value={editingHotline.name}
                          onChange={(e) => setEditingHotline({ ...editingHotline, name: e.target.value })}
                          required
                          className="w-full rounded-lg bg-white border px-3 py-2 text-xs text-stone-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Category Category *</label>
                        <select
                          value={editingHotline.category}
                          onChange={(e) => setEditingHotline({ ...editingHotline, category: e.target.value as any })}
                          className="w-full rounded-lg bg-white border px-3 py-2 text-xs text-stone-700 outline-none"
                        >
                          <option value="General">General</option>
                          <option value="Veterans">Veterans</option>
                          <option value="LGBTQ+">LGBTQ+</option>
                          <option value="Youth">Youth</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Support Number / Code</label>
                        <input
                          type="text"
                          value={editingHotline.phone}
                          onChange={(e) => setEditingHotline({ ...editingHotline, phone: e.target.value })}
                          required
                          className="w-full rounded-lg bg-white border px-3 py-2 text-xs text-stone-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Optional Support Text Code</label>
                        <input
                          type="text"
                          value={editingHotline.textCode}
                          onChange={(e) => setEditingHotline({ ...editingHotline, textCode: e.target.value })}
                          className="w-full rounded-lg bg-white border px-3 py-2 text-xs text-stone-700"
                          placeholder="e.g. text HOME to 741741"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">External Link Website</label>
                        <input
                          type="text"
                          value={editingHotline.link}
                          onChange={(e) => setEditingHotline({ ...editingHotline, link: e.target.value })}
                          className="w-full rounded-lg bg-white border px-3 py-2 text-xs text-stone-700"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Short Description</label>
                      <textarea
                        value={editingHotline.description}
                        onChange={(e) => setEditingHotline({ ...editingHotline, description: e.target.value })}
                        required
                        rows={2}
                        className="w-full rounded-lg bg-white border px-3 py-2 text-xs leading-normal"
                      />
                    </div>

                    <div className="flex gap-2 justify-end border-t pt-2">
                      <button type="button" onClick={() => setEditingHotline(null)} className="rounded-lg border px-4 py-2 text-xs hover:bg-stone-50">Cancel</button>
                      <button type="submit" className="rounded-lg bg-slate-800 text-white font-bold px-5 py-2 text-xs">Save Listing</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {db.hotlines.map(hl => (
                      <div key={hl.id} className="flex justify-between items-center border rounded-xl p-3 bg-stone-50/50">
                        <div>
                          <p className="text-xs font-bold text-stone-850">{hl.name}</p>
                          <p className="text-[10px] text-stone-400 font-sans mt-0.5">{hl.category} ({hl.phone})</p>
                        </div>
                        <div className="flex gap-1 max-w-xs justify-end">
                          <button onClick={() => setEditingHotline(hl)} className="bg-white border text-stone-600 rounded-lg px-2 py-1 text-[10px] hover:bg-stone-100">Edit</button>
                          <button onClick={() => deleteHotline(hl.id)} className="bg-white border text-rose-500 rounded p-1 hover:bg-rose-50"><Trash2 size={11} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FAQs Editor */}
              <div className="border-t border-stone-100 pt-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-md font-bold text-stone-800 font-display">Frequently Asked Questions</h3>
                    <p className="text-xs text-stone-450 mt-0.5">Answer terms and safety methodologies directly.</p>
                  </div>
                  {!editingFaq && (
                    <button
                      onClick={() => setEditingFaq({ question: "", answer: "", category: "General", orderIndex: db.faqs.length })}
                      className="flex cursor-pointer items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm"
                    >
                      <PlusCircle size={14} />
                      Add FAQ List
                    </button>
                  )}
                </div>

                {editingFaq ? (
                  <form onSubmit={saveFaq} className="bg-stone-50 border border-stone-100 p-6 rounded-2xl space-y-4">
                    <h4 className="text-sm font-bold text-stone-800">Add/Edit FAQ Accordion</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">FAQ Question Text</label>
                        <input
                          type="text"
                          value={editingFaq.question}
                          onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                          required
                          className="w-full rounded-lg bg-white border px-3 py-2 text-xs"
                          placeholder="e.g. Yes / Is this safe?"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Category tag</label>
                        <input
                          type="text"
                          value={editingFaq.category}
                          onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                          required
                          className="w-full rounded-lg bg-white border px-3 py-2 text-xs"
                          placeholder="e.g. Safety, Rules, Terminology"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">FAQ Answer Text</label>
                      <textarea
                        value={editingFaq.answer}
                        onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                        required
                        rows={3}
                        className="w-full rounded-lg bg-white border px-3 py-2 text-xs leading-normal"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t">
                      <button type="button" onClick={() => setEditingFaq(null)} className="rounded bg-white border px-4 py-2 text-xs">Cancel</button>
                      <button type="submit" className="rounded bg-slate-800 text-white font-bold px-5 py-2 text-xs">Save FAQ</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {db.faqs.map(faq => (
                      <div key={faq.id} className="flex justify-between items-center border rounded-xl p-3 bg-stone-50/50">
                        <div>
                          <p className="text-xs font-bold text-stone-850">Q: {faq.question}</p>
                          <p className="text-[10px] text-stone-400 font-sans mt-0.5">Category: {faq.category}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0 ml-4">
                          <button onClick={() => setEditingFaq(faq)} className="bg-white border text-stone-600 rounded-lg px-2.5 py-1 text-[10px] hover:bg-stone-100">Edit</button>
                          <button onClick={() => deleteFaq(faq.id)} className="bg-white border text-rose-500 rounded p-1 hover:bg-rose-50"><Trash2 size={11} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* blogArticles Manager (Reviews / Conventions) */}
              <div className="border-t border-stone-100 pt-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-md font-bold text-stone-800 font-display">Notes, Reviews & Conventions Editor</h3>
                    <p className="text-xs text-stone-450 mt-0.5">Publish therapeutic ageplay guides, ABDL reviews, and logistics blogs.</p>
                  </div>
                  {!editingBlog && (
                    <button
                      onClick={() => setEditingBlog({ title: "", content: "", category: "Reviews" })}
                      className="flex cursor-pointer items-center gap-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm"
                    >
                      <PlusCircle size={14} />
                      Publish Article
                    </button>
                  )}
                </div>

                {editingBlog ? (
                  <form onSubmit={saveBlog} className="bg-stone-50 border border-stone-100 p-6 rounded-2xl space-y-4">
                    <h4 className="text-sm font-bold text-stone-800">Add/Edit Article listing</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Article Title</label>
                        <input
                          type="text"
                          value={editingBlog.title}
                          onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                          required
                          className="w-full rounded-lg bg-white border px-3 py-2 text-xs"
                          placeholder="e.g. Travel safety at ABDL gatherings"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Category tag *</label>
                        <select
                          value={editingBlog.category}
                          onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value as any })}
                          className="w-full rounded-lg bg-white border px-3 py-2 text-xs outline-none"
                        >
                          <option value="Conventions">Conventions</option>
                          <option value="Reviews">Reviews</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Main Blog Content</label>
                      <textarea
                        value={editingBlog.content}
                        onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                        required
                        rows={5}
                        className="w-full rounded-lg bg-white border px-3 py-2 text-xs leading-relaxed"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t">
                      <button type="button" onClick={() => setEditingBlog(null)} className="rounded bg-white border px-4 py-2 text-xs">Cancel</button>
                      <button type="submit" className="rounded bg-slate-800 text-white font-bold px-5 py-2 text-xs">Save Article</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {db.blogArticles.map(art => (
                      <div key={art.id} className="flex justify-between items-center border rounded-xl p-3 bg-stone-50/50">
                        <div>
                          <p className="text-xs font-bold text-stone-850">{art.title}</p>
                          <p className="text-[10px] text-stone-400 font-sans mt-0.5">{art.category} | Created {art.date}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0 ml-4">
                          <button onClick={() => setEditingBlog(art)} className="bg-white border text-stone-600 rounded-lg px-2.5 py-1 text-[10px] hover:bg-stone-100">Edit</button>
                          <button onClick={() => deleteBlog(art.id)} className="bg-white border text-rose-500 rounded p-1 hover:bg-rose-50"><Trash2 size={11} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: INQUIRY LOG MESSAGES */}
          {activeSubTab === "inquiries" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-stone-50 -mx-6 md:-mx-8 -mt-6 md:-mt-8 p-5 rounded-t-3xl border-b border-stone-100">
                <div>
                  <h3 className="text-lg font-bold font-display text-stone-850 dark:text-white">Private Inquiry Logs</h3>
                  <p className="text-xs text-stone-450 mt-0.5 dark:text-stone-300">Read private booking proposals, pronouns, fantasies, and special requests submitted.</p>
                </div>
                <span className="bg-rose-100 text-rose-500 font-bold px-3 py-1 rounded-full text-xs font-mono shrink-0">
                  Total: {db.privateInquiries?.length || 0} Entries
                </span>
              </div>

              {db.privateInquiries && db.privateInquiries.length > 0 ? (
                <div className="space-y-6">
                  {db.privateInquiries.map(inq => (
                    <div
                      key={inq.id}
                      id={`inquiry-log-item-${inq.id}`}
                      className={`w-full border rounded-2xl p-5 space-y-4 relative overflow-hidden bg-white shadow-sm transition-all ${
                        inq.read ? "border-stone-100 opacity-75" : "border-pink-200 outline-2 outline-pink-50"
                      }`}
                    >
<div className="space-y-2">
                      <h4 className="text-sm font-bold text-stone-850 dark:text-white">{inq.name}</h4>
                      <span className="text-[10px] font-mono bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{inq.pronouns}</span>
                      {!inq.read && <span className="bg-rose-500 text-white font-bold text-[8px] font-mono uppercase px-2 py-0.5 rounded-full">New</span>}
                      <p className="text-xs text-stone-450 font-mono dark:text-stone-300">Email: <a href={`mailto:${inq.email}`} className="text-indigo-500 underline hover:text-indigo-600">{inq.email}</a></p>
                      <p className="text-xs text-stone-500 font-semibold leading-relaxed">Fantasy: <span className="text-stone-800">{inq.fantasy}</span></p>
                      <p className="text-xs text-stone-500 font-semibold leading-relaxed">Special Request: <span className="text-stone-800">{inq.specialRequest}</span></p>
                      <p className="text-[10px] font-mono text-stone-400">{new Date(inq.date).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-center items-center mt-2 space-x-4">
                      <button
                        onClick={() => togglePrivateRead(inq.id, inq.read)}
                        className="p-2 rounded-full hover:bg-stone-100 transition-colors"
                        title={inq.read ? "Mark as Unread" : "Mark as Read"}
                      >
                        {inq.read ? <Mail size={20} className="text-emerald-600" /> : <MailOpen size={20} className="text-rose-600" />}
                      </button>
                      <button
                        onClick={() => handleDeletePrivate(inq.id)}
                        className="p-2 rounded-full hover:bg-rose-50 transition-colors"
                        title="Delete this private inquiry"
                      >
                        <Trash2 size={20} className="text-rose-600" />
                      </button>
                    </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-stone-400 text-xs text-center py-12 bg-stone-50 rounded-2xl border border-dashed">
                  No private inquiries recorded yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 7: GLOBAL SETTINGS & EXPORT TOOLS */}
          {activeSubTab === "settings" && (
            <div className="space-y-8">
              {/* Routing & Security Credentials */}
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-stone-800">Global Settings & Configuration</h3>
                  <p className="text-xs text-stone-450 mt-0.5">Control destination logs, passwords, and administrative access parameters.</p>
                </div>

                <div className="space-y-4 max-w-xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">Inquiry Routing Email Address</label>
                    <input
                      type="email"
                      value={db.globalSettings.routingEmail}
                      onChange={(e) => setDb({ ...db, globalSettings: { ...db.globalSettings, routingEmail: e.target.value } })}
                      className="w-full rounded-xl bg-stone-50 outline-none focus:bg-white focus:ring-2 focus:ring-pink-300 border border-stone-100 px-4 py-2.5 text-xs text-stone-700"
                      required
                    />
                    <p className="text-[10px] text-stone-400">SMTP Simulator redirects public contact sheets to this email address automatically.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">Change Administrator Portal Password</label>
                    <input
                      type="text"
                      placeholder="Leave completely unchanged to maintain current value..."
                      onChange={(e) => setDb({ ...db, globalSettings: { ...db.globalSettings, adminPassword: e.target.value } })}
                      className="w-full rounded-xl bg-stone-50 outline-none focus:bg-white focus:ring-2 focus:ring-pink-300 border border-stone-100 px-4 py-2.5 text-xs text-stone-700 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-xl cursor-pointer bg-slate-800 hover:bg-stone-700 text-white font-semibold text-xs px-5 py-3 shadow-md inline-flex items-center gap-1.5"
                >
                  <Save size={12} />
                  Update Credentials & Routing
                </button>
              </form>

              {/* Supabase Database Connection Tester */}
              <div className="border-t border-stone-100 pt-8 space-y-4">
                <div>
                  <h3 className="text-md font-bold text-stone-800 font-display">Supabase Integration & Health Check</h3>
                  <p className="text-xs text-stone-450 mt-0.5">Test real-time connection status with your Supabase schema and run a diagnostic read/write query.</p>
                </div>

                <div className="bg-stone-50 border rounded-2xl p-5 max-w-xl space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-stone-800">Supabase Connection Diagnostics</p>
                      <p className="text-[10px] text-stone-450 font-sans leading-normal">
                        Triggers server-side initialization, creates a connection check record in the <b className="text-stone-705">nursery_store</b> table, reads it back to confirm full read/write privileges, and cleans up.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={testSupabaseConnection}
                      disabled={supabaseTestLoading}
                      className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-vibrant-charcoal hover:bg-stone-700 font-bold text-white px-4 py-2.5 text-xs shadow-sm disabled:opacity-50 transition"
                    >
                      {supabaseTestLoading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          Testing...
                        </>
                      ) : (
                        "Test Connection"
                      )}
                    </button>
                  </div>

                  {/* Render test outputs dynamically */}
                  {supabaseTestResult && (
                    <div className={`p-4 rounded-xl text-xs space-y-2 border transition-all ${
                      supabaseTestResult.success 
                        ? "bg-emerald-50 border-emerald-150 text-emerald-800" 
                        : "bg-amber-50 border-amber-150 text-amber-900"
                    }`}>
                      <div className="flex gap-2 items-center font-bold">
                        {supabaseTestResult.success ? (
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        ) : (
                          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        <span>Status: {supabaseTestResult.success ? "Connected Successfully!" : "Connection Diagnostic Failed"}</span>
                      </div>
                      
                      <p className="text-[11px] leading-relaxed font-sans">{supabaseTestResult.message || supabaseTestResult.error}</p>

                      {supabaseTestResult.configuration && (
                        <div className="bg-white p-3 rounded-lg border text-[10px] space-y-1 font-mono">
                          <div><b>Supabase Host:</b> {supabaseTestResult.configuration.host}</div>
                          <div><b>Store Table:</b> {supabaseTestResult.configuration.table}</div>
                          {supabaseTestResult.testRecordInfo && (
                            <div className="mt-2 text-[9px] text-stone-500 bg-stone-50/50 p-2 rounded border border-stone-100">
                              <b>Verified Test Record Write-back:</b>
                              <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(supabaseTestResult.testRecordInfo, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Display SQL fix helper if table is missing or query fails */}
                      {supabaseTestResult.sqlFix && (
                        <div className="mt-3 space-y-1.5 bg-white p-3.5 rounded-xl border border-stone-200">
                          <p className="text-[10px] font-bold text-stone-700 uppercase tracking-wide">🔧 SQL Initializer Helper Code</p>
                          <p className="text-[10px] text-stone-500 font-sans">Run this SQL code block inside your <b>Supabase SQL Editor</b> to provision the registry store table:</p>
                          <pre className="p-2.5 bg-stone-50 rounded-lg text-[9px] text-rose-600 font-mono select-all overflow-x-auto border">{supabaseTestResult.sqlFix}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mailing List Export Tools */}
              <div className="border-t border-stone-100 pt-8 space-y-4">
                <div>
                  <h3 className="text-md font-bold text-stone-800 font-display">Newsletter & Mailing List Exporter</h3>
                  <p className="text-xs text-stone-450 mt-0.5">Mailing list contains {db.mailingList?.length || 0} registered email entries.</p>
                </div>

                <div className="bg-stone-50 border rounded-2xl p-5 max-w-lg flex items-center justify-between gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-stone-800">CSV Spreadsheet Export</p>
                    <p className="text-[10px] text-stone-400 font-sans leading-normal">Download subscriber emails along with reservation timestamps into a standard CSV spreadsheet file.</p>
                  </div>
                  <button
                    onClick={triggerExportCSV}
                    id="admin-export-csv-btn"
                    className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-rose-400 hover:bg-rose-500 font-semibold text-white px-4 py-2.5 text-xs shadow-md shadow-rose-200"
                  >
                    <FileDown size={14} />
                    Download CSV
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
