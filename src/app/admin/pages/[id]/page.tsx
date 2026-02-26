import { db } from "~/server/db";
import { notFound, redirect } from "next/navigation";
import type { Block } from "~/lib/blocks";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPage({ params }: Props) {
  const { id } = await params;

  const page = await db.page.findUnique({
    where: { id },
  });

  if (!page) {
    notFound();
  }

  async function updatePage(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const path = formData.get("path") as string;
    const contentRaw = formData.get("content") as string;

    let content: Block[] = [];
    try {
      const parsed = JSON.parse(contentRaw || "[]") as unknown;
      if (Array.isArray(parsed)) {
        content = parsed as Block[];
      }
    } catch {
      content = [];
    }

    await db.page.update({
      where: { id: page?.id },
      data: {
        title,
        slug,
        path,
        content,
      },
    });

    redirect("/admin/pages");
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Edit Page</h1>

      <form action={updatePage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            defaultValue={page.title}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input
            name="slug"
            defaultValue={page.slug}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Path</label>
          <input
            name="path"
            defaultValue={page.path}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Content (JSON array)
          </label>
          <textarea
            name="content"
            defaultValue={JSON.stringify(page.content, null, 2)}
            className="mt-1 h-40 w-full rounded border px-3 py-2 font-mono text-xs"
          />
          <p className="mt-1 text-xs text-slate-500">
            For now, this is just raw JSON. We’ll make a nicer block editor
            later.
          </p>
        </div>

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Save
        </button>
      </form>
    </div>
  );
}
