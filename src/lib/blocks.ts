// src/lib/blocks.ts
export type RichTextAlignment = "left" | "center" | "right" | "justify";

export type RichTextMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "strike" }
  | { type: "code" }
  | { type: "link"; attrs?: { href?: string } };

export type RichTextTextNode = {
  type: "text";
  text?: string;
  marks?: RichTextMark[];
};

export type RichTextHeadingNode = {
  type: "heading";
  attrs?: { level?: number; textAlign?: RichTextAlignment };
  content?: RichTextNode[];
};

export type RichTextParagraphNode = {
  type: "paragraph";
  attrs?: { textAlign?: RichTextAlignment };
  content?: RichTextNode[];
};

export type RichTextListNode = {
  type: "bulletList" | "orderedList";
  attrs?: { textAlign?: RichTextAlignment };
  content?: RichTextNode[];
};

export type RichTextListItemNode = {
  type: "listItem";
  content?: RichTextNode[];
};

export type RichTextBlockquoteNode = {
  type: "blockquote";
  attrs?: { textAlign?: RichTextAlignment };
  content?: RichTextNode[];
};

export type RichTextTaskListNode = {
  type: "taskList";
  content?: RichTextNode[];
};

export type RichTextTaskItemNode = {
  type: "taskItem";
  attrs?: { checked?: boolean };
  content?: RichTextNode[];
};

export type RichTextImageNode = {
  type: "image";
  attrs?: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    provider?: string;
    assetId?: string;
    textAlign?: RichTextAlignment;
  };
};

export type RichTextUnknownNode = {
  type: "unknown";
  originalType?: string;
  attrs?: { textAlign?: RichTextAlignment; [key: string]: unknown };
  content?: RichTextNode[];
};

export type RichTextNode =
  | RichTextTextNode
  | RichTextHeadingNode
  | RichTextParagraphNode
  | RichTextListNode
  | RichTextListItemNode
  | RichTextBlockquoteNode
  | RichTextTaskListNode
  | RichTextTaskItemNode
  | RichTextImageNode
  | RichTextUnknownNode;

export type RichTextDoc = {
  type: "doc";
  content?: RichTextNode[];
};

export type RichTextBlock = {
  id: string; // opaque unique string (cuid/uuid/etc.)
  type: "richText";
  props: {
    doc: RichTextDoc;
  };
};

export type Block = RichTextBlock;
