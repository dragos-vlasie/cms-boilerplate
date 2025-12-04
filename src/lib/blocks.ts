// src/lib/blocks.ts
export type RichTextDoc = {
  type: "doc";
  content?: any[];
};

export type RichTextBlock = {
  id: string;            // opaque unique string (cuid/uuid/etc.)
  type: "richText";
  props: {
    doc: RichTextDoc;
  };
};

export type Block = RichTextBlock;
