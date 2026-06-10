"use client";

import { useMemo } from "react";
import { Clock, Type, Wifi, WifiOff } from "lucide-react";

interface WordCountBarProps {
  content: string;
  isSaved?: boolean;
  isOnline?: boolean;
}

export function WordCountBar({
  content,
  isSaved = true,
  isOnline = true,
}: WordCountBarProps) {
  const stats = useMemo(() => {
    try {
      const blocks = JSON.parse(content);
      const text = blocks
        .map((b: any) =>
          (b.content ?? []).map((i: any) => i.text ?? "").join("")
        )
        .join(" ");
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.replace(/\s/g, "").length;
      const readingTime = Math.max(1, Math.ceil(words / 200));
      return { words, chars, readingTime };
    } catch {
      return { words: 0, chars: 0, readingTime: 1 };
    }
  }, [content]);

  return (
    <div className="border-t border-white/5 bg-zinc-950/80 px-6 py-1.5 flex items-center gap-5 text-xs text-white/30 select-none">
      <div className="flex items-center gap-1.5">
        <Type className="w-3 h-3" />
        <span>
          <span className="text-white/50 font-medium">{stats.words}</span>{" "}
          words
        </span>
        <span className="text-white/15">·</span>
        <span>
          <span className="text-white/50 font-medium">{stats.chars}</span>{" "}
          chars
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Clock className="w-3 h-3" />
        <span>{stats.readingTime} min read</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              isSaved ? "bg-green-500" : "bg-yellow-400 animate-pulse"
            }`}
          />
          <span>{isSaved ? "Saved locally" : "Saving..."}</span>
        </div>

        {isOnline ? (
          <div className="flex items-center gap-1 text-indigo-400/70">
            <Wifi className="w-3 h-3" />
            <span>Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-white/25">
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </div>
        )}
      </div>
    </div>
  );
}
