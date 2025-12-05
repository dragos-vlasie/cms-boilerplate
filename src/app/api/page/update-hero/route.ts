// src/app/api/page/update-hero/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import type { Block } from "~/lib/blocks";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = (await req.json()) as unknown;
  const pageId = (body as { pageId?: string }).pageId;
  const title = (body as { title?: string }).title;

  if (!pageId || typeof title !== "string" || !title.trim()) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const page = await db.page.findUnique({ where: { id: pageId } });
  if (!page) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const blocks = Array.isArray(page.content)
    ? (page.content as Block[])
    : [];

  const updatedBlocks: Block[] = blocks.map((block) =>
    block.type === "hero"
      ? {
          ...block,
          props: { ...block.props, title },
        }
      : block,
  );

  await db.page.update({
    where: { id: pageId },
    data: { content: updatedBlocks },
  });

  return NextResponse.json({ ok: true });
}
