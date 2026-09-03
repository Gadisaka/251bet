import { useNavigate } from "react-router-dom";
import footballTile from "../../../assets/tiles/football.png";
import liveTile from "../../../assets/tiles/live.png";
import casinoTile from "../../../assets/tiles/esports.png";
import calendarTile from "../../../assets/tiles/calendar.png";
import { useTranslation } from "../../../i18n/LanguageContext.jsx";

const TILES = Object.freeze([
  {
    id: "football",
    image: footballTile,
    action: "sport",
    sportId: "football",
  },
  { id: "live", image: liveTile, action: "live" },
  { id: "casino", image: casinoTile, action: "casino" },
  { id: "calendar", image: calendarTile, action: "upcoming" },
]);

function DesktopCategoryTiles({ onSelectSport, onScrollUpcoming }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = (tile) => {
    if (tile.action === "live") {
      navigate("/live");
      return;
    }
    if (tile.action === "casino") {
      navigate("/casino");
      return;
    }
    if (tile.action === "sport" && tile.sportId) {
      onSelectSport?.(tile.sportId);
    }
    onScrollUpcoming?.();
  };

  return (
    <div className="mt-4 grid w-full grid-cols-4 gap-4">
      {TILES.map((tile) => (
        <button
          key={tile.id}
          type="button"
          onClick={() => handleClick(tile)}
          className="relative h-[200px] w-full cursor-pointer overflow-hidden rounded-xl border-0 bg-[#121212] p-0 xl:h-[240px]"
        >
          <img
            src={tile.image}
            alt={t(`home.${tile.id}`)}
            className="h-full w-full object-cover object-center"
          />
        </button>
      ))}
    </div>
  );
}

export default DesktopCategoryTiles;
