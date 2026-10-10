import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// ===== brand-config =====
/** Per-koe brändäys nurture-sähköposteille (domain, värit, linkit). */

type ExamCode = "a" | "b" | "c" | "e" | "f";

type NurtureBrand = {
  exam: ExamCode;
  siteName: string;
  siteUrl: string;
  fromDomain: string;
  fieldLabel: string;
  accentColor: string;
  headerBg: string;
  buttonBg: string;
  buttonText: string;
};

const FIELD_LABELS: Record<ExamCode, string> = {
  a: "tekniikkaa ja luonnontieteitä",
  b: "lääke- ja terveystieteitä",
  c: "biologiaa ja ympäristötieteitä",
  e: "kasvatusalaa",
  f: "kauppatieteitä",
};

const BRANDS: Record<ExamCode, NurtureBrand> = {
  a: {
    exam: "a",
    siteName: "Valintakoe A Pro",
    siteUrl: "https://valintakoea.fi",
    fromDomain: "valintakoea.fi",
    fieldLabel: FIELD_LABELS.a,
    accentColor: "#D4AF37",
    headerBg: "#0A2540",
    buttonBg: "#D4AF37",
    buttonText: "#0A2540",
  },
  b: {
    exam: "b",
    siteName: "Valintakoe B Pro",
    siteUrl: "https://valintakoeb.fi",
    fromDomain: "valintakoeb.fi",
    fieldLabel: FIELD_LABELS.b,
    accentColor: "#D4AF37",
    headerBg: "#0A2540",
    buttonBg: "#D4AF37",
    buttonText: "#0A2540",
  },
  c: {
    exam: "c",
    siteName: "Valintakoe C Pro",
    siteUrl: "https://valintakoec.fi",
    fromDomain: "valintakoec.fi",
    fieldLabel: FIELD_LABELS.c,
    accentColor: "#D4AF37",
    headerBg: "#0A2540",
    buttonBg: "#D4AF37",
    buttonText: "#0A2540",
  },
  e: {
    exam: "e",
    siteName: "Valintakoe E Pro",
    siteUrl: "https://valintakoee.fi",
    fromDomain: "valintakoee.fi",
    fieldLabel: FIELD_LABELS.e,
    accentColor: "#D4AF37",
    headerBg: "#0A2540",
    buttonBg: "#D4AF37",
    buttonText: "#0A2540",
  },
  f: {
    exam: "f",
    siteName: "Valintakoe F Pro",
    siteUrl: "https://valintakoefpro.com",
    fromDomain: "valintakoefpro.com",
    fieldLabel: FIELD_LABELS.f,
    accentColor: "#D4AF37",
    headerBg: "#0A2540",
    buttonBg: "#D4AF37",
    buttonText: "#0A2540",
  },
};

function getNurtureBrand(exam: string): NurtureBrand {
  const key = exam.toLowerCase() as ExamCode;
  return BRANDS[key] ?? BRANDS.f;
}

function examFromLeadSource(source: string): ExamCode {
  const s = (source || "").toLowerCase();
  if (s.startsWith("valintakoea") || s.startsWith("hub_a")) return "a";
  if (s.startsWith("valintakoeb") || s.startsWith("hub_b")) return "b";
  if (s.startsWith("valintakoec") || s.startsWith("hub_c")) return "c";
  if (s.startsWith("valintakoee") || s.startsWith("hub_e")) return "e";
  return "f";
}

/** Jaettu nurture-lähetysdomain (Resend). Vaihda pääsykoe.fi kun verified. */
function nurtureFromDomain(): string {
  return Deno.env.get("NURTURE_FROM_DOMAIN") ?? "valintakoefpro.com";
}

/** Lähettäjä: koe-kohtainen nimi, jaettu verified-domain. */
function fromHeader(brand: NurtureBrand): string {
  return `${brand.siteName} <noreply@${nurtureFromDomain()}>`;
}

function examCodeUpper(exam: string): string {
  return exam.toUpperCase();
}

// ===== sequences =====
/** Nurture-sekvenssit: Stream B (liidit) ja Stream C (ilmaiskäyttäjät). */

type TemplateKey =
  | "T1_HOT_DEAL"
  | "T2_SMALL_STEP"
  | "T3_DELETE_PLAN"
  | "T4_UNREAD"
  | "T5_PAIN"
  | "T6_FAQ"
  | "M1_CUTOFF"
  | "M2_GAP_YEAR"
  | "M3_PROBABILITY";

type NurtureStep = {
  template: TemplateKey;
  /** Päiviä enrollmentista (Stream B/C). */
  delayDays: number;
  /** Alennus % HOT DEAL -viestissä (vain T1). */
  discountPct?: number;
  discountReason?: string;
};

/** Stream B: 6 viestiä, 28 pv. */
const STREAM_B_STEPS: NurtureStep[] = [
  { template: "T4_UNREAD", delayDays: 0 },
  { template: "T5_PAIN", delayDays: 3 },
  { template: "T2_SMALL_STEP", delayDays: 7 },
  { template: "T6_FAQ", delayDays: 14 },
  { template: "T3_DELETE_PLAN", delayDays: 21 },
  {
    template: "T1_HOT_DEAL",
    delayDays: 28,
    discountPct: 30,
    discountReason: "olet liidilistalla",
  },
];

/** Stream C: 6 nurture-viestiä (C0 welcome = erillinen transactional). */
const STREAM_C_STEPS: NurtureStep[] = [
  { template: "T2_SMALL_STEP", delayDays: 1 },
  { template: "T4_UNREAD", delayDays: 3 },
  { template: "T6_FAQ", delayDays: 7 },
  { template: "T5_PAIN", delayDays: 14 },
  { template: "T3_DELETE_PLAN", delayDays: 21 },
  {
    template: "T1_HOT_DEAL",
    delayDays: 28,
    discountPct: 25,
    discountReason: "loit tilin",
  },
];

/** Maintenance F: 3 viestin kiertävä luuppi (12–21 pv välein). */
const MAINTENANCE_F_STEPS: NurtureStep[] = [
  { template: "M1_CUTOFF", delayDays: 0 },
  { template: "M2_GAP_YEAR", delayDays: 0 },
  { template: "M3_PROBABILITY", delayDays: 0 },
];

/** Ylläpito: off-season 21 pv, sesonki (tammi–huhti) 12 pv. */
const MAINTENANCE_OFF_SEASON_DAYS = 21;
const MAINTENANCE_SEASON_DAYS = 12;

/** Aalto / kauppatieteet -referenssipisteraja (oikeat vastaukset %). */
const F_AALTO_CUTOFF_PCT = 70;

