"use client";

import { useStore } from "@/store/useStore";
import { db } from "@/lib/db";
import { X, BookOpen, Calendar, Users, Lightbulb, FlaskConical } from "lucide-react";

type TemplateBlock = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  content: { type: string; text: string; styles: Record<string, unknown> }[];
  children: unknown[];
};

type Template = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  description: string;
  content: TemplateBlock[];
};

function block(
  id: string,
  type: string,
  text: string,
  props: Record<string, unknown> = {}
): TemplateBlock {
  return {
    id,
    type,
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left", ...props },
    content: [{ type: "text", text, styles: {} }],
    children: [],
  };
}

// `today` is computed at render-time inside the component (see handleUseTemplate / templates getter)
// keeping templates as a function to ensure fresh `today` each time the modal opens
function getTemplates(): Template[] {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return [
    {
      id: "meeting",
      name: "Meeting Notes",
      icon: Users,
      gradient: "from-blue-500 to-cyan-600",
      description: "Agenda, attendees, action items",
      content: [
      block("h1", "heading", "📅 Meeting Notes", { level: 1 }),
      block("h2a", "heading", "Attendees", { level: 2 }),
      block("a1", "bulletListItem", "Name / Role"),
      block("h2b", "heading", "Agenda", { level: 2 }),
      block("b1", "numberedListItem", "Topic 1"),
      block("h2c", "heading", "Action Items", { level: 2 }),
      block("c1", "bulletListItem", "[ ] Action — Owner — Deadline"),
      block("h2d", "heading", "Notes", { level: 2 }),
      block("d1", "paragraph", ""),
    ],
  },
  {
    id: "daily",
    name: "Daily Journal",
    icon: Calendar,
    gradient: "from-purple-500 to-pink-600",
    description: "Morning intentions, wins, reflections",
    content: [
      block("h1", "heading", `📔 ${today}`, { level: 1 }),
      block("h2a", "heading", "🌅 Morning Intentions", { level: 2 }),
      block("a1", "paragraph", "Today I want to..."),
      block("h2b", "heading", "✅ Today's Tasks", { level: 2 }),
      block("b1", "bulletListItem", "Task 1"),
      block("h2c", "heading", "🏆 Wins", { level: 2 }),
      block("c1", "paragraph", ""),
      block("h2d", "heading", "🌙 Evening Reflection", { level: 2 }),
      block("d1", "paragraph", "Today I learned..."),
    ],
  },
  {
    id: "project",
    name: "Project Brief",
    icon: Lightbulb,
    gradient: "from-yellow-500 to-orange-500",
    description: "Goals, scope, timeline, team",
    content: [
      block("h1", "heading", "🚀 Project Brief", { level: 1 }),
      block("h2a", "heading", "Overview", { level: 2 }),
      block("a1", "paragraph", "Project description here..."),
      block("h2b", "heading", "Goals", { level: 2 }),
      block("b1", "bulletListItem", "Goal 1"),
      block("h2c", "heading", "Scope", { level: 2 }),
      block("c1", "paragraph", "In scope: | Out of scope:"),
      block("h2d", "heading", "Timeline", { level: 2 }),
      block("d1", "paragraph", "Start: | End:"),
      block("h2e", "heading", "Team", { level: 2 }),
      block("e1", "bulletListItem", "Name — Role"),
    ],
  },
  {
    id: "research",
    name: "Research Note",
    icon: FlaskConical,
    gradient: "from-green-500 to-emerald-600",
    description: "Sources, findings, conclusions",
    content: [
      block("h1", "heading", "🔬 Research: Topic", { level: 1 }),
      block("h2a", "heading", "Key Question", { level: 2 }),
      block("a1", "paragraph", "What am I trying to find out?"),
      block("h2b", "heading", "Sources", { level: 2 }),
      block("b1", "bulletListItem", "Source 1 — URL"),
      block("h2c", "heading", "Findings", { level: 2 }),
      block("c1", "bulletListItem", "Finding 1"),
      block("h2d", "heading", "Conclusion", { level: 2 }),
      block("d1", "paragraph", ""),
    ],
  },
  ];
}

export function NoteTemplatesModal() {
  const { templatesModalOpen, setTemplatesModalOpen, setActiveNoteId, addToast } =
    useStore();

  // Compute templates fresh each time modal opens (ensures `today` is correct)
  const templates = getTemplates();

  if (!templatesModalOpen) return null;

  const handleUseTemplate = async (template: Template) => {
    const id = crypto.randomUUID();
    await db.notes.add({
      id,
      title: template.name,
      content: JSON.stringify(template.content),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setActiveNoteId(id);
    setTemplatesModalOpen(false);
    addToast(`"${template.name}" created ✓`);
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={() => setTemplatesModalOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="font-bold text-white/90">Note Templates</h2>
          </div>
          <button
            onClick={() => setTemplatesModalOpen(false)}
            className="text-white/40 hover:text-white/90 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => handleUseTemplate(template)}
                className="p-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/3 hover:bg-white/8 transition-all text-left group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="font-semibold text-white/90 text-sm mb-1">
                  {template.name}
                </div>
                <div className="text-xs text-white/40">{template.description}</div>
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-4 text-center text-xs text-white/25">
          Click a template to create a new note
        </div>
      </div>
    </div>
  );
}
