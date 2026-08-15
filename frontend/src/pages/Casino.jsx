import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import PrimaryNav from "../components/layout/PrimaryNav";
import SiteFooter from "../components/layout/SiteFooter";
import TopHeader from "../components/layout/TopHeader";
import MobileBottomBar from "../components/layout/MobileBottomBar";
import AppIcon from "../components/common/AppIcon";
import GameFrame from "../components/casino/GameFrame";
import { GameCard, GameRail } from "../components/casino/GameRail";
import { topHeaderData, topNavItems } from "../data/homepageData";
import { mockCasinoRails } from "../data/mockSportsbook";
import { USE_MOCK_DATA } from "../hooks/useMatches";
import { useTranslation } from "../i18n/LanguageContext.jsx";
import {
  fetchCasinoGames,
  fetchCasinoStatus,
  fetchInoutLaunchUrl,
  generateMrxSsoToken,
  hasAuthToken,
} from "../services/api";
import kenoThumb from "../assets/games/keno.png";
import aviatorThumb from "../assets/games/aviator.png";
import bingoThumb from "../assets/games/bingo.png";

const GAME_BASE_URL =
  import.meta.env.VITE_GAME_BASE_URL || "https://games.251bet.net";

const MRX_GAMES = [
  {
    id: "keno",
    nameKey: "casino.kenoName",
    iconUrl: kenoThumb,
    ssoTarget: GAME_BASE_URL,
    path: "/game/keno",
  },
  {
    id: "bingo",
    nameKey: "casino.bingoName",
    iconUrl: bingoThumb,
    ssoTarget: GAME_BASE_URL,
    path: "/game/bingo",
  },
  {
    id: "aviator",
    nameKey: "casino.aviatorName",
    iconUrl: aviatorThumb,
    ssoTarget: GAME_BASE_URL,
    path: "/game/aviator",
  },
];

/** InOut gameModes launched from the top nav / home tiles (no catalog wait). */
const NAV_INOUT_LAUNCHES = {
  "chicken-road-two-bonus": { title: "Chicken Road 2" },
  "chicken-coin": { title: "Chicken Coin" },
  megablock: { title: "Mega Block" },
};

/** Floating jump-to-top control that clears the pinned bottom bar. */
function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 left-1/2 z-40 flex h-9 w-9 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-(--sb-bg-card-elevated) text-white shadow-lg"
    >
      <AppIcon name="chevronUp" size={18} />
    </button>
  );
}

function Casino() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const launchId = searchParams.get("launch");
  const handledLaunchRef = useRef(null);

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // null = still checking; false = InOut lobby off (Instant Games still shown).
  const [casinoEnabled, setCasinoEnabled] = useState(null);

  const [frame, setFrame] = useState(null);
  const [launching, setLaunching] = useState(false);
  const [mrxLaunching, setMrxLaunching] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    fetchCasinoStatus({ signal: ac.signal })
      .then((s) => setCasinoEnabled(s.enabled))
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setCasinoEnabled(true);
      });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (casinoEnabled !== true) {
      setLoading(false);
      setGames([]);
      return;
    }
    const ac = new AbortController();
    setLoading(true);
    fetchCasinoGames({ signal: ac.signal })
      .then((list) => {
        setGames(list);
        setError(null);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError(err.message || "Failed to load games");
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [casinoEnabled]);

  const clearLaunchParam = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("launch");
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const handleMrxPlay = useCallback(
    async (game) => {
      setError(null);
      if (!hasAuthToken()) {
        navigate("/login");
        return;
      }
      if (mrxLaunching) return;
      setMrxLaunching(game.id);
      try {
        const ssoToken = await generateMrxSsoToken();
        const targetUrl = new URL(game.path || "/", game.ssoTarget);
        targetUrl.searchParams.set("sso_token", ssoToken);
        window.location.assign(targetUrl.toString());
      } catch (err) {
        if (err.message === "NOT_LOGGED_IN") {
          navigate("/login");
          return;
        }
        setError(err.message || "Could not launch game. Please try again.");
      } finally {
        setMrxLaunching(null);
      }
    },
    [mrxLaunching, navigate],
  );

  const handlePlay = useCallback(
    async (game) => {
      if (!hasAuthToken()) {
        navigate("/login");
        return;
      }
      if (launching) return;
      setLaunching(true);
      try {
        const url = await fetchInoutLaunchUrl(game.gameMode, { lang: language });
        setFrame({ url, title: game.title });
      } catch (err) {
        setError(err.message || "Failed to launch game");
      } finally {
        setLaunching(false);
      }
    },
    [launching, language, navigate],
  );

  // Deep links (`/casino?launch=<id>`) come from the top nav and the home tiles.
  // MRX ids resolve from the static list; anything else is matched against the
  // synced InOut catalog, so promoting a new game needs no frontend change.
  useEffect(() => {
    if (!launchId) {
      handledLaunchRef.current = null;
      return;
    }
    if (handledLaunchRef.current === launchId) return;

    const mrxGame = MRX_GAMES.find((g) => g.id === launchId);
    if (mrxGame) {
      handledLaunchRef.current = launchId;
      clearLaunchParam();
      handleMrxPlay(mrxGame);
      return;
    }

    // Promoted InOut tiles/nav items launch immediately — same gameMode the
    // provider expects, without waiting on catalog reconciliation.
    const navInout = NAV_INOUT_LAUNCHES[launchId];
    if (navInout) {
      handledLaunchRef.current = launchId;
      clearLaunchParam();
      handlePlay({ gameMode: launchId, title: navInout.title });
      return;
    }

    // Wait until casino status (and catalog, when enabled) have settled —
    // otherwise we clear ?launch= against an empty games list and never retry.
    if (casinoEnabled === null) return;
    if (casinoEnabled === true && loading) return;

    const inoutGame =
      casinoEnabled === true
        ? games.find((g) => g.gameMode === launchId)
        : null;
    handledLaunchRef.current = launchId;
    clearLaunchParam();
    if (inoutGame) handlePlay(inoutGame);
  }, [
    launchId,
    casinoEnabled,
    loading,
    games,
    clearLaunchParam,
    handleMrxPlay,
    handlePlay,
  ]);

  return (
    <PageContainer>
      <div className="sticky top-0 z-50">
        <TopHeader data={topHeaderData} />
        <PrimaryNav items={topNavItems} />
      </div>

      <div className="w-full">
        {error && !USE_MOCK_DATA ? (
          <div className="mx-2 mt-2 rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <GameRail
          title={t("casino.instantTitle")}
          games={MRX_GAMES.map((game) => ({ ...game, title: t(game.nameKey) }))}
          onPlay={handleMrxPlay}
        />

        {casinoEnabled === true && games.length > 0 ? (
          <GameRail
            title={t("casino.inoutTitle")}
            games={games.map((game) => ({ ...game, id: game.gameMode }))}
            onPlay={handlePlay}
          />
        ) : null}

        {mockCasinoRails.map((rail) => (
          <GameRail
            key={rail.id}
            title={t(rail.titleKey)}
            overflow={rail.overflow}
            games={rail.games}
            featured={rail.id !== "trending"}
            onPlay={() => {}}
          />
        ))}
      </div>

      <ScrollTopButton />
      <SiteFooter />
      <MobileBottomBar />

      {frame ? (
        <GameFrame
          url={frame.url}
          title={frame.title}
          onClose={() => setFrame(null)}
        />
      ) : null}
    </PageContainer>
  );
}

export default Casino;
