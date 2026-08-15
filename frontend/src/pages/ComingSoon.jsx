import { useLocation } from "react-router-dom";
import AppIcon from "../components/common/AppIcon";
import MobileBottomBar from "../components/layout/MobileBottomBar";
import PageContainer from "../components/layout/PageContainer";
import PrimaryNav from "../components/layout/PrimaryNav";
import SiteFooter from "../components/layout/SiteFooter";
import TopHeader from "../components/layout/TopHeader";
import { topHeaderData, topNavItems } from "../data/homepageData";
import { useTranslation } from "../i18n/LanguageContext.jsx";

/** Placeholder for the top tabs whose products are not built yet. */
function ComingSoon() {
  const { t } = useTranslation();
  const location = useLocation();
  const item = topNavItems.find((nav) => nav.path === location.pathname);
  const title = item ? t(`nav.${item.id}`) : "";

  return (
    <PageContainer>
      <div className="sticky top-0 z-50">
        <TopHeader data={topHeaderData} />
        <PrimaryNav items={topNavItems} />
      </div>

      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <AppIcon
          name={item?.icon || "trophy"}
          size={34}
          className="text-(--sb-accent-fill)"
        />
        <h1 className="m-0 text-base font-bold uppercase tracking-wide text-white">
          {title}
        </h1>
        <p className="m-0 text-sm text-(--sb-text-muted)">
          {t("common.comingSoon")}
        </p>
      </div>

      <SiteFooter />
      <MobileBottomBar />
    </PageContainer>
  );
}

export default ComingSoon;