function isExamSeason(): boolean {
  const month = new Date().getMonth() + 1; // 1–12
  return month >= 1 && month <= 4;
}

function maintenanceIntervalDays(): number {
  return isExamSeason() ? MAINTENANCE_SEASON_DAYS : MAINTENANCE_OFF_SEASON_DAYS;
}

function stepsForStream(streamType: string, exam?: string): NurtureStep[] {
  if (streamType === "B") return STREAM_B_STEPS;
  if (streamType === "C") return STREAM_C_STEPS;
  if (streamType === "maintenance" && (exam ?? "").toLowerCase() === "f") {
    return MAINTENANCE_F_STEPS;
  }
  return [{ template: "T2_SMALL_STEP", delayDays: 0 }];
}

/** Valitse maintenance-template: F kiertää 3 viestiä, muut käyttävät FAQ:ta. */
function maintenanceStepFor(exam: string, stepIndex: number): NurtureStep {
  if (exam.toLowerCase() === "f") {
    const steps = MAINTENANCE_F_STEPS;
    return steps[((stepIndex % steps.length) + steps.length) % steps.length];
  }
  return { template: "T6_FAQ", delayDays: 0 };
}

function campaignId(exam: string, streamType: string, stepIndex: number): string {
  return `${exam.toLowerCase()}_${streamType}_step_${stepIndex}`;
}

function nextSendAtFromEnrollment(
  enrolledAt: Date,
  stepIndex: number,
  streamType: string,
): Date | null {
  const steps = stepsForStream(streamType);
  const nextIndex = stepIndex + 1;
  if (nextIndex >= steps.length) return null;
  const delayDays = steps[nextIndex].delayDays;
  const ms = enrolledAt.getTime() + delayDays * 24 * 60 * 60 * 1000;
  return new Date(ms);
}

function dueStepIndex(enrolledAt: Date, streamType: string, now = new Date()): number {
  const steps = stepsForStream(streamType);
  let due = -1;
  for (let i = 0; i < steps.length; i++) {
    const dueAt = enrolledAt.getTime() + steps[i].delayDays * 24 * 60 * 60 * 1000;
    if (dueAt <= now.getTime()) due = i;
  }
  return due;
}

// ===== discount-token =====
/** Allekirjoitetut nurture-alennustokenit (HOT DEAL). */

const DEAL_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DEAL_TTL_F_MS = 48 * 60 * 60 * 1000;

function dealSecret(): string {
  return Deno.env.get("NURTURE_SIGNING_SECRET") || Deno.env.get("DRIP_SIGNING_SECRET") || "";
}

function b64url(data: string): string {
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(payload: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(payload));
  return b64url(String.fromCharCode(...new Uint8Array(sig)));
}

async function signDealToken(
  email: string,
  exam: string,
  discountPct: number,
  ttlMs?: number,
): Promise<string> {
  const s = dealSecret();
  if (!s) throw new Error("NURTURE_SIGNING_SECRET missing");
  const normalized = email.toLowerCase().trim();
  const ex = exam.toLowerCase();
  const ttl = ttlMs ?? (ex === "f" ? DEAL_TTL_F_MS : DEAL_TTL_MS);
  const payload = JSON.stringify({
    e: normalized,
    x: ex,
    d: discountPct,
    exp: Date.now() + ttl,
  });
  const payloadB64 = b64url(payload);
  const sig = await hmacSign(`${normalized}:${ex}:${discountPct}`, s);
  return `${payloadB64}.${sig}`;
}

async function verifyDealToken(
  token: string,
): Promise<{ email: string; exam: string; discountPct: number } | null> {
  const s = dealSecret();
  if (!token || !s) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(json) as { e: string; x: string; d: number; exp: number };
    const expected = await hmacSign(`${parsed.e}:${parsed.x}:${parsed.d}`, s);
    if (sig !== expected) return null;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    if (!parsed.d || parsed.d < 1 || parsed.d > 50) return null;
    return { email: parsed.e, exam: parsed.x, discountPct: parsed.d };
  } catch {
    return null;
  }
}

/** UTM-medium → alennus % (vanhat sähköpostit ilman tokenia). */
function discountFromUtmMedium(medium: string | null): number | null {
  if (!medium) return null;
  if (medium === "B_hot_deal") return 30;
  if (medium === "C_hot_deal") return 25;
  return null;
}

// ===== unsubscribe-token =====
/** Allekirjoitetut nurture-peruutustokenit. */

function unsubSecret(): string {
  return Deno.env.get("NURTURE_SIGNING_SECRET") || Deno.env.get("DRIP_SIGNING_SECRET") || "";
}

function unsubB64url(data: string): string {
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function unsubHmacSign(payload: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(payload));
  return unsubB64url(String.fromCharCode(...new Uint8Array(sig)));
}

async function signUnsubscribeToken(
  email: string,
  exam: string,
): Promise<string> {
  const s = unsubSecret();
  if (!s) throw new Error("NURTURE_SIGNING_SECRET missing");
  const normalized = email.toLowerCase().trim();
  const payload = JSON.stringify({
    e: normalized,
    x: exam.toLowerCase(),
    exp: Date.now() + 90 * 24 * 60 * 60 * 1000,
  });
  const payloadB64 = unsubB64url(payload);
  const sig = await unsubHmacSign(`${normalized}:${exam.toLowerCase()}`, s);
  return `${payloadB64}.${sig}`;
}

async function verifyUnsubscribeToken(
  token: string,
): Promise<{ email: string; exam: string } | null> {
  const s = unsubSecret();
  if (!token || !s) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(json) as { e: string; x: string; exp: number };
    const expected = await unsubHmacSign(`${parsed.e}:${parsed.x}`, s);
    if (sig !== expected) return null;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return { email: parsed.e, exam: parsed.x };
  } catch {
    return null;
  }
}

async function unsubscribeUrl(
  email: string,
  exam: string,
  siteUrl: string,
): Promise<string> {
  const token = await signUnsubscribeToken(email, exam);
  return `${siteUrl.replace(/\/$/, "")}/peruuta-nurture?token=${encodeURIComponent(token)}`;
}

/** Edge function URL one-click unsubscribe (RFC 8058). */
async function unsubscribeApiUrl(email: string, exam: string): Promise<string> {
  const token = await signUnsubscribeToken(email, exam);
  const base = Deno.env.get("SUPABASE_URL") ?? "";
  return `${base}/functions/v1/nurture-unsubscribe?token=${encodeURIComponent(token)}`;
}

// ===== eligibility =====

const PAID_TIERS = new Set(["pro", "vip", "basic"]);

