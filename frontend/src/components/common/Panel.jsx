/** Glassy surface — aligns with SoftPanel / MainLayout chrome */
function Panel({
  as: Component = "section",
  className = "",
  children,
  ...rest
}) {
  return (
    <Component
      className={`sb-card ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Panel;
