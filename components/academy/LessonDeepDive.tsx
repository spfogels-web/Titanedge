"use client";
import { BookOpen } from "lucide-react";

interface Props {
  paragraphs: string[];
}

export default function LessonDeepDive({ paragraphs }: Props) {
  return (
    <section className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={14} className="text-accentBlue" />
        <h2 className="text-sm font-semibold tracking-wide">DEEP DIVE</h2>
      </div>
      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-white/85">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