function isPaidProfile(profile: Record<string, unknown> | null): boolean {
  if (!profile) return false;
  if (profile.manual_tier_override) return true;
  if (profile.is_customer === true) return true;
  const now = Date.now();
  const inFuture = (ts: unknown) => ts && new Date(ts as string).getTime() > now;
  if (inFuture(profile.exam_access_until) || inFuture(profile.vip_access_until)) return true;
  return PAID_TIERS.has(profile.subscription_tier as string);
}

async function isCustomerEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<boolean> {
  const lower = email.toLowerCase().trim();

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email?.toLowerCase() === lower);
  if (!user?.id) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, manual_tier_override, exam_access_until, vip_access_until, is_customer, nurture_unsubscribed")
    .eq("user_id", user.id)
    .maybeSingle();

  return isPaidProfile(profile);
}

async function isNurtureUnsubscribed(
  supabase: SupabaseClient,
  email: string,
  exam: string,
): Promise<boolean> {
  const lower = email.toLowerCase().trim();

  const { data: global } = await supabase
    .from("suppressed_emails")
    .select("email")
    .eq("email", lower)
    .maybeSingle();
  if (global) return true;

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email?.toLowerCase() === lower);
  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nurture_unsubscribed")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profile?.nurture_unsubscribed) return true;
  }

  const { data: streamUnsub } = await supabase
    .from("active_nurture_streams")
    .select("status")
    .eq("email", lower)
    .eq("exam", exam.toLowerCase())
    .eq("status", "unsubscribed")
    .limit(1);
  if (streamUnsub && streamUnsub.length > 0) return true;

  return false;
}

async function canSendNurture(
  supabase: SupabaseClient,
  email: string,
  exam: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (await isNurtureUnsubscribed(supabase, email, exam)) {
    return { ok: false, reason: "unsubscribed" };
  }
  if (await isCustomerEmail(supabase, email)) {
    return { ok: false, reason: "customer" };
  }
  return { ok: true };
}

/** Poistu kaikista nurture-virroista oston jälkeen. */
async function exitNurtureOnPurchase(
  supabase: SupabaseClient,
  email: string,
): Promise<void> {
  const lower = email.toLowerCase().trim();
  const now = new Date().toISOString();

  await supabase
    .from("active_nurture_streams")
    .update({ status: "exited_by_purchase", updated_at: now })
    .eq("email", lower)
    .in("status", ["active", "paused"]);

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email?.toLowerCase() === lower);
  if (user?.id) {
    await supabase
      .from("profiles")
      .update({ is_customer: true, updated_at: now })
      .eq("user_id", user.id);
  }
}

// ===== enroll =====
  stepsForStream,
  nextSendAtFromEnrollment,
  campaignId,
} from "./sequences.ts";

function jitterMs(maxHours = 48): number {
  return Math.floor(Math.random() * maxHours * 60 * 60 * 1000);
}

async function enrollStreamB(
  supabase: SupabaseClient,
  email: string,
  exam: string,
  options: { backfill?: boolean } = {},
): Promise<{ ok: boolean; reason?: string }> {
  const lower = email.toLowerCase().trim();
  const ex = exam.toLowerCase();

  const eligible = await canSendNurture(supabase, lower, ex);
  if (!eligible.ok) return { ok: false, reason: eligible.reason };

  const { data: existing } = await supabase
    .from("active_nurture_streams")
    .select("id, status")
    .eq("email", lower)
    .eq("exam", ex)
    .eq("stream_type", "B")
    .maybeSingle();

  if (existing && !["completed", "unsubscribed", "exited_by_purchase"].includes(existing.status)) {
    return { ok: true, reason: "already_enrolled" };
  }

  // Stream B vain jos EI ilmaistiliä
  const { data: users } = await supabase.auth.admin.listUsers();
  const hasAccount = users?.users?.some((u) => u.email?.toLowerCase() === lower);
  if (hasAccount) return { ok: false, reason: "has_account" };

  const enrolledAt = new Date();
  const steps = stepsForStream("B");
  const firstDelay = steps[0]?.delayDays ?? 0;
  let nextSend = new Date(enrolledAt.getTime() + firstDelay * 24 * 60 * 60 * 1000);
  if (options.backfill) {
    nextSend = new Date(Date.now() + jitterMs());
  }

  const { error } = await supabase.from("active_nurture_streams").upsert(
    {
      email: lower,
      exam: ex,
      stream_type: "B",
      current_step_index: -1,
      next_send_at: nextSend.toISOString(),
      status: "active",
      enrolled_at: enrolledAt.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email,exam,stream_type" },
  );

  if (error) {
    console.error("enrollStreamB failed", error);
    return { ok: false, reason: "db_error" };
  }
  return { ok: true };
}

async function enrollStreamC(
  supabase: SupabaseClient,
  email: string,
  exam: string,
): Promise<{ ok: boolean; reason?: string }> {
  const lower = email.toLowerCase().trim();
  const ex = exam.toLowerCase();

  const eligible = await canSendNurture(supabase, lower, ex);
  if (!eligible.ok) return { ok: false, reason: eligible.reason };

  const { data: existing } = await supabase
    .from("active_nurture_streams")
    .select("id, status")
    .eq("email", lower)
    .eq("exam", ex)
    .eq("stream_type", "C")
    .maybeSingle();

  if (existing && !["completed", "unsubscribed", "exited_by_purchase"].includes(existing.status)) {
    return { ok: true, reason: "already_enrolled" };
  }

  // Pause Stream B — tuotekonteksti voittaa
  await supabase
    .from("active_nurture_streams")
    .update({ status: "paused", updated_at: new Date().toISOString() })
    .eq("email", lower)
    .eq("exam", ex)
    .eq("stream_type", "B")
    .eq("status", "active");

  const enrolledAt = new Date();
  const steps = stepsForStream("C");
  const firstDelay = steps[0]?.delayDays ?? 1;
  const nextSend = new Date(enrolledAt.getTime() + firstDelay * 24 * 60 * 60 * 1000);

  const { error } = await supabase.from("active_nurture_streams").upsert(
    {
      email: lower,
      exam: ex,
      stream_type: "C",
      current_step_index: -1,
      next_send_at: nextSend.toISOString(),
      status: "active",
      enrolled_at: enrolledAt.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email,exam,stream_type" },
  );

  if (error) {
    console.error("enrollStreamC failed", error);
    return { ok: false, reason: "db_error" };
  }
  return { ok: true };
}

async function enrollMaintenance(
  supabase: SupabaseClient,
  email: string,
  exam: string,
  intervalDays: number,
): Promise<void> {
  const lower = email.toLowerCase().trim();
  const nextSend = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);

  await supabase.from("active_nurture_streams").upsert(
    {
      email: lower,
      exam: exam.toLowerCase(),
      stream_type: "maintenance",
      current_step_index: -1,
      next_send_at: nextSend.toISOString(),
      status: "active",
      enrolled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email,exam,stream_type" },
  );
}


// ===== send-via-queue =====

type QueueEmailParams = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  label: string;
  idempotencyKey: string;
  unsubscribeUrl?: string;
};

type NurtureTestContext = {
  exam: string;
  siteName: string;
  streamType?: string;
  stepIndex?: number;
  stepTotal?: number;
};

/** Jos NURTURE_TEST_RECIPIENT on asetettu, kaikki nurture menee sinne (ei oikeille liideille). */
function applyNurtureTestRouting(
  originalTo: string,
  params: Pick<QueueEmailParams, "subject" | "html" | "text">,
  ctx?: NurtureTestContext,
): { to: string; subject: string; html: string; text?: string; isTestMode: boolean } {
  const testTo = Deno.env.get("NURTURE_TEST_RECIPIENT")?.trim().toLowerCase();
  if (!testTo) {
    return { to: originalTo, subject: params.subject, html: params.html, text: params.text, isTestMode: false };
  }

  const exam = ctx?.exam?.toUpperCase() ?? "?";
  const stream = ctx?.streamType ?? "";
  const step =
    ctx?.stepIndex != null && ctx?.stepTotal != null
      ? ` · viesti ${ctx.stepIndex + 1}/${ctx.stepTotal}`
      : "";
  const site = ctx?.siteName ?? `Koe ${exam}`;
  const tag = `[TEST · ${site}${stream ? ` · ${stream}` : ""}${step}]`;

  const topBanner =
    `<div style="background:#fef3c7;border:2px solid #d97706;border-radius:8px;padding:12px 16px;margin:0 0 16px;text-align:center">` +
    `<strong style="color:#92400e;font-size:13px">TEST MODE</strong>` +
    `<p style="margin:6px 0 0;font-size:12px;color:#78350f">${site} · Stream ${stream || "?"}${step}<br>` +
    `Alkuperäinen vastaanottaja: ${originalTo}</p></div>`;

  const bottomBanner =
    `<p style="font-size:11px;color:#999;text-align:center;margin-top:16px">` +
    `TEST MODE · ${site} · ${originalTo}</p>`;

  const html = params.html.includes("<body")
    ? params.html.replace(/<body([^>]*)>/, `<body$1>${topBanner}`)
    : `${topBanner}${params.html}`;

  return {
    to: testTo,
    subject: `${tag} ${params.subject}`,
    html: html.replace("</body>", `${bottomBanner}</body>`),
    text: params.text
      ? `${tag}\n${params.text}\n\n(TEST → ${originalTo})`
      : `${tag} (TEST → ${originalTo})`,
    isTestMode: true,
  };
}

async function enqueueNurtureEmail(
  supabase: SupabaseClient,
  params: QueueEmailParams,
): Promise<{ ok: boolean; error?: string }> {
  const messageId = crypto.randomUUID();
  const payload = {
    to: params.to,
    from: params.from,
    subject: params.subject,
    html: params.html,
    text: params.text,
    message_id: messageId,
    idempotency_key: params.idempotencyKey,
    label: params.label,
    queued_at: new Date().toISOString(),
  };

  const { error } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload,
  });

  if (error) {
    console.error("enqueueNurtureEmail failed", error);
    return { ok: false, error: error.message };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (supabaseUrl && serviceKey) {
    fetch(`${supabaseUrl}/functions/v1/process-email-queue`, {
      method: "POST",
      headers: { Authorization: `Bearer ${serviceKey}` },
    }).catch(() => {});
  }

  return { ok: true };
}

