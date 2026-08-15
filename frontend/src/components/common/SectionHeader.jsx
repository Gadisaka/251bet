import AppIcon from "./AppIcon";
import { useTranslation } from "../../i18n/LanguageContext.jsx";

/** Tiny uppercase section title with an optional right-aligned "More" link. */
function SectionHeader({ title, onMore = null }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-2 py-2">
      <h2 className="m-0 text-[11px] font-bold uppercase tracking-wide text-white">
        {title}
      </h2>
      {onMore ? (
        <button
          type="button"
          onClick={onMore}
          className="inline-flex cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 text-[11px] font-medium text-(--sb-text-muted) hover:text-white"
        >
          {t("common.more")}
          <AppIcon name="chevronRight" size={13} />
        </button>
      ) : null}
    </div>
  );
}

export default SectionHeader;
