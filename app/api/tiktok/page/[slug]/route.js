export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { BlobNotFoundError, head } from "@vercel/blob";
import { isValidTikTokSlug, tiktokBlobPath } from "../../../../../lib/tiktok-pages.js";

export async function GET(_request, { params }) {
  const slug = typeof params?.slug === "string" ? params.slug.trim().toLowerCase() : "";
  if (!isValidTikTokSlug(slug)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const meta = await head(tiktokBlobPath(slug));
    const upstream = await fetch(meta.url);
    if (!upstream.ok) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": meta.contentType || "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return new Response("Not found", { status: 404 });
    }
    throw error;
  }
}
