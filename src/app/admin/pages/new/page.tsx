import { db } from "~/server/db";
import { redirect } from "next/navigation";

// OPTIONAL: a simple default JSON you can reuse for Home
const defaultContent = [
  {
    id: "home-intro",
    type: "richText",
    props: {
      doc: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [
              {
                type: "text",
                text: "Welcome to your CMS boilerplate",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This is the homepage. You can edit this text directly in the inline editor.",
              },
            ],
          },
        ],
      },
    },
  },
];

export default function NewPage() {
  async function createPage(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const path = formData.get("path") as string;
    const contentRaw = formData.get("content") as string;

    let content: any = [];
    try {
      content = JSON.parse(contentRaw || "[]");
    } catch {
      content = [];
    }

    const page = await db.page.create({
      data: {
        title,
        slug,
        path,
        status: "PUBLISHED", // or "DRAFT" if you prefer
        content,
      },
    });

    redirect(`/admin/pages/${page.id}/edit`);
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">New Page</h1>

      <form action={createPage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            defaultValue="Home"
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input
            name="slug"
            defaultValue="home"
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Path</label>
          <input
            name="path"
            defaultValue="/"
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Content (JSON array)
          </label>
          <textarea
            name="content"
            defaultValue={JSON.stringify(defaultContent, null, 2)}
            className="mt-1 h-40 w-full rounded border px-3 py-2 font-mono text-xs"
          />
          <p className="mt-1 text-xs text-slate-500">
            Paste/edit your block JSON here. Your PageEditor/PageView will use
            this.
          </p>
        </div>

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Create
        </button>
      </form>
    </div>
  );
}
