import { useLocation, useNavigate } from "react-router-dom";
import AppIcon from "../common/AppIcon";
import { useTranslation } from "../../i18n/LanguageContext.jsx";

/**
 * Single scrolling row of uppercase tabs. The row overflows rather than wrapping
 * so the tail entries stay reachable on narrow screens, matching the reference
 * chrome where the last tabs are cut off mid-word.
 */
function PrimaryNav({ items }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="w-full border-b border-(--sb-header-border) bg-(--sb-nav)">
      <div className="mx-auto flex max-w-[1240px] items-stretch overflow-x-auto px-0 lg:px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const isActive = Boolean(item.path) && location.pathname === item.path;
          return (
            <button
              key={item.id}
              type="button"
              className={`flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 border-0 border-b-2 bg-transparent px-3 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap sm:px-4 lg:h-11 lg:flex-1 lg:px-6 ${
                isActive
                  ? "border-(--sb-accent-fill) text-white"
                  : "border-transparent text-(--sb-text-muted) hover:text-white"
              }`}
              onClick={() => {
                if (item.path) navigate(item.path);
              }}
            >
              {item.icon ? (
                <AppIcon
                  name={item.icon}
                  size={14}
                  className="hidden lg:inline-block"
                />
              ) : null}
              {t(`nav.${item.id}`)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default PrimaryNav;
