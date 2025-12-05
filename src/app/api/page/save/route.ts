import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import type { Block } from "~/lib/blocks";
import { PageStatus } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { pageId, blocks, status } = (await req.json()) as {
    pageId?: string;
    blocks?: Block[];
    status?: PageStatus;
  };

  if (!pageId || !Array.isArray(blocks)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const page = await db.page.findUnique({ where: { id: pageId } });
  if (!page) {
    return new NextResponse("Not Found", { status: 404 });
  }

  await db.page.update({
    where: { id: pageId },
    data: {
      content: blocks,
      status: status ?? page.status,
    },
  });

  return NextResponse.json({ ok: true });
}
