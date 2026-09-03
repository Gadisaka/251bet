import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import MobileBottomBar from "../components/layout/MobileBottomBar";
import PageContainer from "../components/layout/PageContainer";
import PrimaryNav from "../components/layout/PrimaryNav";
import SiteFooter from "../components/layout/SiteFooter";
import TopHeader from "../components/layout/TopHeader";
import BetSlipPanel from "../components/sections/BetSlipPanel";
import MatchesTable from "../components/sections/MatchesTable";
import SportCalendarDates from "../components/sport/SportCalendarDates";
import SportEventMatchList from "../components/sport/SportEventMatchList";
import SportMatchDetails from "../components/sport/SportMatchDetails";
import SportSidebar from "../components/sport/SportSidebar";
import SportTabs from "../components/sport/SportTabs";
import { sportsbookToolbar, topNavItems } from "../data/homepageData";
import useMatches, { PREMATCH_HORIZON_DAYS } from "../hooks/useMatches";
import { useFootballSidebarCatalog } from "../hooks/useFootballSidebarCatalog";
import { useTranslation } from "../i18n/LanguageContext.jsx";
import {
  buildLeagueSidebarGroups,
  buildLeagueTabOptions,
} from "../utils/buildLeagueSidebarGroups";
import { buildSportsbookTimeOptions } from "../utils/sportsbookTimeOptions";
import {
  enrichSlipsFromMatches,
  loadBetSlipState,
  persistBetSlipState,
} from "../utils/betSlipPersistence";
import { pruneExpiredSlips } from "../utils/selectionExpiry";
import { normalizeApiFixtureId } from "../utils/fixtureId";
import { findMatchByFixtureId } from "../utils/openSlipSelectionOnHome";
import { matchesClubNameSearch } from "../utils/matchTimeUtils";
import { MATCH_MARKET_TABS } from "../utils/sportsbookDisplay";

const BET_SLIP_PRUNE_MS = 15_000;
const ALL_LEAGUES_ID = "all-leagues";

function isCalendarDayTimeId(id) {
  return (
    id === "today" || id === "tomorrow" || /^day\d+$/i.test(String(id || ""))
  );
}

function sortByKickoff(a, b) {
  const ka = a.kickoffAt ? new Date(a.kickoffAt).getTime() : 0;
  const kb = b.kickoffAt ? new Date(b.kickoffAt).getTime() : 0;
  return ka - kb || Number(a.apiFixtureId) - Number(b.apiFixtureId);
}

