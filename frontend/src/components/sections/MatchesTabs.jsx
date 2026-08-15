import AppIcon from "../common/AppIcon";
import SectionHeader from "../common/SectionHeader";
import { MINUTE_BUCKET_IDS } from "../../utils/sportsbookTimeOptions.js";
import { useTranslation } from "../../i18n/LanguageContext.jsx";

/**
 * Filter stack above the upcoming list: kickoff-window segments, sport tiles
 * with counts, then the market strip. League selection moved to the leagues
 * sheet, so only club search remains from the old chip rows.
 */
function MatchesTabs({
  sports = [],
  markets = [],
  selectedSportId,
  selectedTimeId,
  selectedMarketId,
  onSportChange,
  onTimeChange,
  onMarketChange,
  searchQuery = "",
  onSearchChange,
}) {
  const { t } = useTranslation();

  return (
    <section className="bg-(--sb-bg-page)">
      <SectionHeader title={t("home.upcomingMatches")} />

      <div className="flex items-stretch gap-1.5 px-2 pb-2">
        {MINUTE_BUCKET_IDS.map((bucket) => {
          const active = bucket.id === selectedTimeId;
          return (
            <button
              key={bucket.id}
              type="button"
              onClick={() => onTimeChange?.(active ? "all" : bucket.id)}
              className={`h-8 min-w-0 flex-1 cursor-pointer rounded-sm border bg-(--sb-bg-card) text-[11px] font-bold ${
                active
                  ? "border-white text-white"
                  : "border-(--sb-border) text-(--sb-text-muted) hover:text-white"
              }`}
            >
              {bucket.label}
            </button>
          );
        })}
      </div>

      {sports.length > 0 ? (
        <div className="flex items-stretch gap-1.5 overflow-x-auto px-2 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sports.map((sport) => {
            const active = sport.id === selectedSportId;
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => onSportChange?.(sport.id)}
                className={`relative flex h-14 w-[70px] shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border-0 px-1 ${
                  active
                    ? "bg-(--sb-sport-football) text-white"
                    : "bg-(--sb-bg-card) text-(--sb-text-muted) hover:text-white"
                }`}
              >
                <AppIcon name={sport.icon} size={18} />
                <span className="max-w-full truncate text-[9px] font-medium">
                  {sport.label}
                </span>
                {sport.count > 0 ? (
                  <span
                    className={`absolute right-1.5 top-1 text-[9px] font-bold ${
                      active ? "text-white" : "text-(--sb-accent-fill)"
                    }`}
                  >
                    {sport.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {markets.length > 0 ? (
        <div className="flex items-stretch overflow-x-auto border-b border-(--sb-border) [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {markets.map((market) => {
            const active = market.id === selectedMarketId;
            return (
              <button
                key={market.id}
                type="button"
                onClick={() => onMarketChange?.(market.id)}
                className={`h-8 shrink-0 cursor-pointer whitespace-nowrap border-0 border-b-2 bg-transparent px-3 text-[10px] font-bold uppercase tracking-wide ${
                  active
                    ? "border-white text-white"
                    : "border-transparent text-(--sb-text-muted) hover:text-white"
                }`}
              >
                {market.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="px-2 py-2">
        <div className="flex h-8 items-center rounded-sm bg-(--sb-bg-card) px-2.5 text-(--sb-text-muted)">
          <AppIcon name="search" size={13} className="mr-2 shrink-0" />
          <input
            id="club-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={t("sidebar.searchClubsPlaceholder")}
            className="min-w-0 flex-1 border-0 bg-transparent text-[12px] font-medium text-white placeholder:text-(--sb-text-muted) outline-none"
            aria-label={t("sidebar.searchClubsAria")}
          />
          {searchQuery ? (
            <button
              type="button"
              className="ml-1 shrink-0 cursor-pointer border-0 bg-transparent text-[10px] font-bold uppercase text-(--sb-accent-fill)"
              onClick={() => onSearchChange?.("")}
            >
              {t("common.clear")}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default MatchesTabs;
