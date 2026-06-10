"use client";

import { useStore } from "@/store/useStore";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl pointer-events-auto min-w-[280px] animate-in slide-in-from-right-4 fade-in duration-300 ${
            toast.type === "success"
              ? "bg-zinc-900/95 border-green-500/30"
              : toast.type === "error"
              ? "bg-zinc-900/95 border-red-500/30"
              : "bg-zinc-900/95 border-indigo-500/30"
          }`}
        >
          {toast.type === "success" && (
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          )}
          {toast.type === "error" && (
            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          {toast.type === "info" && (
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-white/90 flex-1">
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/30 hover:text-white/80 transition-colors ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
