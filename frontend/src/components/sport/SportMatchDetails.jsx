import { useEffect, useState } from "react";
import AppIcon from "../common/AppIcon";
import ExpansionMarketSection from "../common/ExpansionMarketSection";
import LogoImg from "../common/LogoImg";
import {
  MARKET_FILTER_ALL_CHIP_ID,
  MARKET_FILTER_CHIPS,
  filterCategoriesByChipId,
} from "../../data/footballMarketsByCategory";
import {
  getMarketDisplayName,
  sortMarketsByPriority,
  sortOddsWithinMarket,
} from "../../utils/marketDisplay";
import { useTranslation } from "../../i18n/LanguageContext.jsx";
import {
  formatKickoffDateTime,
  formatLeagueLabel,
  splitMatchTeams,
} from "./sportMatchUtils";

function SportMatchDetails({
  match,
  oddsReady = false,
  onOddsClick,
  selectedOdds,
  onBack,
}) {
  const { t } = useTranslation();
  const [activeChipId, setActiveChipId] = useState(MARKET_FILTER_ALL_CHIP_ID);

  useEffect(() => {
    setActiveChipId(MARKET_FILTER_ALL_CHIP_ID);
  }, [match?.id]);

  if (!match) {
    return (
      <section className="sb-card flex min-h-[50vh] items-center justify-center px-4 lg:h-full lg:min-h-0">
        <p className="m-0 text-center text-[12px] text-(--sb-text-muted)">
          {t("sport.selectMatch")}
        </p>
      </section>
    );
  }

  const split = splitMatchTeams(match.match);
  const home = match.homeTeam || split.home;
  const away = match.awayTeam || split.away;
  const detail = match.detailedOdds;
  const categories = [...(detail?.main || []), ...(detail?.extra || [])];
  const filteredCategories = filterCategoriesByChipId(categories, activeChipId);
  const showFilteredEmpty =
    activeChipId !== MARKET_FILTER_ALL_CHIP_ID &&
    filteredCategories.length === 0;
  const visibleCategories = sortMarketsByPriority(filteredCategories).map(
    (category) => ({
      ...category,
      odds: sortOddsWithinMarket(category.category, category.odds || []),
    }),
  );
  const fromLive = Boolean(match.liveStatus);
  const hasScore = match.homeScore != null && match.awayScore != null;

  return (
    <section className="sb-card flex min-h-[70vh] flex-col overflow-hidden lg:h-full lg:min-h-0">
      <header className="shrink-0 border-b border-(--sb-border) bg-[#111111]">
        <div className="flex items-center gap-2 px-3 py-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border-0 bg-[#1a1a1a] text-white lg:hidden"
              aria-label={t("sport.backToList")}
            >
              <AppIcon name="chevronLeft" size={14} />
            </button>
          ) : null}
          {match.countryFlag ? (
            <LogoImg
              src={match.countryFlag}
              alt=""
              size={16}
              rounded="rounded-[2px]"
            />
          ) : null}
          {match.leagueLogo ? (
            <LogoImg src={match.leagueLogo} alt="" size={18} />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] text-(--sb-text-muted)">
              {formatLeagueLabel(match.league)}
            </div>
            <div className="truncate text-[12px] font-bold text-white">
              {formatKickoffDateTime(match.kickoffAt, match.date)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 pb-3">
          <div className="flex min-w-0 flex-col items-center gap-1 text-center">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#1a1a1a]">
              {match.homeTeamLogo ? (
                <LogoImg
                  src={match.homeTeamLogo}
                  alt=""
                  size={40}
                  className="h-10 w-10 max-w-none rounded-full object-cover"
                  rounded="rounded-full"
                />
              ) : (
                <AppIcon name="flag" size={14} className="text-(--sb-text-muted)" />
              )}
            </div>
            <div className="w-full truncate text-[12px] font-semibold text-white">
              {home}
            </div>
            {hasScore ? (
              <div className="text-[15px] font-bold text-white">
                {match.homeScore}
              </div>
            ) : null}
          </div>
          <div className="text-[11px] font-bold tracking-wider text-(--sb-text-muted)">
            VS
          </div>
          <div className="flex min-w-0 flex-col items-center gap-1 text-center">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#1a1a1a]">
              {match.awayTeamLogo ? (
                <LogoImg
                  src={match.awayTeamLogo}
                  alt=""
                  size={40}
                  className="h-10 w-10 max-w-none rounded-full object-cover"
                  rounded="rounded-full"
                />
              ) : (
                <AppIcon name="flag" size={14} className="text-(--sb-text-muted)" />
              )}
            </div>
            <div className="w-full truncate text-[12px] font-semibold text-white">
              {away}
            </div>
            {hasScore ? (
              <div className="text-[15px] font-bold text-white">
                {match.awayScore}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-(--sb-border) px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MARKET_FILTER_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setActiveChipId(chip.id)}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
              chip.id === activeChipId
                ? "border-(--sb-accent) bg-(--sb-accent-surface) text-(--sb-accent-text-soft)"
                : "border-transparent bg-[#111111] text-(--sb-text-muted) hover:text-white"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5">
        {!oddsReady ? (
          <p className="m-0 px-3 py-10 text-center text-[12px] text-(--sb-text-muted)">
            {t("article.loading")}
          </p>
        ) : null}
        {oddsReady && categories.length === 0 ? (
          <p className="m-0 px-3 py-10 text-center text-[12px] text-(--sb-text-muted)">
            {t("sport.noMarkets")}
          </p>
        ) : null}
        {oddsReady && showFilteredEmpty ? (
          <p className="m-0 px-3 py-8 text-center text-[12px] text-(--sb-text-muted)">
            {t("sport.noMarkets")}
          </p>
        ) : null}
        {oddsReady && !showFilteredEmpty
          ? visibleCategories.map((category) => (
              <ExpansionMarketSection
                key={category.category}
                marketLabel={category.category}
                displayMarketLabel={getMarketDisplayName(category.category)}
                odds={category.odds}
                matchName={match.match}
                apiFixtureId={match.apiFixtureId}
                kickoffAt={match.kickoffAt}
                matchStatus={match.liveStatus ?? match.status}
                fromLive={fromLive}
                home={home}
                away={away}
                onOddsClick={onOddsClick}
                selectedOdds={selectedOdds}
              />
            ))
          : null}
      </div>
    </section>
  );
}

export default SportMatchDetails;
