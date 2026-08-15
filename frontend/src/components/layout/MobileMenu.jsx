import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../common/AppIcon";
import { INFO_PAGES } from "../../data/infoPages";
import { useTranslation } from "../../i18n/LanguageContext.jsx";

const rowCls =
  "flex w-full cursor-pointer items-center gap-3 border-0 border-b border-(--sb-border) bg-transparent px-4 py-3 text-left text-sm font-medium text-white";

function MobileMenu({ open, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [myBetsOpen, setMyBetsOpen] = useState(true);
  const [balanceOpen, setBalanceOpen] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;
  const isLoggedIn = !!token;

  function go(path) {
    onClose();
    navigate(path);
  }

  function handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    onClose();
    navigate("/login");
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[85] cursor-default border-0 bg-black/55 lg:hidden"
          onClick={onClose}
          aria-label={t("common.closeMenu")}
        />
      ) : null}
      <div
        className={`fixed inset-y-0 left-0 z-[90] flex w-[min(100vw-2.5rem,18.5rem)] flex-col overflow-hidden bg-(--sb-bg-2) transition-transform duration-200 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label={t("menu.title")}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-(--sb-border) bg-(--sb-bg-card) px-3">
          <p className="m-0 text-xs font-bold uppercase tracking-wider text-white">
            {t("menu.title")}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center border-0 bg-transparent text-white"
            aria-label={t("common.close")}
          >
            <AppIcon name="x" size={20} strokeWidth={2.4} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <button type="button" className={rowCls} onClick={() => go("/")}>
            {t("nav.home")}
          </button>
          <button type="button" className={rowCls} onClick={() => go("/live")}>
            {t("nav.live")}
          </button>
          <button type="button" className={rowCls} onClick={() => go("/casino")}>
            {t("nav.games")}
          </button>

          {isLoggedIn ? (
            <>
              <button
                type="button"
                className={rowCls}
                onClick={() => go("/profile")}
              >
                {t("menu.myProfile")}
              </button>
              <button
                type="button"
                onClick={() => setMyBetsOpen((p) => !p)}
                className={`${rowCls} justify-between`}
              >
                {t("menu.myBets")}
                <AppIcon
                  name={myBetsOpen ? "chevronUp" : "chevronDown"}
                  size={14}
                  className="text-(--sb-text-muted)"
                />
              </button>
              {myBetsOpen ? (
                <div className="bg-(--sb-bg-0)">
                  <button
                    type="button"
                    className={`${rowCls} pl-8 text-(--sb-text-muted)`}
                    onClick={() => go("/bets")}
                  >
                    {t("menu.betHistory")}
                  </button>
                  <button
                    type="button"
                    className={`${rowCls} pl-8 text-(--sb-text-muted)`}
                    onClick={() => go("/check-ticket")}
                  >
                    {t("menu.checkTicket")}
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setBalanceOpen((p) => !p)}
                className={`${rowCls} justify-between`}
              >
                {t("menu.balance")}
                <AppIcon
                  name={balanceOpen ? "chevronUp" : "chevronDown"}
                  size={14}
                  className="text-(--sb-text-muted)"
                />
              </button>
              {balanceOpen ? (
                <div className="bg-(--sb-bg-0)">
                  {[
                    { tKey: "menu.deposit", path: "/deposit" },
                    { tKey: "menu.withdraw", path: "/withdraw" },
                    { tKey: "menu.transaction", path: "/transactions" },
                  ].map((item) => (
                    <button
                      key={item.tKey}
                      type="button"
                      className={`${rowCls} pl-8 text-(--sb-text-muted)`}
                      onClick={() => go(item.path)}
                    >
                      {t(item.tKey)}
                    </button>
                  ))}
                </div>
              ) : null}
              <button type="button" className={rowCls} onClick={handleSignOut}>
                {t("menu.signOut")}
              </button>
            </>
          ) : (
            <>
              <button type="button" className={rowCls} onClick={() => go("/login")}>
                {t("header.login")}
              </button>
              <button
                type="button"
                className={rowCls}
                onClick={() => go("/register")}
              >
                {t("header.register")}
              </button>
            </>
          )}

          {INFO_PAGES.map(({ slug }) => (
            <button
              key={slug}
              type="button"
              className={`${rowCls} text-(--sb-text-muted)`}
              onClick={() => go(`/info/${slug}`)}
            >
              {t(`infoPage.${slug}`)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default MobileMenu;
