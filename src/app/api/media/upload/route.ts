// src/app/api/media/upload/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "~/server/supabase";
import { env } from "~/env";
import { db } from "~/server/db";

export const runtime = "nodejs"; // ensure Node runtime for Buffer

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Missing file" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = file.name || "upload";
    const ext = originalName.includes(".")
      ? originalName.split(".").pop()
      : "";
    const safeExt = ext ? `.${ext}` : "";

    const filePath = `cms/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}${safeExt}`;

    const { error: uploadError } = await supabaseServer.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Upload failed" },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabaseServer.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(filePath);

    const asset = await db.mediaAsset.create({
      data: {
        url: publicUrl,
        alt: null,
        provider: "supabase",
      },
    });

    return NextResponse.json(
      {
        id: asset.id,
        url: asset.url,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 },
    );
  }
}
