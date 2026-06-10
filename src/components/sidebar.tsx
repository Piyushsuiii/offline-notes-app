"use client";

import { useStore } from "@/store/useStore";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Plus, FileText, PanelLeftClose, PanelLeft, LogOut, Trash2,
  MessageSquare, Search, Pin, Calendar, BookOpen, Focus,
  Keyboard, Star,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSidebar } from "@/components/chat-sidebar";
import { TagsPanel } from "@/components/tags-panel";
import { useState } from "react";

export function Sidebar() {
  const {
    sidebarOpen, toggleSidebar,
    activeNoteId, setActiveNoteId,
    sidebarTab, setSidebarTab,
    activeTagFilter,
    setTemplatesModalOpen,
    setFocusMode, focusMode,
    setKeyboardShortcutsOpen,
    addToast,
  } = useStore();

  const { data: session } = useSession();
  const [search, setSearch] = useState("");

  const allNotes = useLiveQuery(() =>
    db.notes.orderBy("updatedAt").reverse().toArray()
  );

  // Filter + split into pinned / unpinned
  const filteredNotes = (allNotes ?? []).filter((note) => {
    const matchesSearch = !search || note.title.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !activeTagFilter || note.tags?.includes(activeTagFilter);
    return matchesSearch && matchesTag;
  });
  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.pinned);

  const handleCreateNote = async () => {
    const id = crypto.randomUUID();
    await db.notes.add({
      id,
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setActiveNoteId(id);
    addToast("Note created ✓");
  };

  const handleDailyNote = async () => {
    const today = new Date().toLocaleDateString("en-CA");
    const title = `📔 Daily — ${today}`;
    const existing = await db.notes.where("title").equals(title).first();
    if (existing) {
      setActiveNoteId(existing.id);
      addToast("Daily note opened ✓");
    } else {
      const id = crypto.randomUUID();
      await db.notes.add({
        id, title, content: "", createdAt: Date.now(), updatedAt: Date.now(),
      });
      setActiveNoteId(id);
      addToast("Daily note created ✓");
    }
  };

  const handlePinToggle = async (e: React.MouseEvent, noteId: string, pinned: boolean) => {
    e.stopPropagation();
    await db.notes.update(noteId, { pinned: !pinned });
    addToast(pinned ? "Unpinned" : "Pinned ✓");
  };

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (!confirm("Delete this note?")) return;
    await db.transaction("rw", db.notes, db.links, async () => {
      await db.notes.delete(noteId);
      await db.links.where("source").equals(noteId).delete();
      await db.links.where("target").equals(noteId).delete();
    });
    if (activeNoteId === noteId) setActiveNoteId(null);
    addToast("Note deleted");
  };

  // Collapsed sidebar
  if (!sidebarOpen) {
    return (
      <div className="h-screen w-14 border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl flex flex-col items-center py-4 gap-2 transition-all duration-300 z-10">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-white/60 hover:text-white hover:bg-white/10 w-9 h-9">
          <PanelLeft className="w-4 h-4" />
        </Button>
        <div className="w-8 h-px bg-white/10 my-1" />
        <button onClick={handleCreateNote} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors" title="New Note">
          <Plus className="w-4 h-4" />
        </button>
        <button onClick={handleDailyNote} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors" title="Daily Note">
          <Calendar className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const NoteItem = ({ note }: { note: NonNullable<typeof allNotes>[number] }) => {
    const isActive = activeNoteId === note.id;
    return (
      <div
        className={`group w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
          isActive
            ? "bg-indigo-500/20 text-indigo-300"
            : "text-white/55 hover:bg-white/5 hover:text-white/90"
        }`}
        onClick={() => setActiveNoteId(note.id)}
      >
        {note.pinned ? (
          <Star className={`w-3.5 h-3.5 flex-shrink-0 fill-current ${isActive ? "text-indigo-400" : "text-yellow-400/70"}`} />
        ) : (
          <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-indigo-400" : "text-white/30"}`} />
        )}
        <span className="truncate flex-1 text-left text-xs">{note.title || "Untitled Note"}</span>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => handlePinToggle(e, note.id, !!note.pinned)}
            className={`p-1 rounded transition-colors ${note.pinned ? "text-yellow-400 hover:text-yellow-300" : "text-white/30 hover:text-yellow-400 hover:bg-yellow-500/10"}`}
            title={note.pinned ? "Unpin" : "Pin"}
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => handleDelete(e, note.id)}
            className="p-1 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-64 border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl flex flex-col transition-all duration-300 shadow-2xl shadow-black z-10 relative">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-white font-black text-lg leading-none">N</span>
          </div>
          <h1 className="font-black text-white/90 text-lg tracking-tight">NOTERA</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-white/40 hover:text-white hover:bg-white/10 h-8 w-8">
          <PanelLeftClose className="w-4 h-4" />
        </Button>
      </div>

      {/* Tab switcher */}
      <div className="px-3 pb-2">
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
          <button
            onClick={() => setSidebarTab("notes")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all ${
              sidebarTab === "notes" ? "bg-white/10 text-white shadow-sm" : "text-white/45 hover:text-white/70"
            }`}
          >
            <FileText className="w-3 h-3" /> Notes
          </button>
          <button
            onClick={() => setSidebarTab("chat")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all ${
              sidebarTab === "chat" ? "bg-indigo-500/20 text-indigo-300 shadow-sm" : "text-white/45 hover:text-white/70"
            }`}
          >
            <MessageSquare className="w-3 h-3" /> AI Chat
          </button>
        </div>
      </div>

      {/* AI Chat tab */}
      {sidebarTab === "chat" ? (
        <div className="flex-1 overflow-hidden">
          <ChatSidebar />
        </div>
      ) : (
        <>
          {/* Notes tab content */}
          <div className="px-3 pb-2 space-y-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full bg-white/5 border border-white/8 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white/80 placeholder:text-white/25 outline-none focus:border-indigo-500/40 focus:bg-white/8 transition-all"
              />
            </div>

            {/* Action buttons row */}
            <div className="flex gap-1.5">
              <Button
                onClick={handleCreateNote}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 h-8 text-xs"
              >
                <Plus className="w-3 h-3 mr-1.5" /> New Note
              </Button>
              <button
                onClick={handleDailyNote}
                className="px-2.5 h-8 rounded-md bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                title="Today's Daily Note"
              >
                <Calendar className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tags panel */}
          <TagsPanel />

          {/* Notes list */}
          <ScrollArea className="flex-1 px-3 mt-1">
            <div className="space-y-0.5 py-1">
              {/* Pinned section */}
              {pinnedNotes.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-[10px] font-semibold text-white/25 uppercase tracking-widest flex items-center gap-1.5">
                    <Pin className="w-2.5 h-2.5" /> Pinned
                  </div>
                  {pinnedNotes.map((note) => <NoteItem key={note.id} note={note} />)}
                  {unpinnedNotes.length > 0 && (
                    <div className="px-2 py-1.5 mt-1 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                      Notes
                    </div>
                  )}
                </>
              )}

              {/* Unpinned */}
              {unpinnedNotes.map((note) => <NoteItem key={note.id} note={note} />)}

              {/* Empty state */}
              {filteredNotes.length === 0 && (
                <div className="text-center py-10 text-white/25 text-xs px-2">
                  {search ? `No notes matching "${search}"` : "No notes yet. Create one!"}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Bottom actions */}
          <div className="p-3 border-t border-white/5 bg-zinc-950/50">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setTemplatesModalOpen(true)}
                className="flex flex-col items-center gap-1 py-2 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/5 transition-colors text-center"
                title="Templates"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-[9px]">Templates</span>
              </button>
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors text-center ${
                  focusMode ? "text-indigo-400 bg-indigo-500/10" : "text-white/35 hover:text-white/70 hover:bg-white/5"
                }`}
                title="Focus Mode"
              >
                <Focus className="w-4 h-4" />
                <span className="text-[9px]">Focus</span>
              </button>
              <button
                onClick={() => setKeyboardShortcutsOpen(true)}
                className="flex flex-col items-center gap-1 py-2 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/5 transition-colors text-center"
                title="Keyboard Shortcuts"
              >
                <Keyboard className="w-4 h-4" />
                <span className="text-[9px]">Shortcuts</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* User profile */}
      {session?.user && (
        <div className="p-3 border-t border-white/5 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              src={session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`}
              alt="Avatar"
              className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0"
            />
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-white/80 truncate">{session.user.name}</span>
              <span className="text-[10px] text-white/35 truncate">{session.user.email}</span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-1.5 text-white/35 hover:text-white/90 hover:bg-white/8 rounded-md transition-colors flex-shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
