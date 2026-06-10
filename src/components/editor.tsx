"use client";

import { useStore } from "@/store/useStore";
import { TimeTravelModal } from "./time-travel-modal";
import { BacklinksPanel } from "./backlinks-panel";
import { WordCountBar } from "./word-count-bar";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  Maximize2, Minimize2, Wand2, Loader2, Link as LinkIcon,
  Mic, MicOff, History, Download, BookOpen, Focus,
  Minimize, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import * as Y from "yjs";
// @ts-ignore
import { IndexeddbPersistence } from "y-indexeddb";
// @ts-ignore
import { WebrtcProvider } from "y-webrtc";
// @ts-ignore
import randomColor from "randomcolor";

// Note color palette
const NOTE_COLORS: { key: string; label: string; class: string; accent: string }[] = [
  { key: "", label: "Default", class: "", accent: "bg-white/20" },
  { key: "indigo", label: "Indigo", class: "from-indigo-950/30 via-transparent", accent: "bg-indigo-500" },
  { key: "purple", label: "Purple", class: "from-purple-950/30 via-transparent", accent: "bg-purple-500" },
  { key: "rose", label: "Rose", class: "from-rose-950/30 via-transparent", accent: "bg-rose-500" },
  { key: "amber", label: "Amber", class: "from-amber-950/30 via-transparent", accent: "bg-amber-500" },
  { key: "emerald", label: "Emerald", class: "from-emerald-950/30 via-transparent", accent: "bg-emerald-500" },
  { key: "sky", label: "Sky", class: "from-sky-950/30 via-transparent", accent: "bg-sky-500" },
];

