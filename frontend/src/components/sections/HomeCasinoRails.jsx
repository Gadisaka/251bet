import { useNavigate } from "react-router-dom";
import { GameRail } from "../casino/GameRail";
import { mockCasinoRails } from "../../data/mockSportsbook";
import { useTranslation } from "../../i18n/LanguageContext.jsx";

/**
 * Home-page casino stack matching the Bet251 rails: Trending, Casino games,
 * Live Casino, Popular Games, New Games.
 */
function HomeCasinoRails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const openCasino = () => navigate("/casino");

  return (
    <div className="w-full bg-(--sb-bg-page) pt-1">
      {mockCasinoRails.map((rail) => (
        <GameRail
          key={rail.id}
          title={t(rail.titleKey)}
          overflow={rail.overflow}
          games={rail.games}
          featured={rail.id !== "trending"}
          onPlay={openCasino}
          onMore={openCasino}
        />
      ))}
    </div>
  );
}

export default HomeCasinoRails;
