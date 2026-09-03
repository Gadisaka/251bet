import AppIcon from "../common/AppIcon";
import LogoImg, { LogoSlot } from "../common/LogoImg";
import { resolveCompactMarketToken } from "../../utils/compactMarketToken";
import { useTranslation } from "../../i18n/LanguageContext.jsx";
import {
  formatKickoffTime,
  formatLeagueLabel,
  groupMatchesByDate,
  marketMapFromMatch,
  splitMatchTeams,
} from "./sportMatchUtils";

function OddButton({ value, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!value}
      className={`flex h-8 min-w-[52px] cursor-pointer items-center justify-center rounded-sm border-0 px-1.5 text-[12px] font-bold disabled:cursor-default ${
        selected
          ? "bg-(--sb-accent-fill) text-[#111]"
          : "bg-[#111111] text-(--sb-odds) hover:bg-[#1c1c1c]"
      }`}
    >
      {value ?? "-"}
    </button>
  );
}

function SportEventMatchList({
  leagueLabel,
  matches = [],
  selectedMatchId,
  onSelectMatch,
  onOddsClick,
  selectedOdds,
  loading = false,
  showOdds = true,
}) {
  const { t } = useTranslation();
  const groups = groupMatchesByDate(matches);
  const headerLabel = leagueLabel
    ? formatLeagueLabel(leagueLabel)
    : t("sport.eventView");

  return (
    <section className="sb-card flex min-h-[70vh] flex-col overflow-hidden lg:h-full lg:min-h-0">
      <header className="flex shrink-0 items-center gap-2 border-b border-(--sb-border) bg-[#1a1a1a] px-3 py-2">
        <AppIcon name="star" size={14} className="text-(--sb-text-muted)" />
        <h2 className="m-0 min-w-0 flex-1 truncate text-[13px] font-bold text-white">
          {headerLabel}
        </h2>
        <span className="shrink-0 text-[11px] font-bold text-(--sb-text-muted)">
          {matches.length}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <p className="m-0 px-3 py-10 text-center text-[12px] text-(--sb-text-muted)">
            {t("article.loading")}
          </p>
        ) : null}
        {!loading && matches.length === 0 ? (
          <p className="m-0 px-3 py-10 text-center text-[12px] text-(--sb-text-muted)">
            {t("sport.noMatches")}
          </p>
        ) : null}
        {groups.map((group) => (
          <div key={group.date}>
            <div className="bg-[#111111] px-3 py-1.5 text-[11px] font-bold text-(--sb-text-muted)">
              {group.date}
            </div>
            {group.matches.map((match) => {
              const { home, away } = splitMatchTeams(match.match);
              const selected = match.id === selectedMatchId;
              const marketMap = marketMapFromMatch(match);
              const selections = ["1", "x", "2"].filter(
                (id) => id !== "x" || marketMap.x != null,
              );
              const emitOdd = (event, marketId, value) => {
                event.stopPropagation();
                if (!value) return;
                const selectionId = `${match.match}-${marketId.toUpperCase()}`;
                onOddsClick?.({
                  id: selectionId,
                  apiFixtureId: match.apiFixtureId,
                  matchName: match.match,
                  league: match.league,
                  ...resolveCompactMarketToken(marketId),
                  value,
                  kickoffAt: match.kickoffAt,
                  matchStatus: match.status,
                  fromLive: Boolean(match.liveStatus),
                });
              };

              return (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => onSelectMatch?.(match)}
                  className={`flex w-full cursor-pointer items-center gap-2 border-0 border-b border-(--sb-border) px-2.5 py-2 text-left ${
                    selected
                      ? "bg-(--sb-accent-surface)"
                      : "bg-transparent hover:bg-[#151515]"
                  }`}
                >
                  <span className="w-11 shrink-0 text-[11px] font-semibold text-(--sb-text-muted)">
                    {formatKickoffTime(match.kickoffAt, match.date)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <LogoSlot src={match.homeTeamLogo} alt="" size={14} />
                      <span className="min-w-0 truncate text-[12px] font-medium text-white">
                        {home}
                      </span>
                    </span>
                    <span className="mt-0.5 flex min-w-0 items-center gap-1.5">
                      <LogoSlot src={match.awayTeamLogo} alt="" size={14} />
                      <span className="min-w-0 truncate text-[12px] font-medium text-white">
                        {away}
                      </span>
                    </span>
                  </span>
                  {showOdds ? (
                    <span className="hidden items-center gap-1 sm:flex">
                      {selections.map((marketId) => {
                        const value = marketMap[marketId];
                        const selectionId = `${match.match}-${marketId.toUpperCase()}`;
                        return (
                          <OddButton
                            key={`${match.id}-${marketId}`}
                            value={value}
                            selected={selectedOdds?.has(selectionId)}
                            onClick={(event) => emitOdd(event, marketId, value)}
                          />
                        );
                      })}
                    </span>
                  ) : null}
                  <span className="hidden shrink-0 text-[10px] font-bold text-(--sb-text-muted) sm:inline">
                    +{match.sideBets ?? 0}
                  </span>
                  <AppIcon
                    name="chevronRight"
                    size={14}
                    className="shrink-0 text-(--sb-text-muted)"
                  />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

export default SportEventMatchList;
