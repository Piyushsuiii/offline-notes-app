"use client";

import { useStore } from "@/store/useStore";
import { X, Keyboard } from "lucide-react";
import { useEffect } from "react";

const shortcuts = [
  { keys: ["Ctrl", "K"], description: "Open Command Palette" },
  { keys: ["?"], description: "Show Keyboard Shortcuts" },
  { keys: ["Ctrl", "N"], description: "New Note" },
  { keys: ["Ctrl", "F"], description: "Toggle Focus Mode" },
  { keys: ["Ctrl", "E"], description: "Export Current Note" },
  { keys: ["Ctrl", "T"], description: "Browse Templates" },
  { keys: ["Ctrl", "G"], description: "Toggle Graph View" },
  { keys: ["/"], description: "Insert Block (in editor)" },
  { keys: ["[[", "Note Name", "]]" ], description: "Link to another note" },
  { keys: ["Esc"], description: "Close modal / Exit focus mode" },
];

export function KeyboardShortcutsModal() {
  const { keyboardShortcutsOpen, setKeyboardShortcutsOpen } = useStore();

  // Open with ?
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === "?") setKeyboardShortcutsOpen(true);
      if (e.key === "Escape") setKeyboardShortcutsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setKeyboardShortcutsOpen]);

  if (!keyboardShortcutsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={() => setKeyboardShortcutsOpen(false)}
    >
      <div
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="font-bold text-white/90">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setKeyboardShortcutsOpen(false)}
            className="text-white/40 hover:text-white/90 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 space-y-0.5 max-h-96 overflow-y-auto">
          {shortcuts.map(({ keys, description }) => (
            <div
              key={description}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="text-sm text-white/70">{description}</span>
              <div className="flex items-center gap-1">
                {keys.map((key, i) => (
                  <span key={i} className="flex items-center gap-0.5">
                    <kbd className="px-2 py-0.5 text-xs text-white/60 bg-white/10 rounded border border-white/15 font-mono">
                      {key}
                    </kbd>
                    {i < keys.length - 1 && (
                      <span className="text-white/25 text-xs mx-0.5">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 text-center text-xs text-white/25">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50 font-mono">
            ?
          </kbd>{" "}
          anywhere to open this panel
        </div>
      </div>
    </div>
  );
}
