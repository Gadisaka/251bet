import AppIcon from "../../common/AppIcon";
import MatchesTable from "../../sections/MatchesTable";
import { MINUTE_BUCKET_IDS } from "../../../utils/sportsbookTimeOptions.js";
import { useTranslation } from "../../../i18n/LanguageContext.jsx";

function DesktopUpcoming({
  sports = [],
  markets = [],
  selectedSportId,
  selectedTimeId,
  selectedMarketId,
  onSportChange,
  onTimeChange,
  onMarketChange,
  matches = [],
  onMatchClick,
  onOddsClick,
  selectedOdds,
  expandedMatchId,
  oddsDetailByFixtureId,
  onMore,
}) {
  const { t } = useTranslation();

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="m-0 text-[15px] font-semibold uppercase tracking-wide text-white">
          {t("home.upcomingMatches")}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {MINUTE_BUCKET_IDS.map((bucket) => {
              const active = bucket.id === selectedTimeId;
              return (
                <button
                  key={bucket.id}
                  type="button"
                  onClick={() => onTimeChange?.(active ? "all" : bucket.id)}
                  className={`h-8 cursor-pointer rounded-md border-0 px-3 text-[11px] font-bold ${
                    active
                      ? "bg-white text-[#111]"
                      : "bg-(--sb-bg-card) text-(--sb-text-muted) hover:text-white"
                  }`}
                >
                  {bucket.label}
                </button>
              );
            })}
          </div>
          {onMore ? (
            <button
              type="button"
              onClick={onMore}
              className="inline-flex cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 text-[12px] text-(--sb-text-muted) hover:text-white"
            >
              {t("common.more")}
              <AppIcon name="chevronRight" size={13} />
            </button>
          ) : null}
        </div>
      </div>

      {sports.length > 0 ? (
        <div className="mb-3 flex items-stretch gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sports.map((sport) => {
            const active = sport.id === selectedSportId;
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => onSportChange?.(sport.id)}
                className={`relative flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-md border-0 ${
                  active
                    ? "bg-(--sb-accent-fill) text-[#111]"
                    : "bg-(--sb-bg-card) text-(--sb-text-muted) hover:text-white"
                }`}
              >
                <AppIcon name={sport.icon} size={20} />
                {sport.count > 0 ? (
                  <span
                    className={`absolute right-1 top-0.5 text-[9px] font-bold ${
                      active ? "text-[#111]" : "text-white/80"
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
        <div className="mb-0 flex items-center justify-between border-b border-(--sb-border) bg-(--sb-bg-card) px-3">
          <div className="flex items-stretch">
            {markets.map((market) => {
              const active = market.id === selectedMarketId;
              return (
                <button
                  key={market.id}
                  type="button"
                  onClick={() => onMarketChange?.(market.id)}
                  className={`h-9 cursor-pointer border-0 bg-transparent px-2 text-[12px] font-medium ${
                    active ? "text-white" : "text-(--sb-text-muted) hover:text-white"
                  }`}
                >
                  {market.label}
                  {active ? (
                    <AppIcon name="chevronDown" size={12} className="ml-1" />
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="flex gap-7 pr-2 text-[11px] font-bold uppercase text-(--sb-text-muted)">
            {(
              markets.find((market) => market.id === selectedMarketId)
                ?.selections || ["1", "2"]
            )
              .filter((id) => {
                if (id !== "x") return true;
                return !["tennis", "table-tennis", "basketball", "volleyball"].includes(
                  selectedSportId,
                );
              })
              .map((id) => (
                <span key={id}>
                  {id === "1" ? "W1" : id === "2" ? "W2" : id.toUpperCase()}
                </span>
              ))}
          </div>
        </div>
      ) : null}

      <MatchesTable
        matches={matches}
        onMatchClick={onMatchClick}
        onOddsClick={onOddsClick}
        selectedOdds={selectedOdds}
        expandedMatchId={expandedMatchId}
        oddsDetailByFixtureId={oddsDetailByFixtureId}
        marketTabId={selectedMarketId}
        variant="desktop"
      />
    </section>
  );
}

export default DesktopUpcoming;
