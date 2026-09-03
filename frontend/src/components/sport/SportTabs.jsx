import { useTranslation } from "../../i18n/LanguageContext.jsx";

const TABS = [
  { id: "event", key: "sport.eventView" },
  { id: "calendar", key: "sport.liveCalendar" },
];

function SportTabs({ activeTab, onChange }) {
  const { t } = useTranslation();

  return (
    <nav className="border-b border-(--sb-header-border) bg-(--sb-nav)">
      <div className="flex items-stretch justify-center">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange?.(tab.id)}
              className={`h-10 cursor-pointer border-0 border-b-2 bg-transparent px-5 text-[12px] font-bold uppercase tracking-wide ${
                active
                  ? "border-(--sb-accent-fill) text-white"
                  : "border-transparent text-(--sb-text-muted) hover:text-white"
              }`}
            >
              {t(tab.key)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default SportTabs;
