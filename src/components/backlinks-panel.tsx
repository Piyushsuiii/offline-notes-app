"use client";

import { useStore } from "@/store/useStore";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Link2, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { useState } from "react";

export function BacklinksPanel() {
  const { activeNoteId, setActiveNoteId } = useStore();
  const [open, setOpen] = useState(true);

  const backlinks = useLiveQuery(async () => {
    if (!activeNoteId) return [];
    const links = await db.links
      .where("target")
      .equals(activeNoteId)
      .toArray();
    const noteIds = [...new Set(links.map((l) => l.source))];
    const notes = await Promise.all(noteIds.map((id) => db.notes.get(id)));
    return notes.filter(Boolean) as NonNullable<typeof notes[number]>[];
  }, [activeNoteId]);

  if (!activeNoteId || !backlinks || backlinks.length === 0) return null;

  return (
    <div className="border-t border-white/5 bg-zinc-950/50 backdrop-blur-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-6 py-2.5 text-xs text-white/35 hover:text-white/60 transition-colors group"
      >
        <div className="transition-transform">
          {open ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </div>
        <Link2 className="w-3 h-3 text-indigo-400/70" />
        <span>
          {backlinks.length} Backlink{backlinks.length !== 1 ? "s" : ""}
        </span>
        <span className="text-white/20 ml-0.5">— notes that link here</span>
      </button>

      {open && (
        <div className="px-5 pb-4 grid grid-cols-2 gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {backlinks.map((note) => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white/90 hover:bg-white/5 transition-all text-left border border-transparent hover:border-white/10"
            >
              <FileText className="w-3 h-3 text-indigo-400/60 flex-shrink-0" />
              <span className="truncate">{note.title || "Untitled"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
