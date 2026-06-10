"use client";

import { useState, useMemo } from "react";

type GraphNode = { id: string; x: number; y: number };
type GraphLink = { source: string; target: string };

const CENTER_NODE = { id: "My Notes", x: 50, y: 50 };

function extractLinks(text: string): string[] {
  const matches = [...text.matchAll(/\[\[(.*?)\]\]/g)];
  return [...new Set(matches.map((m) => m[1]).filter(Boolean))];
}

function positionForIdx(idx: number, total: number) {
  const angle = (idx / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
  const radius = 30;
  return {
    x: 50 + radius * Math.cos(angle),
    y: 50 + radius * Math.sin(angle),
  };
}

export function LandingInteractiveDemo() {
  const [text, setText] = useState(
    "We need to integrate the [[Authentication Module]] soon.\n\nAlso review the [[Design System]] updates and check the [[API Docs]]."
  );

  const { nodes, links } = useMemo(() => {
    const linked = extractLinks(text);
    const nodes: GraphNode[] = [CENTER_NODE];
    const links: GraphLink[] = [];
    linked.forEach((title, i) => {
      const pos = positionForIdx(i, linked.length);
      nodes.push({ id: title, ...pos });
      links.push({ source: "My Notes", target: title });
    });
    return { nodes, links };
  }, [text]);

  const highlighted = text.replace(
    /\[\[(.*?)\]\]/g,
    '<span class="text-indigo-300 bg-indigo-500/20 px-1 rounded font-medium">[[$1]]</span>'
  );

  return (
    <div className="relative rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col md:flex-row h-[520px]">
      {/* Mac Window Bar */}
      <div className="absolute top-0 left-0 w-full h-10 bg-zinc-900/90 border-b border-white/10 flex items-center px-4 gap-2 z-20">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-white/30 font-mono">notera — editor</span>
      </div>

      {/* Editor Side */}
      <div className="flex-1 border-r border-white/10 pt-14 p-6 relative flex flex-col">
        <div className="text-xl font-bold text-white/90 mb-4">📝 My Notes</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-transparent text-white/70 text-sm leading-relaxed resize-none outline-none placeholder:text-white/30 font-mono"
          placeholder="Start typing... Use [[Note Name]] to create links!"
          spellCheck={false}
        />
        <div
          className="absolute bottom-6 left-6 right-6 text-sm leading-relaxed text-white/60 pointer-events-none"
          dangerouslySetInnerHTML={{ __html: highlighted }}
          style={{ display: "none" }}
        />
        <div className="mt-3 text-xs text-white/30 border-t border-white/5 pt-3">
          💡 Try typing <code className="text-indigo-300 bg-indigo-500/10 px-1 rounded">[[Your Idea]]</code> — watch the graph update!
        </div>
      </div>

      {/* Graph Side */}
      <div className="flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-zinc-950 to-zinc-950 relative pt-10">
        <div className="absolute top-12 left-0 right-0 bottom-0">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Links */}
            {links.map((link, i) => {
              const source = nodes.find((n) => n.id === link.source);
              const target = nodes.find((n) => n.id === link.target);
              if (!source || !target) return null;
              return (
                <line
                  key={i}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#818cf8"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                  opacity="0.5"
                  className="animate-pulse"
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isCenter = node.id === "My Notes";
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isCenter ? 5 : 3}
                    fill={isCenter ? "#c7d2fe" : "#818cf8"}
                    opacity={isCenter ? 1 : 0.85}
                  />
                  {isCenter && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={8}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  )}
                  <text
                    x={node.x + (isCenter ? 0 : 4)}
                    y={node.y - (isCenter ? 7 : 0) + (isCenter ? 0 : -1)}
                    fontSize={isCenter ? 4 : 3}
                    fill="white"
                    opacity={isCenter ? 0.8 : 0.6}
                    textAnchor={isCenter ? "middle" : "start"}
                    dominantBaseline="middle"
                  >
                    {node.id.length > 14 ? node.id.slice(0, 12) + "…" : node.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live badge */}
        <div className="absolute top-12 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-medium">Live Graph</span>
        </div>

        {nodes.length === 1 && (
          <div className="absolute inset-0 flex items-center justify-center pt-10">
            <p className="text-white/20 text-xs text-center px-6">
              No links yet.<br />Type <code className="text-indigo-300">[[anything]]</code> in the editor
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
