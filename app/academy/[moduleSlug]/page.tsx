import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ArrowRight, BookOpen, TrendingUp, Target, Shield, Brain, Compass, Bot } from "lucide-react";
import { modules } from "@/lib/mock/academy";
import { themeFor } from "@/lib/academyTheme";
import ModuleVisual from "@/components/academy/ModuleVisual";

const ICONS = {
  foundations: BookOpen,
  technical:   TrendingUp,
  setups:      Target,
  risk:        Shield,
  psychology:  Brain,
  context:     Compass,
  bot:         Bot,
} as const;

export function generateStaticParams() {
  return modules.map((m) => ({ moduleSlug: m.slug }));
}

export default function Page({ params }: { params: { moduleSlug: string } }) {
  const moduleIdx = modules.findIndex((m) => m.slug === params.moduleSlug);
  if (moduleIdx === -1) notFound();
  const module = modules[moduleIdx];
  const Icon = ICONS[module.icon];
  const theme = themeFor(module.icon);
  const totalMinutes = module.lessons.reduce((acc, l) => acc + l.durationMin, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back nav */}
      <Link
        href="/academy"
        className="inline-flex items-center gap-2 text-xs text-muted hover:text-accent transition"
      >
        <ArrowLeft size={12} />
        Back to Academy
      </Link>

      {/* Themed module hero */}
      <header
        className="relative overflow-hidden rounded-2xl border p-6 md:p-8"
        style={{
          borderColor: theme.primary + "40",
          background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%), #13131a`,
        }}
      >
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle, ${theme.glow}, transparent 65%)` }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: theme.primary + "20",
              color: theme.primary,
              boxShadow: `0 0 30px ${theme.glow}`,
            }}
          >
            <Icon size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted font-mono">
              Module {String(moduleIdx + 1).padStart(2, "0")}
              <span style={{ color: theme.primary }}>· {theme.label}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{module.title}</h1>
            <p className="text-sm text-muted mt-2 leading-relaxed max-w-3xl">
              {module.description}
            </p>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
              <span>{module.lessons.length} lessons</span>
              <span>·</span>
              <span>{totalMinutes} min total</span>
            </div>
          </div>
          <div className="hidden md:block opacity-90">
            <ModuleVisual iconKey={module.icon} width={180} height={80} />
          </div>
        </div>
      </header>

      {/* Lessons */}
      <ol className="space-y-3">
        {module.lessons.map((l, i) => (
          <li key={l.slug}>
            <Link
              href={`/academy/${module.slug}/${l.slug}`}
              className="group flex items-center gap-4 p-4 bg-panel border border-border rounded-xl hover:border-accent/40 transition"
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center font-mono text-xs shrink-0 transition"
                style={{
                  backgroundColor: theme.primary + "15",
                  color: theme.primary,
                  border: `1px solid ${theme.primary}40`,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold group-hover:text-accent transition">
                  {l.title}
                </div>
                <p className="text-xs text-muted mt-1 line-clamp-2">{l.intro}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-muted flex items-center gap-1">
                  <Clock size={10} />
                  {l.durationMin} min
                </span>
                <ArrowRight size={14} className="text-muted group-hover:text-accent group-hover:translate-x-1 transition" />
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
