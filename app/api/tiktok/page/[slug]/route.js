export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { get } from "@vercel/blob";
import { isValidTikTokSlug, tiktokBlobPath } from "../../../../../lib/tiktok-pages.js";

export async function GET(_request, { params }) {
  const slug = typeof params?.slug === "string" ? params.slug.trim().toLowerCase() : "";
  if (!isValidTikTokSlug(slug)) {
    return new Response("Not found", { status: 404 });
  }

  const result = await get(tiktokBlobPath(slug));
  if (!result || result.statusCode === 404) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(result.stream, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
