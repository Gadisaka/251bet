import DesktopCategoryTiles from "./DesktopCategoryTiles";
import DesktopHero from "./DesktopHero";
import DesktopMultiples from "./DesktopMultiples";
import DesktopSuggestedBets from "./DesktopSuggestedBets";
import DesktopTrending from "./DesktopTrending";
import DesktopUpcoming from "./DesktopUpcoming";
import MatchesPagination from "../../common/MatchesPagination";

function DesktopHome({
  upcomingRef,
  suggestedMatches = [],
  allMatches = [],
  sports = [],
  markets = [],
  selectedSportId,
  selectedTimeId,
  selectedMarketId,
  onSportChange,
  onTimeChange,
  onMarketChange,
  onScrollUpcoming,
  matches = [],
  onMatchClick,
  onOddsClick,
  selectedOdds,
  expandedMatchId,
  oddsDetailByFixtureId,
  onLoadTicket,
  matchesPage = 1,
  matchesTotalPages = 1,
  onMatchesPageChange,
}) {
  return (
    <div className="w-full px-4 pb-12 pt-4 lg:px-6">
      <DesktopHero />
      <DesktopCategoryTiles
        onSelectSport={onSportChange}
        onScrollUpcoming={onScrollUpcoming}
      />
      <DesktopSuggestedBets
        matches={suggestedMatches}
        onOddsClick={onOddsClick}
        selectedOdds={selectedOdds}
      />
      <DesktopMultiples
        matches={allMatches}
        onLoadTicket={onLoadTicket}
      />
      <div ref={upcomingRef}>
        <DesktopUpcoming
          sports={sports}
          markets={markets}
          selectedSportId={selectedSportId}
          selectedTimeId={selectedTimeId}
          selectedMarketId={selectedMarketId}
          onSportChange={onSportChange}
          onTimeChange={onTimeChange}
          onMarketChange={onMarketChange}
          matches={matches}
          onMatchClick={onMatchClick}
          onOddsClick={onOddsClick}
          selectedOdds={selectedOdds}
          expandedMatchId={expandedMatchId}
          oddsDetailByFixtureId={oddsDetailByFixtureId}
        />
        <MatchesPagination
          page={matchesPage}
          totalPages={matchesTotalPages}
          onPageChange={onMatchesPageChange}
        />
      </div>
      <DesktopTrending />
    </div>
  );
}

export default DesktopHome;
