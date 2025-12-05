// src/app/_components/PageView.tsx
import type { JSX } from "react";
import type {
  Block,
  ContainerBlock,
  ContainerBackground,
  ContainerPadding,
  RichTextBlock,
} from "~/lib/blocks";
import { renderRichText } from "~/lib/renderRichText";

const paddingClasses: Record<ContainerPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-8",
  lg: "p-12",
};

const backgroundClasses: Record<ContainerBackground, string> = {
  base: "bg-base-100",
  muted: "bg-base-200",
  primary: "bg-primary text-primary-content",
  gradientWarm: "bg-gradient-to-r from-pink-500 via-amber-400 to-orange-500 text-base-100",
};

function renderBlock(block: Block): JSX.Element | null {
  if (block.type === "container") {
    return renderContainer(block);
  }

  const rich = block as RichTextBlock;
  return (
    <div key={rich.id} className="prose max-w-none prose-p:my-3">
      {renderRichText(rich.props.doc)}
    </div>
  );
}

function renderContainer(container: ContainerBlock): JSX.Element | null {
  if (container.props.hidden) return null;

  const padding = paddingClasses[container.props.padding ?? "md"];
  const background = backgroundClasses[container.props.backgroundVariant ?? "base"];

  return (
    <section
      key={container.id}
      aria-label={container.props.label}
      className={`mx-auto my-6 max-w-6xl rounded-xl border border-base-200 shadow-sm ${background} ${padding}`}
    >
      <div className="flex flex-col gap-6">
        {container.props.children.map((child) => renderBlock(child))}
      </div>
    </section>
  );
}

export function PageView({ blocks }: { blocks: Block[] }) {
  return <>{blocks.map((block) => renderBlock(block))}</>;
}
