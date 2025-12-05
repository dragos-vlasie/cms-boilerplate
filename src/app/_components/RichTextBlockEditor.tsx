// src/app/_components/RichTextBlockEditor.tsx
"use client";

import {
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import type { Level } from "@tiptap/extension-heading";

import type { RichTextBlock, RichTextDoc } from "~/lib/blocks";
import {
  TailwindParagraph,
  TailwindHeading,
  TailwindBulletList,
  TailwindOrderedList,
  TailwindTaskList,
  TailwindTaskItem,
  TailwindImage,
} from "~/lib/tiptapExtensions";

type LibraryItem = {
  id: string;
  url: string;
  alt?: string;
  provider: "supabase" | "contentful";
};

export function RichTextBlockEditor({
  block,
  updateDoc,
}: {
  block: RichTextBlock;
  updateDoc: (id: string, doc: RichTextDoc) => void;
}) {
  // --- link modal state ---
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // --- image modal state ---
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"url" | "upload" | "library">(
    "url",
  );

  // dropdown labels
  const [blockLabel, setBlockLabel] = useState("Normal text");
  const [alignmentLabel, setAlignmentLabel] = useState("Left");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false,
        heading: false,
        bulletList: false,
        orderedList: false,
      }),
      TailwindParagraph,
      TailwindHeading,
      TailwindBulletList,
      TailwindOrderedList,
      TailwindTaskList,
      TailwindTaskItem,
      LinkExt.configure({
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: {
          class:
            "link link-primary font-medium underline underline-offset-2",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TailwindImage.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: block.props.doc,
    immediatelyRender: false,
    onUpdate({ editor }) {
      updateDoc(block.id, editor.getJSON() as RichTextDoc);
    },
  });

  // keep dropdown labels in sync with selection
  useEffect(() => {
    if (!editor) return;

    const updateLabels = () => {
      if (editor.isActive("heading", { level: 1 })) setBlockLabel("Heading 1");
      else if (editor.isActive("heading", { level: 2 }))
        setBlockLabel("Heading 2");
      else if (editor.isActive("heading", { level: 3 }))
        setBlockLabel("Heading 3");
      else if (editor.isActive("heading", { level: 4 }))
        setBlockLabel("Heading 4");
      else if (editor.isActive("heading", { level: 5 }))
        setBlockLabel("Heading 5");
      else if (editor.isActive("heading", { level: 6 }))
        setBlockLabel("Heading 6");
      else setBlockLabel("Normal text");

      if (editor.isActive({ textAlign: "center" }))
        setAlignmentLabel("Center");
      else if (editor.isActive({ textAlign: "right" }))
        setAlignmentLabel("Right");
      else if (editor.isActive({ textAlign: "justify" }))
        setAlignmentLabel("Justify");
      else setAlignmentLabel("Left");
    };

    updateLabels();
    editor.on("selectionUpdate", updateLabels);
    editor.on("transaction", updateLabels);

    return () => {
      editor.off("selectionUpdate", updateLabels);
      editor.off("transaction", updateLabels);
    };
  }, [editor]);

  if (!editor) return null;

  // helpers
  const setBlockType = (type: string) => {
    const chain = editor.chain().focus();
    if (type === "paragraph") {
      chain.setParagraph().run();
    } else {
      const level = Number(type.replace("heading-", ""));
      if (!Number.isNaN(level) && [1, 2, 3, 4, 5, 6].includes(level)) {
        chain.setHeading({ level: level as Level }).run();
      }
    }
  };

  // --- link modal handlers ---
  const openLinkModal = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    setLinkUrl(prev ?? "https://");
    setIsLinkModalOpen(true);
  };
  const closeLinkModal = () => setIsLinkModalOpen(false);
  const handleSaveLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
    closeLinkModal();
  };
  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    closeLinkModal();
  };

  // --- image modal handlers ---
  const openImageModal = () => {
    setActiveTab("url");
    setImageUrl("");
    setImageAlt("");
    setIsImageModalOpen(true);
  };
  const closeImageModal = () => setIsImageModalOpen(false);

  const insertFromUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    editor
      .chain()
      .focus()
      .setImage({
        src: url,
        alt: imageAlt.trim() || undefined,
      } as any)
      .run();
    closeImageModal();
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data: { id: string; url: string } = await res.json();

    editor
      .chain()
      .focus()
      .setImage({
        src: data.url,
        alt: imageAlt.trim() || undefined,
        assetId: data.id,
        provider: "supabase",
      } as any)
      .run();
    closeImageModal();
  } finally {
      setIsUploading(false);
    }
  };

  const loadLibrary = async () => {
    if (library.length > 0) return;
    const res = await fetch("/api/media/list");
    if (!res.ok) return;
    const items: LibraryItem[] = await res.json();
    setLibrary(items);
  };

  const insertFromLibrary = (item: LibraryItem) => {
    editor
      .chain()
      .focus()
      .setImage({
        src: item.url,
        alt: (item.alt ?? imageAlt.trim()) || undefined,
        assetId: item.id,
        provider: item.provider,
      } as any)
      .run();
    closeImageModal();
  };

  // --- render ---
  return (
    <section className="mx-auto max-w-5xl px-8 py-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-t-md border border-base-300 bg-base-200 px-3 py-2 text-xs text-base-content">
        {/* Block type dropdown */}
        <div className="dropdown dropdown-bottom">
          <label
            tabIndex={0}
            className="btn btn-xs h-7 min-h-0 border border-base-300 bg-base-100 px-3 normal-case text-base-content shadow-none hover:bg-base-100/80"
          >
            {blockLabel}
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu menu-xs bg-base-100 text-base-content rounded-md border border-base-300 z-[1] mt-1 w-44 p-1 shadow-md"
          >
            <li>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setBlockType("paragraph");
                }}
              >
                Normal text
              </button>
            </li>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <li key={level}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setBlockType(`heading-${level}`);
                  }}
                >
                  {`Heading ${level}`}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Alignment dropdown */}
        <div className="dropdown dropdown-bottom">
          <label
            tabIndex={0}
            className="btn btn-xs h-7 min-h-0 border border-base-300 bg-base-100 px-3 normal-case text-base-content shadow-none hover:bg-base-100/80"
          >
            Align: {alignmentLabel}
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu menu-xs bg-base-100 text-base-content rounded-md border border-base-300 z-[1] mt-1 w-40 p-1 shadow-md"
          >
            {["left", "center", "right", "justify"].map((align) => (
              <li key={align}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setTextAlign(align).run();
                  }}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Text style dropdown */}
        <div className="dropdown dropdown-bottom">
          <label
            tabIndex={0}
            className="btn btn-xs h-7 min-h-0 border border-base-300 bg-base-100 px-3 normal-case text-base-content shadow-none hover:bg-base-100/80"
          >
            Text style
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu menu-xs bg-base-100 text-base-content rounded-md border border-base-300 z-[1] mt-1 w-40 p-1 shadow-md"
          >
            <li>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleBold().run();
                }}
              >
                Bold
              </button>
            </li>
            <li>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleItalic().run();
                }}
              >
                Italic
              </button>
            </li>
            <li>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleStrike().run();
                }}
              >
                Strikethrough
              </button>
            </li>
            <li>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleBlockquote().run();
                }}
              >
                Blockquote
              </button>
            </li>
          </ul>
        </div>

        {/* Lists dropdown */}
        <div className="dropdown dropdown-bottom">
          <label
            tabIndex={0}
            className="btn btn-xs h-7 min-h-0 border border-base-300 bg-base-100 px-3 normal-case text-base-content shadow-none hover:bg-base-100/80"
          >
            Lists
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu menu-xs bg-base-100 text-base-content rounded-md border border-base-300 z-[1] mt-1 w-40 p-1 shadow-md"
          >
            <li>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleBulletList().run();
                }}
              >
                Bullet list
              </button>
            </li>
            <li>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleOrderedList().run();
                }}
              >
                Numbered list
              </button>
            </li>
            <li>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleTaskList().run();
                }}
              >
                Task list
              </button>
            </li>
          </ul>
        </div>

        {/* Image + Link buttons */}
        <TB active={false} onClick={openImageModal}>
          Image
        </TB>
        <TB active={editor.isActive("link")} onClick={openLinkModal}>
          Link
        </TB>
        <TB
          active={false}
          onClick={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
        >
          Unlink
        </TB>
      </div>

      {/* Editor area */}
      <div className="rounded-b-md border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content">
        <EditorContent editor={editor} />
      </div>

      {/* Link modal */}
      {isLinkModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="text-lg font-bold">Edit link</h3>
            <p className="py-2 text-sm text-base-content/70">
              Paste or edit the URL for this link.
            </p>
            <input
              type="url"
              placeholder="https://example.com"
              className="input input-bordered input-sm mt-2 w-full"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <div className="modal-action flex items-center justify-between">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={closeLinkModal}
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline btn-error btn-sm"
                  onClick={handleRemoveLink}
                >
                  Remove link
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveLink}
                >
                  Save link
                </button>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={closeLinkModal}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Image modal */}
      {isImageModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="text-lg font-bold">Insert image</h3>
            <div className="mt-3">
              <div className="tabs space-x-4 tabs-bordered">
                <button
                  type="button"
                  className={`tab tab-sm ${
                    activeTab === "url" ? "tab-active" : ""
                  }`}
                  onClick={() => setActiveTab("url")}
                >
                  URL
                </button>
                <button
                  type="button"
                  className={`tab tab-sm ${
                    activeTab === "upload" ? "tab-active" : ""
                  }`}
                  onClick={() => setActiveTab("upload")}
                >
                  Upload
                </button>
                <button
                  type="button"
                  className={`tab tab-sm ${
                    activeTab === "library" ? "tab-active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("library");
                    void loadLibrary();
                  }}
                >
                  Library
                </button>
              </div>

              {/* URL tab */}
              {activeTab === "url" && (
                <div className="mt-3 space-y-2">
                  <label className="label">
                    <span className="label-text text-xs">Image URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="input input-bordered input-sm w-full"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <label className="label mt-2">
                    <span className="label-text text-xs">
                      Alt text (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Short description for screen readers"
                    className="input input-bordered input-sm w-full"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                  />
                </div>
              )}

              {/* Upload tab */}
              {activeTab === "upload" && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-base-content/70">
                    Upload to Supabase Storage via{" "}
                    <code>/api/media/upload</code>.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input file-input-bordered file-input-sm w-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleUpload(file);
                    }}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <p className="mt-1 text-xs text-info">Uploading…</p>
                  )}
                </div>
              )}

              {/* Library tab */}
              {activeTab === "library" && (
                <div className="mt-3">
                  {library.length === 0 ? (
                    <p className="text-xs text-base-content/70">
                      No images yet. Upload one or connect your media
                      sources.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {library.map((item) => (
                        <button
                          key={`${item.provider}-${item.id}`}
                          type="button"
                          className="group flex flex-col items-center gap-1 rounded border border-base-300 p-1 hover:border-primary"
                          onClick={() => insertFromLibrary(item)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.alt ?? ""}
                            className="h-20 w-full rounded object-cover"
                          />
                          <span className="text-[10px] text-base-content/70">
                            {item.provider}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-action flex items-center justify-end">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={closeImageModal}
              >
                Close
              </button>
              {activeTab === "url" && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={insertFromUrl}
                >
                  Insert image
                </button>
              )}
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={closeImageModal}
            aria-hidden="true"
          />
        </div>
      )}
    </section>
  );
}

function TB({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`btn btn-xs h-7 min-h-0 border border-base-300 px-2 py-1 text-xs shadow-none ${
        active
          ? "bg-primary text-primary-content hover:bg-primary/90"
          : "bg-base-100 text-base-content hover:bg-base-100/80"
      }`}
    >
      {children}
    </button>
  );
}
