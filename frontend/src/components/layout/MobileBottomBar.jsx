import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppIcon from "../common/AppIcon";
import MobileBetSlip from "../sections/MobileBetSlip";
import MobileLeaguesSheet from "../sections/MobileLeaguesSheet";
import MobileMenu from "./MobileMenu";
import { usePlatformSettings } from "../../hooks/usePlatformSettings";
import { coerceStakeDisplayToLimits } from "../../utils/stakeLimits";
import { useTranslation } from "../../i18n/LanguageContext.jsx";

/**
 * Pinned five-item bar on small screens. Desktop hides the bar and opens the
 * same slip sheet from the header control.
 */
function MobileBottomBar({
  selections = [],
  onRemoveSelection = () => {},
  onClearSelections = () => {},
  onReplaceSelections = () => {},
  onSelectionClick,
  leaguesSidebarProps = null,
  liveCount = 0,
  slipOpen: slipOpenProp,
  onSlipOpenChange,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [internalSlipOpen, setInternalSlipOpen] = useState(false);
  const slipOpen = slipOpenProp ?? internalSlipOpen;
  const setSlipOpen = onSlipOpenChange ?? setInternalSlipOpen;
  const [leaguesOpen, setLeaguesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stakeInput, setStakeInput] = useState("20");
  const { limits, winningsTax } = usePlatformSettings();

  useEffect(() => {
    if (!limits) return;
    setStakeInput((prev) => coerceStakeDisplayToLimits(prev, limits));
  }, [limits?.MIN_BET_AMOUNT, limits?.MAX_BET_AMOUNT]);

  const mobileLeaguesSidebarProps = useMemo(() => {
    if (!leaguesSidebarProps) return null;
    const { onSelectLeague } = leaguesSidebarProps;
    return {
      ...leaguesSidebarProps,
      onSelectLeague: (id) => {
        onSelectLeague?.(id);
        setLeaguesOpen(false);
      },
    };
  }, [leaguesSidebarProps]);

  const safeSelections = Array.isArray(selections) ? selections : [];
  const selectionCount = safeSelections.length;

  const defaultSelectionClick = useCallback(
    (sel) => {
      if (sel?.apiFixtureId == null) return;
      setSlipOpen(false);
      navigate("/sport", {
        state: {
          openFixtureId: sel.apiFixtureId,
          kickoffAt: sel.kickoffAt ?? null,
        },
      });
    },
    [navigate],
  );

  const handleSelectionClick = onSelectionClick ?? defaultSelectionClick;

  const items = [
    {
      id: "live",
      icon: "radio",
      label: t("mobileBar.live"),
      badge: liveCount,
      active: location.pathname === "/live",
      onClick: () => navigate("/live"),
    },
    {
      id: "sports",
      icon: "timer",
      label: t("mobileBar.sports"),
      active: location.pathname === "/" || location.pathname === "/sport",
      // Already on the sportsbook: reuse the tab to browse leagues.
      onClick: () => {
        if (
          (location.pathname === "/" || location.pathname === "/sport") &&
          mobileLeaguesSidebarProps
        ) {
          setLeaguesOpen(true);
          return;
        }
        navigate("/sport");
      },
    },
    {
      id: "betslip",
      icon: "receipt",
      label: t("mobileBar.betSlip"),
      badge: selectionCount,
      active: slipOpen,
      onClick: () => setSlipOpen(true),
    },
    {
      id: "virtual",
      icon: "rotate",
      label: t("mobileBar.virtual"),
      active: location.pathname === "/casino",
      onClick: () => navigate("/casino"),
    },
    {
      id: "menu",
      icon: "menu",
      label: t("mobileBar.menu"),
      active: menuOpen,
      onClick: () => setMenuOpen(true),
    },
  ];

  return (
    <>
      <MobileBetSlip
        open={slipOpen}
        onClose={() => setSlipOpen(false)}
        selections={safeSelections}
        onRemoveSelection={onRemoveSelection}
        onClearSelections={onClearSelections}
        onReplaceSelections={onReplaceSelections}
        onSelectionClick={handleSelectionClick}
        stakeInput={stakeInput}
        onStakeInputChange={setStakeInput}
        limits={limits}
        winningsTax={winningsTax}
      />
      <MobileLeaguesSheet
        open={leaguesOpen}
        onClose={() => setLeaguesOpen(false)}
        sidebarProps={mobileLeaguesSidebarProps}
      />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-stretch border-t border-(--sb-border) bg-(--sb-bottom-bar) lg:hidden">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            aria-label={
              item.badge > 0 ? `${item.label}, ${item.badge}` : item.label
            }
            className={`relative flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 border-0 bg-transparent ${
              item.active ? "text-(--sb-accent-fill)" : "text-white"
            }`}
          >
            <span className="relative inline-flex">
              <AppIcon name={item.icon} size={20} />
              {item.badge > 0 ? (
                <span className="absolute -right-2.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-(--sb-accent-fill) px-1 text-[9px] font-bold text-(--sb-accent-text-on-dark)">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </span>
            <span className="max-w-full truncate text-[10px] font-medium">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
      <div className="h-14 lg:hidden" />
    </>
  );
}

export default MobileBottomBar;