function Sport() {
  const { t } = useTranslation();
  const initialBet = loadBetSlipState();
  const location = useLocation();
  const navigate = useNavigate();
  const defaultSportId = sportsbookToolbar.sports?.[0]?.id || "football";

  const timeOptions = useMemo(
    () => buildSportsbookTimeOptions(undefined, PREMATCH_HORIZON_DAYS),
    [],
  );

  const [tab, setTab] = useState("event");
  const [catalogMode, setCatalogMode] = useState("prematch");
  const [selectedSportId, setSelectedSportId] = useState(defaultSportId);
  const [selectedTimeId, setSelectedTimeId] = useState("all");
  const [selectedLeagueId, setSelectedLeagueId] = useState(ALL_LEAGUES_ID);
  const [clubSearch, setClubSearch] = useState("");
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [mobileShowDetails, setMobileShowDetails] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [activeSlip, setActiveSlip] = useState(initialBet.activeSlip);
  const [slips, setSlips] = useState(initialBet.slips);
  const autoLeagueRef = useRef(false);

  const hookTimeId =
    tab === "calendar"
      ? isCalendarDayTimeId(selectedTimeId)
        ? selectedTimeId
        : "today"
      : catalogMode === "live"
        ? "all"
        : selectedTimeId;

  const {
    matches,
    allMatches,
    liveMatches,
    loading,
    error,
    refreshAll,
    hydrateMatchOdds,
    oddsDetailByFixtureId,
    resolvedTimeId,
    dateDropdownOptions,
  } = useMatches({
    includeLive: true,
    filters: {
      sportId: selectedSportId,
      timeId: hookTimeId,
      leagueId: selectedLeagueId,
      clubSearch,
    },
  });

  const { catalogItems } = useFootballSidebarCatalog();

  const selectedOdds = useMemo(
    () => new Set((slips[activeSlip] || []).map((selection) => selection.id)),
    [activeSlip, slips],
  );
  const selections = slips[activeSlip] || [];
  const slipCounts = useMemo(
    () => ({
      betslip1: slips.betslip1?.length || 0,
      betslip2: slips.betslip2?.length || 0,
      betslip3: slips.betslip3?.length || 0,
    }),
    [slips],
  );

  const sportLiveMatches = useMemo(() => {
    const selectedSport = String(selectedSportId || "").toLowerCase();
    return liveMatches.filter((match) => {
      const sportId = String(match.sportId || "").toLowerCase();
      if (selectedSport && sportId && sportId !== selectedSport) return false;
      return true;
    });
  }, [liveMatches, selectedSportId]);

  const eventMatches = useMemo(() => {
    if (catalogMode !== "live") return matches;
    const q = String(clubSearch || "").trim();
    return sportLiveMatches
      .filter((match) => {
        if (
          selectedLeagueId !== ALL_LEAGUES_ID &&
          match.league !== selectedLeagueId
        ) {
          return false;
        }
        if (q) return matchesClubNameSearch(match, q);
        return true;
      })
      .sort(sortByKickoff);
  }, [catalogMode, clubSearch, matches, selectedLeagueId, sportLiveMatches]);

  const selectedMatch = useMemo(
    () => eventMatches.find((match) => match.id === selectedMatchId) || null,
    [eventMatches, selectedMatchId],
  );

  const sidebarSource = useMemo(() => {
    if (tab === "event" && catalogMode === "live") return sportLiveMatches;
    const selectedSport = String(selectedSportId || "").toLowerCase();
    return allMatches.filter((match) => {
      const sportId = String(match.sportId || "").toLowerCase();
      if (selectedSport && sportId && sportId !== selectedSport) return false;
      return true;
    });
  }, [allMatches, catalogMode, selectedSportId, sportLiveMatches, tab]);

  const leagueCounts = useMemo(() => {
    const counts = new Map();
    sidebarSource.forEach((match) => {
      const id = String(match.league || "").trim();
      if (!id) return;
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    return counts;
  }, [sidebarSource]);

  const leagueMetaByKey = useMemo(() => {
    const meta = new Map();
    sidebarSource.forEach((match) => {
      const id = String(match.league || "").trim();
      if (!id || meta.has(id)) return;
      meta.set(id, {
        leagueLogo: match.leagueLogo || null,
        countryFlag: match.countryFlag || null,
      });
    });
    return meta;
  }, [sidebarSource]);

  const leagueOptions = useMemo(
    () =>
      buildLeagueTabOptions({
        allLeaguesId: ALL_LEAGUES_ID,
        allMatchesLength: sidebarSource.length,
        catalogItems,
        counts: leagueCounts,
        leagueMetaByKey,
      }),
    [catalogItems, leagueCounts, leagueMetaByKey, sidebarSource.length],
  );

  const { regionGroups, countryGroups } = useMemo(
    () => buildLeagueSidebarGroups(catalogItems, leagueCounts, leagueMetaByKey),
    [catalogItems, leagueCounts, leagueMetaByKey],
  );

  const totalLeagueCount = Math.max(leagueOptions.length - 1, 0);

  const handleSelectLeague = useCallback((id) => {
    setSelectedLeagueId(id);
    setMobileShowDetails(false);
    setExpandedMatchId(null);
  }, []);

  const sidebarProps = useMemo(
    () => ({
      regionGroups,
      countryGroups,
      catalogItems,
      allLeaguesId: ALL_LEAGUES_ID,
      totalLeagueCount,
      selectedLeagueId,
      onSelectLeague: handleSelectLeague,
      selectedTimeId: resolvedTimeId,
      onTimeChange: setSelectedTimeId,
      timeOptions,
      dateDropdownOptions,
      searchQuery: clubSearch,
      onSearchChange: setClubSearch,
    }),
    [
      catalogItems,
      clubSearch,
      countryGroups,
      dateDropdownOptions,
      handleSelectLeague,
      regionGroups,
      resolvedTimeId,
      selectedLeagueId,
      timeOptions,
      totalLeagueCount,
    ],
  );

  useEffect(() => {
    setSlips((prev) =>
      pruneExpiredSlips(
        enrichSlipsFromMatches(prev, [...allMatches, ...liveMatches]),
      ),
    );
  }, [allMatches, liveMatches]);

  useEffect(() => {
    const tick = () => {
      setSlips((prev) => pruneExpiredSlips(prev));
    };
    tick();
    const id = window.setInterval(tick, BET_SLIP_PRUNE_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    persistBetSlipState(slips, activeSlip);
  }, [slips, activeSlip]);

  useEffect(() => {
    if (autoLeagueRef.current) return;
    const first = sidebarSource.find((match) => match.league);
    if (!first?.league) return;
    autoLeagueRef.current = true;
    setSelectedLeagueId(first.league);
  }, [sidebarSource]);

  useEffect(() => {
    if (tab !== "event") return;
    if (!eventMatches.length) {
      setSelectedMatchId(null);
      return;
    }
    if (!eventMatches.some((match) => match.id === selectedMatchId)) {
      setSelectedMatchId(eventMatches[0].id);
    }
  }, [eventMatches, selectedMatchId, tab]);

  useEffect(() => {
    if (!selectedMatch?.apiFixtureId) return;
    void hydrateMatchOdds(selectedMatch.apiFixtureId);
  }, [hydrateMatchOdds, selectedMatch?.apiFixtureId]);

  useEffect(() => {
    const fixtureId = location.state?.openFixtureId;
    if (fixtureId == null) return;

    const match = findMatchByFixtureId(
      [...allMatches, ...liveMatches],
      fixtureId,
    );
    if (match) {
      setTab("event");
      setCatalogMode(match.liveStatus ? "live" : "prematch");
      if (match.sportId) setSelectedSportId(String(match.sportId));
      setSelectedLeagueId(match.league || ALL_LEAGUES_ID);
      setSelectedMatchId(match.id);
      setMobileShowDetails(true);
      if (match.apiFixtureId) void hydrateMatchOdds(match.apiFixtureId);
    }
    navigate(".", { replace: true, state: {} });
  }, [
    allMatches,
    hydrateMatchOdds,
    liveMatches,
    location.state?.openFixtureId,
    navigate,
  ]);

  const handleTabChange = useCallback((nextTab) => {
    setTab(nextTab);
    setMobileShowDetails(false);
    setExpandedMatchId(null);
    if (nextTab === "calendar") {
      setCatalogMode("prematch");
      setSelectedTimeId((prev) => (isCalendarDayTimeId(prev) ? prev : "today"));
      return;
    }
    setSelectedTimeId("all");
  }, []);

  const handleSelectMatch = useCallback(
    (match) => {
      setSelectedMatchId(match.id);
      setMobileShowDetails(true);
      if (match?.apiFixtureId) void hydrateMatchOdds(match.apiFixtureId);
    },
    [hydrateMatchOdds],
  );

  const handleCalendarMatchClick = useCallback(
    async (match) => {
      setExpandedMatchId((prev) => (prev === match.id ? null : match.id));
      if (!match?.apiFixtureId) return;
      try {
        await hydrateMatchOdds(match.apiFixtureId);
      } catch (err) {
        console.error("Failed to hydrate match odds:", err);
      }
    },
    [hydrateMatchOdds],
  );

  const handleOddsClick = useCallback(
    (oddData) => {
      setSlips((prev) => {
        const current = prev[activeSlip] || [];
        const exists = current.find((row) => row.id === oddData.id);
        if (exists) {
          return {
            ...prev,
            [activeSlip]: current.filter((row) => row.id !== oddData.id),
          };
        }
        const withoutSameMatch = current.filter(
          (row) => row.matchName !== oddData.matchName,
        );
        return {
          ...prev,
          [activeSlip]: [...withoutSameMatch, oddData],
        };
      });
    },
    [activeSlip],
  );

  const handleRemoveSelection = useCallback(
    (id) => {
      setSlips((prev) => ({
        ...prev,
        [activeSlip]: (prev[activeSlip] || []).filter((row) => row.id !== id),
      }));
    },
    [activeSlip],
  );

  const handleClearSelections = useCallback(() => {
    setSlips((prev) => ({ ...prev, [activeSlip]: [] }));
  }, [activeSlip]);

  const handleReplaceSlipSelections = useCallback(
    (nextSelections) => {
      setSlips((prev) => ({
        ...prev,
        [activeSlip]: Array.isArray(nextSelections) ? nextSelections : [],
      }));
    },
    [activeSlip],
  );

  const handleOpenSelection = useCallback(
    (selection) => {
      const fixtureId = normalizeApiFixtureId(selection?.apiFixtureId);
      if (fixtureId == null) return;
      const match = findMatchByFixtureId(
        [...allMatches, ...liveMatches],
        fixtureId,
      );
      if (!match) return;
      setTab("event");
      setCatalogMode(match.liveStatus ? "live" : "prematch");
      setSelectedLeagueId(match.league || ALL_LEAGUES_ID);
      setSelectedMatchId(match.id);
      setMobileShowDetails(true);
      if (match.apiFixtureId) void hydrateMatchOdds(match.apiFixtureId);
    },
    [allMatches, hydrateMatchOdds, liveMatches],
  );

  const oddsReady = Boolean(
    selectedMatch?.apiFixtureId &&
      oddsDetailByFixtureId?.has?.(selectedMatch.apiFixtureId),
  );

  const leagueHeaderLabel =
    selectedLeagueId === ALL_LEAGUES_ID
      ? t("sport.eventView")
      : selectedLeagueId;

  const betSlip = (
    <BetSlipPanel
      className="h-full min-h-0"
      selections={selections}
      onRemoveSelection={handleRemoveSelection}
      onClearSelections={handleClearSelections}
      activeSlip={activeSlip}
      onChangeSlip={setActiveSlip}
      onReplaceSelections={handleReplaceSlipSelections}
      onSelectionClick={handleOpenSelection}
      slipCounts={slipCounts}
    />
  );

  return (
    <PageContainer>
      <div className="sticky top-0 z-50">
        <TopHeader />
        <PrimaryNav items={topNavItems} />
        <SportTabs activeTab={tab} onChange={handleTabChange} />
      </div>

      <MainLayout
        center={
          <>
            {error && !loading ? (
              <div
                className="mx-2 mt-2 flex flex-col items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-50 sm:flex-row sm:items-center sm:justify-between"
                role="alert"
              >
                <p>{error?.message || t("sport.noMatches")}</p>
                <button
                  type="button"
                  onClick={() => refreshAll()}
                  className="shrink-0 rounded-lg bg-(--sb-accent-fill) px-3 py-1.5 text-xs font-semibold text-[#111111] hover:brightness-110"
                >
                  Retry
                </button>
              </div>
            ) : null}

            {tab === "event" ? (
              <div className="hidden h-[calc(100vh-8.75rem)] grid-cols-[250px_minmax(0,0.95fr)_minmax(0,1.15fr)_300px] gap-2 px-2 py-2 lg:grid">
                <SportSidebar
                  catalogMode={catalogMode}
                  onCatalogModeChange={setCatalogMode}
                  liveCount={sportLiveMatches.length}
                  prematchCount={allMatches.length}
                  sidebarProps={sidebarProps}
                />
                <SportEventMatchList
                  leagueLabel={leagueHeaderLabel}
                  matches={eventMatches}
                  selectedMatchId={selectedMatchId}
                  onSelectMatch={handleSelectMatch}
                  onOddsClick={handleOddsClick}
                  selectedOdds={selectedOdds}
                  loading={loading && eventMatches.length === 0}
                />
                <SportMatchDetails
                  match={selectedMatch}
                  oddsReady={oddsReady}
                  onOddsClick={handleOddsClick}
                  selectedOdds={selectedOdds}
                />
                {betSlip}
              </div>
            ) : (
              <div className="hidden h-[calc(100vh-8.75rem)] grid-cols-[250px_minmax(0,1fr)_300px] gap-2 px-2 py-2 lg:grid">
                <SportSidebar
                  showModeToggle={false}
                  catalogMode="prematch"
                  liveCount={sportLiveMatches.length}
                  prematchCount={allMatches.length}
                  sidebarProps={sidebarProps}
                />
                <div className="flex min-h-0 flex-col overflow-hidden">
                  <SportCalendarDates
                    selectedTimeId={
                      isCalendarDayTimeId(resolvedTimeId)
                        ? resolvedTimeId
                        : "today"
                    }
                    onSelect={setSelectedTimeId}
                  />
                  <div className="mb-0 flex items-center justify-between border-b border-(--sb-border) bg-(--sb-bg-card) px-3">
                    <span className="h-9 text-[12px] font-medium leading-9 text-white">
                      {t("sport.matchWinner")}
                    </span>
                    <div className="flex gap-7 pr-2 text-[11px] font-bold uppercase text-(--sb-text-muted)">
                      <span>W1</span>
                      <span>X</span>
                      <span>W2</span>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    {matches.length === 0 && !loading ? (
                      <p className="m-0 px-3 py-10 text-center text-[12px] text-(--sb-text-muted)">
                        {t("sport.noMatches")}
                      </p>
                    ) : (
                      <MatchesTable
                        matches={matches}
                        onMatchClick={handleCalendarMatchClick}
                        onOddsClick={handleOddsClick}
                        selectedOdds={selectedOdds}
                        expandedMatchId={expandedMatchId}
                        oddsDetailByFixtureId={oddsDetailByFixtureId}
                        marketTabId={MATCH_MARKET_TABS[0].id}
                        variant="desktop"
                      />
                    )}
                  </div>
                </div>
                {betSlip}
              </div>
            )}

            <div className="lg:hidden">
              {tab === "event" && !mobileShowDetails ? (
                <>
                  <div className="grid grid-cols-2 gap-1 px-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCatalogMode("live")}
                      className={`h-9 cursor-pointer rounded border-0 text-[11px] font-bold ${
                        catalogMode === "live"
                          ? "bg-(--sb-accent-fill) text-[#111]"
                          : "bg-[#111111] text-(--sb-text-muted)"
                      }`}
                    >
                      {t("sport.live")} ({sportLiveMatches.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatalogMode("prematch")}
                      className={`h-9 cursor-pointer rounded border-0 text-[11px] font-bold ${
                        catalogMode === "prematch"
                          ? "bg-(--sb-accent-fill) text-[#111]"
                          : "bg-[#111111] text-(--sb-text-muted)"
                      }`}
                    >
                      {t("sport.prematch")} ({allMatches.length})
                    </button>
                  </div>
                  <SportEventMatchList
                    leagueLabel={leagueHeaderLabel}
                    matches={eventMatches}
                    selectedMatchId={selectedMatchId}
                    onSelectMatch={handleSelectMatch}
                    onOddsClick={handleOddsClick}
                    selectedOdds={selectedOdds}
                    loading={loading && eventMatches.length === 0}
                    showOdds={false}
                  />
                </>
              ) : null}
              {tab === "event" && mobileShowDetails ? (
                <SportMatchDetails
                  match={selectedMatch}
                  oddsReady={oddsReady}
                  onOddsClick={handleOddsClick}
                  selectedOdds={selectedOdds}
                  onBack={() => setMobileShowDetails(false)}
                />
              ) : null}
              {tab === "calendar" ? (
                <div className="flex flex-col">
                  <SportCalendarDates
                    selectedTimeId={
                      isCalendarDayTimeId(resolvedTimeId)
                        ? resolvedTimeId
                        : "today"
                    }
                    onSelect={setSelectedTimeId}
                  />
                  {matches.length === 0 && !loading ? (
                    <p className="m-0 px-3 py-10 text-center text-[12px] text-(--sb-text-muted)">
                      {t("sport.noMatches")}
                    </p>
                  ) : (
                    <MatchesTable
                      matches={matches}
                      onMatchClick={handleCalendarMatchClick}
                      onOddsClick={handleOddsClick}
                      selectedOdds={selectedOdds}
                      expandedMatchId={expandedMatchId}
                      oddsDetailByFixtureId={oddsDetailByFixtureId}
                      marketTabId={MATCH_MARKET_TABS[0].id}
                    />
                  )}
                </div>
              ) : null}
            </div>
          </>
        }
      />

      <div className="lg:hidden">
        <SiteFooter />
      </div>
      <MobileBottomBar
        selections={selections}
        onRemoveSelection={handleRemoveSelection}
        onClearSelections={handleClearSelections}
        onReplaceSelections={handleReplaceSlipSelections}
        onSelectionClick={handleOpenSelection}
        leaguesSidebarProps={sidebarProps}
        liveCount={sportLiveMatches.length}
      />
    </PageContainer>
  );
}

export default Sport;
