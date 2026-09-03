import { Link } from "react-router-dom";
import AppIcon from "../common/AppIcon";
import AgeRestrictionNotice from "../common/AgeRestrictionNotice";
import { topHeaderData } from "../../data/homepageData";
import { useTelegramContact } from "../../hooks/useTelegramContact";
import { useTranslation } from "../../i18n/LanguageContext.jsx";

const footerGroups = [
  {
    titleKey: "footer.about",
    links: [
      { key: "infoPage.terms-and-conditions", to: "/info/terms-and-conditions" },
      { key: "infoPage.privacy-policy", to: "/info/privacy-policy" },
      { key: "footer.cashbackRules", to: "/info/cashback-rules" },
    ],
  },
  {
    titleKey: "footer.help",
    links: [
      { key: "infoPage.faq", to: "/info/faq" },
      { key: "infoPage.how-to-play", to: "/info/how-to-play" },
      { key: "infoPage.contact-us", to: "/info/contact-us" },
    ],
  },
  {
    titleKey: "footer.payments",
    links: [{ key: "footer.deposit", to: "/deposit" }],
  },
];

function SiteFooter() {
  const { t } = useTranslation();
  const telegram = useTelegramContact();
  const brand = topHeaderData.brand || "251Bet";
  const year = new Date().getFullYear();

  return (
    <footer className="mt-0 border-t border-(--sb-border) bg-(--sb-bg-2) px-4 pb-8 pt-6">
      <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
        {footerGroups.map((group) => (
          <div key={group.titleKey}>
            <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wide text-white">
              {t(group.titleKey)}
            </p>
            <nav className="flex flex-col gap-1.5">
              {group.links.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-[12px] font-medium text-(--sb-text-muted) no-underline hover:text-white"
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-6 flex max-w-4xl flex-col items-center gap-3 text-center">
        {telegram?.link ? (
          <a
            href={telegram.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#229ED9] text-white"
            aria-label={t("header.telegram")}
          >
            {telegram.logo ? (
              <img
                src={telegram.logo}
                alt=""
                className="h-5 w-5 rounded-sm object-cover"
              />
            ) : (
              <AppIcon name="send" size={18} strokeWidth={2} />
            )}
          </a>
        ) : null}

        <AgeRestrictionNotice className="max-w-md" />

        <p className="m-0 max-w-lg text-[11px] leading-relaxed text-(--sb-text-muted)">
          © {year} {brand}. {t("footer.rightsReserved")} {t("footer.ageNotice")}{" "}
          {t("footer.gambleResponsibly")}
        </p>
      </div>
    </footer>
  );
}

export default SiteFooter;
