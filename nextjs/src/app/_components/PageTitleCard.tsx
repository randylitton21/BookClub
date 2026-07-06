export default function PageTitleCard({
  title,
  subtitle,
  actions,
  variant = "default",
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: "default" | "hero";
}) {
  return (
    <header className={`pageHeader${variant === "hero" ? " pageHeader--hero" : ""}`}>
      <div className="pageHeaderInner">
        <div className="pageHeaderText">
          <h1 className="pageHeaderTitle">{title}</h1>
          {subtitle != null && <p className="pageHeaderSubtitle muted">{subtitle}</p>}
        </div>
        {actions != null && <div className="pageHeaderActions">{actions}</div>}
      </div>
    </header>
  );
}
