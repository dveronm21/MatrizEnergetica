import React from 'react';
import { useEnergyData } from './hooks/useEnergyData.js';
import DemandCard from './components/DemandCard.jsx';
import GenerationMatrix from './components/GenerationMatrix.jsx';
import RegionalChart from './components/RegionalChart.jsx';
import StatusBar from './components/StatusBar.jsx';

export default function App() {
  const { data, loading, error, refresh } = useEnergyData();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⚡</span>
          <span style={styles.logoText}>Matriz Energética</span>
        </div>
        <span style={styles.region}>San Juan · SADI en tiempo real</span>
      </header>

      <main style={styles.main}>
        {loading && !data && (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <p>Cargando datos de CAMMESA...</p>
          </div>
        )}

        {error && !data && (
          <div style={styles.error}>
            <p>⚠️ {error}</p>
            <button onClick={refresh} style={styles.retryBtn}>Reintentar</button>
          </div>
        )}

        {data && (
          <>
            <StatusBar lastUpdated={data.lastUpdated} onRefresh={refresh} />

            <div style={styles.topGrid}>
              <DemandCard demandaActual={data.demandaActual} />
              <GenerationMatrix demandaActual={data.demandaActual} />
            </div>

            <RegionalChart
              sanjuanDemanda={data.sanjuanDemanda}
              cuyoGeneracion={data.cuyoGeneracion}
            />

            <CuyoGeneracionDesglose
              participacion={data.cuyoParticipacion}
              generacion={data.cuyoGeneracion}
            />
          </>
        )}
      </main>

      <footer style={styles.footer}>
        Fuente de datos:{' '}
        <a href="https://api.cammesa.com" style={styles.link} target="_blank" rel="noopener noreferrer">
          api.cammesa.com
        </a>
        {' '}· El backend sondea CAMMESA cada 5 minutos · El frontend se refresca cada 60 segundos
      </footer>
    </div>
  );
}

function CuyoGeneracionDesglose({ participacion, generacion }) {
  const snap = participacion || (generacion && generacion[generacion.length - 1]);
  if (!snap) return null;

  const total = snap.sumTotal || 1;
  const items = [
    { label: 'Renovable Ley 26.190', value: snap.renovable ?? 0, color: '#52b788' },
    { label: 'Hidráulico >50MW', value: snap.hidraulico ?? 0, color: '#1a9e9e' },
    { label: 'Térmico', value: snap.termico ?? 0, color: '#f4845f' },
    { label: 'Nuclear', value: snap.nuclear ?? 0, color: '#fbbf24' },
    { label: 'Importación', value: snap.importacion ?? 0, color: '#a78bfa' },
  ];

  return (
    <div style={snap_s.card}>
      <h2 style={snap_s.title}>Generación Región Cuyo — Desglose actual</h2>
      <p style={snap_s.sub}>
        Total: <strong>{Math.round(total).toLocaleString('es-AR')} MW</strong>
        {' '}· Cuyo incluye San Juan, Mendoza y San Luis
      </p>
      <div style={snap_s.grid}>
        {items.map(item => (
          <div key={item.label} style={snap_s.item}>
            <div style={{ ...snap_s.colorBar, background: item.color }} />
            <div>
              <div style={snap_s.itemLabel}>{item.label}</div>
              <div style={{ ...snap_s.itemValue, color: item.color }}>
                {Math.round(item.value).toLocaleString('es-AR')} MW
                <span style={snap_s.pct}>
                  {' '}({Math.round((item.value / total) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#f0f4f8',
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '14px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { fontSize: 22 },
  logoText: { fontSize: 18, fontWeight: 700, color: '#1a73e8', letterSpacing: -0.3 },
  region: { fontSize: 13, color: '#718096', fontWeight: 500 },
  main: {
    flex: 1,
    maxWidth: 1100,
    width: '100%',
    margin: '0 auto',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20,
  },
  loading: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: 60, gap: 16, color: '#718096', fontSize: 15,
  },
  spinner: {
    width: 40, height: 40,
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #1a73e8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  error: {
    background: '#fff5f5', border: '1px solid #fed7d7',
    borderRadius: 10, padding: 24, textAlign: 'center', color: '#c53030',
  },
  retryBtn: {
    marginTop: 12, padding: '8px 20px', background: '#c53030',
    color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
    fontFamily: 'inherit', fontSize: 14,
  },
  footer: {
    textAlign: 'center', padding: '14px 20px', fontSize: 12,
    color: '#a0aec0', borderTop: '1px solid #e2e8f0', background: '#fff',
  },
  link: { color: '#1a73e8', textDecoration: 'none' },
};

const snap_s = {
  card: {
    background: '#fff', borderRadius: 12,
    padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  title: { fontSize: 16, fontWeight: 600, color: '#2d3748', marginBottom: 4 },
  sub: { fontSize: 13, color: '#718096', marginBottom: 16 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    gap: 16,
  },
  item: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  colorBar: { width: 4, height: 44, borderRadius: 4, flexShrink: 0, marginTop: 2 },
  itemLabel: { fontSize: 12, color: '#718096', marginBottom: 2 },
  itemValue: { fontSize: 18, fontWeight: 700 },
  pct: { fontSize: 12, fontWeight: 400, color: '#a0aec0' },
};