export function Editor() {
  const {
    activeNoteId, graphView, setGraphView,
    focusMode, setFocusMode,
    setExportModalOpen, setTemplatesModalOpen,
    addToast,
  } = useStore();

  const note = useLiveQuery(
    () => (activeNoteId ? db.notes.get(activeNoteId) : undefined),
    [activeNoteId]
  );

  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [suggestedLinks, setSuggestedLinks] = useState<{ title: string; id: string }[]>([]);
  const [isSaved, setIsSaved] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // AI State
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  // Hover Preview State
  const [hoverPreview, setHoverPreview] = useState<{
    show: boolean; title: string; content: string; x: number; y: number;
  } | null>(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Time Travel State
  const [timeTravelOpen, setTimeTravelOpen] = useState(false);

  // Embedding Worker
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../lib/ai/embeddings.worker.ts", import.meta.url),
      { type: "module" }
    );
    workerRef.current.onmessage = (event) => {
      const { type, id, embedding } = event.data;
      if (type === "result") db.notes.update(id, { embedding });
    };
    return () => workerRef.current?.terminate();
  }, []);

  // Online status
  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Keyboard shortcuts for editor
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f" && !e.shiftKey) {
        e.preventDefault();
        setFocusMode(!focusMode);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        setExportModalOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
        setTemplatesModalOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focusMode, setFocusMode, setExportModalOpen, setTemplatesModalOpen]);

  useEffect(() => {
    if (!activeNoteId) return;
    // Reset immediately so we never use a destroyed doc while the new one loads
    setDoc(null);
    setProvider(null);
    const ydoc = new Y.Doc();
    // IndexedDB persistence keeps the Yjs doc in sync with local storage
    new IndexeddbPersistence(`note-${activeNoteId}`, ydoc);
    const webrtcProvider = new WebrtcProvider(
      `offline-notes-${activeNoteId}`,
      ydoc,
      { signaling: ["wss://signaling.yjs.dev"] }
    );
    setTimeout(() => {
      setDoc(ydoc);
      setProvider(webrtcProvider);
    }, 0);
    return () => {
      // Reset state so the editor shows loading while the next note's doc loads
      setDoc(null);
      setProvider(null);
      ydoc.destroy();
      webrtcProvider.destroy();
    };
  }, [activeNoteId]);

  const randomUser = useMemo(
    () => ({ name: "User " + Math.floor(Math.random() * 1000), color: randomColor({ luminosity: "light" }) }),
    []
  );

  // Pass [doc] as deps so the editor is recreated with collaboration
  // once the Yjs doc is ready. Without this, collaboration is never initialized.
  const editor = useCreateBlockNote(
    {
      collaboration: doc
        ? { provider: provider as any, fragment: doc.getXmlFragment("document-store"), user: randomUser }
        : undefined,
      uploadFile: async (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    },
    [doc] // Recreate editor when Yjs doc changes so collaboration is properly set up
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeNoteId) return;
    db.notes.update(activeNoteId, { title: e.target.value, updatedAt: Date.now() });
  };

  const handleContentChange = useCallback(() => {
    if (!activeNoteId || !editor) return;
    setIsSaved(false);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      let plainText = "";
      editor.document.forEach((block) => {
        if (block.content && Array.isArray(block.content)) {
          block.content.forEach((inline: any) => {
            if (inline.type === "text") plainText += inline.text + " ";
          });
        }
      });

      const linkRegex = /\[\[(.*?)\]\]/g;
      const matches = [...plainText.matchAll(linkRegex)];
      const linkedTitles = [...new Set(matches.map((m) => m[1]))];

      if (linkedTitles.length > 0) {
        const allNotes = await db.notes.toArray();
        const newLinks: any[] = [];
        for (const title of linkedTitles) {
          let targetNote = allNotes.find((n) => n.title.toLowerCase() === title.toLowerCase());
          if (!targetNote) {
            const newNoteId = crypto.randomUUID();
            targetNote = { id: newNoteId, title, content: "", createdAt: Date.now(), updatedAt: Date.now() };
            await db.notes.add(targetNote);
            allNotes.push(targetNote);
          }
          newLinks.push({ id: crypto.randomUUID(), source: activeNoteId, target: targetNote.id });
        }
        await db.transaction("rw", db.links, async () => {
          await db.links.where("source").equals(activeNoteId).delete();
          await db.links.bulkAdd(newLinks);
        });
      } else {
        await db.links.where("source").equals(activeNoteId).delete();
      }

      const currentlyLinkedTitles = new Set(linkedTitles.map((t) => t.toLowerCase()));
      const allNotesForSuggestions = await db.notes.toArray();
      const suggestions: { title: string; id: string }[] = [];
      for (const n of allNotesForSuggestions) {
        if (n.id === activeNoteId || !n.title) continue;
        if (n.title.length > 2 && plainText.toLowerCase().includes(n.title.toLowerCase()) && !currentlyLinkedTitles.has(n.title.toLowerCase())) {
          suggestions.push({ title: n.title, id: n.id });
        }
      }
      setSuggestedLinks(suggestions);

      const content = JSON.stringify(editor.document);
      await db.notes.update(activeNoteId, { content, updatedAt: Date.now() });
      setIsSaved(true);

      // History snapshot
      db.history.where("noteId").equals(activeNoteId).last().then((lastSnapshot) => {
        if ((!lastSnapshot || Date.now() - lastSnapshot.timestamp > 60000) && (!lastSnapshot || lastSnapshot.content !== content)) {
          db.history.add({ noteId: activeNoteId, timestamp: Date.now(), content });
        }
      });

      if (workerRef.current && plainText.trim().length > 0) {
        workerRef.current.postMessage({ id: activeNoteId, text: plainText, type: "embed" });
      }
    }, 500);
  }, [activeNoteId, editor]);

  const handleAIAction = async (type: "summarize" | "fix" | "continue" | "shorten" | "expand" | "translate") => {
    if (!navigator.onLine) {
      addToast("AI requires internet connection", "error");
      return;
    }
    setIsAILoading(true);
    setAiMenuOpen(false);
    try {
      const selection = editor.getSelection();
      let prompt = "";
      const source = selection ? selection.blocks : editor.document;
      prompt = source.map((b: any) => b.content?.map((i: any) => i.text).join("") ?? "").join("\n");

      const res = await fetch("/api/ai/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type }),
      });
      if (!res.body) throw new Error("No response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let resultText = "";
      const aiBlockId = crypto.randomUUID();

      // Guard against empty document to avoid crash on insertBlocks
      const lastBlock = editor.document.at(-1);
      if (!lastBlock) {
        addToast("Cannot insert AI output into an empty document.", "error");
        return;
      }
      editor.insertBlocks(
        [{ id: aiBlockId, type: "paragraph", content: "✨ AI is thinking..." }],
        lastBlock,
        "after"
      );
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resultText += decoder.decode(value, { stream: true });
        editor.updateBlock(aiBlockId, { content: `✨ ${resultText}` });
      }
      editor.updateBlock(aiBlockId, { content: resultText || "(No response)" });
      addToast("AI action completed ✓");
    } catch (error) {
      addToast("AI failed to respond. Check your connection.", "error");
    } finally {
      setIsAILoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast("Speech recognition not supported in this browser", "error");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let currentBlockId: string | null = null;
    let finalTranscript = "";
    recognition.onstart = () => {
      setIsRecording(true);
      // Guard against empty document to avoid crash on insertBlocks
      const lastBlock = editor.document.at(-1);
      if (!lastBlock) return;
      currentBlockId = crypto.randomUUID();
      editor.insertBlocks([{ id: currentBlockId, type: "paragraph", content: "🎙️ Listening..." }], lastBlock, "after");
    };
    recognition.onresult = (event: any) => {
      if (!editor || !currentBlockId) return;
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + " ";
        else interimTranscript += event.results[i][0].transcript;
      }
      editor.updateBlock(currentBlockId, { content: `🎙️ ${finalTranscript}${interimTranscript}` });
    };
    recognition.onerror = () => { setIsRecording(false); };
    recognition.onend = () => {
      setIsRecording(false);
      if (editor && currentBlockId) editor.updateBlock(currentBlockId, { content: finalTranscript.trim() });
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (hoverPreview && (Math.abs(e.clientX - hoverPreview.x) > 100 || Math.abs(e.clientY - hoverPreview.y) > 100)) {
        setHoverPreview(null);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hoverPreview]);

  useEffect(() => {
    const editorElement = document.querySelector(".editor-container");
    if (!editorElement) return;
    const onMouseOver = async (e: any) => {
      const textNode = document.caretPositionFromPoint
        ? (document.caretPositionFromPoint(e.clientX, e.clientY) as any)?.offsetNode
        : (document as any).caretRangeFromPoint?.(e.clientX, e.clientY)?.startContainer;
      if (textNode && textNode.nodeType === 3) {
        const text = textNode.textContent || "";
        const match = text.match(/\[\[(.*?)\]\]/);
        if (match) {
          const title = match[1];
          const allNotes = await db.notes.toArray();
          const targetNote = allNotes.find((n) => n.title.toLowerCase() === title.toLowerCase());
          if (targetNote) {
            let preview = "No content";
            if (targetNote.content) {
              try {
                const parsed = JSON.parse(targetNote.content);
                preview = parsed.map((b: any) => b.content?.[0]?.text || "").join(" ").substring(0, 120) + "...";
              } catch (e) {}
            }
            setHoverPreview({ show: true, title: targetNote.title, content: preview, x: e.clientX, y: e.clientY });
          }
        }
      }
    };
    editorElement.addEventListener("mousemove", onMouseOver);
    return () => editorElement.removeEventListener("mousemove", onMouseOver);
  }, []);

  // Get current note color styles
  const currentColor = NOTE_COLORS.find((c) => c.key === note?.color) || NOTE_COLORS[0];

  // Empty state
  if (!activeNoteId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 bg-zinc-950/40 relative select-none">
        <div className="w-20 h-20 mb-6 rounded-2xl bg-white/3 flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.03)] border border-white/5">
          <svg className="w-9 h-9 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <p className="text-base text-white/25">Select a note or create a new one</p>
        <p className="text-sm text-white/15 mt-1">Press Ctrl+K to open the command palette</p>
      </div>
    );
  }

  if (!doc || !editor) {
    return <div className="flex-1 flex items-center justify-center bg-zinc-950/40 text-white/30 text-sm">Loading editor...</div>;
  }

  const AI_ACTIONS = [
    { type: "summarize" as const, label: "✨ Summarize" },
    { type: "fix" as const, label: "✏️ Fix Grammar" },
    { type: "continue" as const, label: "➡️ Continue Writing" },
    { type: "shorten" as const, label: "📏 Make Shorter" },
    { type: "expand" as const, label: "📖 Make Longer" },
    { type: "translate" as const, label: "🌐 Translate to English" },
  ];

  return (
    <div className={`flex-1 flex flex-col bg-zinc-950/40 relative overflow-hidden ${currentColor.key ? `bg-gradient-to-b ${currentColor.class}` : ""}`}>
      {/* Focus Mode bar */}
      {focusMode && (
        <div className="absolute top-3 right-4 z-30 flex items-center gap-2">
          <div className="px-3 py-1.5 bg-zinc-900/80 border border-white/10 rounded-full text-xs text-white/40 flex items-center gap-1.5 backdrop-blur-md">
            <Focus className="w-3 h-3 text-indigo-400" /> Focus Mode
          </div>
          <button onClick={() => setFocusMode(false)} className="p-1.5 bg-zinc-900/80 border border-white/10 rounded-full text-white/40 hover:text-white transition-colors backdrop-blur-md" title="Exit (Esc)">
            <Minimize className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Bar */}
      {!focusMode && (
        <div className="h-13 border-b border-white/5 flex items-center justify-between px-5 bg-zinc-950/50 backdrop-blur-sm z-10 sticky top-0 flex-shrink-0">
          <div className="text-xs text-white/35 flex items-center gap-2 truncate">
            <span>Workspace / </span>
            <span className="text-white/55 truncate max-w-40">{note?.title || "Untitled"}</span>
            {provider?.connected && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] flex-shrink-0" title="Synced" />}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Color picker */}
            <div className="relative">
              <button
                onClick={() => setColorPickerOpen((o) => !o)}
                className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
                title="Note Color"
              >
                <div className={`w-3 h-3 rounded-full ${currentColor.accent}`} />
              </button>
              {colorPickerOpen && (
                <div className="absolute right-0 top-full mt-1 p-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 flex gap-1.5 animate-in slide-in-from-top-1 fade-in duration-150">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => {
                        if (activeNoteId) db.notes.update(activeNoteId, { color: c.key });
                        setColorPickerOpen(false);
                      }}
                      className={`w-5 h-5 rounded-full ${c.accent} transition-transform hover:scale-110 ${note?.color === c.key ? "ring-2 ring-white/60 ring-offset-1 ring-offset-zinc-900" : ""}`}
                      title={c.label}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Export */}
            <Button variant="ghost" size="sm" onClick={() => setExportModalOpen(true)} className="text-white/50 hover:text-white h-8 px-2.5" title="Export (Ctrl+E)">
              <Download className="w-3.5 h-3.5" />
            </Button>

            {/* Templates */}
            <Button variant="ghost" size="sm" onClick={() => setTemplatesModalOpen(true)} className="text-white/50 hover:text-white h-8 px-2.5" title="Templates (Ctrl+T)">
              <BookOpen className="w-3.5 h-3.5" />
            </Button>

            {/* Microphone */}
            <Button
              variant="outline" size="sm"
              onClick={toggleRecording}
              className={`h-8 px-2.5 transition-all ${isRecording ? "border-red-500/50 text-red-400 bg-red-500/10 animate-pulse" : "border-white/10 text-white/50 hover:bg-white/5"}`}
              title="Voice Note"
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </Button>

            {/* AI Actions */}
            {isOnline && (
              <div className="relative">
                <Button
                  variant="outline" size="sm"
                  onClick={() => setAiMenuOpen(!aiMenuOpen)}
                  disabled={isAILoading}
                  className="h-8 px-3 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 transition-all"
                >
                  {isAILoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-1.5" />}
                  AI
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
                {aiMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-1 z-50 animate-in slide-in-from-top-1 fade-in duration-150">
                    {AI_ACTIONS.map((action) => (
                      <button
                        key={action.type}
                        onClick={() => handleAIAction(action.type)}
                        className="w-full text-left px-3 py-2 text-xs text-white/75 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* History */}
            <Button variant="ghost" size="sm" onClick={() => setTimeTravelOpen(true)} className="text-white/50 hover:text-white h-8 px-2.5" title="Revision History">
              <History className="w-3.5 h-3.5" />
            </Button>

            {/* Focus Mode */}
            <Button
              variant="ghost" size="sm"
              onClick={() => setFocusMode(!focusMode)}
              className={`h-8 px-2.5 transition-all ${focusMode ? "text-indigo-400" : "text-white/50 hover:text-white"}`}
              title="Focus Mode (Ctrl+F)"
            >
              <Focus className="w-3.5 h-3.5" />
            </Button>

            {/* Graph Toggle */}
            <Button variant="ghost" size="sm" onClick={() => setGraphView(graphView === "hidden" ? "split" : "hidden")} className="text-white/50 hover:text-white h-8 px-2.5 text-xs">
              {graphView === "hidden" ? "Graph" : "Hide"}
            </Button>
            {graphView !== "hidden" && (
              <Button variant="ghost" size="icon" onClick={() => setGraphView(graphView === "split" ? "fullscreen" : "split")} className="text-white/50 hover:text-white h-8 w-8">
                {graphView === "split" ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={note?.title || ""}
            onChange={handleTitleChange}
            placeholder="Untitled Note"
            className="w-full bg-transparent text-4xl font-black text-white/90 placeholder:text-white/15 border-none outline-none mb-8 ml-[54px] tracking-tight"
          />

          <div className="text-white/80 editor-container" data-color-scheme="dark">
            <BlockNoteView editor={editor} theme="dark" onChange={handleContentChange} />
          </div>

          {/* Hover Preview */}
          {hoverPreview?.show && (
            <div
              className="fixed z-50 bg-zinc-900 border border-indigo-500/40 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] p-4 w-72 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
              style={{ left: hoverPreview.x + 15, top: hoverPreview.y + 15 }}
            >
              <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-white/90 text-sm">{hoverPreview.title}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-4">{hoverPreview.content || "Empty note."}</p>
            </div>
          )}

          {/* Suggested Links */}
          {suggestedLinks.length > 0 && (
            <div className="mt-10 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl ml-[54px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h4 className="text-indigo-400 text-xs font-semibold mb-2 flex items-center gap-2">
                <Wand2 className="w-3.5 h-3.5" /> Suggested Connections
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestedLinks.map((link) => (
                  <button
                    key={link.id}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all"
                    onClick={() => {
                      editor.insertBlocks([{ type: "paragraph", content: `[[${link.title}]]` }], editor.document[editor.document.length - 1], "after");
                      setSuggestedLinks((prev) => prev.filter((p) => p.id !== link.id));
                    }}
                  >
                    + Link to {link.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backlinks Panel */}
      <BacklinksPanel />

      {/* Word Count Bar */}
      <WordCountBar content={note?.content || ""} isSaved={isSaved} isOnline={isOnline} />

      {/* Time Travel Modal */}
      {timeTravelOpen && (
        <TimeTravelModal
          noteId={activeNoteId}
          onClose={() => setTimeTravelOpen(false)}
          onRestore={(historicalContent) => {
            try {
              const blocks = JSON.parse(historicalContent);
              editor.replaceBlocks(editor.document, blocks);
              setTimeTravelOpen(false);
              addToast("Note restored ✓");
            } catch (e) {
              addToast("Failed to restore note", "error");
            }
          }}
        />
      )}
    </div>
  );
}
