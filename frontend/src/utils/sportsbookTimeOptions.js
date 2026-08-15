import {
  dateFromEatAnchorYmd,
  getEatWeekdayIndex,
  sportsbookAnchorAtOffset,
  SPORTSBOOK_TIMEZONE,
} from "./sportsbookDay.js";

const HOUR_BUCKET_IDS = [
  { id: "all", label: "All", labelKey: "time.all" },
  { id: "3h", label: "3 hours", labelKey: "time.hour3h" },
  { id: "6h", label: "6 hours", labelKey: "time.hour6h" },
  { id: "12h", label: "12 hours", labelKey: "time.hour12h" },
  { id: "24h", label: "24 hours", labelKey: "time.hour24h" },
  { id: "48h", label: "48 hours", labelKey: "time.hour48h" },
  { id: "72h", label: "72 hours", labelKey: "time.hour72h" },
];

/**
 * Kickoff windows for the segmented control above the upcoming list. Selecting
 * the active segment again clears back to `all`, so no fixture is unreachable.
 */
export const MINUTE_BUCKET_IDS = Object.freeze([
  { id: "0-15m", label: "0-15M", minFrom: 0, minTo: 15 },
  { id: "15-30m", label: "15-30M", minFrom: 15, minTo: 30 },
  { id: "30-60m", label: "30-60M", minFrom: 30, minTo: 60 },
]);

/** @type {readonly string[]} */
const WEEKDAY_KEY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/**
 * i18n path for calendar-day tabs (`time.today`, `time.tomorrow`, `days.mon`, …).
 * Offsets 2–8 use short weekday; other offsets return null (use generated `label`).
 *
 * @param {number} offset
 * @param {string} anchorYmd — sportsbook anchor date in EAT (`YYYY-MM-DD`)
 * @returns {string | null}
 */
export function timeOptionLabelKey(offset, anchorYmd) {
  const o = Number(offset);
  if (o === 0) return "time.today";
  if (o === 1) return "time.tomorrow";
  if (o >= 2 && o <= 8 && anchorYmd) {
    const d = getEatWeekdayIndex(anchorYmd);
    const key = WEEKDAY_KEY[d];
    return key ? `days.${key}` : null;
  }
  return null;
}

/** Calendar-day tab ids for offsets `0 .. windowDays - 1` (aligned with prematch horizon). */
export function buildDayTimeIds(windowDays = 14) {
  const safe = Math.min(Math.max(Number(windowDays) || 14, 2), 31);
  const ids = [];
  for (let offset = 0; offset < safe; offset += 1) {
    const id = dayOffsetToTimeId(offset);
    if (id) ids.push(id);
  }
  return ids;
}

/**
 * Labels for sportsbook-day offsets: Today / Tomorrow; offsets 2–8 short weekday;
 * offset ≥ 9 lowercase short month + day (e.g. `apr 4`).
 *
 * @param {string} anchorYmd — sportsbook anchor date in EAT
 * @param {number} offset — 0-based offset from current sportsbook day
 */
export function calendarDayTabLabel(anchorYmd, offset) {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  const d = dateFromEatAnchorYmd(anchorYmd);
  if (offset >= 2 && offset <= 8) {
    return d.toLocaleDateString("en-GB", {
      timeZone: SPORTSBOOK_TIMEZONE,
      weekday: "short",
    });
  }
  return d
    .toLocaleDateString("en-GB", {
      timeZone: SPORTSBOOK_TIMEZONE,
      month: "short",
      day: "numeric",
    })
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * @param {Date} [now] — optional fixed date for testing
 * @param {number} [windowDays] — sportsbook offsets 0..windowDays-1 (default 14)
 */
export function buildSportsbookTimeOptions(now = new Date(), windowDays = 14) {
  const safe = Math.min(Math.max(Number(windowDays) || 14, 2), 31);
  /** @type {{ id: string, label: string, labelKey: string | null }[]} */
  const dayParts = [];
  for (let offset = 0; offset < safe; offset += 1) {
    const id = dayOffsetToTimeId(offset);
    if (!id) continue;
    const anchorYmd = sportsbookAnchorAtOffset(offset, now);
    const label = calendarDayTabLabel(anchorYmd, offset);
    dayParts.push({
      id,
      label,
      labelKey: timeOptionLabelKey(offset, anchorYmd),
    });
  }

  const today = dayParts.find((d) => d.id === "today");
  const restDays = dayParts.filter((d) => d.id !== "today");
  return [
    HOUR_BUCKET_IDS[0],
    ...(today ? [today] : []),
    ...HOUR_BUCKET_IDS.slice(1),
    ...restDays,
  ];
}

/** Map calendar offset to stable time ids (`today`, `tomorrow`, `day2`, …). */
export function dayOffsetToTimeId(offset) {
  const o = Number(offset);
  if (o === 0) return "today";
  if (o === 1) return "tomorrow";
  if (o >= 2 && Number.isFinite(o)) return `day${o}`;
  return null;
}

/** Inverse of calendar tabs only — hour buckets (`1h`, …) return null. */
export function calendarTimeIdToUtcDayOffset(timeId) {
  const tid = String(timeId || "");
  if (tid === "today") return 0;
  if (tid === "tomorrow") return 1;
  const m = /^day(\d+)$/i.exec(tid);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Next calendar tab id within `horizonDays` window (last day wraps to `today`).
 * Returns `null` for hour buckets and non-calendar ids.
 *
 * @param {string} timeId
 * @param {number} [horizonDays]
 * @returns {string | null}
 */
export function getNextCalendarDayTimeId(timeId, horizonDays = 14) {
  const off = calendarTimeIdToUtcDayOffset(timeId);
  if (off === null) return null;
  const safe = Math.min(Math.max(Number(horizonDays) || 14, 2), 31);
  const maxOff = safe - 1;
  const nextOff = off >= maxOff ? 0 : off + 1;
  return dayOffsetToTimeId(nextOff);
}
