"use client";
import { Flag, Zap, Shield, BookOpen, Trophy, Brain } from "lucide-react";

interface Badge {
  icon: typeof Flag;
  title: string;
  description: string;
  unlocked: boolean;
  color: string;
  bg: string;
}

// Mock — wires to real progress tracking once we have user state.
const BADGES: Badge[] = [
  { icon: Flag,     title: "First Steps",      description: "Opened the Academy",          unlocked: true,  color: "#00ff88", bg: "rgba(0,255,136,0.12)" },
  { icon: BookOpen, title: "Foundations",      description: "Complete all 4 fundamentals", unlocked: true,  color: "#00aaff", bg: "rgba(0,170,255,0.12)" },
  { icon: Zap,      title: "Setup Master",     description: "Read all 7 setup lessons",    unlocked: false, color: "#ffd700", bg: "rgba(255,215,0,0.12)" },
  { icon: Shield,   title: "Risk Wizard",      description: "Finish the Risk module",      unlocked: false, color: "#ff3366", bg: "rgba(255,51,102,0.12)" },
  { icon: Brain,    title: "Mindset Made",     description: "Complete Psychology module",  unlocked: false, color: "#aa50ff", bg: "rgba(170,80,255,0.12)" },
  { icon: Trophy,   title: "Academy Graduate", description: "Read all 29 lessons",         unlocked: false, color: "#ffd700", bg: "rgba(255,215,0,0.12)" },
];

export default function AcademyAchievements() {
  const earned = BADGES.filter((b) => b.unlocked).length;
  return (
    <section className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-gold" />
          <h2 className="text-sm font-semibold tracking-wide">ACHIEVEMENTS</h2>
        </div>
        <span className="text-[10px] text-muted">
          {earned} / {BADGES.length} unlocked
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {BADGES.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className={`flex flex-col items-center text-center p-3 rounded-lg border transition ${
                b.unlocked
                  ? "border-accent/30 bg-panel2"
                  : "border-border bg-panel2/40 opacity-50"
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                style={{
                  backgroundColor: b.bg,
                  boxShadow: b.unlocked ? `0 0 18px ${b.bg}` : "none",
                }}
              >
                <Icon size={16} style={{ color: b.color }} />
              </div>
              <div className="text-[11px] font-semibold">{b.title}</div>
              <div className="text-[9px] text-muted mt-0.5 leading-tight">{b.description}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
