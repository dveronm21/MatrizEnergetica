import React, { useState } from 'react';

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
}

export default function StatusBar({ lastUpdated, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/refresh', { method: 'POST' });
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div style={styles.bar}>
      <div style={styles.info}>
        <span style={styles.dot} />
        <span>Datos actualizados: <strong>{formatDateTime(lastUpdated)}</strong></span>
        <span style={styles.note}>· Refresco automático cada 5 min</span>
      </div>
      <button onClick={handleRefresh} disabled={refreshing} style={styles.btn}>
        {refreshing ? 'Actualizando…' : '↻ Actualizar ahora'}
      </button>
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    background: '#fff',
    borderRadius: 10,
    padding: '10px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    fontSize: 13,
    color: '#4a5568',
  },
  info: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#48bb78',
    display: 'inline-block',
    flexShrink: 0,
  },
  note: {
    color: '#a0aec0',
  },
  btn: {
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
