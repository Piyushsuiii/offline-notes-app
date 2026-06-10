"use client";

import dynamic from "next/dynamic";
import { Sidebar } from "@/components/sidebar";
import { GraphView } from "@/components/graph-view";
import { CommandPalette } from "@/components/command-palette";
import { OnboardingModal } from "@/components/onboarding-modal";
import { ToastContainer } from "@/components/toast";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";
import { ExportModal } from "@/components/export-modal";
import { NoteTemplatesModal } from "@/components/note-templates-modal";
import { useStore } from "@/store/useStore";
import { Network, FileText } from "lucide-react";

const Editor = dynamic(
  () => import("@/components/editor").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-zinc-950/40 text-white/30 text-sm">
        Loading Editor...
      </div>
    ),
  }
);

const CanvasView = dynamic(
  () => import("@/components/canvas-view").then((mod) => mod.CanvasView),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 text-white/30 text-sm">
        Loading Canvas...
      </div>
    ),
  }
);

export default function AppHome() {
  const { viewMode, setViewMode, activeNoteId, focusMode } = useStore();

  return (
    <main className="flex h-screen w-full bg-black overflow-hidden text-white selection:bg-indigo-500/30">
      {/* Global Modals & Overlays */}
      <CommandPalette />
      <OnboardingModal />
      <ToastContainer />
      <KeyboardShortcutsModal />
      <ExportModal />
      <NoteTemplatesModal />

      {/* Sidebar — hidden in focus mode */}
      {!focusMode && <Sidebar />}

      {/* Main content area */}
      <div className="flex-1 flex relative overflow-hidden">
        {viewMode === "editor" ? (
          <Editor key={activeNoteId || "empty"} />
        ) : (
          <CanvasView />
        )}

        {viewMode === "editor" && !focusMode && <GraphView />}

        {/* Floating View Toggle — hidden in focus mode */}
        {!focusMode && (
          <div className="absolute bottom-6 right-6 z-50 bg-zinc-900/90 border border-white/10 rounded-full p-1 flex shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setViewMode("editor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === "editor"
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Editor
            </button>
            <button
              onClick={() => setViewMode("canvas")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === "canvas"
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              <Network className="w-3.5 h-3.5" /> Canvas
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
