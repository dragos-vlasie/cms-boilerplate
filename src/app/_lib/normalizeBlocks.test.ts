import {
  createContainerBlock,
  createRichTextBlock,
  type ContainerBlock,
} from "~/lib/blocks";
import { normalizeBlocks, toDocFromString } from "./normalizeBlocks";

describe("toDocFromString", () => {
  it("wraps text in a paragraph node", () => {
    expect(toDocFromString("Hello")).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello" }],
        },
      ],
    });
  });

  it("returns an empty document for empty strings", () => {
    expect(toDocFromString("")).toEqual({ type: "doc", content: [] });
  });
});

describe("normalizeBlocks", () => {
  it("creates rich text blocks with new ids when missing", () => {
    const [container] = normalizeBlocks([
      {
        type: "richText",
        props: {
          doc: toDocFromString("Example"),
        },
      },
    ]) as ContainerBlock[];

    const [block] = container.props.children;
    expect(block.type).toBe("richText");
    expect((block as any).props.doc.content?.[0]?.content?.[0]?.text).toBe(
      "Example",
    );
    expect(block.id).toHaveLength(36);
  });

  it("falls back to legacy body strings when doc is absent", () => {
    const [container] = normalizeBlocks([
      {
        props: {
          body: "Legacy content",
        },
      },
    ]) as ContainerBlock[];

    const [block] = container.props.children;
    expect((block as any).props.doc.content?.[0]?.content?.[0]?.text).toBe(
      "Legacy content",
    );
  });

  it("returns container blocks when already present", () => {
    const rich = createRichTextBlock(toDocFromString("Nested"));
    const container = createContainerBlock([rich], { label: "Existing" });

    const [normalized] = normalizeBlocks([container]) as ContainerBlock[];

    expect(normalized.props.label).toBe("Existing");
    expect(normalized.props.children[0]).toMatchObject({ id: rich.id });
  });

  it("wraps legacy arrays into a single container", () => {
    const legacy = [createRichTextBlock(toDocFromString("Legacy"))];
    const [container] = normalizeBlocks(legacy) as ContainerBlock[];

    expect(container.type).toBe("container");
    expect(container.props.children).toHaveLength(1);
  });

  it("handles null or undefined input by returning an empty array", () => {
    expect(normalizeBlocks(null)).toEqual([]);
    expect(normalizeBlocks(undefined)).toEqual([]);
  });
});
