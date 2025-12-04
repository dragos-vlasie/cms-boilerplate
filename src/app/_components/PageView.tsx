// src/app/_components/PageView.tsx
import Image from "next/image";
import type { JSX } from "react";
import type { Block, RichTextBlock } from "~/lib/blocks";
import { renderRichText } from "~/lib/renderRichText";

export function PageView({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block) => {
        const rich = block as RichTextBlock;

        return (
          <section
            key={rich.id}
            className="mx-auto max-w-5xl px-8 py-6 text-base-content"
          >
            <div>
              {renderRichText(rich.props.doc)}
            </div>
          </section>
        );
      })}
    </>
  );
}


