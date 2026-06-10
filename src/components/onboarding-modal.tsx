"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { useStore } from "@/store/useStore";
import { Sparkles, Globe2, BrainCircuit, ArrowRight, Rocket } from "lucide-react";

const slides = [
  {
    icon: Sparkles,
    gradient: "from-indigo-500 to-purple-600",
    shadow: "shadow-indigo-500/30",
    title: "Welcome to NOTERA",
    subtitle: "Your offline-first second brain",
    description:
      "Write, connect, and explore your ideas — even without internet. Everything syncs silently when you're back online.",
  },
  {
    icon: Globe2,
    gradient: "from-blue-500 to-cyan-600",
    shadow: "shadow-blue-500/30",
    title: "Offline First",
    subtitle: "Your data, your device",
    description:
      "Everything saves instantly to your browser's IndexedDB. No loading spinners, no lag. Works on a plane, in a tunnel, anywhere.",
  },
  {
    icon: BrainCircuit,
    gradient: "from-purple-500 to-pink-600",
    shadow: "shadow-purple-500/30",
    title: "Connect Your Ideas",
    subtitle: "Like a web of thought",
    description:
      "Type [[Note Name]] anywhere to create a link. Watch your knowledge grow into a 3D constellation you can explore.",
  },
];

const SAMPLE_NOTE_CONTENT = JSON.stringify([
  {
    id: "b1",
    type: "heading",
    props: { level: 1, textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [{ type: "text", text: "🚀 Welcome to NOTERA!", styles: {} }],
    children: [],
  },
  {
    id: "b2",
    type: "paragraph",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [{ type: "text", text: "This is your first note. Start typing to begin your knowledge journey.", styles: {} }],
    children: [],
  },
  {
    id: "b3",
    type: "paragraph",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [
      { type: "text", text: "Try typing ", styles: {} },
      { type: "text", text: "[[My Second Note]]", styles: { bold: true } },
      { type: "text", text: " to create a linked note and see the 3D graph come alive!", styles: {} },
    ],
    children: [],
  },
]);

export function OnboardingModal() {
  const { addToast, setActiveNoteId } = useStore();
  const [slide, setSlide] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("notera_onboarding_complete") === "true";
    if (!done) setShow(true);
  }, []);

  if (!show) return null;

  const current = slides[slide];
  const Icon = current.icon;

  const handleFinish = async () => {
    localStorage.setItem("notera_onboarding_complete", "true");
    const id = crypto.randomUUID();
    await db.notes.add({
      id,
      title: "🚀 Welcome to NOTERA",
      content: SAMPLE_NOTE_CONTENT,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setActiveNoteId(id);
    setShow(false);
    addToast("Welcome! Your first note is ready ✓");
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-7 pb-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === slide
                  ? "w-8 h-2 bg-indigo-500"
                  : "w-2 h-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="p-8 text-center">
          <div
            className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${current.gradient} flex items-center justify-center mx-auto mb-6 shadow-2xl ${current.shadow}`}
          >
            <Icon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
            {current.title}
          </h2>
          <p className="text-indigo-400 font-semibold text-sm mb-5">
            {current.subtitle}
          </p>
          <p className="text-zinc-400 leading-relaxed text-sm">
            {current.description}
          </p>
        </div>

        <div className="px-8 pb-8 flex gap-3">
          {slide > 0 && (
            <button
              onClick={() => setSlide((s) => s - 1)}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
            >
              Back
            </button>
          )}
          {slide === 0 && (
            <button
              onClick={() => handleFinish()}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white/60 transition-all text-sm"
            >
              Skip
            </button>
          )}
          {slide < slides.length - 1 ? (
            <button
              onClick={() => setSlide((s) => s + 1)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/20"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-lg"
            >
              <Rocket className="w-4 h-4" /> Let&apos;s Go!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