/** Lähetä kopio seurantaosoitteeseen (NURTURE_MIRROR_EMAIL). */
async function mirrorToTestInbox(
  supabase: SupabaseClient,
  params: QueueEmailParams,
  originalTo: string,
  ctx?: NurtureTestContext,
): Promise<void> {
  const mirror = Deno.env.get("NURTURE_MIRROR_EMAIL");
  if (!mirror) return;

  const exam = ctx?.exam?.toUpperCase() ?? "?";
  const stream = ctx?.streamType ?? "";
  const step =
    ctx?.stepIndex != null && ctx?.stepTotal != null
      ? ` · viesti ${ctx.stepIndex + 1}/${ctx.stepTotal}`
      : "";
  const site = ctx?.siteName ?? `Koe ${exam}`;
  const tag = `[KOPIO · ${site}${stream ? ` · ${stream}` : ""}${step}]`;

  const banner =
    `<div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:8px;padding:12px 16px;margin:0 0 16px;text-align:center">` +
    `<strong style="color:#1d4ed8;font-size:13px">SEURANTAKOPIO</strong>` +
    `<p style="margin:6px 0 0;font-size:12px;color:#1e40af">${site}${stream ? ` · Stream ${stream}` : ""}${step}<br>` +
    `Lähetetty myös: <strong>${originalTo}</strong></p></div>`;

  const html = params.html.includes("<body")
    ? params.html.replace(/<body([^>]*)>/, `<body$1>${banner}`)
    : `${banner}${params.html}`;
  const text = params.text
    ? `${tag}\n(KOPIO → ${originalTo})\n\n${params.text}`
    : `${tag} (KOPIO → ${originalTo})`;

  await enqueueNurtureEmail(supabase, {
    ...params,
    to: mirror,
    subject: `${tag} ${params.subject}`,
    html,
    text,
    idempotencyKey: `${params.idempotencyKey}_mirror`,
    label: `${params.label}_mirror`,
  });
}

// ===== templates =====

type RenderContext = {
  email: string;
  firstName?: string | null;
  brand: NurtureBrand;
  step: NurtureStep;
  streamType: string;
  unsubscribeUrl: string;
  ctaUrl: string;
  /** F B-viesti 1: dynaaminen heikkous (esim. "aineistotehtävissä"). */
  weaknessHint?: string | null;
};

type EmailTpl = { subject: string; body: string; cta: string; notes?: string };

function greeting(ctx: RenderContext): string {
  if (ctx.firstName) return `Hei ${ctx.firstName},`;
  return "Hei,";
}

function weaknessPhrase(ctx: RenderContext): string {
  const w = (ctx.weaknessHint || "").trim();
  return w || "aineistotehtävissä";
}

