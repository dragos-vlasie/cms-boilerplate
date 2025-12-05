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

export type HeroBlock = {
  id: string;
  type: "hero";
  props: {
    title: string;
    subtitle?: string;
    ctaText?: string;
    ctaHref?: string;
  };
};

export type Block = RichTextBlock | HeroBlock;
