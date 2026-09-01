function OddsCell({
  label,
  value,
  selected,
  suspended = false,
  onClick,
  className = "",
  layout = "horizontal",
}) {
  const stacked = layout === "stacked";
  const locked = suspended || value == null || value === "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={`${
        stacked
          ? "flex min-h-[40px] flex-col items-center justify-center gap-0.5 rounded-sm border px-1.5 py-1.5 text-center"
          : "flex min-h-8 items-center justify-between gap-1 rounded-sm border px-2"
      } ${
        locked
          ? "cursor-default border-transparent bg-(--sb-odd) text-(--sb-text-muted) opacity-45"
          : selected
            ? "cursor-pointer border-(--sb-accent-fill) bg-(--sb-accent-fill) text-(--sb-accent-text-on-dark)"
            : "cursor-pointer border-transparent bg-(--sb-odd) text-white hover:bg-(--sb-bg-card-elevated)"
      } ${className}`.trim()}
    >
      {label ? (
        <span
          className={`font-bold text-[#ffffff] ${
            stacked
              ? "max-w-full whitespace-normal break-words text-balance text-[10px] leading-tight"
              : "text-[13px]"
          }`}
        >
          {label}
        </span>
      ) : null}
      <span
        className={`font-bold ${
          stacked ? "text-[13px] leading-none" : "text-sm"
        } ${
          locked
            ? "text-(--sb-text-muted)"
            : selected
              ? "text-(--sb-accent-text-on-dark)"
              : "text-white"
        }`}
      >
        {value}
      </span>
    </button>
  );
}

export default OddsCell;
