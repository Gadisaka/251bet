import {
  dateFromEatAnchorYmd,
  sportsbookAnchorAtOffset,
  SPORTSBOOK_TIMEZONE,
} from "../../utils/sportsbookDay.js";
import { dayOffsetToTimeId } from "../../utils/sportsbookTimeOptions.js";

function formatPillLabel(anchorYmd) {
  const d = dateFromEatAnchorYmd(anchorYmd);
  const datePart = d.toLocaleDateString("en-GB", {
    timeZone: SPORTSBOOK_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
  });
  const weekday = d
    .toLocaleDateString("en-GB", {
      timeZone: SPORTSBOOK_TIMEZONE,
      weekday: "short",
    })
    .toUpperCase();
  return `${datePart.replace(/\//g, ".")} ${weekday}`;
}

export function buildCalendarDatePills(days = 7, now = new Date()) {
  const count = Math.min(Math.max(Number(days) || 7, 1), 14);
  const pills = [];
  for (let offset = 0; offset < count; offset += 1) {
    const id = dayOffsetToTimeId(offset);
    if (!id) continue;
    const anchorYmd = sportsbookAnchorAtOffset(offset, now);
    pills.push({
      id,
      label: formatPillLabel(anchorYmd),
    });
  }
  return pills;
}

function SportCalendarDates({ selectedTimeId, onSelect, days = 7 }) {
  const pills = buildCalendarDatePills(days);

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-1 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {pills.map((pill) => {
        const active = pill.id === selectedTimeId;
        return (
          <button
            key={pill.id}
            type="button"
            onClick={() => onSelect?.(pill.id)}
            className={`h-10 shrink-0 cursor-pointer rounded-md border px-3 text-[12px] font-bold uppercase tracking-wide ${
              active
                ? "border-white bg-[#1a1a1a] text-white"
                : "border-transparent bg-[#141414] text-(--sb-text-muted) hover:text-white"
            }`}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}

export default SportCalendarDates;
