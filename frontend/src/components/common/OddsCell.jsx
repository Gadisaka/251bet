function OddsCell({
  label,
  value,
  selected,
  onClick,
  className = "",
  layout = "horizontal",
}) {
  const stacked = layout === "stacked";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${
        stacked
          ? "flex min-h-[40px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-sm border px-1.5 py-1.5 text-center"
          : "flex min-h-8 cursor-pointer items-center justify-between gap-1 rounded-sm border px-2"
      } ${
        selected
          ? "border-(--sb-accent-fill) bg-(--sb-accent-fill) text-(--sb-accent-text-on-dark)"
          : "border-transparent bg-(--sb-odd) text-white hover:bg-(--sb-bg-card-elevated)"
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
        } ${selected ? "text-(--sb-accent-text-on-dark)" : "text-white"}`}
      >
        {value}
      </span>
    </button>
  );
}

export default OddsCell;
