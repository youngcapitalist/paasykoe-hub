export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { put } from "@vercel/blob";
import crypto from "crypto";

// Max 20 MB (TikTok photo limit); our JPEGs are ~300-500 KB.
const MAX_BYTES = 20 * 1024 * 1024;

function unauthorized() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

function uploadSecret(request) {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return request.headers.get("x-upload-secret");
}

export async function POST(request) {
  const expected = process.env.TIKTOK_UPLOAD_SECRET;
  if (!expected || uploadSecret(request) !== expected) return unauthorized();

  const buf = Buffer.from(await request.arrayBuffer());
  if (!buf.length) {
    return Response.json({ error: "empty_body" }, { status: 400 });
  }
  if (buf.length > MAX_BYTES) {
    return Response.json({ error: "too_large" }, { status: 413 });
  }

  const pathname = `${crypto.randomUUID().replace(/-/g, "")}.jpg`;

  await put(pathname, buf, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: false,
    allowOverwrite: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  // Serve from the verified domain (paasykoe.fi/_tiktok/...) via the
  // next.config rewrite, so TikTok's pull_by_url accepts it.
  const base = process.env.TIKTOK_MEDIA_BASE || "https://xn--psykoe-buaa.fi/_tiktok";
  return Response.json({ ok: true, url: `${base}/${pathname}`, pathname });
}
