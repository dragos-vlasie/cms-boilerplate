import type { JSX } from "react";
import type { Block, HeroBlock, TextBlock, RichTextDoc } from "~/lib/blocks";

export function renderRichText(doc: RichTextDoc) {
  if (!doc || !doc.content) return null;
  return doc.content.map((node, idx) => renderNode(node, idx));
}

function renderNode(node: any, key: number): JSX.Element | JSX.Element[] | null {
  switch (node.type) {
    case "paragraph": {
      if (!node.content) return <p key={key}>&nbsp;</p>;
      return <p key={key}>{renderInline(node.content)}</p>;
    }

    case "heading": {
      const level = node.attrs?.level ?? 2;

    const headingClasses: Record<number, string> = {
      1: "text-3xl font-bold mt-4 mb-2",
      2: "text-2xl font-semibold mt-4 mb-2",
      3: "text-xl font-semibold mt-3 mb-2",
      4: "text-md font-semibold mt-3 mb-2",
      5: "text-sm font-semibold mt-3 mb-2",
    };

    const Tag = (`h${Math.min(Math.max(level, 1), 3)}` as keyof JSX.IntrinsicElements);

    return (
      <Tag key={key} className={headingClasses[level] ?? headingClasses[2]}>
        {renderInline(node.content ?? [])}
      </Tag>
    );
  }

    case "bulletList":
      return (
        <ul key={key} className="list-disc pl-5">
          {node.content?.map((child: any, i: number) =>
            renderNode(child, i),
          )}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="list-decimal pl-5">
          {node.content?.map((child: any, i: number) =>
            renderNode(child, i),
          )}
        </ol>
      );

    case "listItem":
      return (
        <li key={key}>
          {node.content?.map((child: any, i: number) =>
            renderNode(child, i),
          )}
        </li>
      );
    

    case "text":
      return <span key={key}>{applyMarks(node)}</span>;
    
    case "blockquote":
  return (
    <blockquote
      key={key}
      className="border-l-4 border-slate-300 pl-3 italic text-slate-700 my-3"
    >
      {renderInline(node.content ?? [])}
    </blockquote>
  );

case "taskList":
  return (
    <ul key={key} className="space-y-1 pl-0 my-2">
      {node.content?.map((child: any, i: number) => renderNode(child, i))}
    </ul>
  );

case "taskItem": {
  const checked = !!node.attrs?.checked;
  return (
    <li
      key={key}
      className="flex list-none items-start gap-2 text-slate-800"
    >
      <input
        type="checkbox"
        readOnly
        checked={checked}
        className="mt-1 h-4 w-4 rounded border-slate-400"
      />
      <div>
        {node.content?.map((child: any, i: number) =>
          renderNode(child, i),
        )}
      </div>
    </li>
  );
}


    default:
      // Unknown node types → just render children
      if (node.content) {
        return node.content.map((child: any, i: number) =>
          renderNode(child, i),
        );
      }
      return null;
  }
}

function renderInline(content: any[]): JSX.Element[] {
  return content.map((n, i) => {
    if (n.type === "text") {
      return <span key={i}>{applyMarks(n)}</span>;
    }
    return renderNode(n, i) as JSX.Element;
  });
}

function applyMarks(node: any): JSX.Element {
  const text = node.text ?? "";
  const marks = node.marks ?? [];

  let el: JSX.Element = <>{text}</>;

  for (const mark of marks) {
    if (mark.type === "bold") {
      el = <strong>{el}</strong>;
    } else if (mark.type === "italic") {
      el = <em>{el}</em>;
    } else if (mark.type === "strike") {
      el = <span className="line-through">{el}</span>;
    } else if (mark.type === "code") {
      el = (
        <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
          {el}
        </code>
      );
    }
  }

  return el;
}
