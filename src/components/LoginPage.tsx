import React, { useState } from "react";
import { supabase } from "../supabaseClient";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
    } else {
      // redirect to dashboard after successful login
      window.location.href = "/dashboard";
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-[32px] border-2 border-vibrant-pink p-8 shadow-xs">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-vibrant-pink flex items-center justify-center mb-3">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h2 className="text-2xl font-extrabold font-display text-vibrant-charcoal dark:text-white">Welcome Back</h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 text-center mt-1">Sign in to access your private nursery dashboard.</p>
        </div>
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-500 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl bg-vibrant-bg border border-stone-200 px-4 py-2.5 text-xs text-stone-800 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-vibrant-gold"
              required
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Password</label>
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
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-full bg-rose-600 hover:bg-rose-700 text-white uppercase font-bold tracking-wider py-4 text-xs disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="text-xs text-center text-stone-600 dark:text-stone-400 mt-4">
          Don't have an account?{' '}
          <a href="/register" className="text-rose-600 hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
}
