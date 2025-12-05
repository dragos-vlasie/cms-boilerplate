// src/app/_components/PageEditor.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Block, RichTextDoc } from "~/lib/blocks";
import { PageView } from "./PageView";
import { RichTextBlockEditor } from "./RichTextBlockEditor";

export function PageEditor({
  initialBlocks,
  pageId,
}: {
  initialBlocks: Block[];
  pageId: string;
}) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [dirty, setDirty] = useState(false);
  const [mode, setMode] = useState<"edit" | "view">("edit");
  const router = useRouter();

  const updateBlockDoc = (blockId: string, doc: RichTextDoc) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? { ...block, props: { ...block.props, doc } }
          : block,
      ),
    );
    setDirty(true);
  };

  const handleSave = async () => {
    const res = await fetch("/api/page/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, blocks }),
    });

    if (res.ok) {
      setDirty(false);
      router.refresh();
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "edit" ? "view" : "edit"));
  };

  return (
    <div className="relative">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-base-300 bg-base-100/80 px-4 py-3 backdrop-blur">
        <div className="text-xs font-medium text-base-content/60">
          {mode === "edit" ? "Editing mode" : "Preview mode"}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMode}
            className={`btn btn-sm font-semibold ${
              mode === "view" ? "btn-outline" : "btn-ghost"
            }`}
          >
            {mode === "edit" ? "View page" : "Back to editor"}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty}
            className={`btn btn-sm font-semibold ${
              dirty ? "btn-primary" : "btn-disabled"
            }`}
          >
            Save changes
          </button>
        </div>
      </div>

      {/* Content */}
      {mode === "edit" ? (
        <div>
          {blocks.map((block) => (
            <RichTextBlockEditor
              key={block.id}
              block={block}
              updateDoc={updateBlockDoc}
            />
          ))}
        </div>
      ) : (
        <PageView blocks={blocks} />
      )}
    </div>
  );
}
