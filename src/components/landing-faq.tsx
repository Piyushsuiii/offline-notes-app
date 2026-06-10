"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is my data really stored offline?",
    a: "Yes — 100%. Everything is saved instantly to your browser's IndexedDB (the same tech behind Google Docs offline mode). No network request is made when you type. Your data stays on your device.",
  },
  {
    q: "What happens when I come back online?",
    a: "NOTERA silently syncs in the background. Any notes you created or edited offline are pushed to our Supabase Postgres backend without you lifting a finger. No merge conflicts, no data loss.",
  },
  {
    q: "Can I collaborate with others in real-time?",
    a: "Yes! We use Y.js with WebRTC for peer-to-peer collaboration — no central server needed. Share a note, and your co-author sees your cursor move in real time, even without a server.",
  },
  {
    q: "Is NOTERA really free?",
    a: "The core app — unlimited notes, offline sync, 3D graph, AI chat, bidirectional links — is completely free. We plan a Pro tier for advanced features like cloud backup and custom themes.",
  },
  {
    q: "How does the AI work without my data leaving?",
    a: "We use a local embedding model (Xenova Transformers, runs in your browser) to understand your notes semantically. Only when you ask the AI to respond does a request go to our API — no note content is stored on our AI servers.",
  },
  {
    q: "Can I export my notes?",
    a: "Absolutely. Export any note as Markdown (.md) or plain text (.txt) in one click. Your notes are never locked in — you own them forever.",
  },
];

export function LandingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto space-y-2">
      {faqs.map((faq, i) => {
        const isOpen = openIdx === i;
        return (
          <div
            key={i}
            className={`rounded-2xl border transition-all duration-200 ${
              isOpen
                ? "border-indigo-500/30 bg-indigo-500/5"
                : "border-white/8 bg-white/3 hover:border-white/15"
            }`}
          >
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
            >
              <span
                className={`text-sm font-semibold transition-colors ${
                  isOpen ? "text-white/90" : "text-white/70"
                }`}
              >
                {faq.q}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-indigo-400" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 animate-in slide-in-from-top-1 fade-in duration-200">
                <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