/** Valintakoe F Pro — Hopkins-malliset Stream B -viestit. */
function templatesFStreamB(ctx: RenderContext): Partial<Record<TemplateKey, EmailTpl>> {
  const weakness = weaknessPhrase(ctx);
  const discount = ctx.step.discountPct ?? 30;

  return {
    T4_UNREAD: {
      subject: "Valintakoe F: Lähtötasotestisi tulos ja analyysi",
      body:
        `${greeting(ctx)}\n\n` +
        `Testisi on analysoitu. Valintakoe F ei testaa sitä, kuinka monta kirjaa olet lukenut ulkoa. Se testaa tiedon prosessointinopeutta ja loogista päättelyä äärimmäisen aikapaineen alla.\n\n` +
        `Datamme perusteella suurin yksittäinen riskisi karsiutua on ajan loppuminen ${weakness}.\n\n` +
        `Jos jatkat perinteistä lukemista, tämä heikkous ei korjaannu. Valintakoe F Pro on rakennettu simuloimaan kokeen aikarajoja ja pakottamaan sinut nopeammaksi niissä osioissa, joissa häviät pisteitä.\n\n` +
        `Katso tarkka tulosraporttisi ja aloita nopeutesi optimointi välittömästi.`,
      cta: "KATSO RAPORTTI JA ALOITA PRO",
    },
    T5_PAIN: {
      subject: "Miksi 70 % kauppakorkeakouluun hakijoista treenaa väärin",
      body:
        `${greeting(ctx)}\n\n` +
        `Suurin virhe, jonka voit tehdä tällä viikolla, on avata oppikirja sivulta yksi ja alkaa lukea ilman dataan perustuvaa suunnitelmaa.\n\n` +
        `Tämä toimi vanhassa pääsykokeessa. Uudessa F-kokeessa se on varma tapa epäonnistua. Kun opiskelet asioita satunnaisesti, tuhlaat satoja tunteja materiaaliin, jonka jo osaat, ja jätät kriittiset heikkoutesi (kuten nopean todennäköisyyksien laskennan) huomiotta.\n\n` +
        `F Pro -järjestelmä mittaa sekuntikellolla jokaisen vastauksesi ja syöttää sinulle vain niitä tehtävätyyppejä, joissa olet hitain. Se on puhdasta, numeerista tuloksen tekoa.`,
      cta: "KORJAA OPISKELUTEKNIIKKASI TÄNÄÄN",
    },
    T2_SMALL_STEP: {
      subject: "Yksi muutos logiikkatehtäviin (Säästää 3 minuuttia kokeessa)",
      body:
        `${greeting(ctx)}\n\n` +
        `Tässä on suora fakta Valintakoe F:n loogisesta osiosta: Älä koskaan lue aineistoa ensin.\n\n` +
        `Kokeen laatijat piilottavat tekstiin tahallaan ylimääräistä dataa kuluttaakseen aikaasi. Lue aina ensin kysymys, tunnista vaadittu muuttuja ja skannaa teksti vain sen osalta. Tämä säästää keskimäärin 3 minuuttia per osio.\n\n` +
        `PRO-järjestelmämme pakottaa sinut tähän rytmiin. Koesimulaattorimme katkaisee ajan armottomasti, jotta opit eliminoimaan turhan lukemisen paineen alla.`,
      cta: "KOKEILE KOESIMULAATTORIA PRO-TILILLÄ",
    },
    T6_FAQ: {
      subject: "Mitä oikeasti tapahtuu, kun avaat Valintakoe F Pro:n?",
      body:
        `${greeting(ctx)}\n\n` +
        `Moni kysyy, mitä PRO-paketti tarkalleen sisältää. Vastaus on yksinkertainen: kaiken tarvittavan infrastruktuurin sisäänpääsyyn.\n\n` +
        `Diagnostinen kysymyspankki: Ei satunnaisia kysymyksiä. Järjestelmä etsii aukot osaamisessasi ja pakottaa sinut paikkaamaan ne.\n\n` +
        `Koesimulaatiot: Rakennettu vastaamaan kokeen oikeaa käyttöliittymää ja aikapainetta. Kun astut koesaliin, tilanne on sinulle rutiinia.\n\n` +
        `Teoria vain tarpeeseen: Puristettu ja optimoitu teoria, jota käytät vain, kun jäät jumiin tehtävissä.\n\n` +
        `Aikaa kokeeseen on rajallisesti. Paras aika aloittaa tehokas toistojen tekeminen on tänään.`,
      cta: "AVAA KOKO JÄRJESTELMÄ",
    },
    T3_DELETE_PLAN: {
      subject: "Testitulostesi pohjalta tehty lukusuunnitelma poistuu 48h kuluttua",
      body:
        `${greeting(ctx)}\n\n` +
        `Teit lähtötasotestin kanssamme muutama viikko sitten. Järjestelmämme on pitänyt sinulle luotua personoitua heikkousanalyysiä ja lukusuunnitelmaa aktiivisena.\n\n` +
        `Koska haluamme pitää palvelinkapasiteettimme sataprosenttisesti aktiivisten treenaajien käytössä, arkistoimme inaktiiviset profiilit automaattisesti 48 tunnin kuluttua.\n\n` +
        `Jos haluat säilyttää datasi ja aloittaa treenaamisen F-kokeeseen optimoidulla putkellamme, aktivoi tilisi nyt.`,
      cta: "AKTIVOI PRO-TILI ENNEN ARKISTOINTIA",
    },
    T1_HOT_DEAL: {
      subject: `Viimeinen mahdollisuus epäreiluun etuun (PRO -${discount} %)`,
      body:
        `${greeting(ctx)}\n\n` +
        `Huomaan, ettet ole vielä tehnyt päätöstä valmistautumisestasi. Tiedämme datasta, että ne opiskelijat, jotka aloittavat simulaatiot tässä vaiheessa vuotta, saavat merkittävän etumatkan kevään hakijoihin.\n\n` +
        `Haluamme palkita hakijat, jotka ovat valmiita sitoutumaan ajoissa. Koska teit alkuperäisen testin kanssamme, saat Valintakoe F Pro -järjestelmän täyden käyttöoikeuden ${discount} % alennuksella.\n\n` +
        `Käytä koodia FAST30 kassalla. Koodi on aktiivinen tasan 48 tuntia. Tämän jälkeen hinta palautuu normaaliksi.`,
      cta: "LUNASTA EDUSI TÄSTÄ",
      notes: "FAST30 voimassa 48 tuntia.",
    },
  };
}

