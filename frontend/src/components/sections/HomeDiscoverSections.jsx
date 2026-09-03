import AppIcon from "../common/AppIcon";
import SectionHeader from "../common/SectionHeader";
import MatchesTable from "./MatchesTable";
import DesktopMultiples from "../home/desktop/DesktopMultiples";
import { sportAccentColor } from "../../utils/sportsbookDisplay";
import { useTranslation } from "../../i18n/LanguageContext.jsx";
import { mockMultipleOfTheDay } from "../../data/mockSportsbook";

/** Centered muted copy used wherever a section has nothing to show. */
function EmptyState({ children }) {
  return (
    <p className="m-0 px-3 py-10 text-center text-[12px] text-(--sb-text-muted)">
      {children}
    </p>
  );
}

function LiveMatchRow({ match }) {
  const minute = match.liveMinute ? `${match.liveMinute}'` : "";
  return (
    <div className="flex items-center gap-2 border-b border-(--sb-border) bg-(--sb-bg-card) px-2.5 py-1.5">
      <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--sb-live)" />
      <span className="shrink-0 text-[10px] font-medium text-(--sb-text-muted)">
        {match.livePeriod || "1st Half"} | {match.homeScore ?? 0} :{" "}
        {match.awayScore ?? 0} {minute}
      </span>
      <span className="min-w-0 flex-1 truncate text-[11px] text-white">
        {match.match}
      </span>
      <AppIcon name="star" size={12} className="shrink-0 text-(--sb-text-muted)" />
      <span className="shrink-0 text-[10px] font-bold text-(--sb-text-muted)">
        +{match.sideBets ?? 0}
      </span>
    </div>
  );
}

/**
 * The stacked home blocks above the upcoming list: Suggested Bets, Popular
 * Matches, Multiple Of The Day, and a Live preview with its own market select.
 */
function HomeDiscoverSections({
  popularMatches = [],
  liveMatches = [],
  onMoreLive,
  onMorePopular,
  onOddsClick,
  selectedOdds,
  onLoadTicket,
}) {
  const { t } = useTranslation();
  const liveHead = liveMatches[0];

  return (
    <div className="flex flex-col">
      <section>
        <SectionHeader title={t("home.suggestedBets")} />
        <EmptyState>{t("home.noFeaturedGames")}</EmptyState>
      </section>

      <section>
        <SectionHeader title={t("home.popularMatches")} onMore={onMorePopular} />
        {popularMatches.length === 0 ? (
          <EmptyState>{t("home.noMatches")}</EmptyState>
        ) : (
          <MatchesTable
            matches={popularMatches}
            onOddsClick={onOddsClick}
            selectedOdds={selectedOdds}
          />
        )}
      </section>

      <DesktopMultiples
        tickets={mockMultipleOfTheDay}
        onLoadTicket={onLoadTicket}
      />

      <section>
        <SectionHeader title={t("home.live")} onMore={onMoreLive} />
        <div className="flex h-8 items-center justify-between border-y border-(--sb-border) bg-(--sb-bg-card) px-2.5 text-[11px] font-medium text-white">
          WINNER
          <AppIcon name="chevronDown" size={14} />
        </div>
        {liveMatches.length === 0 ? (
          <EmptyState>{t("home.noMatches")}</EmptyState>
        ) : (
          <>
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 text-[12px] font-bold text-white"
              style={{ background: sportAccentColor(liveHead?.sportId) }}
            >
              <AppIcon name="circleDot" size={13} />
              <span className="min-w-0 flex-1 truncate">
                {liveHead?.sportName || "Football"}
              </span>
              <AppIcon name="chevronUp" size={14} />
            </div>
            {liveMatches.slice(0, 6).map((match) => (
              <LiveMatchRow key={match.id} match={match} />
            ))}
          </>
        )}
      </section>
    </div>
  );
}

export default HomeDiscoverSections;
