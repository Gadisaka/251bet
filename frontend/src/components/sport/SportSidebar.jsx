import TopLeaguesSidebar from "../sections/TopLeaguesSidebar";
import { useTranslation } from "../../i18n/LanguageContext.jsx";

function SportSidebar({
  catalogMode = "prematch",
  onCatalogModeChange,
  liveCount = 0,
  prematchCount = 0,
  showModeToggle = true,
  sidebarProps,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {showModeToggle ? (
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => onCatalogModeChange?.("live")}
            className={`h-9 cursor-pointer rounded border-0 text-[11px] font-bold ${
              catalogMode === "live"
                ? "bg-(--sb-accent-fill) text-[#111]"
                : "bg-[#111111] text-(--sb-text-muted) hover:text-white"
            }`}
          >
            {t("sport.live")} ({liveCount})
          </button>
          <button
            type="button"
            onClick={() => onCatalogModeChange?.("prematch")}
            className={`h-9 cursor-pointer rounded border-0 text-[11px] font-bold ${
              catalogMode === "prematch"
                ? "bg-(--sb-accent-fill) text-[#111]"
                : "bg-[#111111] text-(--sb-text-muted) hover:text-white"
            }`}
          >
            {t("sport.prematch")} ({prematchCount})
          </button>
        </div>
      ) : null}
      <TopLeaguesSidebar
        {...sidebarProps}
        searchPlaceholder={t("sidebar.searchCompetitionPlaceholder")}
        panelClassName="min-h-0 flex-1 lg:max-h-none"
      />
    </div>
  );
}

export default SportSidebar;