/** Valintakoe F Pro — maintenance-luuppi (3 viestiä). */
function templatesFMaintenance(ctx: RenderContext): Partial<Record<TemplateKey, EmailTpl>> {
  const cutoff = F_AALTO_CUTOFF_PCT;
  return {
    M1_CUTOFF: {
      subject: `Aalto-yliopiston pisteraja oli noin ${cutoff} % – Riittääkö nopeutesi?`,
      body:
        `${greeting(ctx)}\n\n` +
        `Kylmä muistutus edellisen vuoden pisterajoista.\n\n` +
        `Keskimäärin sisäänpääsy vaati noin ${cutoff} % oikeita vastauksia. Manuaalinen opiskelu ei skaalaudu tähän. Varmista rutiinisi F Pro -simulaattorilla.`,
      cta: "VARMISTA RUTIINISI SIMULAATTORILLA",
    },
    M2_GAP_YEAR: {
      subject: "Välivuoden todellinen hinta on yli 30 000 euroa",
      body:
        `${greeting(ctx)}\n\n` +
        `Jokainen välivuosi viivästyttää valmistumista ja siirtää ensimmäisen vuoden asiantuntijapalkkaa (keskimäärin 30k–40k €). F Pro:n hinta on mikroskooppinen investointi tähän verrattuna.\n\n` +
        `Älä riskeeraa vuotta elämästäsi väärän opiskelutekniikan takia.`,
      cta: "ALOITA F PRO NYT",
    },
    M3_PROBABILITY: {
      subject: "Miten vältät todennäköisyyslaskennan ansat F-kokeessa",
      body:
        `${greeting(ctx)}\n\n` +
        `Lyhyt tekninen vinkki: älä laske “kaikkia tapauksia” ennen kuin olet rajannut ehdot. F-kokeessa todennäköisyystehtävät piilottavat ylimääräisiä ehtoja juuri siksi, että hakija hukkaa minuutin turhaan haarukointiin.\n\n` +
        `Kirjoita ensin ehto (mikä muuttuja on kiinnitetty), sitten laske. Pro-käyttäjämme tekevät näitä toistoja satoja kertoja viikossa, kunnes ne tulevat selkärangasta. Liity mukaan.`,
      cta: "LIITY F PRO -HARJOITTELUUN",
    },
  };
}

function templatesGeneric(ctx: RenderContext): Record<TemplateKey, EmailTpl> {
  const code = examCodeUpper(ctx.brand.exam);
  const field = ctx.brand.fieldLabel;
  const discount = ctx.step.discountPct ?? 25;
  const reason = ctx.step.discountReason ?? "olet mukana listallamme";

  return {
    T1_HOT_DEAL: {
      subject: `Viimeinen mahdollisuus: -${discount} % Koe ${code} -valmennukseen`,
      body:
        `${greeting(ctx)}\n\n` +
        `Tiedämme, että maksullisen valmennuksen tilaaminen tuntuu isolta päätökseltä — varsinkin ennen kuin olet nähnyt, miten tehtävät oikeasti tuntuvat.\n\n` +
        `Koska ${reason}, saat kertaluonteisen -${discount} % alennuksen. Et näe tätä hintaa julkisesti.\n\n` +
        `Voimassa 7 päivää.`,
      cta: `LUNASTA -${discount} %`,
      notes: "Voimassa 7 päivää.",
    },
    T2_SMALL_STEP: {
      subject: "1 % parempi tänään",
      body:
        `${greeting(ctx)}\n\n` +
        `Iso tulos alkaa pienestä: yksi tehtävä. Yksi kysymys AI-professorille. Yksi virhe, jonka korjaat heti.\n\n` +
        `Tilisi on valmis. Suunnitelmasi odottaa.`,
      cta: "JATKA SUUNNITELMAA",
    },
    T3_DELETE_PLAN: {
      subject: "Henkilökohtainen suunnitelmasi poistuu pian ☹️",
      body:
        `${greeting(ctx)}\n\n` +
        `Plan ID: ${ctx.email.slice(0, 8)} · Tyyppi: Koe ${code} -valmennus · Sähköposti: ${ctx.email}\n\n` +
        `Emme ole kuulleet sinusta vähään aikaan. Jos tavoitteesi on muuttunut, se on täysin ok — poistamme suunnitelman.\n\n` +
        `Jos haluat vielä päästä ${field} opiskelemaan, tallenna suunnitelmasi ennen kuin linkki vanhenee.`,
      cta: "TALLENNA SUUNNITELMA",
    },
    T4_UNREAD: {
      subject:
        ctx.streamType === "B"
          ? "Sinulle on valmis vastaus"
          : "AI-professori vastasi kysymykseesi",
      body:
        `${greeting(ctx)}\n\n` +
        (ctx.streamType === "B"
          ? `Moni Koe ${code} -hakija kysyy ensin: "Mistä aloitan?" Sinulle on valmis vastaus — yksi konkreettinen ensimmäinen askel kohti ${field}.\n\n`
          : `AI-professorisi on valmis auttamaan. Kysymyksesi ei jää roikkumaan — saat selityksen, ei vain oikeaa vastausta.\n\n`) +
        `Avaa tili ja kokeile yhtä tehtävää tänään. Viisi minuuttia riittää.`,
      cta: ctx.streamType === "B" ? "KOKEILE ILMAISEKSI" : "LUE VASTAUS",
    },
    T5_PAIN: {
      subject: `Moni Koe ${code} -hakija tekee saman virheen`,
      body:
        `${greeting(ctx)}\n\n` +
        `He lukevat teoriaa satunnaisesti. Tekevät pari vanhaa koetta. Sitten ihmettelevät, miksi pisteet eivät nouse.\n\n` +
        `Valintakoe ${code} mittaa systemaattisuutta — ei tuuria. Siksi rakennettu harjoittelu ja AI-palaute voittavat YouTube-selailun.\n\n` +
        `Yksi tehtävä, viisi minuuttia.`,
      cta: "KOKEILE ILMAISEKSI",
    },
    T6_FAQ: {
      subject:
        ctx.streamType === "B" || ctx.streamType === "maintenance"
          ? "Mitä PRO sisältää — ja milloin aloittaa?"
          : "Mitä saat PROlla vs. ilmainen tili",
      body:
        `${greeting(ctx)}\n\n` +
        (ctx.streamType === "C"
          ? `Ilmainen tili: rajattu tehtävämäärä ja perus-AI. PRO: rajaton harjoittelu, koesimulaatiot, AI-professori ilman rajoituksia ja henkilökohtainen etenemispolku kohti ${field}.\n\n`
          : `PRO sisältää: teoria osa-alueittain, rajaton AI-harjoittelu, koesimulaatiot ja selkeän viikkorytmin. Paras aika aloittaa on nyt — ei viime tingassa ennen koetta.\n\n`) +
        `Kysymyksiä? Vastaa tähän viestiin tai avaa sovellus.`,
      cta: "KATSO PRO-PAKETTI",
    },
    M1_CUTOFF: {
      subject: `Aalto-yliopiston pisteraja oli noin ${F_AALTO_CUTOFF_PCT} % – Riittääkö nopeutesi?`,
      body: `${greeting(ctx)}\n\nKeskimäärin sisäänpääsy vaati noin ${F_AALTO_CUTOFF_PCT} % oikeita vastauksia.`,
      cta: "KATSO PRO-PAKETTI",
    },
    M2_GAP_YEAR: {
      subject: "Välivuoden todellinen hinta on yli 30 000 euroa",
      body: `${greeting(ctx)}\n\nÄlä riskeeraa vuotta elämästäsi väärän opiskelutekniikan takia.`,
      cta: "KATSO PRO-PAKETTI",
    },
    M3_PROBABILITY: {
      subject: "Miten vältät todennäköisyyslaskennan ansat F-kokeessa",
      body: `${greeting(ctx)}\n\nPro-käyttäjämme tekevät näitä toistoja satoja kertoja viikossa.`,
      cta: "KATSO PRO-PAKETTI",
    },
  };
}

