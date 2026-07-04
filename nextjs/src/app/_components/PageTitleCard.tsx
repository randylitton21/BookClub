export default function PageTitleCard({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="card" style={{ marginTop: 14 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ marginBottom: 2 }}>{title}</h1>
          {subtitle != null && <div className="muted">{subtitle}</div>}
        </div>
        {actions != null && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
