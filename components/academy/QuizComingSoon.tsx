"use client";
import { GraduationCap, Clock } from "lucide-react";

export default function QuizComingSoon({ accent = "#00ff88" }: { accent?: string }) {
  return (
    <section
      className="rounded-xl border p-5"
      style={{
        borderColor: accent + "20",
        background: `linear-gradient(135deg, ${accent}06 0%, transparent 80%), #13131a`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap size={15} style={{ color: accent }} />
        <h2 className="text-sm font-semibold tracking-wide">LESSON QUIZ</h2>
        <span className="ml-auto text-[10px] text-muted">Coming soon</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted">
        <Clock size={14} className="shrink-0" />
        <p>
          A 10-question quiz for this lesson is in the works. For now, the key points,
          examples, and Deep Dive cover the same material — focus on retention before
          moving on.
        </p>
      </div>
    </section>
  );
}
