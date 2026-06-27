import React, { useState } from "react";
import { supabase } from "../supabaseClient";


export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // client validation
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
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
      options: { data: { full_name: name } },
    });
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess("Check your email to confirm your account before logging in.");
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
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl bg-vibrant-bg border border-stone-200 px-4 py-2.5 text-xs text-stone-800 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl bg-vibrant-bg border border-stone-200 px-4 py-2.5 text-xs text-stone-800 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold"
              required
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Password *</label>
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
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
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Confirm Password *</label>
            <input
              type={showConfirmPwd ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
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
