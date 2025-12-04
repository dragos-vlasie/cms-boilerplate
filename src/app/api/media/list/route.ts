// src/app/api/media/list/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";

type LibraryItem = {
  id: string;
  url: string;
  alt?: string;
  provider: "supabase" | "contentful";
};

export async function GET() {
  try {
    // 1) Supabase assets from your DB
    console.log("Prisma models:", Object.keys(db));

    const supabaseAssets = await db.mediaAsset.findMany({
      where: { provider: "supabase" },
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    const library: LibraryItem[] = supabaseAssets.map((a) => ({
      id: a.id,
      url: a.url,
      alt: a.alt ?? undefined,
      provider: "supabase",
    }));

    // 2) (Optional) Contentful assets
    // If you want, you can later add a call here to fetch assets from Contentful,
    // normalise them to LibraryItem[] and push them into `library`.

    return NextResponse.json(library, { status: 200 });
  } catch (err) {
    console.error("Media list error:", err);
    return NextResponse.json(
      { error: "Unable to load media library" },
      { status: 500 },
    );
  }
}
