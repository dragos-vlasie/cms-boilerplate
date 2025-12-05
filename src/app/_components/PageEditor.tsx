// src/app/_components/PageEditor.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  type Block,
  type ContainerBackground,
  type ContainerBlock,
  type ContainerPadding,
  type RichTextBlock,
  createContainerBlock,
  createRichTextBlock,
} from "~/lib/blocks";
import { PageView } from "./PageView";
import { RichTextBlockEditor } from "./RichTextBlockEditor";

const viewportClass = {
  desktop: "max-w-6xl",
  tablet: "max-w-3xl",
  phone: "max-w-xl",
};

type Mode = "edit" | "view";
type Viewport = keyof typeof viewportClass;

type Template = {
  key: string;
  label: string;
  background?: ContainerBackground;
  padding?: ContainerPadding;
  doc: RichTextBlock["props"]["doc"];
};

const templates: Template[] = [
  {
    key: "hero",
    label: "Hero",
    background: "base",
    padding: "lg",
    doc: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Hero headline" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Add a compelling intro and supporting copy.",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Primary CTA", marks: [{ type: "bold" }] },
            { type: "text", text: "  →", marks: [{ type: "underline" }] },
          ],
        },
      ],
    },
  },
  {
    key: "feature",
    label: "Feature/Callout",
    background: "muted",
    padding: "md",
    doc: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Feature highlight" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Benefit-driven bullet point." },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Feature explanation with detail." },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    key: "testimonial",
    label: "Testimonial",
    background: "base",
    padding: "md",
    doc: {
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "“This product changed how our team ships features.”",
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "— Happy customer" }],
        },
      ],
    },
  },
  {
    key: "contact",
    label: "Contact",
    background: "primary",
    padding: "lg",
    doc: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Talk to us" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Drop your details and we’ll reach out. Replace with form block later.",
            },
          ],
        },
      ],
    },
  },
  {
    key: "footer",
    label: "Footer card",
    background: "muted",
    padding: "sm",
    doc: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Footer links or reassurance copy goes here.",
            },
          ],
        },
      ],
    },
  },
];

function duplicateContainer(block: ContainerBlock): ContainerBlock {
  const cloneChildren = block.props.children.map((child) => {
    if (child.type === "container") {
      return duplicateContainer(child);
    }
    return createRichTextBlock(child.props.doc);
  });

  return createContainerBlock(cloneChildren, {
    label: `${block.props.label ?? "Container"} copy`,
    padding: block.props.padding,
    backgroundVariant: block.props.backgroundVariant,
    hidden: block.props.hidden,
  });
}

