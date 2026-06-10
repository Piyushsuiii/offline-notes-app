"use client";

import { useState, useEffect } from "react";
import { X, RotateCcw, Clock } from "lucide-react";
import { db, HistorySnapshot } from "@/lib/db";
import { Button } from "./ui/button";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

export function TimeTravelModal({ noteId, onClose, onRestore }: { noteId: string, onClose: () => void, onRestore: (content: string) => void }) {
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  
  useEffect(() => {
    db.history.where('noteId').equals(noteId).reverse().sortBy('timestamp').then(res => {
      setHistory(res);
      setSelectedIndex(0);
    });
  }, [noteId]);

  const selectedSnapshot = history[selectedIndex];

  // We need a read-only editor to preview
  const editor = useCreateBlockNote({});

  useEffect(() => {
    if (editor && selectedSnapshot) {
       try {
         const blocks = JSON.parse(selectedSnapshot.content);
         editor.replaceBlocks(editor.document, blocks);
       } catch (e) {
         console.error(e);
       }
    }
  }, [selectedSnapshot, editor]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
       <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl overflow-hidden relative">
          <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-900/50">
             <div className="flex items-center gap-2 text-white/90 font-medium">
               <Clock className="w-4 h-4 text-indigo-400" />
               Revision History
             </div>
             <button onClick={onClose} className="p-2 text-white/50 hover:text-white/90 hover:bg-white/5 rounded-full transition-all">
                <X className="w-5 h-5" />
             </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
             {/* Sidebar List */}
             <div className="w-64 border-r border-white/5 bg-zinc-900/20 overflow-y-auto p-4 flex flex-col gap-2">
                {history.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center mt-10">No history available yet. Keep typing to auto-save snapshots.</p>
                ) : (
                  history.map((snap, i) => (
                     <button
                       key={snap.id}
                       onClick={() => setSelectedIndex(i)}
                       className={`flex flex-col text-left p-3 rounded-xl transition-all border ${selectedIndex === i ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'}`}
                     >
                       <span className={`text-sm font-medium ${selectedIndex === i ? 'text-indigo-300' : 'text-white/80'}`}>
                         {new Date(snap.timestamp).toLocaleDateString()}
                       </span>
                       <span className="text-xs text-zinc-500">
                         {new Date(snap.timestamp).toLocaleTimeString()}
                       </span>
                     </button>
                  ))
                )}
             </div>

             {/* Preview Pane */}
             <div className="flex-1 bg-zinc-950/50 flex flex-col relative">
                {selectedSnapshot ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-8 pointer-events-none opacity-80" data-color-scheme="dark">
                       <BlockNoteView editor={editor} theme="dark" editable={false} />
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                       <Button onClick={() => onRestore(selectedSnapshot.content)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg gap-2">
                         <RotateCcw className="w-4 h-4" /> Restore this version
                       </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-500">
                     {history.length > 0 ? "Select a version from the left to preview." : "No snapshots available to preview."}
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}
