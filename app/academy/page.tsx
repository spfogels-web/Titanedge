import AcademyHero from "@/components/academy/AcademyHero";
import AcademyContinueLearning from "@/components/academy/AcademyContinueLearning";
import AcademyAchievements from "@/components/academy/AcademyAchievements";
import AcademyModuleCard from "@/components/AcademyModuleCard";
import AcademyTemplateList from "@/components/AcademyTemplateList";
import { modules } from "@/lib/mock/academy";

export default function Page() {
  return (
    <div className="space-y-6">
      <AcademyHero />

      <AcademyContinueLearning />

      <AcademyAchievements />

      {/* Curriculum */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold tracking-wide">CURRICULUM</h2>
          <span className="text-[10px] text-muted">
            {modules.length} modules · pick any to start
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m, i) => (
            <AcademyModuleCard key={m.slug} module={m} index={i} />
          ))}
        </div>
      </section>

      {/* Templates */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold tracking-wide">TRADER TEMPLATES</h2>
          <span className="text-[10px] text-muted">6 ready-to-copy</span>
        </div>
        <p className="text-xs text-muted mb-4 max-w-2xl">
          Copy and adapt these into your daily workflow. The Pre-Market Checklist and
          Trade Plan alone will prevent the majority of beginner mistakes.
        </p>
        <AcademyTemplateList />
      </section>
    </div>
  );
}
