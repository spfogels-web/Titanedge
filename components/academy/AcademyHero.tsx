"use client";
import Link from "next/link";
import { GraduationCap, Sparkles, ArrowRight, BookOpen, Clock, Award } from "lucide-react";
import { modules } from "@/lib/mock/academy";
import { themeFor } from "@/lib/academyTheme";

// Premium hero banner for the /academy index. Includes the featured-lesson
// callout (currently Slingshot Continuation, the highest-expectancy setup).
export default function AcademyHero() {
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalMinutes = modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + l.durationMin, 0),
    0,
  );

  // Featured lesson — pull Slingshot from the setups module.
  const setups = modules.find((m) => m.slug === "setups");
  const featured = setups?.lessons.find((l) => l.slug === "slingshot");
  const featuredTheme = themeFor("setups");

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border p-8"
      style={{
        background:
          "linear-gradient(135deg, rgba(0,255,136,0.10) 0%, rgba(0,170,255,0.08) 40%, rgba(170,80,255,0.10) 100%), #13131a",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,255,136,0.25), transparent 65%)" }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(170,80,255,0.20), transparent 65%)" }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        {/* Left: copy */}
        <div className="lg:col-span-3 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-accent/15 border border-accent/30 text-accent">
            <Sparkles size={11} />
            Trader Development
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
            TitanEdge <span className="text-accent">Academy</span>
            <span className="block text-base md:text-lg font-medium text-muted mt-2">
              Master the system. Trade the edge.
            </span>
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            A structured curriculum that takes you from order types to advanced
            setup-by-setup mastery of how your TitanEdge bot trades. Paired with
            the templates the pros use to enforce process.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Stat icon={BookOpen} value={`${totalLessons}`} label="Lessons" />
            <Stat icon={Clock}    value={`${totalMinutes}`} label="Minutes" />
            <Stat icon={Award}    value={`${modules.length}`} label="Modules" />
            <Stat icon={GraduationCap} value="6" label="Templates" />
          </div>

          {/* Featured CTA */}
          {featured && setups && (
            <Link
              href={`/academy/${setups.slug}/${featured.slug}`}
              className="group inline-flex items-center gap-3 px-4 py-3 rounded-xl border transition mt-2"
              style={{
                borderColor: featuredTheme.primary + "60",
                background:
                  `linear-gradient(135deg, ${featuredTheme.gradientFrom} 0%, ${featuredTheme.gradientTo} 100%)`,
              }}
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: featuredTheme.primary + "25" }}
              >
                <Sparkles size={15} style={{ color: featuredTheme.primary }} />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-widest" style={{ color: featuredTheme.primary }}>
                  Featured · highest expectancy
                </div>
                <div className="text-sm font-semibold">{featured.title}</div>
              </div>
              <ArrowRight size={14} className="ml-2 text-muted group-hover:translate-x-1 transition" />
            </Link>
          )}
        </div>

        {/* Right: graphic */}
        <div className="lg:col-span-2 hidden lg:flex items-center justify-center">
          <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
            {/* Concentric rings */}
            <div className="absolute inset-0 rounded-full border border-accent/20" />
            <div className="absolute inset-4 rounded-full border border-accent/15" />
            <div className="absolute inset-10 rounded-full border border-accent/10" />
            <div className="absolute inset-16 rounded-full border border-accent/5" />
            {/* Center */}
            <div
              className="relative w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle, rgba(0,255,136,0.35), rgba(0,255,136,0.05) 70%)",
                boxShadow: "0 0 60px rgba(0,255,136,0.25)",
              }}
            >
              <GraduationCap size={42} className="text-accent" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof GraduationCap;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg/40 border border-border">
      <Icon size={13} className="text-accent" />
      <span className="text-sm font-bold">{value}</span>
      <span className="text-[10px] text-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}
