"use client";

import { useState, useRef, useEffect } from "react";
import { db } from "@/lib/db";
import { Send, Bot, User, Loader2 } from "lucide-react";

function cosineSimilarity(a: number[], b: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function ChatSidebar() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../lib/ai/embeddings.worker.ts', import.meta.url), {
      type: 'module'
    });
    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !workerRef.current) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 1. Get embedding for user query
      const queryEmbedding = await new Promise<number[]>((resolve, reject) => {
        const handler = (e: MessageEvent) => {
          if (e.data.type === 'result' && e.data.id === 'query') {
            workerRef.current?.removeEventListener('message', handler);
            resolve(e.data.embedding);
          } else if (e.data.type === 'error') {
            workerRef.current?.removeEventListener('message', handler);
            reject(e.data.error);
          }
        };
        workerRef.current?.addEventListener('message', handler);
        workerRef.current?.postMessage({ id: 'query', text: userMessage, type: 'embed' });
      });

      // 2. Fetch notes and calculate similarity
      const allNotes = await db.notes.toArray();
      const notesWithEmbeddings = allNotes.filter(n => n.embedding && n.embedding.length > 0);
      
      const scoredNotes = notesWithEmbeddings.map(note => ({
        note,
        score: cosineSimilarity(queryEmbedding, note.embedding!)
      })).sort((a, b) => b.score - a.score);

      // Top 3 relevant notes
      const topNotes = scoredNotes.slice(0, 3);
      
      // Extract text content from BlockNote JSON
      const contextText = topNotes.map(n => {
        let text = n.note.title + "\n";
        try {
           const parsed = JSON.parse(n.note.content);
           text += parsed.map((b:any) => b.content?.[0]?.text || "").join(" ");
        } catch(e) {}
        return text;
      }).join("\n\n");

      // 3. Prompt the AI
      const prompt = `You are a helpful AI assistant inside an offline-first notes app.
Use the following context from the user's notes to answer their question. If the answer is not in the context, just say you don't know based on the notes.

CONTEXT:
${contextText}

QUESTION:
${userMessage}
`;

      const res = await fetch("/api/ai/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type: 'continue' }), // Using 'continue' as a generic text completion
      });

      if (!res.body) throw new Error("No response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";
      
      setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;
        
        setMessages(prev => {
          const newMsg = [...prev];
          newMsg[newMsg.length - 1].content = aiResponse;
          return newMsg;
        });
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 backdrop-blur-xl">
      <div className="p-4 border-b border-white/5 flex flex-col gap-2">
        <h2 className="font-bold text-white/90 text-sm tracking-tight flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-400" /> AI Assistant
        </h2>
        <p className="text-xs text-white/40">Ask questions about your notes. Powered by local semantic search.</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-white/30 text-xs mt-10">
            No messages yet. Ask me anything!
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/10 text-white/70'}`}>
              {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
            </div>
            <div className={`text-sm text-white/80 leading-relaxed ${msg.role === 'user' ? 'text-right' : ''} bg-white/5 p-2 rounded-lg max-w-[85%]`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-md bg-white/10 text-white/70 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3 h-3" />
            </div>
            <div className="text-sm text-white/50 flex items-center">
              <Loader2 className="w-3 h-3 animate-spin mr-2" /> Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your notes..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
