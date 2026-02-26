/* eslint-disable @next/next/no-img-element */
import type { JSX } from "react";
import type {
  RichTextDoc,
  RichTextNode,
  RichTextTextNode,
  RichTextMark,
  RichTextAlignment,
} from "./blocks";

export function renderRichText(doc: RichTextDoc) {
  if (!Array.isArray(doc?.content)) return null;
  return doc.content.map((node, idx) => renderNode(node, idx));
}

function renderNode(
  node: RichTextNode,
  key: number,
): JSX.Element | JSX.Element[] | null {
  switch (node.type) {
    case "paragraph": {
      const content = Array.isArray(node.content)
        ? node.content
        : [];

      if (content.length === 0) {
        return (
          <p key={key} className="my-4 text-base leading-relaxed">
            &nbsp;
          </p>
        );
      }

      const alignClass = getAlignClass(node.attrs?.textAlign);
      const baseClass =
        "my-4 first:mt-0 last:mb-0 text-base leading-relaxed";

      return (
        <p key={key} className={`${baseClass} ${alignClass}`}>
          {renderInline(content)}
        </p>
      );
    }

    case "heading": {
      const level = node.attrs?.level ?? 2;
      const clampedLevel = Math.min(Math.max(level, 1), 6);
      const Tag = `h${clampedLevel}` as keyof JSX.IntrinsicElements;

      const alignClass = getAlignClass(node.attrs?.textAlign);

      const headingClasses: Record<number, string> = {
        1: "mt-8 mb-4 text-4xl font-bold tracking-tight",
        2: "mt-7 mb-3 text-3xl font-semibold tracking-tight",
        3: "mt-6 mb-3 text-2xl font-semibold",
        4: "mt-5 mb-2 text-xl font-semibold",
        5: "mt-4 mb-2 text-lg font-semibold",
        6: "mt-3 mb-2 text-base font-semibold",
      };

      const baseClass =
        headingClasses[clampedLevel] ?? headingClasses[2];

      return (
        <Tag key={key} className={`${baseClass} ${alignClass}`}>
          {renderInline(node.content ?? [])}
        </Tag>
      );
    }

    case "image": {
      const src = node.attrs?.src ?? undefined;
      const width = node.attrs?.width ?? undefined;
      const height = node.attrs?.height ?? undefined;
      const alt = node.attrs?.alt ?? "";

      if (!src) return null;

      return (
        <figure key={key} className="my-6">
          <img
            src={src}
            alt={alt}
            width={width ?? 1200}
            height={height ?? 800}
            className="mx-auto h-auto max-w-full md:max-w-xl rounded-lg"
          />
          {alt && (
            <figcaption className="mt-2 text-center text-xs text-base-300">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    case "bulletList": {
      const alignClass = getAlignClass(node.attrs?.textAlign);
      const baseClass =
        "my-4 list-disc list-outside space-y-1 pl-6 text-base leading-relaxed";

      return (
        <ul key={key} className={`${baseClass} ${alignClass}`}>
          {node.content?.map((child, i) =>
            renderNode(child, i),
          )}
        </ul>
      );
    }

    case "orderedList": {
      const alignClass = getAlignClass(node.attrs?.textAlign);
      const baseClass =
        "my-4 list-decimal list-outside space-y-1 pl-6 text-base leading-relaxed";

      return (
        <ol key={key} className={`${baseClass} ${alignClass}`}>
          {node.content?.map((child, i) =>
            renderNode(child, i),
          )}
        </ol>
      );
    }

    case "listItem":
      return (
        <li key={key} className="leading-relaxed">
          {node.content?.map((child, i) =>
            renderNode(child, i),
          )}
        </li>
      );

    case "blockquote": {
      const alignClass = getAlignClass(node.attrs?.textAlign);
      const baseClass =
        "my-5 border-l-4 border-base-300 pl-4 text-sm italic sm:text-base";

      return (
        <blockquote key={key} className={`${baseClass} ${alignClass}`}>
          {renderInline(node.content ?? [])}
        </blockquote>
      );
    }

    case "taskList":
      return (
        <ul
          key={key}
          data-type="taskList"
          className="my-4 space-y-2 pl-0"
        >
          {node.content?.map((child, i) =>
            renderNode(child, i),
          )}
        </ul>
      );

    case "taskItem": {
      const checked = !!node.attrs?.checked;
      return (
        <li
          key={key}
          data-type="taskItem"
          data-checked={checked ? "true" : "false"}
          className="flex list-none items-start gap-2 text-base leading-relaxed"
        >
          <input
            type="checkbox"
            readOnly
            checked={checked}
            className="mt-1 h-4 w-4 rounded border-base-300"
          />
          <div>
            {node.content?.map((child, i) =>
              renderNode(child, i),
            )}
          </div>
        </li>
      );
    }

    case "text":
      return <span key={key}>{applyMarks(node)}</span>;

    default:
      if (
        "content" in node &&
        Array.isArray(node.content)
      ) {
        return node.content.map((child, i) => renderNode(child, i));
      }
      return null;
  }
}

function renderInline(content: RichTextNode[]): JSX.Element[] {
  return content.map((n, i) => {
    if (n.type === "text") {
      return <span key={i}>{applyMarks(n)}</span>;
    }
    return renderNode(n, i) as JSX.Element;
  });
}

function applyMarks(node: RichTextTextNode): JSX.Element {
  const text = node.text ?? "";
  const marks: RichTextMark[] = node.marks ?? [];

  let el: JSX.Element = <>{text}</>;

  for (const mark of marks) {
    if (mark.type === "bold") {
      el = <strong className="font-semibold">{el}</strong>;
    } else if (mark.type === "italic") {
      el = <em className="italic">{el}</em>;
    } else if (mark.type === "strike") {
      el = <span className="line-through">{el}</span>;
    } else if (mark.type === "code") {
      el = (
        <code className="rounded bg-base-200 px-1 py-0.5 text-xs font-mono">
          {el}
        </code>
        );
      } else if (mark.type === "link") {
      const href = mark.attrs?.href ?? "#";
      const isExternal = href.startsWith("http");

      el = (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="link link-primary font-medium underline underline-offset-2"
        >
          {el}
        </a>
      );
    }
  }

  return el;
}


function getAlignClass(
  align: RichTextAlignment | undefined,
): string {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  if (align === "justify") return "text-justify";
  return "text-left";
}
