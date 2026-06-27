import React, { useState } from "react";
import { supabase } from "../supabaseClient";


const getFriendlyError = (message: string): string => {
  const msg = message.toLowerCase();
  if (msg.includes("rate limit") || msg.includes("email rate limit")) {
    return "We're receiving a lot of sign‑ups right now. Please wait a few minutes and try again.";
  }
  if (msg.includes("user already registered") || msg.includes("already been registered")) {
    return "An account with this email already exists. Please log in instead.";
  }
  if (msg.includes("invalid email")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("password")) {
    return "Your password must be at least 8 characters long.";
  }
  return "Something went wrong during registration. Please try again shortly.";
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    pronouns: "",
    age: "",
    goals: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const { name, pronouns, age, goals, email, password, confirmPassword } = formData;
    // client validation
    if (!name || !age || !goals || !email || !password || !confirmPassword) {
      setError("All required fields must be completed.");
      return;
    }
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 18) {
      setError("Age must be a number 18 or older.");
      return;
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          pronouns,
          age: ageNum,
          goals
        }
      }
    });
    if (signUpError) {
      setError(getFriendlyError(signUpError.message || ""));
    } else {
      setSuccess("Check your email to confirm your account before logging in.");
      // Fire‑and‑forget registration data capture
      try {
        fetch("/api/register-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            pronouns: formData.pronouns,
            age: formData.age,
            goals: formData.goals,
            email: formData.email
          })
        });
      } catch (e) {
        console.error("Failed to log registration:", e);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-[32px] border-2 border-vibrant-pink p-8 shadow-xs">
        <div className="flex flex-col items-center mb-6">
          {/* Replace with actual logo component if available */}
          <div className="w-12 h-12 rounded-full bg-vibrant-pink flex items-center justify-center mb-3">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h2 className="text-2xl font-extrabold font-display text-vibrant-charcoal dark:text-white">Create Your Account</h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 text-center mt-1">Join The Cupid Collective and access your personal nursery dashboard.</p>
        </div>
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-500 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-semibold text-emerald-500 mb-4">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name / Alias */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Name or Alias *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Coby (Little Coby)"
              className="w-full rounded-xl bg-vibrant-bg border border-stone-200 px-4 py-2.5 text-xs text-stone-800 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold"
              required
            />
          </div>
          {/* Pronouns */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Pronouns</label>
            <input
              type="text"
              value={formData.pronouns}
              onChange={e => setFormData(prev => ({ ...prev, pronouns: e.target.value }))}
              placeholder="e.g., He / Him"
              className="w-full rounded-xl bg-vibrant-bg border border-stone-200 px-4 py-2.5 text-xs text-stone-800 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold"
            />
          </div>
          {/* Age */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Age *</label>
            <input
              type="number"
              value={formData.age}
              onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
              placeholder="Must be 18 or older"
              min={18}
              className="w-full rounded-xl bg-vibrant-bg border border-stone-200 px-4 py-2.5 text-xs text-stone-800 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold"
              required
            />
          </div>
          {/* Goals */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Goals *</label>
            <textarea
              value={formData.goals}
              onChange={e => setFormData(prev => ({ ...prev, goals: e.target.value }))}
              placeholder="What are you hoping to experience or achieve through the nursery?"
              rows={3}
              className="w-full rounded-xl bg-vibrant-bg border border-stone-200 px-4 py-2.5 text-xs text-stone-800 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold"
              required
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="e.g., mail@example.com"
              className="w-full rounded-xl bg-vibrant-bg border border-stone-200 px-4 py-2.5 text-xs text-stone-800 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold"
              required
            />
          </div>
          {/* Password */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Password *</label>
            <input
              type={showPwd ? "text" : "password"}
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-xl bg-vibrant-bg border border-stone-200 px-4 py-2.5 text-xs text-stone-800 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-stone-600"
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Confirm Password *</label>
            <input
              type={showConfirmPwd ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full rounded-xl bg-vibrant-bg border border-stone-200 px-4 py-2.5 text-xs text-stone-800 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd(v => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-stone-600"
            >
              {showConfirmPwd ? "Hide" : "Show"}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-full bg-rose-600 hover:bg-rose-700 text-white uppercase font-bold tracking-wider py-4 text-xs disabled:opacity-50"
          >
            {loading ? "Processing…" : "Create Account"}
          </button>
        </form>
        <p className="text-xs text-center text-stone-600 dark:text-stone-400 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-rose-600 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}
