"use client";

import { useStore } from "@/store/useStore";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useState, useEffect, useRef } from "react";
import {
  Search, FileText, Plus, Network, Bot, Keyboard,
  Maximize2, Download, BookOpen, Calendar,
} from "lucide-react";

export function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveNoteId,
    setViewMode,
    setSidebarTab,
    focusMode,
    setFocusMode,
    setExportModalOpen,
    setTemplatesModalOpen,
    setKeyboardShortcutsOpen,
    addToast,
  } = useStore();

  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const notes = useLiveQuery(() =>
    db.notes.orderBy("updatedAt").reverse().toArray()
  );

  // Open with Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [commandPaletteOpen]);

  const quickActions = [
    {
      id: "new-note",
      label: "New Note",
      icon: Plus,
      action: async () => {
        const id = crypto.randomUUID();
        await db.notes.add({
          id,
          title: "Untitled Note",
          content: "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        setActiveNoteId(id);
        setViewMode("editor");
        addToast("New note created ✓");
      },
    },
    {
      id: "canvas",
      label: "Switch to Canvas View",
      icon: Network,
      action: () => setViewMode("canvas"),
    },
    {
      id: "ai-chat",
      label: "Open AI Chat",
      icon: Bot,
      action: () => setSidebarTab("chat"),
    },
    {
      id: "focus",
      label: focusMode ? "Exit Focus Mode" : "Enter Focus Mode",
      icon: Maximize2,
      action: () => {
        setFocusMode(!focusMode);
        addToast(focusMode ? "Focus mode off" : "Focus mode on ✓");
      },
    },
    {
      id: "export",
      label: "Export Current Note",
      icon: Download,
      action: () => setExportModalOpen(true),
    },
    {
      id: "templates",
      label: "Browse Templates",
      icon: BookOpen,
      action: () => setTemplatesModalOpen(true),
    },
    {
      id: "daily",
      label: "Open Today's Daily Note",
      icon: Calendar,
      action: async () => {
        const today = new Date().toLocaleDateString("en-CA");
        const title = `📔 Daily — ${today}`;
        const existing = await db.notes
          .where("title")
          .equals(title)
          .first();
        if (existing) {
          setActiveNoteId(existing.id);
        } else {
          const id = crypto.randomUUID();
          await db.notes.add({
            id,
            title,
            content: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          setActiveNoteId(id);
        }
        setViewMode("editor");
        addToast("Daily note opened ✓");
      },
    },
    {
      id: "shortcuts",
      label: "Keyboard Shortcuts",
      icon: Keyboard,
      action: () => setKeyboardShortcutsOpen(true),
    },
  ];

  const filteredNotes = (notes ?? []).filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredActions = quickActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  type Item = {
    type: "action" | "note";
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    action: () => void;
    date?: string;
  };

  const allItems: Item[] = [
    ...filteredActions.map((a) => ({ type: "action" as const, ...a })),
    ...filteredNotes.map((n) => ({
      type: "note" as const,
      id: n.id,
      label: n.title || "Untitled",
      icon: FileText,
      action: () => {
        setActiveNoteId(n.id);
        setViewMode("editor");
      },
      date: new Date(n.updatedAt).toLocaleDateString(),
    })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, allItems.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && allItems[selectedIdx]) {
      allItems[selectedIdx].action();
      setCommandPaletteOpen(false);
    }
    if (e.key === "Escape") setCommandPaletteOpen(false);
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-start justify-center pt-[15vh] bg-black/70 backdrop-blur-sm"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-top-4 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search notes or run an action..."
            className="flex-1 bg-transparent text-white/90 placeholder:text-white/30 outline-none text-sm"
          />
          <kbd className="px-2 py-0.5 text-xs text-white/30 bg-white/5 rounded border border-white/10 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {allItems.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">
              No results for &quot;{query}&quot;
            </div>
          )}

          {filteredActions.length > 0 && (
            <>
              <div className="px-4 py-1.5 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                Actions
              </div>
              {filteredActions.map((action, i) => {
                const Icon = action.icon;
                const isSelected = selectedIdx === i;
                return (
                  <button
                    key={action.id}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isSelected
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                    onClick={() => {
                      action.action();
                      setCommandPaletteOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIdx(i)}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-indigo-500/30" : "bg-white/5"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {action.label}
                  </button>
                );
              })}
            </>
          )}

          {filteredNotes.length > 0 && (
            <>
              <div className="px-4 py-1.5 text-[10px] font-semibold text-white/25 uppercase tracking-widest mt-1">
                Notes
              </div>
              {filteredNotes.map((note, i) => {
                const globalIdx = filteredActions.length + i;
                const isSelected = selectedIdx === globalIdx;
                return (
                  <button
                    key={note.id}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isSelected
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                    onClick={() => {
                      setActiveNoteId(note.id);
                      setViewMode("editor");
                      setCommandPaletteOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIdx(globalIdx)}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-indigo-500/30" : "bg-white/5"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate flex-1 text-left">
                      {note.title || "Untitled Note"}
                    </span>
                    <span className="text-xs text-white/25 flex-shrink-0">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-[10px] text-white/25">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>ESC close</span>
          <span className="ml-auto">Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}
