import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import AppIcon from "../common/AppIcon";
import DesktopUserSidebar from "./DesktopUserSidebar";
import MobileMenu from "./MobileMenu";
import { fetchNotificationUnreadCount, fetchPlayerWallet } from "../../services/api";
import NotificationsDialog from "../notifications/NotificationsDialog";
import { useTelegramContact } from "../../hooks/useTelegramContact";
import { useLanguage, useTranslation } from "../../i18n/LanguageContext.jsx";
import { SPORTSBOOK_TIMEZONE } from "../../utils/sportsbookDay.js";
import brandLogo from "../../assets/logo.png";

const LANG_FLAG = Object.freeze({
  en: { code: "gb", label: "English" },
  am: { code: "et", label: "አማርኛ" },
});

function flagSrc(iso2) {
  return `https://flagcdn.com/w40/${iso2}.png`;
}

function HeaderClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const label = now.toLocaleTimeString("en-GB", {
    timeZone: SPORTSBOOK_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <time
      className="hidden tabular-nums text-[12px] font-medium tracking-wide text-white/90 lg:inline"
      dateTime={now.toISOString()}
    >
      {label}
    </time>
  );
}

function TopHeader({ slipCount = 0, onOpenSlip = null }) {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const telegram = useTelegramContact();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const [walletBalance, setWalletBalance] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const userStr =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isLoggedIn = !!token;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (!isLoggedIn) {
        setWalletBalance(null);
        return;
      }
      const wallet = await fetchPlayerWallet();
      if (!cancelled) setWalletBalance(wallet?.balance ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const refreshUnreadCount = useCallback(async () => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await fetchNotificationUnreadCount();
      setUnreadCount(Number(data?.count) || 0);
    } catch {
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handler = () => {
      forceUpdate((n) => n + 1);
      (async () => {
        const wallet = await fetchPlayerWallet();
        setWalletBalance(wallet?.balance ?? 0);
      })();
      void refreshUnreadCount();
    };
    window.addEventListener("balanceUpdated", handler);
    return () => window.removeEventListener("balanceUpdated", handler);
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return undefined;
    }
    void refreshUnreadCount();
    const id = setInterval(() => void refreshUnreadCount(), 60_000);
    return () => clearInterval(id);
  }, [isLoggedIn, refreshUnreadCount]);

  useEffect(() => {
    const onSession = () => forceUpdate((n) => n + 1);
    window.addEventListener("authSessionUpdated", onSession);
    return () => window.removeEventListener("authSessionUpdated", onSession);
  }, []);

  useEffect(() => {
    if (!langMenuOpen) return undefined;
    const onDocPointer = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setLangMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointer, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocPointer, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [langMenuOpen]);

  const selectLang = useCallback(
    (code) => {
      setLanguage(code);
      setLangMenuOpen(false);
    },
    [setLanguage],
  );

  const displayName = user?.name || user?.phone || user?.username || "";
  const displayBalance =
    walletBalance === null ? "—" : Number(walletBalance).toLocaleString();

  return (
    <>
      <header className="flex h-12 min-w-0 items-center gap-2 overflow-visible border-b border-(--sb-header-border) bg-(--sb-header) px-2 sm:px-3 lg:h-14 lg:px-4">
        <Link
          to="/"
          className="inline-flex h-9 shrink-0 items-center no-underline sm:h-10 lg:h-11"
          aria-label="251Bet"
        >
          <img
            src={brandLogo}
            alt="251Bet"
            className="h-full w-auto object-contain object-left"
          />
        </Link>

        {telegram?.link ? (
          <a
            href={telegram.link}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#229ED9] text-white no-underline lg:inline-flex"
            aria-label={t("header.telegram")}
          >
            {telegram.logo ? (
              <img
                src={telegram.logo}
                alt=""
                className="h-4 w-4 rounded-full object-cover"
              />
            ) : (
              <AppIcon name="send" size={13} strokeWidth={2.4} />
            )}
          </a>
        ) : null}

        <div className="mr-auto min-w-0" />

        {isLoggedIn ? (
          <div className="relative flex items-center gap-1.5 text-sm text-white">
            <div className="mr-0.5 hidden flex-col items-end leading-[1.1] sm:flex">
              <span className="text-xs font-bold">{displayBalance} ETB</span>
              <small className="max-w-[9rem] truncate text-[10px] font-medium text-(--sb-text-muted)">
                {displayName}
              </small>
            </div>
            <Link
              to="/deposit"
              aria-label={t("header.deposit")}
              title={t("header.deposit")}
              className="inline-flex h-8 items-center justify-center rounded-sm bg-(--sb-accent-fill) px-2.5 text-[11px] font-bold uppercase text-(--sb-accent-text-on-dark) no-underline hover:bg-(--sb-accent-fill-hover)"
            >
              {t("header.deposit")}
            </Link>
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              aria-label={
                unreadCount > 0
                  ? `${t("header.notifications")} (${unreadCount})`
                  : t("header.notifications")
              }
              className="relative hidden h-8 w-8 cursor-pointer items-center justify-center border-0 bg-transparent text-(--sb-text-muted) hover:text-white lg:inline-flex"
            >
              <AppIcon name="bell" size={16} />
              {unreadCount > 0 ? (
                <span
                  className="absolute right-1 top-1 size-1.5 rounded-full bg-(--sb-live)"
                  aria-hidden
                />
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setDesktopMenuOpen((p) => !p)}
              className="hidden h-8 w-8 cursor-pointer items-center justify-center border-0 bg-transparent text-(--sb-text-muted) hover:text-white lg:inline-flex"
              aria-label={t("common.accountMenu")}
            >
              <AppIcon name="user" size={16} />
            </button>
            <DesktopUserSidebar
              open={desktopMenuOpen}
              onClose={() => setDesktopMenuOpen(false)}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-[11px] font-bold uppercase tracking-wide text-white underline-offset-2 no-underline hover:underline"
            >
              <span className="lg:hidden">{t("header.login")}</span>
              <span className="hidden lg:inline">{t("header.signIn")}</span>
            </Link>
            <Link
              to="/register"
              className="flex h-7 items-center rounded-sm bg-(--sb-accent-fill) px-3 text-[11px] font-bold uppercase tracking-wide text-(--sb-accent-text-on-dark) no-underline hover:bg-(--sb-accent-fill-hover)"
            >
              {t("header.register")}
            </Link>
          </div>
        )}

        <div className="relative z-20 shrink-0" ref={langMenuRef}>
          <button
            type="button"
            id="lang-menu-button"
            aria-haspopup="listbox"
            aria-expanded={langMenuOpen}
            aria-controls="lang-menu-list"
            aria-label={t("header.languageMenu")}
            onClick={() => setLangMenuOpen((o) => !o)}
            className="inline-flex h-8 cursor-pointer items-center gap-1 border-0 bg-transparent py-0 pl-0.5 pr-0.5"
            title={language === "en" ? LANG_FLAG.en.label : LANG_FLAG.am.label}
          >
            <span className="inline-flex h-5 w-5 shrink-0 overflow-hidden rounded-sm">
              <img
                src={flagSrc(LANG_FLAG[language].code)}
                alt=""
                width={20}
                height={20}
                className="h-full w-full object-cover"
                decoding="async"
              />
            </span>
            <span className="hidden text-[10px] font-bold uppercase text-(--sb-text-muted) sm:inline">
              {language === "en" ? "ENG" : "AMH"}
            </span>
          </button>

          {langMenuOpen ? (
            <ul
              id="lang-menu-list"
              role="listbox"
              aria-labelledby="lang-menu-button"
              className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[7rem] overflow-hidden rounded-sm bg-(--sb-bg-card-elevated) py-1 shadow-lg"
            >
              <li role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={language === "en"}
                  onClick={() => selectLang("en")}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-bold text-white hover:bg-(--sb-odd)"
                >
                  ENG
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={language === "am"}
                  onClick={() => selectLang("am")}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-bold text-white hover:bg-(--sb-odd)"
                >
                  AMH
                </button>
              </li>
            </ul>
          ) : null}
        </div>

        <HeaderClock />

        {onOpenSlip ? (
          <button
            type="button"
            onClick={onOpenSlip}
            className="relative hidden h-8 cursor-pointer items-center justify-center border-0 bg-transparent px-1 text-white hover:text-(--sb-accent-fill) lg:inline-flex"
            aria-label={
              slipCount > 0
                ? `${t("header.betSlip")} (${slipCount})`
                : t("header.betSlip")
            }
          >
            <AppIcon name="receipt" size={16} />
            {slipCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-(--sb-accent-fill) px-1 text-[9px] font-bold text-(--sb-accent-text-on-dark)">
                {slipCount > 99 ? "99+" : slipCount}
              </span>
            ) : null}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="inline-flex h-8 w-6 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent text-white"
          aria-label={t("menu.title")}
        >
          <AppIcon name="moreVertical" size={18} strokeWidth={2.2} />
        </button>
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {isLoggedIn ? (
        <NotificationsDialog
          open={notificationsOpen}
          onClose={() => {
            setNotificationsOpen(false);
            void refreshUnreadCount();
          }}
          onReadChange={() => void refreshUnreadCount()}
        />
      ) : null}
    </>
  );
}

export default TopHeader;
