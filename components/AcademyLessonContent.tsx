"use client";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertOctagon,
  Lightbulb,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Target,
  Shield,
  Brain,
  Compass,
  Bot,
} from "lucide-react";
import type { Lesson, Module } from "@/lib/mock/academy";
import { themeFor } from "@/lib/academyTheme";
import LessonVideoEmbed from "./academy/LessonVideoEmbed";
import LessonDeepDive from "./academy/LessonDeepDive";
import LessonQuiz from "./academy/LessonQuiz";
import QuizComingSoon from "./academy/QuizComingSoon";

interface AcademyLessonContentProps {
  lesson: Lesson;
  moduleSlug: string;
  moduleTitle: string;
  moduleIcon: Module["icon"];
  prevHref?: string;
  nextHref?: string;
}

const ICONS = {
  foundations: BookOpen,
  technical:   TrendingUp,
  setups:      Target,
  risk:        Shield,
  psychology:  Brain,
  context:     Compass,
  bot:         Bot,
} as const;

export default function AcademyLessonContent({
  lesson,
  moduleSlug,
  moduleTitle,
  moduleIcon,
  prevHref,
  nextHref,
}: AcademyLessonContentProps) {
  const Icon = ICONS[moduleIcon];
  const theme = themeFor(moduleIcon);

  return (
    <article className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link href="/academy" className="hover:text-accent">Academy</Link>
        <span>/</span>
        <Link href={`/academy/${moduleSlug}`} className="hover:text-accent">{moduleTitle}</Link>
      </div>

      {/* Header */}
      <header
        className="relative overflow-hidden rounded-2xl border p-6 md:p-7"
        style={{
          borderColor: theme.primary + "40",
          background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%), #13131a`,
        }}
      >
        <div
          className="absolute -top-16 -right-16 w-60 h-60 rounded-full blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle, ${theme.glow}, transparent 65%)` }}
        />
        <div className="relative flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: theme.primary + "20",
              color: theme.primary,
              boxShadow: `0 0 22px ${theme.glow}`,
            }}
          >
            <Icon size={19} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted font-mono">
              <span style={{ color: theme.primary }}>{theme.label}</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {lesson.durationMin} min read
              </span>
              {lesson.quiz && (
                <span style={{ color: theme.primary }}>
                  · {lesson.quiz.questions.length}-Q quiz
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1.5">{lesson.title}</h1>
            <p className="text-sm text-muted mt-2 leading-relaxed">{lesson.intro}</p>
          </div>
        </div>
      </header>

      {/* Video (or placeholder) */}
      <LessonVideoEmbed
        url={lesson.videoUrl}
        title={lesson.title}
        accent={theme.primary}
      />

      {/* Key Points */}
      <section className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={14} className="text-accent" />
          <h2 className="text-sm font-semibold tracking-wide">KEY POINTS</h2>
        </div>
        <ul className="space-y-2.5">
          {lesson.keyPoints.map((p, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span
                className="shrink-0 w-6 h-6 rounded-full text-[11px] font-mono font-bold flex items-center justify-center"
                style={{ backgroundColor: theme.primary + "20", color: theme.primary }}
              >
                {i + 1}
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Examples */}
      {lesson.examples && lesson.examples.length > 0 && (
        <section className="bg-panel border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-gold" />
            <h2 className="text-sm font-semibold tracking-wide">EXAMPLES</h2>
          </div>
          <ul className="space-y-3">
            {lesson.examples.map((e, i) => (
              <li
                key={i}
                className="text-sm leading-relaxed p-3 rounded-lg bg-panel2 border-l-2 italic"
                style={{ borderLeftColor: "#ffd700" }}
              >
                {e}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Common Mistakes */}
      {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
        <section className="bg-panel border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon size={14} className="text-accentRed" />
            <h2 className="text-sm font-semibold tracking-wide">COMMON MISTAKES</h2>
          </div>
          <ul className="space-y-2">
            {lesson.commonMistakes.map((m, i) => (
              <li
                key={i}
                className="text-sm leading-relaxed flex gap-2 p-3 rounded-lg bg-accentRed/5 border-l-2 border-accentRed/40"
              >
                <span className="text-accentRed shrink-0">✕</span>
                <span className="text-white/85">{m}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Deep Dive */}
      {lesson.deepDive && lesson.deepDive.length > 0 && (
        <LessonDeepDive paragraphs={lesson.deepDive} />
      )}

      {/* Takeaway */}
      <section
        className="rounded-xl p-5 border"
        style={{
          borderColor: theme.primary + "40",
          background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
        }}
      >
        <div
          className="text-[10px] uppercase tracking-widest mb-1.5 font-semibold"
          style={{ color: theme.primary }}
        >
          KEY TAKEAWAY
        </div>
        <p className="text-sm font-semibold leading-relaxed">{lesson.takeaway}</p>
      </section>

      {/* Quiz */}
      {lesson.quiz ? (
        <LessonQuiz
          quiz={lesson.quiz}
          lessonSlug={lesson.slug}
          accent={theme.primary}
        />
      ) : (
        <QuizComingSoon accent={theme.primary} />
      )}

      {/* Ask AI */}
      <section className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">ASK THE AI ABOUT THIS LESSON</h2>
        </div>
        <div className="space-y-2">
          {lesson.askAiPrompts.map((q) => (
            <Link
              key={q}
              href={`/chat?q=${encodeURIComponent(q)}`}
              className="block text-sm p-3 rounded-lg bg-panel2 border border-border hover:border-accentBlue/40 hover:text-accentBlue transition"
            >
              {q}
            </Link>
          ))}
        </div>
        <Link
          href="/chat"
          className="mt-3 inline-flex items-center gap-1 text-xs text-accentBlue hover:text-accent transition"
        >
          Open full Bot Chat →
        </Link>
      </section>

      {/* Pagination */}
      <nav className="flex items-center justify-between pt-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className="flex items-center gap-2 text-sm text-muted hover:text-accent transition"
          >
            <ArrowLeft size={14} />
            Previous lesson
          </Link>
        ) : (
          <span />
        )}
        {nextHref && (
          <Link
            href={nextHref}
            className="flex items-center gap-2 text-sm font-semibold transition ml-auto group"
            style={{ color: theme.primary }}
          >
            Next lesson
            <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
          </Link>
        )}
      </nav>
    </article>
  );
}
