import welcomeBonus from "../../../assets/banners/01-welcome-bonus.png";
import firstDeposit from "../../../assets/banners/04-first-deposit.png";

const BANNERS = Object.freeze([
  {
    id: "welcome-bonus",
    src: welcomeBonus,
    alt: "Sports welcome bonus up to 100%",
  },
  {
    id: "first-deposit",
    src: firstDeposit,
    alt: "1st deposit reward every day",
  },
]);

function DesktopHero() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {BANNERS.map((banner) => (
        <div
          key={banner.id}
          className="relative min-h-[240px] overflow-hidden rounded-xl bg-(--sb-bg-card) xl:min-h-[300px]"
        >
          <img
            src={banner.src}
            alt={banner.alt}
            decoding="async"
            className="aspect-[16/7] h-full w-full object-cover object-center"
          />
        </div>
      ))}
    </div>
  );
}

export default DesktopHero;
