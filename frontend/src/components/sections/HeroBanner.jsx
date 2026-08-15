import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import welcomeBonus from "../../assets/banners/01-welcome-bonus.png";
import superBet from "../../assets/banners/02-super-bet.png";
import profitBooster from "../../assets/banners/03-profit-booster.png";
import firstDeposit from "../../assets/banners/04-first-deposit.png";
import cashBonus50x from "../../assets/banners/05-cash-bonus-50x.png";
import weeklyCashback from "../../assets/banners/06-weekly-cashback.png";
import multipleOfTheDay from "../../assets/banners/07-multiple-of-the-day.png";
import wednesdayBonus from "../../assets/banners/08-wednesday-bonus.png";
import cashBonus100x from "../../assets/banners/09-cash-bonus-100x.png";
import tuesdayFreeBet from "../../assets/banners/10-tuesday-free-bet.png";
import cashOut from "../../assets/banners/11-cash-out.png";
import esports from "../../assets/banners/12-esports.png";
import promotionsVideo from "../../assets/banners/promotions.mp4";

const SLIDES = Object.freeze([
  { id: "welcome-bonus", src: welcomeBonus, alt: "Sports welcome bonus up to 100%" },
  { id: "super-bet", src: superBet, alt: "Super Bet — decide the size of your bet" },
  { id: "profit-booster", src: profitBooster, alt: "Deposit and activate Profit Booster every day" },
  { id: "first-deposit", src: firstDeposit, alt: "1st deposit reward every day" },
  { id: "cash-bonus-50x", src: cashBonus50x, alt: "Cash bonus up to 50x" },
  { id: "weekly-cashback", src: weeklyCashback, alt: "10% weekly cashback on sports" },
  { id: "multiple-of-the-day", src: multipleOfTheDay, alt: "Multiple of the day with extra cash bonus" },
  { id: "wednesday-bonus", src: wednesdayBonus, alt: "10% sports bonus every Wednesday" },
  { id: "cash-bonus-100x", src: cashBonus100x, alt: "Cash bonus up to 100x" },
  { id: "tuesday-free-bet", src: tuesdayFreeBet, alt: "Tuesday free bet 10% on turnover" },
  { id: "cash-out", src: cashOut, alt: "Cash out with 0% commission" },
  { id: "esports", src: esports, alt: "15% free bet on e-sports every Thursday" },
]);

/** Native aspect of the recorded promotions strip (1632×176). */
const PROMO_ASPECT = "1632 / 176";

function PromotionsStrip() {
  return (
    <Link
      to="/promotions"
      aria-label="Promotions"
      className="relative block w-full overflow-hidden bg-[#f5c518]"
      style={{ aspectRatio: PROMO_ASPECT }}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={promotionsVideo} type="video/mp4" />
      </video>
    </Link>
  );
}

/**
 * Image carousel is the first screen on desktop (fills the viewport below
 * the sticky chrome). The Promotions video starts on the next screen down.
 */
function HeroBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (SLIDES.length <= 1) return undefined;
    const intervalId = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden bg-(--sb-bg-0) aspect-[2.4/1] max-h-[220px] lg:aspect-auto lg:h-[calc(100svh-8.75rem)] lg:max-h-none">
        {SLIDES.map((slide, index) => (
          <img
            key={slide.id}
            src={slide.src}
            alt={slide.alt}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${
              index === currentBanner ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <span className="absolute right-2 top-2 rounded-sm bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-(--sb-accent-fill) lg:right-4 lg:top-4 lg:px-2 lg:py-1 lg:text-xs">
          {currentBanner + 1} / {SLIDES.length}
        </span>
        <div className="absolute inset-x-0 bottom-1.5 flex items-center justify-center gap-1 lg:bottom-3 lg:gap-1.5">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={slide.alt}
              aria-current={index === currentBanner}
              onClick={() => setCurrentBanner(index)}
              className={`h-1.5 cursor-pointer rounded-full border-0 p-0 transition-all lg:h-2 ${
                index === currentBanner
                  ? "w-4 bg-white lg:w-5"
                  : "w-1.5 bg-white/40 hover:bg-white/70 lg:w-2"
              }`}
            />
          ))}
        </div>
      </div>

      <PromotionsStrip />
    </div>
  );
}

export default HeroBanner;
