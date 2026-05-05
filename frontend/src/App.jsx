import React from 'react';
import { useEnergyData } from './hooks/useEnergyData.js';
import DemandCard from './components/DemandCard.jsx';
import GenerationMatrix from './components/GenerationMatrix.jsx';
import RegionalChart from './components/RegionalChart.jsx';
import StatusBar from './components/StatusBar.jsx';
import EnergyGauge from './components/EnergyGauge.jsx';
import RenewableIndicator from './components/RenewableIndicator.jsx';
import FuelMixBars from './components/FuelMixBars.jsx';

export default function App() {
  const { data, loading, error, refresh } = useEnergyData();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logoGroup}>
          <img src="/logo-epse.png" alt="EPSE" style={styles.logoImg} />
          <div>
            <div style={styles.logoTitle}>Sistema Eléctrico — San Juan</div>
            <div style={styles.logoSub}>Datos en tiempo real · Fuente CAMMESA</div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.badge}>⚡ SADI en vivo</span>
        </div>
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

            {/* Leyenda de código de colores geográficos */}
            <div style={styles.geoLegend}>
              <span style={{ ...styles.geoBadge, borderColor: '#1a73e8', color: '#1a73e8' }}>■ San Juan</span>
              <span style={{ ...styles.geoBadge, borderColor: '#f59e0b', color: '#f59e0b' }}>■ Región Cuyo</span>
              <span style={{ ...styles.geoBadge, borderColor: '#6b7280', color: '#6b7280' }}>■ SADI Nacional</span>
            </div>

            {/* Fila 1: Demanda SJ + Gauge SJ + Renovable Cuyo */}
            <div style={styles.topGrid3}>
              <div style={styles.wrapperSanJuan}>
                <DemandCard sanjuanDemanda={data.sanjuanDemanda} />
              </div>
              <div style={styles.wrapperSanJuan}>
                <EnergyGauge sanjuanDemanda={data.sanjuanDemanda} />
              </div>
              <RenewableIndicator
                cuyoParticipacion={data.cuyoParticipacion}
                cuyoGeneracion={data.cuyoGeneracion}
              />
            </div>

            {/* Fila 2: Donut SADI + Barras mix Cuyo */}
            <div style={styles.midGrid}>
              <GenerationMatrix demandaActual={data.demandaActual} />
              <FuelMixBars
                cuyoParticipacion={data.cuyoParticipacion}
                cuyoGeneracion={data.cuyoGeneracion}
              />
            </div>

            <div style={styles.wrapperSADI}>
              <RegionalChart
                sanjuanDemanda={data.sanjuanDemanda}
                cuyoGeneracion={data.cuyoGeneracion}
              />
            </div>
          </>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerRow}>
          <span>
            Fuente:{' '}
            <a href="https://api.cammesa.com" style={styles.link} target="_blank" rel="noopener noreferrer">
              api.cammesa.com
            </a>
            {' '}· Actualización cada 5 min
          </span>
          <span style={styles.author}>
            Desarrollado por <strong>Douglas Verón</strong> · EPSE San Juan
          </span>
        </div>
      </footer>
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
    borderBottom: '2px solid #1a73e8',
    padding: '12px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 2px 8px rgba(26,115,232,0.08)',
  },
  logoGroup: { display: 'flex', alignItems: 'center', gap: 14 },
  logoImg: { height: 48, objectFit: 'contain' },
  logoTitle: { fontSize: 17, fontWeight: 700, color: '#1a2a4a', letterSpacing: -0.2 },
  logoSub: { fontSize: 11, color: '#718096', marginTop: 1 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  badge: {
    background: '#ebf8ff',
    color: '#2b6cb0',
    border: '1px solid #bee3f8',
    borderRadius: 20,
    padding: '4px 14px',
    fontSize: 12,
    fontWeight: 600,
  },
  main: {
    flex: 1,
    width: '100%',
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    boxSizing: 'border-box',
  },
  geoLegend: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    fontSize: 12,
    color: '#718096',
    flexWrap: 'wrap',
  },
  geoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    border: '1.5px solid',
    borderRadius: 20,
    padding: '3px 10px',
    fontWeight: 600,
    fontSize: 11,
  },
  topGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))',
    gap: 20,
  },
  wrapperSanJuan: {
    borderLeft: '3px solid #1a73e8',
    borderRadius: 12,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  wrapperSADI: {
    borderLeft: '3px solid #6b7280',
    borderRadius: 12,
    overflow: 'hidden',
  },
  midGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
    padding: '14px 32px', fontSize: 12,
    color: '#a0aec0', borderTop: '1px solid #e2e8f0', background: '#fff',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  link: { color: '#1a73e8', textDecoration: 'none' },
  author: { color: '#4a5568', fontStyle: 'italic' },
};
