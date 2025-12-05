// src/app/_lib/normalizeBlocks.ts
import {
  type Block,
  type ContainerBlock,
  type RichTextBlock,
  type RichTextDoc,
  createContainerBlock,
  createRichTextBlock,
} from "~/lib/blocks";

export function toDocFromString(text: string): RichTextDoc {
  return {
    type: "doc",
    content: text
      ? [
          {
            type: "paragraph",
            content: [{ type: "text", text }],
          },
        ]
      : [],
  };
}

function normalizeRichTextBlock(raw: any): RichTextBlock {
  const rb = raw as Partial<RichTextBlock>;
  const doc =
    rb.props?.doc ??
    toDocFromString((rb.props as any)?.body ?? ""); // legacy fallback

  return createRichTextBlock(doc, rb.id);
}

function normalizeContainerBlock(raw: any, index: number): ContainerBlock {
  const cb = raw as Partial<ContainerBlock>;
  const childrenRaw = cb.props?.children ?? [];
  const children = Array.isArray(childrenRaw)
    ? (childrenRaw as any[]).map((child) =>
        child?.type === "container"
          ? normalizeContainerBlock(child, index)
          : normalizeRichTextBlock(child),
      )
    : [];

  return createContainerBlock(children, {
    id: cb.id,
    label: cb.props?.label ?? `Container ${index + 1}`,
    padding: cb.props?.padding,
    backgroundVariant: cb.props?.backgroundVariant,
    hidden: cb.props?.hidden,
  });
}

export function normalizeBlocks(raw: any[] | null | undefined): Block[] {
  const rawArray = Array.isArray(raw) ? raw : [];
  const normalized = rawArray.map((b, idx) => {
    if (b?.type === "container") {
      return normalizeContainerBlock(b, idx);
    }
    return normalizeRichTextBlock(b);
  });

  const hasContainer = normalized.some((b) => b.type === "container");
  if (hasContainer) return normalized;

  // legacy pages: wrap existing rich text blocks in a single container
  return [
    createContainerBlock(normalized, {
      label: "Container 1",
      padding: "md",
      backgroundVariant: "base",
    }),
  ];
}
