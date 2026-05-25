"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Brain, FileText } from "lucide-react";
import {
  seedConversation,
  cannedResponses,
  sampleDocuments,
  type ChatMessage,
} from "@/lib/mock/chat";

const SUGGESTIONS = [
  "What setups should I watch for today?",
  "Summarize my Trade Plan",
  "What did the FOMC minutes say about rate cuts?",
  "Which of my setups has the worst expectancy?",
];

function timeNow(): string {
  const d = new Date();
  const h = ((d.getHours() + 11) % 12) + 1;
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = d.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${m} ${ap}`;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>(seedConversation);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const cannedIdx = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = (textRaw: string) => {
    const text = textRaw.trim();
    if (!text || thinking) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: timeNow(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    // Canned reply (rotates) — real LLM call wires here later.
    setTimeout(() => {
      const reply = cannedResponses[cannedIdx.current % cannedResponses.length];
      cannedIdx.current += 1;
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "bot",
        text: reply,
        timestamp: timeNow(),
      };
      setMessages((m) => [...m, botMsg]);
      setThinking(false);
    }, 850);
  };

  return (
    <div className="flex flex-col h-full bg-panel border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-panel2/40">
        <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center">
          <Brain size={14} className="text-accent" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">TitanEdge Bot</div>
          <div className="text-[10px] text-muted">
            Indexed {sampleDocuments.length} docs · Ready to chat
          </div>
        </div>
        <span className="text-[10px] text-accent flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Online
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-4 min-h-[400px]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "bot" && (
              <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                <Brain size={13} className="text-accent" />
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-lg px-3 py-2 ${
                m.role === "user"
                  ? "bg-accentBlue/15 border border-accentBlue/30"
                  : "bg-panel2 border border-border"
              }`}
            >
              <div className="text-xs whitespace-pre-wrap leading-relaxed">{m.text}</div>
              {m.citations && m.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border space-y-1">
                  {m.citations.map((c, i) => {
                    const doc = sampleDocuments.find((d) => d.id === c.docId);
                    return (
                      <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted">
                        <FileText size={10} className="mt-0.5 shrink-0 text-accentBlue" />
                        <span className="font-mono">
                          {doc?.name ?? c.docId}
                          {c.page != null && ` · p.${c.page}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="text-[9px] text-muted mt-1">{m.timestamp}</div>
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
              <Brain size={13} className="text-accent" />
            </div>
            <div className="bg-panel2 border border-border rounded-lg px-3 py-2.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "200ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "400ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      {messages.length <= seedConversation.length && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-panel2 border border-border text-muted hover:text-accent hover:border-accent/30 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-border bg-panel2/40 p-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your docs, today's setup, market regime..."
          className="flex-1 bg-bg border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:border-accent/50"
        />
        <button
          type="submit"
          disabled={!input.trim() || thinking}
          className="px-3 py-2 bg-accent/15 hover:bg-accent/25 border border-accent/30 text-accent rounded-md text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
        >
          <Send size={12} />
          Send
        </button>
      </form>
    </div>
  );
}
