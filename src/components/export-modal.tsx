"use client";

import { useStore } from "@/store/useStore";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { X, Download, Copy, FileText, FileCode } from "lucide-react";

export function ExportModal() {
  const { exportModalOpen, setExportModalOpen, activeNoteId, addToast } =
    useStore();
  const note = useLiveQuery(
    () => (activeNoteId ? db.notes.get(activeNoteId) : undefined),
    [activeNoteId]
  );

  if (!exportModalOpen) return null;

  const getMarkdownContent = () => {
    if (!note) return "";
    let md = `# ${note.title}\n\n`;
    try {
      const blocks = JSON.parse(note.content);
      blocks.forEach((block: any) => {
        const text =
          block.content?.map((i: any) => i.text ?? "").join("") ?? "";
        if (block.type === "heading") {
          const level = block.props?.level ?? 1;
          md += `${"#".repeat(level)} ${text}\n\n`;
        } else if (block.type === "bulletListItem") {
          md += `- ${text}\n`;
        } else if (block.type === "numberedListItem") {
          md += `1. ${text}\n`;
        } else if (block.type === "paragraph") {
          md += `${text}\n\n`;
        } else if (block.type === "codeBlock") {
          md += `\`\`\`\n${text}\n\`\`\`\n\n`;
        }
      });
    } catch (e) {}
    return md;
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const safeName = note?.title?.replace(/[^a-z0-9]/gi, "_") || "note";

  const actions = [
    {
      icon: FileCode,
      label: "Markdown (.md)",
      desc: "Download as Markdown file",
      color: "indigo",
      onClick: () => {
        downloadFile(getMarkdownContent(), `${safeName}.md`, "text/markdown");
        addToast("Exported as Markdown ✓");
        setExportModalOpen(false);
      },
    },
    {
      icon: FileText,
      label: "Plain Text (.txt)",
      desc: "Download as plain text file",
      color: "purple",
      onClick: () => {
        const txt = getMarkdownContent()
          .replace(/#{1,6} /g, "")
          .replace(/[*_`~]/g, "")
          .replace(/\n{3,}/g, "\n\n");
        downloadFile(txt, `${safeName}.txt`, "text/plain");
        addToast("Exported as text ✓");
        setExportModalOpen(false);
      },
    },
    {
      icon: Copy,
      label: "Copy to Clipboard",
      desc: "Copy Markdown content",
      color: "green",
      onClick: async () => {
        await navigator.clipboard.writeText(getMarkdownContent());
        addToast("Copied to clipboard ✓");
        setExportModalOpen(false);
      },
    },
  ];

  const colorMap: Record<string, string> = {
    indigo: "hover:bg-indigo-500/10 hover:border-indigo-500/30",
    purple: "hover:bg-purple-500/10 hover:border-purple-500/30",
    green: "hover:bg-green-500/10 hover:border-green-500/30",
  };
  const iconBgMap: Record<string, string> = {
    indigo: "group-hover:bg-indigo-500/20",
    purple: "group-hover:bg-purple-500/20",
    green: "group-hover:bg-green-500/20",
  };
  const iconColorMap: Record<string, string> = {
    indigo: "text-indigo-400",
    purple: "text-purple-400",
    green: "text-green-400",
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={() => setExportModalOpen(false)}
    >
      <div
        className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Download className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-white/90 text-sm">Export Note</h2>
              {note && (
                <p className="text-xs text-white/40 truncate max-w-[180px]">
                  {note.title}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="text-white/40 hover:text-white/90 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!activeNoteId ? (
          <div className="p-6 text-center text-white/40 text-sm">
            Select a note first to export it.
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className={`group w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 transition-all text-left ${colorMap[action.color]}`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 transition-colors ${iconBgMap[action.color]}`}
                  >
                    <Icon
                      className={`w-5 h-5 ${iconColorMap[action.color]}`}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white/90">
                      {action.label}
                    </div>
                    <div className="text-xs text-white/40">{action.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
