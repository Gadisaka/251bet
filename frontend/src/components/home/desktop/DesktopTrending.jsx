import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../../common/AppIcon";
import { GameCard } from "../../casino/GameRail";
import { mockCasinoRails } from "../../../data/mockSportsbook";
import { useTranslation } from "../../../i18n/LanguageContext.jsx";

function DesktopTrending() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollerRef = useRef(null);
  const trending = mockCasinoRails.find((rail) => rail.id === "trending");
  const games = trending?.games || [];

  const scrollByCard = (direction) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: 280 * direction, behavior: "smooth" });
  };

  return (
    <section className="mt-8 pb-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="m-0 text-[15px] font-semibold text-white">
          {t("casino.trending")}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous games"
            onClick={() => scrollByCard(-1)}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-[#2a2a2a] text-white"
          >
            <AppIcon name="chevronLeft" size={16} />
          </button>
          <button
            type="button"
            aria-label="Next games"
            onClick={() => scrollByCard(1)}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-[#2a2a2a] text-white"
          >
            <AppIcon name="chevronRight" size={16} />
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            size="desktop"
            onPlay={() => navigate("/casino")}
          />
        ))}
      </div>
    </section>
  );
}

export default DesktopTrending;
