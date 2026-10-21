export function Loading({ label = "Cargando…" }) {
  return (
    <div className="loading-block">
      <span className="spinner" />
      {label}
    </div>
  );
}

export function EmptyState({ icon = "▢", title, subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {subtitle && <p style={{ fontSize: 13, marginTop: 6 }}>{subtitle}</p>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

export function Pagination({ count, page, pageSize = 50, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <span>
        Página {page} de {totalPages} · {count} registros
      </span>
      <div className="controls">
        <button className="btn btn-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          ← Anterior
        </button>
        <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Siguiente →
        </button>
      </div>
    </div>
  );
}
