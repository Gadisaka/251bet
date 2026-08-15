/** Soft glassy surface — matches deposit / auth account palette */
export function SoftPanel({ children, className = "", style }) {
  return (
    <div
      style={style}
      className={`sb-card rounded-sm px-5 py-6 ${className}`}
    >
      {children}
    </div>
  );
}

export default SoftPanel;
