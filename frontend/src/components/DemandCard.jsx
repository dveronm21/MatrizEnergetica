import React from 'react';

function formatMW(value) {
  if (value == null) return '—';
  return value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function DemandCard({ sanjuanDemanda }) {
  const last = sanjuanDemanda?.findLast(d => d.demHoy != null) ?? null;
  const hoy = last?.demHoy ?? null;
  const ayer = last?.demAyer ?? null;
  const fecha = last?.fecha ?? null;
  const diff = hoy != null && ayer != null ? hoy - ayer : null;
  const diffPct = diff != null && ayer ? ((diff / ayer) * 100).toFixed(1) : null;
  const diffColor = diff == null ? '#718096' : diff >= 0 ? '#e53e3e' : '#52b788';
  const diffArrow = diff == null ? '' : diff >= 0 ? '▲' : '▼';

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Demanda Actual — San Juan</h2>
      <p style={styles.value}>{formatMW(hoy)} <span style={styles.unit}>MW</span></p>
      <p style={styles.subtitle}>Actualizado a las {formatTime(fecha)}</p>
      {diffPct != null && (
        <p style={{ ...styles.diff, color: diffColor }}>
          {diffArrow} {Math.abs(diff).toLocaleString('es-AR')} MW ({Math.abs(diffPct)}%) vs ayer
        </p>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '28px 32px',
    textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
    color: '#4a5568',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  value: {
    fontSize: 52,
    fontWeight: 700,
    color: '#1a73e8',
    lineHeight: 1.1,
    marginBottom: 8,
  },
  unit: {
    fontSize: 28,
    fontWeight: 600,
    color: '#1a73e8',
  },
  subtitle: {
    fontSize: 13,
    color: '#718096',
    fontWeight: 500,
  },
  diff: {
    fontSize: 13,
    fontWeight: 600,
    marginTop: 4,
  },
};
