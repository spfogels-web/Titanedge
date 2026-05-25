"use client";
import { useState } from "react";
import { Folder } from "lucide-react";
import DocumentUploader from "@/components/DocumentUploader";
import DocumentList from "@/components/DocumentList";
import ChatWindow from "@/components/ChatWindow";
import { sampleDocuments, type UploadedDocument } from "@/lib/mock/chat";

export default function Page() {
  // Live state so newly "uploaded" files appear in the list — actual file
  // bytes are dropped on the floor until the upload backend lands.
  const [docs, setDocs] = useState<UploadedDocument[]>(sampleDocuments);

  const onFilesPicked = (files: File[]) => {
    const additions: UploadedDocument[] = files.map((f, idx) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      const type: UploadedDocument["type"] =
        ext === "pdf"  ? "pdf"  :
        ext === "docx" ? "docx" :
        ext === "csv"  ? "csv"  :
                         "txt";
      return {
        id: `local-${Date.now()}-${idx}`,
        name: f.name,
        type,
        sizeKb: Math.max(1, Math.round(f.size / 1024)),
        uploadedAt: "Just now",
      };
    });
    setDocs((prev) => [...additions, ...prev]);
  };

  const onRemove = (id: string) =>
    setDocs((prev) => prev.filter((d) => d.id !== id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
      {/* Left: documents */}
      <div className="space-y-4 overflow-y-auto scrollbar-thin">
        <DocumentUploader onFilesPicked={onFilesPicked} />
        <div className="bg-panel border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Folder size={14} className="text-accentBlue" />
            <h2 className="text-sm font-semibold tracking-wide">YOUR DOCUMENTS</h2>
            <span className="ml-auto text-[10px] text-muted">{docs.length}</span>
          </div>
          <DocumentList documents={docs} onRemove={onRemove} />
        </div>
      </div>

      {/* Right: chat */}
      <div className="lg:col-span-2 min-h-[500px]">
        <ChatWindow />
      </div>
    </div>
  );
}
