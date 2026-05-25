"use client";
import { useState } from "react";
import { FileText, Copy, Check } from "lucide-react";
import { templates } from "@/lib/mock/academy";

export default function AcademyTemplateList() {
  const [activeSlug, setActiveSlug] = useState<string>(templates[0]?.slug ?? "");
  const [copied, setCopied] = useState(false);

  const active = templates.find((t) => t.slug === activeSlug) ?? templates[0];
  if (!active) return null;

  const copy = () => {
    void navigator.clipboard.writeText(active.body).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left: template list */}
      <div className="space-y-2">
        {templates.map((t) => {
          const isActive = t.slug === active.slug;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => setActiveSlug(t.slug)}
              className={`w-full text-left flex gap-3 p-3 rounded-lg border transition ${
                isActive
                  ? "bg-accent/5 border-accent/40"
                  : "bg-panel2 border-border hover:border-accent/30"
              }`}
            >
              <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
                isActive ? "bg-accent/15 text-accent" : "bg-bg/40 text-accentBlue"
              }`}>
                <FileText size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold">{t.title}</div>
                <div className="text-[10px] text-muted mt-0.5 line-clamp-2">{t.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right: template body */}
      <div className="lg:col-span-2 bg-panel border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-panel2/40">
          <div>
            <div className="text-sm font-semibold">{active.title}</div>
            <div className="text-[10px] text-muted mt-0.5">{active.description}</div>
          </div>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-panel border border-border rounded-md text-xs hover:border-accent/40 hover:text-accent transition"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="flex-1 overflow-auto scrollbar-thin px-5 py-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-white/90">
          {active.body}
        </pre>
      </div>
    </div>
  );
}
