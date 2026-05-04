import React from 'react';

const FUENTES = [
  { key: 'termico',    label: 'Térmico',             color: '#f4845f', icon: '🔥' },
  { key: 'hidraulico', label: 'Hidráulico >50MW',    color: '#1a9e9e', icon: '💧' },
  { key: 'renovable',  label: 'Renovable Ley 27.191', color: '#52b788', icon: '🌬' },
  { key: 'nuclear',    label: 'Nuclear',              color: '#818cf8', icon: '⚛️' },
  { key: 'importacion',label: 'Importación',          color: '#a78bfa', icon: '🔌', esImportacion: true },
];

export default function FuelMixBars({ cuyoParticipacion, cuyoGeneracion }) {
  const snap = cuyoParticipacion ?? (cuyoGeneracion?.at(-1) ?? null);
  const totalGeneracion = (snap?.termico ?? 0) + (snap?.hidraulico ?? 0) + (snap?.renovable ?? 0) + (snap?.nuclear ?? 0) || 1;
  const totalConImport = snap?.sumTotal || 1;

  const items = FUENTES.map(f => ({
    ...f,
    value: snap?.[f.key] ?? 0,
    pct: snap ? Math.round(((snap[f.key] ?? 0) / (f.esImportacion ? totalConImport : totalGeneracion)) * 100) : 0,
  })).sort((a, b) => b.value - a.value);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Mix de Generación — Detalle por Fuente</h2>
        <span style={{ ...styles.region, color: '#f59e0b' }}>Región Cuyo (SJ · MDZ · SL) · tiempo real</span>
      </div>

      <div style={styles.list}>
        {items.map((item, idx) => {
          const prevItem = idx > 0 ? items[idx - 1] : null;
          const showDivider = item.esImportacion && prevItem && !prevItem.esImportacion;
          return (
            <React.Fragment key={item.key}>
              {showDivider && (
                <div style={{ borderTop: '1px dashed #e2e8f0', margin: '8px 0' }} />
              )}
              <div
                style={{
                  ...styles.row,
                  ...(item.esImportacion ? { borderLeft: '2px dashed #a78bfa', paddingLeft: 8 } : {}),
                }}
              >
                <div style={styles.labelRow}>
                  <span style={styles.icon}>{item.icon}</span>
                  <span style={styles.label}>{item.label}</span>
                  {item.esImportacion && (
                    <span style={{ fontSize: 10, color: '#a0aec0', marginLeft: 4 }}>(no generación propia)</span>
                  )}
                  <span style={{ ...styles.pct, color: item.color }}>{item.pct}%</span>
                  <span style={styles.mw}>{Math.round(item.value).toLocaleString('es-AR')} MW</span>
                </div>
                <div style={styles.trackBg}>
                  <div
                    style={{
                      ...styles.fill,
                      width: `${item.pct}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div style={styles.footer}>
        Total sistema:{' '}
        <strong style={{ color: '#2d3748' }}>
          {Math.round(totalConImport).toLocaleString('es-AR')} MW
        </strong>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    borderLeft: '3px solid #f59e0b',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 4,
  },
  title: { fontSize: 16, fontWeight: 600, color: '#2d3748' },
  region: { fontSize: 12, color: '#a0aec0' },
  list: { display: 'flex', flexDirection: 'column', gap: 14 },
  row: {},
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  icon: { fontSize: 15, flexShrink: 0 },
  label: { flex: 1, fontSize: 13, color: '#4a5568', fontWeight: 500 },
  pct: { fontSize: 14, fontWeight: 700, minWidth: 36, textAlign: 'right' },
  mw: { fontSize: 12, color: '#a0aec0', minWidth: 80, textAlign: 'right' },
  trackBg: {
    height: 8,
    background: '#f0f4f8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 8,
    transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
    minWidth: 4,
  },
  footer: {
    marginTop: 16,
    fontSize: 13,
    color: '#718096',
    textAlign: 'right',
    borderTop: '1px solid #f0f4f8',
    paddingTop: 12,
  },
};
