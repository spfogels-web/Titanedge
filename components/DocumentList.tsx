"use client";
import { FileText, FileSpreadsheet, FileType, Trash2 } from "lucide-react";
import type { UploadedDocument } from "@/lib/mock/chat";

const TYPE_ICON = {
  pdf:  { icon: FileText,        color: "text-accentRed" },
  docx: { icon: FileType,        color: "text-accentBlue" },
  txt:  { icon: FileType,        color: "text-muted" },
  csv:  { icon: FileSpreadsheet, color: "text-accent" },
} as const;

function fmtSize(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

interface DocumentListProps {
  documents: UploadedDocument[];
  onRemove?: (id: string) => void;
}

export default function DocumentList({ documents, onRemove }: DocumentListProps) {
  return (
    <div className="space-y-2">
      {documents.length === 0 && (
        <div className="text-xs text-muted text-center py-6">
          No documents uploaded yet
        </div>
      )}
      {documents.map((d) => {
        const meta = TYPE_ICON[d.type];
        const Icon = meta.icon;
        return (
          <div
            key={d.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-panel2 border border-border hover:border-accent/30 transition group"
          >
            <div className={`w-9 h-9 rounded-md bg-bg/40 flex items-center justify-center shrink-0 ${meta.color}`}>
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{d.name}</div>
              <div className="text-[10px] text-muted mt-0.5 flex items-center gap-2">
                <span>{fmtSize(d.sizeKb)}</span>
                {d.pages != null && <span>· {d.pages} pages</span>}
                <span>· {d.uploadedAt}</span>
              </div>
            </div>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(d.id)}
                aria-label="Remove document"
                className="opacity-0 group-hover:opacity-100 text-muted hover:text-accentRed transition"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
