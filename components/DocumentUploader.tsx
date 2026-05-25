"use client";
import { useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";

interface DocumentUploaderProps {
  onFilesPicked?: (files: File[]) => void;
}

export default function DocumentUploader({ onFilesPicked }: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFilesPicked?.(Array.from(files));
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
        dragOver ? "border-accent bg-accent/5" : "border-border bg-panel2/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.csv,.md"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-panel border border-border flex items-center justify-center text-accent">
          <Upload size={18} />
        </div>
        <div className="text-sm font-semibold">Drop documents here or click to upload</div>
        <div className="text-[11px] text-muted flex items-center gap-1.5">
          <FileText size={11} />
          PDF · DOCX · TXT · CSV · MD
        </div>
        <div className="text-[10px] text-muted italic mt-1">
          Upload backend coming in next phase — UI accepts files now, indexing wires up later
        </div>
      </div>
    </div>
  );
}
