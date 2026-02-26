// src/lib/tiptapExtensions.ts
import Image from "@tiptap/extension-image";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

// Paragraph with Tailwind/Daisy classes
export const TailwindParagraph = Paragraph.extend({
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      "p",
      {
        ...HTMLAttributes,
        class:
          "my-4 first:mt-0 last:mb-0 text-base leading-relaxed",
      },
      0,
    ];
  },
});

// Headings with Tailwind/Daisy classes
export const TailwindHeading = Heading.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      levels: [1, 2, 3, 4, 5, 6],
    };
  },

  renderHTML({
    node,
    HTMLAttributes,
  }: {
    node: { attrs: { level?: number } };
    HTMLAttributes: Record<string, unknown>;
  }) {
    const level = node.attrs.level ?? 2;
    const clamped = Math.min(Math.max(level, 1), 6);

    const headingClasses: Record<number, string> = {
      1: "mt-8 mb-4 text-4xl font-bold tracking-tight",
      2: "mt-7 mb-3 text-3xl font-semibold tracking-tight",
      3: "mt-6 mb-3 text-2xl font-semibold",
      4: "mt-5 mb-2 text-xl font-semibold",
      5: "mt-4 mb-2 text-lg font-semibold",
      6: "mt-3 mb-2 text-base font-semibold",
    };

    return [
      `h${clamped}`,
      {
        ...HTMLAttributes,
        class: headingClasses[clamped] ?? headingClasses[2],
      },
      0,
    ];
  },
});

// Bullet list
export const TailwindBulletList = BulletList.extend({
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      "ul",
      {
        ...HTMLAttributes,
        class:
          "my-4 list-disc list-outside space-y-1 pl-6 text-base leading-relaxed",
      },
      0,
    ];
  },
});

// Ordered list
export const TailwindOrderedList = OrderedList.extend({
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      "ol",
      {
        ...HTMLAttributes,
        class:
          "my-4 list-decimal list-outside space-y-1 pl-6 text-base leading-relaxed",
      },
      0,
    ];
  },
});

// src/lib/tiptapExtensions.ts

export const TailwindImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      assetId: {
        default: null,
      },
      provider: {
        default: "url",
      },
    };
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    // You can also inject Tailwind classes here later
    return [
      "img",
      {
        ...HTMLAttributes,
        class:
          "mx-auto h-auto max-w-full md:max-w-xl rounded-lg",
      },
    ];
  },
});


// Task list wrapper
export const TailwindTaskList = TaskList.extend({
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      "ul",
      {
        ...HTMLAttributes,
        "data-type": "taskList",
        class: "my-4 space-y-2 pl-0",
      },
      0,
    ];
  },
});

// Task item with styled checkbox
export const TailwindTaskItem = TaskItem.extend({
  renderHTML({
    node,
    HTMLAttributes,
  }: {
    node: { attrs: { checked?: boolean } };
    HTMLAttributes: Record<string, unknown>;
  }) {
    const checked = !!node.attrs.checked;

    return [
      "li",
      {
        ...HTMLAttributes,
        "data-type": "taskItem",
        "data-checked": checked ? "true" : "false",
        class:
          "flex list-none items-start gap-2 text-base leading-relaxed",
      },
      [
        "label",
        { class: "mt-1" },
        [
          "input",
          {
            type: "checkbox",
            class: "h-4 w-4 rounded border-base-300",
            ...(checked ? { checked: "" } : {}),
          },
        ],
      ],
      ["div", {}, 0],
    ];
  },
});
