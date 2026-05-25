import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="bg-panel border border-border rounded-xl p-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-panel2 flex items-center justify-center mb-4">
        <Construction size={28} className="text-muted" />
      </div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted text-sm max-w-md">
        {description ??
          "Coming soon. The Overview dashboard has the full picture for now."}
      </p>
    </div>
  );
}
