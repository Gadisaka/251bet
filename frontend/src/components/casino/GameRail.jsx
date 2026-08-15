import AppIcon from "../common/AppIcon";

const SIZE_CLASS = {
  rail: "w-[112px] shrink-0 aspect-[4/3]",
  featured: "min-w-0 w-full aspect-[4/3]",
  sm: "w-full aspect-square",
  lg: "w-full aspect-[3/4]",
};

export function GameCard({ game, onPlay, launching = false, size = "lg" }) {
  return (
    <button
      type="button"
      disabled={launching}
      onClick={() => onPlay?.(game)}
      className={`group relative ${SIZE_CLASS[size] || SIZE_CLASS.lg} cursor-pointer overflow-hidden rounded-sm border-0 bg-[#0a0a0a] p-0 text-left hover:ring-1 hover:ring-(--sb-accent-fill)/60 disabled:cursor-wait disabled:opacity-70`}
      style={game.gradient ? { background: game.gradient } : undefined}
    >
      {game.iconUrl ? (
        <img
          src={game.iconUrl}
          alt={game.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : game.gradient ? null : (
        <div className="absolute inset-0 flex items-center justify-center text-[#3a3a3a]">
          <AppIcon name="gamepad" size={40} />
        </div>
      )}

      {game.provider ? (
        <span className="absolute left-1 top-1 rounded-[2px] bg-black/60 px-1 py-px text-[8px] font-bold uppercase tracking-wide text-white/90">
          {game.provider}
        </span>
      ) : null}

      {launching ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-1.5 pb-1.5 pt-6">
        <h3 className="truncate text-[11px] font-semibold text-[#f6f9ff]">
          {game.title}
        </h3>
      </div>
    </button>
  );
}

/**
 * Horizontal casino rail. Featured rows (four tiles) fill the width;
 * denser rows scroll so every tile stays reachable.
 */
export function GameRail({ title, overflow, games, onPlay, onMore, featured = false }) {
  return (
    <section className="pb-3">
      <div className="flex items-center justify-between px-2 py-2">
        <h2 className="m-0 text-[13px] font-medium text-white">{title}</h2>
        {overflow ? (
          <button
            type="button"
            onClick={onMore}
            className="inline-flex cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 text-[12px] font-medium text-(--sb-text-muted) hover:text-white"
          >
            +{overflow.toLocaleString()}
            <AppIcon name="chevronRight" size={13} />
          </button>
        ) : null}
      </div>
      {featured ? (
        <div className="grid grid-cols-4 gap-1.5 px-2">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onPlay={onPlay} size="featured" />
          ))}
        </div>
      ) : (
        <div className="flex gap-1.5 overflow-x-auto px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onPlay={onPlay} size="rail" />
          ))}
        </div>
      )}
    </section>
  );
}

export default GameRail;
