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

export default function DemandCard({ demandaActual }) {
  const total = demandaActual?.sumTotal ?? null;
  const fecha = demandaActual?.fecha ?? null;

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Demanda Actual SADI</h2>
      <p style={styles.value}>{formatMW(total)} <span style={styles.unit}>MW</span></p>
      <p style={styles.subtitle}>
        Actualizado a las {formatTime(fecha)}
      </p>
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
    color: '#1a73e8',
    fontWeight: 500,
  },
};
