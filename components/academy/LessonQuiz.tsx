"use client";
import { useEffect, useMemo, useState } from "react";
import { Check, X, RotateCcw, Award, AlertCircle, GraduationCap } from "lucide-react";
import type { LessonQuiz as LessonQuizType } from "@/lib/mock/academy";

interface Props {
  quiz: LessonQuizType;
  lessonSlug: string;
  accent?: string;
}

interface QuizProgress {
  attempts: number;
  bestScore: number;
  passed: boolean;
  lastAttemptAt: string;
}

const STORAGE_PREFIX = "titanedge.academy.quiz.";

function loadProgress(slug: string): QuizProgress | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + slug);
    return raw ? (JSON.parse(raw) as QuizProgress) : null;
  } catch {
    return null;
  }
}

function saveProgress(slug: string, p: QuizProgress) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + slug, JSON.stringify(p));
  } catch {
    // ignore
  }
}

export default function LessonQuiz({ quiz, lessonSlug, accent = "#00ff88" }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState<QuizProgress | null>(null);

  useEffect(() => {
    setProgress(loadProgress(lessonSlug));
  }, [lessonSlug]);

  const totalQuestions = quiz.questions.length;
  const answered = Object.keys(answers).length;
  const allAnswered = answered === totalQuestions;

  const score = useMemo(() => {
    if (!submitted) return 0;
    let correct = 0;
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    return Math.round((correct / totalQuestions) * 100);
  }, [submitted, answers, quiz.questions, totalQuestions]);

  const passed = submitted && score >= quiz.passingScore;

  function selectAnswer(qid: string, idx: number) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qid]: idx }));
  }

  function submit() {
    if (!allAnswered) return;
    setSubmitted(true);
    let correct = 0;
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    const newScore = Math.round((correct / totalQuestions) * 100);
    const newPassed = newScore >= quiz.passingScore;
    const next: QuizProgress = {
      attempts: (progress?.attempts ?? 0) + 1,
      bestScore: Math.max(progress?.bestScore ?? 0, newScore),
      passed: (progress?.passed ?? false) || newPassed,
      lastAttemptAt: new Date().toISOString(),
    };
    setProgress(next);
    saveProgress(lessonSlug, next);
    window.setTimeout(() => {
      const top = document.getElementById(`quiz-${lessonSlug}-result`);
      top?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function retake() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <section
      className="rounded-xl border p-5"
      style={{
        borderColor: accent + "30",
        background: `linear-gradient(135deg, ${accent}08 0%, transparent 80%), #13131a`,
      }}
    >
      <div id={`quiz-${lessonSlug}-result`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GraduationCap size={15} style={{ color: accent }} />
          <h2 className="text-sm font-semibold tracking-wide">LESSON QUIZ</h2>
        </div>
        <div className="text-[10px] text-muted">
          {totalQuestions} questions · {quiz.passingScore}% to pass
          {progress && progress.attempts > 0 && (
            <>
              {" · "}
              <span style={{ color: progress.passed ? accent : "#888892" }}>
                Best: {progress.bestScore}%
                {progress.passed && " ✓"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Result banner (post-submit) */}
      {submitted && (
        <div
          className="mb-4 p-4 rounded-lg flex items-center gap-3 border"
          style={{
            borderColor: passed ? accent + "60" : "#ff336660",
            backgroundColor: passed ? accent + "12" : "rgba(255,51,102,0.08)",
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: passed ? accent + "20" : "rgba(255,51,102,0.15)" }}
          >
            {passed ? (
              <Award size={20} style={{ color: accent }} />
            ) : (
              <AlertCircle size={20} className="text-accentRed" />
            )}
          </div>
          <div className="flex-1">
            <div
              className="text-lg font-bold"
              style={{ color: passed ? accent : "#ff3366" }}
            >
              {passed ? "Passed" : "Not yet"} — {score}%
            </div>
            <div className="text-xs text-muted mt-0.5">
              {passed
                ? `You needed ${quiz.passingScore}% — got ${score}%. Lesson marked complete.`
                : `You needed ${quiz.passingScore}% — got ${score}%. Review your missed questions below and retake.`}
            </div>
          </div>
          {!passed && (
            <button
              type="button"
              onClick={retake}
              className="px-3 py-1.5 rounded-md text-xs font-semibold border border-border bg-panel2 hover:border-accent/40 hover:text-accent transition flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              Retake
            </button>
          )}
        </div>
      )}

      {/* Progress bar (pre-submit) */}
      {!submitted && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] text-muted mb-1">
            <span>Progress</span>
            <span>
              {answered} / {totalQuestions} answered
            </span>
          </div>
          <div className="h-1 bg-panel2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(answered / totalQuestions) * 100}%`,
                backgroundColor: accent,
              }}
            />
          </div>
        </div>
      )}

      {/* Questions */}
      <ol className="space-y-5">
        {quiz.questions.map((q, qi) => {
          const userIdx = answers[q.id];
          const isAnswered = userIdx != null;
          return (
            <li key={q.id} className="space-y-2">
              <div className="flex gap-3">
                <span
                  className="shrink-0 w-7 h-7 rounded-md text-xs font-mono font-bold flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: accent + "20", color: accent }}
                >
                  {qi + 1}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold leading-snug">{q.question}</div>
                  <div className="mt-2 space-y-1.5">
                    {q.options.map((opt, oi) => {
                      const selected = userIdx === oi;
                      const isCorrect = q.correctIndex === oi;
                      const showCorrect = submitted && isCorrect;
                      const showWrong = submitted && selected && !isCorrect;
                      return (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => selectAnswer(q.id, oi)}
                          disabled={submitted}
                          className={`w-full text-left text-sm px-3 py-2 rounded-md border transition flex items-start gap-2 ${
                            showCorrect
                              ? "border-accent/50 bg-accent/10 text-accent"
                              : showWrong
                              ? "border-accentRed/50 bg-accentRed/10 text-accentRed"
                              : selected
                              ? "border-accent/40 bg-panel2"
                              : "border-border bg-panel2 hover:border-accent/30"
                          } ${submitted ? "cursor-default" : "cursor-pointer"}`}
                        >
                          <span
                            className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                              showCorrect
                                ? "border-accent bg-accent"
                                : showWrong
                                ? "border-accentRed bg-accentRed"
                                : selected
                                ? "border-accent"
                                : "border-border"
                            }`}
                          >
                            {showCorrect && <Check size={10} className="text-bg" />}
                            {showWrong && <X size={10} className="text-white" />}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className="mt-2 p-2.5 rounded-md bg-panel2/60 border-l-2 border-accentBlue text-xs text-muted leading-relaxed">
                      <span className="text-accentBlue font-semibold">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Submit / status footer */}
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        {!submitted ? (
          <>
            <div className="text-xs text-muted">
              {allAnswered
                ? "All answered — ready to submit."
                : `Answer all ${totalQuestions} questions to submit.`}
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={!allAnswered}
              className="px-4 py-1.5 rounded-md text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: accent + "25",
                color: accent,
                border: `1px solid ${accent}40`,
              }}
            >
              Submit Quiz
            </button>
          </>
        ) : (
          <>
            <div className="text-xs text-muted">
              Score saved to your progress · Attempts: {progress?.attempts ?? 1}
            </div>
            <button
              type="button"
              onClick={retake}
              className="px-3 py-1.5 rounded-md text-xs font-semibold border border-border bg-panel2 hover:border-accent/40 hover:text-accent transition flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              Retake
            </button>
          </>
        )}
      </div>
    </section>
  );
}
