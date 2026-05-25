import { notFound } from "next/navigation";
import AcademyLessonContent from "@/components/AcademyLessonContent";
import { modules } from "@/lib/mock/academy";

export function generateStaticParams() {
  return modules.flatMap((m) =>
    m.lessons.map((l) => ({ moduleSlug: m.slug, lessonSlug: l.slug })),
  );
}

export default function Page({
  params,
}: {
  params: { moduleSlug: string; lessonSlug: string };
}) {
  const module = modules.find((m) => m.slug === params.moduleSlug);
  if (!module) notFound();
  const idx = module.lessons.findIndex((l) => l.slug === params.lessonSlug);
  if (idx === -1) notFound();
  const lesson = module.lessons[idx];

  const prevLesson = idx > 0 ? module.lessons[idx - 1] : null;
  const nextLesson = idx < module.lessons.length - 1 ? module.lessons[idx + 1] : null;

  return (
    <AcademyLessonContent
      lesson={lesson}
      moduleSlug={module.slug}
      moduleTitle={module.title}
      moduleIcon={module.icon}
      prevHref={prevLesson ? `/academy/${module.slug}/${prevLesson.slug}` : undefined}
      nextHref={nextLesson ? `/academy/${module.slug}/${nextLesson.slug}` : undefined}
    />
  );
}