function resolveTemplate(ctx: RenderContext): EmailTpl {
  const exam = ctx.brand.exam;
  if (exam === "f" && ctx.streamType === "B") {
    const f = templatesFStreamB(ctx)[ctx.step.template];
    if (f) return f;
  }
  if (exam === "f" && ctx.streamType === "maintenance") {
    const f = templatesFMaintenance(ctx)[ctx.step.template];
    if (f) return f;
  }
  return templatesGeneric(ctx)[ctx.step.template];
}

function renderNurtureEmail(ctx: RenderContext): { subject: string; html: string; text: string } {
  const tpl = resolveTemplate(ctx);
  const { brand, ctaUrl, unsubscribeUrl } = ctx;

  const bodyHtml = tpl.body
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 16px;line-height:1.65;color:#334155;font-size:15px">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  const notesHtml = tpl.notes
    ? `<p style="margin:0 0 16px;font-size:13px;color:#64748b">${tpl.notes}</p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="fi">
<body style="margin:0;background:#f4f6f8;font-family:system-ui,sans-serif;color:#0A2540">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:${brand.headerBg};color:#fff;border-radius:16px 16px 0 0;padding:24px;text-align:center">
      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${brand.accentColor}">${brand.siteName}</p>
      <h1 style="margin:12px 0 0;font-size:20px;line-height:1.3;font-weight:700">${tpl.subject}</h1>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:24px;border:1px solid #e5e7eb;border-top:0">
      ${bodyHtml}
      ${notesHtml}
      <a href="${ctaUrl}" style="display:block;text-align:center;background:${brand.buttonBg};color:${brand.buttonText};font-weight:800;text-decoration:none;padding:16px 24px;border-radius:999px;font-size:15px;margin-top:8px">${tpl.cta}</a>
      <p style="margin:20px 0 0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.5">
        <a href="${unsubscribeUrl}" style="color:#64748b">Peru markkinointi (${brand.siteName})</a>
        · Jos olet jo asiakas, voit jättää tämän huomiotta
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `${tpl.subject}\n\n${tpl.body}\n\n${tpl.cta}: ${ctaUrl}\n\nPeru: ${unsubscribeUrl}`;

  return { subject: tpl.subject, html, text };
}

/** Map hub pain → F-heikkousfraasi viestiin 1. */
function weaknessHintFromPain(painKey?: string | null): string {
  const k = (painKey || "").toLowerCase();
  if (k === "time") return "aineistotehtävissä (ajan hallinta)";
  if (k === "compete") return "loogisessa päättelyssä aikapaineessa";
  if (k === "fear") return "aineistotehtävissä";
  return "aineistotehtävissä";
}

async function ctaUrlForStep(
  brand: NurtureBrand,
  streamType: string,
  step: NurtureStep,
  email?: string,
): Promise<string> {
  const base = brand.siteUrl.replace(/\/$/, "");
  const isFHopkinsCta =
    brand.exam === "f" &&
    (streamType === "B" || streamType === "maintenance") &&
    (step.template === "T1_HOT_DEAL" ||
      step.template === "T3_DELETE_PLAN" ||
      step.template === "T6_FAQ" ||
      step.template.startsWith("M"));

  if (step.template === "T1_HOT_DEAL") {
    const discount = step.discountPct ?? 25;
    const params = new URLSearchParams({
      utm_source: "nurture",
      utm_medium: `${streamType}_hot_deal`,
      utm_campaign: brand.exam,
    });
    if (brand.exam === "f") params.set("code", "FAST30");
    if (email) {
      try {
        const ttlMs = brand.exam === "f" ? 48 * 60 * 60 * 1000 : undefined;
        const token = await signDealToken(email, brand.exam, discount, ttlMs);
        params.set("token", token);
      } catch {
        /* token optional if secret missing in dev */
      }
    }
    return `${base}/hinnoittelu?${params.toString()}`;
  }

  if (isFHopkinsCta) {
    return `${base}/hinnoittelu?utm_source=nurture&utm_medium=${streamType}&utm_campaign=${brand.exam}`;
  }

  if (streamType === "B") {
    return `${base}/auth?utm_source=nurture&utm_medium=${streamType}&utm_campaign=${brand.exam}`;
  }
  return `${base}/?utm_source=nurture&utm_medium=${streamType}&utm_campaign=${brand.exam}`;
}

// ===== process-nurture-streams =====
  stepsForStream,
  campaignId,
  maintenanceIntervalDays,
  maintenanceStepFor,
  type NurtureStep,
} from "../_shared/nurture/sequences.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function stepDueAt(enrolledAt: Date, step: NurtureStep): Date {
  return new Date(enrolledAt.getTime() + step.delayDays * 24 * 60 * 60 * 1000);
}

async function resolveWeaknessHint(
  supabase: ReturnType<typeof createClient>,
  email: string,
): Promise<string> {
  const lower = email.toLowerCase();
  const { data: hub } = await supabase
    .from("valintakoe_hub_leads")
    .select("pain_key")
    .eq("email", lower)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (hub?.pain_key) return weaknessHintFromPain(hub.pain_key);

  const { data: mkt } = await supabase
    .from("marketing_leads")
    .select("metadata")
    .eq("email", lower)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const meta = (mkt?.metadata ?? {}) as Record<string, unknown>;
  const pain = (meta.pain_key as string) || (meta.weakness as string) || null;
  return weaknessHintFromPain(pain);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const now = new Date();
  const results = { processed: 0, sent: 0, skipped: 0, exited: 0, errors: 0 };

  const { data: due, error: queryErr } = await supabase
    .from("active_nurture_streams")
    .select("*")
    .eq("status", "active")
    .lte("next_send_at", now.toISOString())
    .order("next_send_at", { ascending: true })
    .limit(50);

  if (queryErr) {
    console.error("Query failed", queryErr);
    return new Response(JSON.stringify({ error: "query_failed" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Cache auth users once per cron run
  const { data: allUsersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const usersByEmail = new Map(
    (allUsersData?.users ?? [])
      .filter((u) => u.email)
      .map((u) => [u.email!.toLowerCase(), u]),
  );

  for (const row of due ?? []) {
    results.processed++;
    const { email, exam, stream_type: streamType, current_step_index: curIdx, id } = row;
    const enrolledAt = new Date(row.enrolled_at);

    const eligibility = await canSendNurture(supabase, email, exam);
    if (!eligibility.ok) {
      const status = eligibility.reason === "customer" ? "exited_by_purchase" : "unsubscribed";
      await supabase
        .from("active_nurture_streams")
        .update({ status, updated_at: now.toISOString() })
        .eq("id", id);
      results.exited++;
      continue;
    }

    const brand = getNurtureBrand(exam);
    let stepIndex = curIdx + 1;
    let step: NurtureStep;

    if (streamType === "maintenance") {
      step = maintenanceStepFor(exam, stepIndex);
    } else if (streamType === "passive") {
      const user = usersByEmail.get(email.toLowerCase());
      let lastLogin: Date | null = null;
      if (user?.id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("last_login_at")
          .eq("user_id", user.id)
          .maybeSingle();
        if (prof?.last_login_at) lastLogin = new Date(prof.last_login_at);
      }
      const daysSince = lastLogin
        ? (now.getTime() - lastLogin.getTime()) / (24 * 60 * 60 * 1000)
        : 999;
      step =
        daysSince > 45
          ? { template: "T2_SMALL_STEP", delayDays: 0 }
          : { template: "T3_DELETE_PLAN", delayDays: 0 };
      stepIndex = curIdx + 1;
    } else {
      const steps = stepsForStream(streamType, exam);
      if (stepIndex >= steps.length) {
        await supabase
          .from("active_nurture_streams")
          .update({ status: "completed", updated_at: now.toISOString() })
          .eq("id", id);
        await enrollMaintenance(supabase, email, exam, maintenanceIntervalDays());
        continue;
      }
      step = steps[stepIndex];
      const dueAt = stepDueAt(enrolledAt, step);
      if (dueAt > now) {
        await supabase
          .from("active_nurture_streams")
          .update({ next_send_at: dueAt.toISOString(), updated_at: now.toISOString() })
          .eq("id", id);
        results.skipped++;
        continue;
      }
    }

    const campId = campaignId(exam, streamType, stepIndex);

    // Idempotenssi
    const { data: existingLog } = await supabase
      .from("nurture_log")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("campaign_id_text", campId)
      .maybeSingle();

    if (existingLog) {
      results.skipped++;
      const steps = stepsForStream(streamType, exam);
      const nextIdx = stepIndex + 1;
      let nextSend: string;
      if (streamType === "maintenance" || streamType === "passive") {
        nextSend = new Date(now.getTime() + maintenanceIntervalDays() * 24 * 60 * 60 * 1000).toISOString();
      } else if (nextIdx >= steps.length) {
        await supabase
          .from("active_nurture_streams")
          .update({ status: "completed", current_step_index: stepIndex, updated_at: now.toISOString() })
          .eq("id", id);
        await enrollMaintenance(supabase, email, exam, maintenanceIntervalDays());
        continue;
      } else {
        nextSend = stepDueAt(enrolledAt, steps[nextIdx]).toISOString();
      }
      await supabase
        .from("active_nurture_streams")
        .update({
          current_step_index: stepIndex,
          next_send_at: nextSend,
          updated_at: now.toISOString(),
        })
        .eq("id", id);
      continue;
    }

    // Hae etunimi
    let firstName: string | null = null;
    const user = usersByEmail.get(email.toLowerCase());
    if (user?.id) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("user_id", user.id)
        .maybeSingle();
      firstName = prof?.first_name ?? user.user_metadata?.first_name ?? null;
    }

    const weaknessHint =
      exam.toLowerCase() === "f" && streamType === "B" && step.template === "T4_UNREAD"
        ? await resolveWeaknessHint(supabase, email)
        : null;

    const unsubLink = await unsubscribeUrl(email, exam, brand.siteUrl);
    const ctaUrl = await ctaUrlForStep(brand, streamType, step, email);
    const rendered = renderNurtureEmail({
      email,
      firstName,
      brand,
      step,
      streamType,
      unsubscribeUrl: unsubLink,
      ctaUrl,
      weaknessHint,
    });

    const streamSteps = stepsForStream(streamType, exam);
    const stepTotal =
      streamType === "maintenance" && exam.toLowerCase() === "f"
        ? streamSteps.length
        : streamSteps.length;
    const routed = applyNurtureTestRouting(email, {
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    }, {
      exam,
      siteName: brand.siteName,
      streamType,
      stepIndex: stepIndex,
      stepTotal,
    });

    const emailParams = {
      to: routed.to,
      from: fromHeader(brand),
      subject: routed.subject,
      html: routed.html,
      text: routed.text,
      label: `nurture_${campId}`,
      idempotencyKey: campId,
      unsubscribeUrl: await unsubscribeApiUrl(email, exam),
    };

    const sendResult = await enqueueNurtureEmail(supabase, emailParams);
    if (!sendResult.ok) {
      results.errors++;
      continue;
    }

    if (!routed.isTestMode) {
      await mirrorToTestInbox(supabase, emailParams, email, {
        exam,
        siteName: brand.siteName,
        streamType,
        stepIndex: stepIndex,
        stepTotal,
      });
    }

    await supabase.from("nurture_log").insert({
      email: email.toLowerCase(),
      exam: exam.toLowerCase(),
      step: stepIndex,
      campaign_id_text: campId,
      sent_at: now.toISOString(),
    });

    results.sent++;

    const steps = stepsForStream(streamType, exam);
    const nextIdx = stepIndex + 1;
    let nextSend: string;
    let newStatus = "active";

    if (streamType === "maintenance" || streamType === "passive") {
      nextSend = new Date(now.getTime() + maintenanceIntervalDays() * 24 * 60 * 60 * 1000).toISOString();
    } else if (nextIdx >= steps.length) {
      newStatus = "completed";
      nextSend = now.toISOString();
    } else {
      nextSend = stepDueAt(enrolledAt, steps[nextIdx]).toISOString();
    }

    await supabase
      .from("active_nurture_streams")
      .update({
        current_step_index: stepIndex,
        last_sent_at: now.toISOString(),
        next_send_at: nextSend,
        status: newStatus,
        updated_at: now.toISOString(),
      })
      .eq("id", id);

    if (newStatus === "completed") {
      await enrollMaintenance(supabase, email, exam, maintenanceIntervalDays());
    }
  }

  return new Response(JSON.stringify({ ok: true, ...results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
