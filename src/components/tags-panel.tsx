"use client";

import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useStore } from "@/store/useStore";
import { useState } from "react";
import { Tag, Plus, X } from "lucide-react";

export const TAG_COLORS = [
  { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/30", dot: "bg-red-400" },
  { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/30", dot: "bg-orange-400" },
  { bg: "bg-yellow-500/20", text: "text-yellow-300", border: "border-yellow-500/30", dot: "bg-yellow-400" },
  { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30", dot: "bg-green-400" },
  { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", dot: "bg-blue-400" },
  { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30", dot: "bg-purple-400" },
  { bg: "bg-pink-500/20", text: "text-pink-300", border: "border-pink-500/30", dot: "bg-pink-400" },
  { bg: "bg-indigo-500/20", text: "text-indigo-300", border: "border-indigo-500/30", dot: "bg-indigo-400" },
];

export function TagsPanel() {
  const { activeTagFilter, setActiveTagFilter, addToast } = useStore();
  const [creating, setCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);

  const tags = useLiveQuery(() => db.tags.toArray());

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    await db.tags.add({
      id: crypto.randomUUID(),
      name: newTagName.trim(),
      color: String(selectedColor),
    });
    addToast(`Tag "${newTagName.trim()}" created ✓`);
    setNewTagName("");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    await db.tags.delete(id);
    if (activeTagFilter === id) setActiveTagFilter(null);
  };

  return (
    <div className="px-3 py-2 border-b border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest flex items-center gap-1.5">
          <Tag className="w-3 h-3" /> Tags
        </span>
        <button
          onClick={() => setCreating((c) => !c)}
          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
            creating ? "bg-indigo-500/20 text-indigo-400" : "text-white/25 hover:text-white/60 hover:bg-white/10"
          }`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="mb-2.5 p-2.5 bg-white/5 rounded-xl border border-white/10 animate-in slide-in-from-top-1 duration-150">
          <input
            autoFocus
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setCreating(false);
            }}
            placeholder="Tag name..."
            className="w-full bg-transparent text-xs text-white/90 placeholder:text-white/30 outline-none mb-2.5"
          />
          <div className="flex items-center gap-2 justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {TAG_COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className={`w-3.5 h-3.5 rounded-full ${c.dot} transition-all ${
                    selectedColor === i
                      ? "ring-2 ring-white/60 ring-offset-1 ring-offset-zinc-900 scale-110"
                      : "opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleCreate}
              disabled={!newTagName.trim()}
              className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded-md disabled:opacity-50 hover:bg-indigo-500/30 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {activeTagFilter && (
            <button
              onClick={() => setActiveTagFilter(null)}
              className="px-2 py-1 rounded-md text-[10px] bg-white/10 text-white/60 hover:bg-white/15 transition-colors flex items-center gap-1"
            >
              All <X className="w-2.5 h-2.5" />
            </button>
          )}
          {tags.map((tag) => {
            const colorSet = TAG_COLORS[parseInt(tag.color) % TAG_COLORS.length];
            const isActive = activeTagFilter === tag.id;
            return (
              <div key={tag.id} className="flex items-center group">
                <button
                  onClick={() => setActiveTagFilter(isActive ? null : tag.id)}
                  className={`px-2 py-0.5 rounded-l-md text-[10px] border transition-all flex items-center gap-1 ${
                    isActive
                      ? `${colorSet.bg} ${colorSet.text} ${colorSet.border}`
                      : "bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/70"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${colorSet.dot}`} />
                  {tag.name}
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="opacity-0 group-hover:opacity-100 px-1 py-0.5 rounded-r-md border-y border-r border-white/10 bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        !creating && (
          <p className="text-[10px] text-white/20 py-1">
            No tags yet. Click + to create one.
          </p>
        )
      )}
    </div>
  );
}