export function PageEditor({
  initialBlocks,
  pageId,
  pageTitle = "Page",
  pageStatus = "DRAFT",
  updatedAt,
}: {
  initialBlocks: Block[];
  pageId: string;
  pageTitle?: string;
  pageStatus?: "DRAFT" | "PUBLISHED";
  updatedAt?: Date | string;
}) {
  const [blocks, setBlocks] = useState<ContainerBlock[]>(
    (initialBlocks as ContainerBlock[]) ?? [],
  );
  const [dirty, setDirty] = useState(false);
  const [mode, setMode] = useState<Mode>("edit");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(pageStatus);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(
    blocks[0]?.id ?? null,
  );
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [highContrast, setHighContrast] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const isMod = event.metaKey || event.ctrlKey;
      if (isMod && event.key.toLowerCase() === "p") {
        event.preventDefault();
        setMode((prev) => (prev === "edit" ? "view" : "edit"));
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const selectedContainer = useMemo(
    () => blocks.find((b) => b.id === selectedContainerId) ?? blocks[0] ?? null,
    [blocks, selectedContainerId],
  );

  const updateBlocks = (updater: (prev: ContainerBlock[]) => ContainerBlock[]) => {
    setBlocks((prev) => {
      const next = updater(prev);
      setDirty(true);
      return next;
    });
  };

  const updateBlockDoc = (blockId: string, doc: unknown) => {
    updateBlocks((prev) =>
      prev.map((container) => ({
        ...container,
        props: {
          ...container.props,
          children: container.props.children.map((child) =>
            child.type === "richText" && child.id === blockId
              ? { ...child, props: { ...child.props, doc } }
              : child,
          ),
        },
      })),
    );
  };

  const handleSave = async () => {
    const res = await fetch("/api/page/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, blocks, status }),
    });

    if (res.ok) {
      setDirty(false);
      router.refresh();
    }
  };

  const toggleMode = () => setMode((prev) => (prev === "edit" ? "view" : "edit"));

  const addContainer = (template?: Template) => {
    const label = template?.label ?? `Container ${blocks.length + 1}`;
    const doc = template?.doc ?? {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Start writing..." }],
        },
      ],
    };
    const container = createContainerBlock(
      [createRichTextBlock(doc)],
      {
        label,
        padding: template?.padding ?? "md",
        backgroundVariant: template?.background ?? "base",
      },
    );

    updateBlocks((prev) => [...prev, container]);
    setSelectedContainerId(container.id);
  };

  const addRichText = (containerId: string) => {
    const newBlock = createRichTextBlock({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "New paragraph" }],
        },
      ],
    });

    updateBlocks((prev) =>
      prev.map((container) =>
        container.id === containerId
          ? {
              ...container,
              props: {
                ...container.props,
                children: [...container.props.children, newBlock],
              },
            }
          : container,
      ),
    );
  };

  const moveContainer = (containerId: string, direction: -1 | 1) => {
    updateBlocks((prev) => {
      const index = prev.findIndex((c) => c.id === containerId);
      if (index < 0) return prev;
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const toggleVisibility = (containerId: string) => {
    updateBlocks((prev) =>
      prev.map((container) =>
        container.id === containerId
          ? {
              ...container,
              props: { ...container.props, hidden: !container.props.hidden },
            }
          : container,
      ),
    );
  };

  const updatePadding = (padding: ContainerPadding) => {
    if (!selectedContainer) return;
    updateBlocks((prev) =>
      prev.map((container) =>
        container.id === selectedContainer.id
          ? { ...container, props: { ...container.props, padding } }
          : container,
      ),
    );
  };

  const updateBackground = (backgroundVariant: ContainerBackground) => {
    if (!selectedContainer) return;
    updateBlocks((prev) =>
      prev.map((container) =>
        container.id === selectedContainer.id
          ? { ...container, props: { ...container.props, backgroundVariant } }
          : container,
      ),
    );
  };

  const moveRichText = (containerId: string, blockId: string, direction: -1 | 1) => {
    updateBlocks((prev) =>
      prev.map((container) => {
        if (container.id !== containerId) return container;
        const idx = container.props.children.findIndex((c) => c.id === blockId);
        if (idx < 0) return container;
        const nextChildren = [...container.props.children];
        const target = idx + direction;
        if (target < 0 || target >= nextChildren.length) return container;
        const [item] = nextChildren.splice(idx, 1);
        nextChildren.splice(target, 0, item);
        return { ...container, props: { ...container.props, children: nextChildren } };
      }),
    );
  };

  const duplicateSelected = () => {
    if (!selectedContainer) return;
    const clone = duplicateContainer(selectedContainer);
    updateBlocks((prev) => [...prev, clone]);
    setSelectedContainerId(clone.id);
  };

  const lastSaved = updatedAt ? new Date(updatedAt).toLocaleString() : "Just now";

  return (
    <div className="relative">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-base-300 bg-base-300/50 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-base-content/60">
          <span className="font-semibold text-base-content">{pageTitle}</span>
          <span className="badge badge-sm" data-testid="status-badge">
            {status}
          </span>
          <span className="hidden text-[11px] md:inline">Last saved: {lastSaved}</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="select select-xs bg-base-200"
            value={viewport}
            onChange={(e) => setViewport(e.target.value as Viewport)}
          >
            <option value="desktop">Desktop</option>
            <option value="tablet">Tablet</option>
            <option value="phone">Phone</option>
          </select>
          <button
            type="button"
            onClick={() => setHighContrast((v) => !v)}
            className="btn btn-ghost btn-xs"
          >
            Contrast
          </button>
          <button
            type="button"
            onClick={() =>
              setStatus((prev) => (prev === "DRAFT" ? "PUBLISHED" : "DRAFT"))
            }
            className="btn btn-outline btn-xs"
          >
            {status === "DRAFT" ? "Mark Published" : "Mark Draft"}
          </button>
          <button
            type="button"
            onClick={toggleMode}
            className={`btn btn-xs font-semibold ${
              mode === "view" ? "btn-outline" : "btn-ghost"
            }`}
          >
            {mode === "edit" ? "Preview" : "Back to edit"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty}
            className={`btn btn-xs font-semibold ${
              dirty ? "btn-primary" : "btn-disabled"
            }`}
          >
            Save draft
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr_260px] md:gap-6">
        {/* Left sidebar */}
        <aside className="hidden h-[calc(100vh-4rem)] flex-col overflow-y-auto rounded-xl border border-base-200 bg-base-100 p-3 md:flex">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase text-base-content/70">
            <span>Layers</span>
            <span className="badge badge-ghost badge-xs">{blocks.length}</span>
          </div>
          <div className="space-y-2">
            {blocks.map((container, idx) => (
              <div
                key={container.id}
                className={`rounded-lg border p-2 text-sm shadow-sm transition hover:border-primary ${
                  selectedContainer?.id === container.id
                    ? "border-primary bg-primary/5"
                    : "border-base-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="flex-1 text-left font-medium"
                    onClick={() => setSelectedContainerId(container.id)}
                  >
                    {container.props.label ?? `Container ${idx + 1}`}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => toggleVisibility(container.id)}
                  >
                    {container.props.hidden ? "Show" : "Hide"}
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => moveContainer(container.id, -1)}
                  >
                    ↑
                  </button>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => moveContainer(container.id, 1)}
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <section
          className={`min-h-[70vh] rounded-xl border border-dashed border-base-300 bg-base-100/60 p-4 ${
            highContrast ? "bg-base-300/40" : ""
          }`}
        >
          {mode === "edit" ? (
            <div className={`mx-auto space-y-4 ${viewportClass[viewport]}`}>
              {blocks.map((container, idx) => (
                <div
                  key={container.id}
                  className={`rounded-xl border bg-base-100 shadow-sm ${
                    selectedContainer?.id === container.id
                      ? "border-primary"
                      : "border-base-200"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-base-200 px-4 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {container.props.label ?? `Container ${idx + 1}`}
                      </span>
                      <span className="text-xs text-base-content/60">
                        {container.props.backgroundVariant ?? "base"} · {" "}
                        padding {container.props.padding ?? "md"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => setSelectedContainerId(container.id)}
                      >
                        Focus
                      </button>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => addRichText(container.id)}
                      >
                        + Rich text
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4 p-4">
                    {container.props.children.map((child, childIdx) => (
                      <div
                        key={child.id}
                        className="rounded-lg border border-base-200 bg-base-100/80"
                      >
                        <div className="flex items-center justify-between border-b border-base-200 px-3 py-2 text-xs uppercase tracking-wide text-base-content/60">
                          <span>
                            Block {childIdx + 1} – Rich text
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() =>
                                moveRichText(container.id, child.id, -1)
                              }
                            >
                              ↑
                            </button>
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() =>
                                moveRichText(container.id, child.id, 1)
                              }
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <RichTextBlockEditor
                            block={child as RichTextBlock}
                            updateDoc={updateBlockDoc}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-center">
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => addContainer()}
                >
                  + Add container
                </button>
              </div>
            </div>
          ) : (
            <div className={`${viewportClass[viewport]} mx-auto`}>
              <PageView blocks={blocks} />
            </div>
          )}
        </section>

        {/* Right sidebar */}
        <aside className="hidden h-[calc(100vh-4rem)] overflow-y-auto rounded-xl border border-base-200 bg-base-100 p-3 md:block">
          <div className="text-xs font-semibold uppercase text-base-content/70">
            Presets
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.key}
                className="btn btn-outline btn-xs"
                onClick={() => addContainer(tpl)}
              >
                {tpl.label}
              </button>
            ))}
          </div>

          <div className="mt-4 text-xs font-semibold uppercase text-base-content/70">
            Padding
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {["none", "sm", "md", "lg"].map((pad) => (
              <button
                key={pad}
                className={`btn btn-xs ${
                  selectedContainer?.props.padding === pad ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => updatePadding(pad as ContainerPadding)}
              >
                {pad}
              </button>
            ))}
          </div>

          <div className="mt-4 text-xs font-semibold uppercase text-base-content/70">
            Theme
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["base", "muted", "primary", "gradientWarm"].map((variant) => (
              <button
                key={variant}
                className={`btn btn-xs ${
                  selectedContainer?.props.backgroundVariant === variant
                    ? "btn-primary"
                    : "btn-outline"
                }`}
                onClick={() => updateBackground(variant as ContainerBackground)}
              >
                {variant}
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 z-10 mt-4 flex items-center justify-between rounded-t-xl border border-base-200 bg-base-100 px-4 py-2 text-sm shadow">
        <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/70">
          <span className="font-semibold text-base-content">Breadcrumb:</span>
          <span className="badge badge-ghost">Page</span>
          {selectedContainer ? (
            <>
              <span className="badge badge-ghost">
                {selectedContainer.props.label ?? "Container"}
              </span>
              <span className="badge badge-outline">Content</span>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-outline btn-xs"
            onClick={duplicateSelected}
            disabled={!selectedContainer}
          >
            Duplicate container
          </button>
        </div>
      </div>
    </div>
  );
}
