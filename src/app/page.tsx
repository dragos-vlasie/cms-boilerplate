// src/app/page.tsx
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import type { Block } from "~/lib/blocks";
import { PageView } from "./_components/PageView";
import { PageEditor } from "./_components/PageEditor";
import { normalizeBlocks } from "./_lib/normalizeBlocks";

export default async function HomePage() {
  const session = await auth();
  const page = await db.page.findUnique({ where: { path: "/" } });

  if (!page) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">No homepage found</h1>
      </main>
    );
  }

  const blocks = normalizeBlocks(page.content as any[]) as Block[];

  if (!session) {
    return (
      <main className="min-h-screen">
        <PageView blocks={blocks} />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <PageEditor
        initialBlocks={blocks}
        pageId={page.id}
        pageTitle={page.title}
        pageStatus={page.status}
        updatedAt={page.updatedAt}
      />
    </main>
  );
}
