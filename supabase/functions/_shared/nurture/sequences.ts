/** Nurture-sekvenssit: Stream B (liidit) ja Stream C (ilmaiskäyttäjät). */

export type TemplateKey =
  | "T1_HOT_DEAL"
  | "T2_SMALL_STEP"
  | "T3_DELETE_PLAN"
  | "T4_UNREAD"
  | "T5_PAIN"
  | "T6_FAQ"
  | "M1_CUTOFF"
  | "M2_GAP_YEAR"
  | "M3_PROBABILITY";

export type NurtureStep = {
  template: TemplateKey;
  /** Päiviä enrollmentista (Stream B/C). */
  delayDays: number;
  /** Alennus % HOT DEAL -viestissä (vain T1). */
  discountPct?: number;
  discountReason?: string;
};

/** Stream B: 6 viestiä, 28 pv. */
export const STREAM_B_STEPS: NurtureStep[] = [
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
export const STREAM_C_STEPS: NurtureStep[] = [
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
export const MAINTENANCE_F_STEPS: NurtureStep[] = [
  { template: "M1_CUTOFF", delayDays: 0 },
  { template: "M2_GAP_YEAR", delayDays: 0 },
  { template: "M3_PROBABILITY", delayDays: 0 },
];

/** Ylläpito: off-season 21 pv, sesonki (tammi–huhti) 12 pv. */
export const MAINTENANCE_OFF_SEASON_DAYS = 21;
export const MAINTENANCE_SEASON_DAYS = 12;

/** Aalto / kauppatieteet -referenssipisteraja (oikeat vastaukset %). */
export const F_AALTO_CUTOFF_PCT = 70;

export function isExamSeason(): boolean {
  const month = new Date().getMonth() + 1; // 1–12
  return month >= 1 && month <= 4;
}

export function maintenanceIntervalDays(): number {
  return isExamSeason() ? MAINTENANCE_SEASON_DAYS : MAINTENANCE_OFF_SEASON_DAYS;
}

export function stepsForStream(streamType: string, exam?: string): NurtureStep[] {
  if (streamType === "B") return STREAM_B_STEPS;
  if (streamType === "C") return STREAM_C_STEPS;
  if (streamType === "maintenance" && (exam ?? "").toLowerCase() === "f") {
    return MAINTENANCE_F_STEPS;
  }
  return [{ template: "T2_SMALL_STEP", delayDays: 0 }];
}

/** Valitse maintenance-template: F kiertää 3 viestiä, muut käyttävät FAQ:ta. */
export function maintenanceStepFor(exam: string, stepIndex: number): NurtureStep {
  if (exam.toLowerCase() === "f") {
    const steps = MAINTENANCE_F_STEPS;
    return steps[((stepIndex % steps.length) + steps.length) % steps.length];
  }
  return { template: "T6_FAQ", delayDays: 0 };
}

export function campaignId(exam: string, streamType: string, stepIndex: number): string {
  return `${exam.toLowerCase()}_${streamType}_step_${stepIndex}`;
}

export function nextSendAtFromEnrollment(
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

export function dueStepIndex(enrolledAt: Date, streamType: string, now = new Date()): number {
  const steps = stepsForStream(streamType);
  let due = -1;
  for (let i = 0; i < steps.length; i++) {
    const dueAt = enrolledAt.getTime() + steps[i].delayDays * 24 * 60 * 60 * 1000;
    if (dueAt <= now.getTime()) due = i;
  }
  return due;
}
