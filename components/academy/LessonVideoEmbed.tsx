"use client";
import { Play, Video } from "lucide-react";

interface Props {
  url?: string;
  title: string;
  accent?: string;
}

export default function LessonVideoEmbed({ url, title, accent = "#00ff88" }: Props) {
  if (url) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden border border-border">
        <iframe
          src={url}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <div
      className="aspect-video rounded-lg border border-border flex flex-col items-center justify-center text-center p-6"
      style={{
        background:
          `radial-gradient(circle at center, ${accent}10 0%, transparent 70%), #0f0f15`,
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: accent + "20", color: accent }}
      >
        <Play size={28} className="ml-1" fill={accent} />
      </div>
      <div className="text-sm font-semibold">Video coming soon</div>
      <div className="text-xs text-muted mt-1 max-w-sm">
        Walk-through video for &ldquo;{title}&rdquo; will land here. Until then, the
        expanded reading + quiz below cover the full lesson.
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted">
        <Video size={11} />
        Placeholder — upload backend lands later
      </div>
    </div>
  );
}
