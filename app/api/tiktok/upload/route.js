export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { put } from "@vercel/blob";
import { isValidTikTokSlug, tiktokBlobPath } from "../../../../lib/tiktok-pages.js";

const MAX_HTML_BYTES = 512 * 1024;

function unauthorized() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

function uploadSecret(request) {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return request.headers.get("x-tiktok-upload-secret");
}

export async function POST(request) {
  const expected = process.env.TIKTOK_UPLOAD_SECRET;
  if (!expected || uploadSecret(request) !== expected) return unauthorized();

  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = typeof data?.slug === "string" ? data.slug.trim().toLowerCase() : "";
  const html = typeof data?.html === "string" ? data.html : "";

  if (!isValidTikTokSlug(slug)) {
    return Response.json({ error: "invalid_slug" }, { status: 400 });
  }
  if (!html.trim()) {
    return Response.json({ error: "empty_html" }, { status: 400 });
  }
  if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
    return Response.json({ error: "html_too_large" }, { status: 413 });
  }

  const blob = await put(tiktokBlobPath(slug), html, {
    access: "public",
    contentType: "text/html; charset=utf-8",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return Response.json({
    ok: true,
    slug,
    path: `/t/${slug}`,
    blobUrl: blob.url,
  });
}
