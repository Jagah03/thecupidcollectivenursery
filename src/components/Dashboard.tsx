import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard({ onStartBooking }: { onStartBooking: () => void }) {
  const { user } = useAuth();
  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-[32px] border-2 border-vibrant-pink p-8 shadow-xs">
        <h2 className="text-2xl font-extrabold font-display text-vibrant-charcoal dark:text-white mb-4">
          Dashboard
        </h2>
        <p className="text-stone-600 dark:text-stone-300">
          Welcome, {user?.email ?? "User"}!
        </p>
        <button onClick={onStartBooking} className="mt-4 rounded-xl bg-rose-400 hover:bg-rose-500 text-white font-bold px-4 py-2">
          Book a Session
        </button>
        {/* Add dashboard content here */}
      </div>
    </div>
  );
}
