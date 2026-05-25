"use client";
import Link from "next/link";
import { Play, Clock } from "lucide-react";
import { modules } from "@/lib/mock/academy";
import { themeFor } from "@/lib/academyTheme";

// Mock — when user progress tracking exists, this will read last-viewed
// lesson from DB or localStorage.
const MOCK_LAST_LESSON = { moduleSlug: "technical-analysis", lessonSlug: "ema-trend" };

export default function AcademyContinueLearning() {
  const m = modules.find((x) => x.slug === MOCK_LAST_LESSON.moduleSlug);
  const l = m?.lessons.find((x) => x.slug === MOCK_LAST_LESSON.lessonSlug);
  if (!m || !l) return null;

  const lessonIdx = m.lessons.findIndex((x) => x.slug === l.slug);
  const total = m.lessons.length;
  const progress = Math.round(((lessonIdx + 1) / total) * 100);
  const theme = themeFor(m.icon);

  return (
    <Link
      href={`/academy/${m.slug}/${l.slug}`}
      className="group block rounded-xl border p-5 transition"
      style={{
        borderColor: theme.primary + "40",
        background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
          style={{
            backgroundColor: theme.primary + "25",
            boxShadow: `0 0 18px ${theme.glow}`,
          }}
        >
          <Play size={18} style={{ color: theme.primary }} fill={theme.primary} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest" style={{ color: theme.primary }}>
            Continue learning
          </div>
          <div className="text-sm font-semibold mt-0.5 group-hover:text-accent transition truncate">
            {l.title}
          </div>
          <div className="text-[11px] text-muted mt-0.5 flex items-center gap-3">
            <span>{m.title} · Lesson {lessonIdx + 1} of {total}</span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {l.durationMin} min
            </span>
          </div>
          <div className="mt-2 h-1 bg-bg/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: theme.primary }}
            />
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold font-mono" style={{ color: theme.primary }}>
            {progress}%
          </div>
          <div className="text-[10px] text-muted uppercase tracking-wider">module</div>
        </div>
      </div>
    </Link>
  );
}
