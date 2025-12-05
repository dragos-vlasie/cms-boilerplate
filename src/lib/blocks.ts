// src/lib/blocks.ts
export type RichTextDoc = {
  type: "doc";
  content?: any[];
};

export type RichTextBlock = {
  id: string; // opaque unique string (cuid/uuid/etc.)
  type: "richText";
  props: {
    doc: RichTextDoc;
  };
};

export type ContainerPadding = "none" | "sm" | "md" | "lg";
export type ContainerBackground =
  | "base"
  | "muted"
  | "primary"
  | "gradientWarm";

export type ContainerBlock = {
  id: string;
  type: "container";
  props: {
    label?: string;
    padding?: ContainerPadding;
    backgroundVariant?: ContainerBackground;
    hidden?: boolean;
    children: Block[];
  };
};

export type Block = RichTextBlock | ContainerBlock;

export function createRichTextBlock(doc: RichTextDoc, id?: string): RichTextBlock {
  return {
    id: id ?? crypto.randomUUID(),
    type: "richText",
    props: { doc },
  };
}

export function createContainerBlock(
  children: Block[] = [],
  opts?: {
    label?: string;
    padding?: ContainerPadding;
    backgroundVariant?: ContainerBackground;
    hidden?: boolean;
    id?: string;
  },
): ContainerBlock {
  return {
    id: opts?.id ?? crypto.randomUUID(),
    type: "container",
    props: {
      label: opts?.label,
      padding: opts?.padding ?? "md",
      backgroundVariant: opts?.backgroundVariant ?? "base",
      hidden: opts?.hidden ?? false,
      children,
    },
  };
}
