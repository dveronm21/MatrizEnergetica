import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function parseHour(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function roundTo5min(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  d.setSeconds(0, 0);
  d.setMinutes(Math.floor(d.getMinutes() / 5) * 5);
  return d.getTime();
}

function mergeTimeSeries(demandaArr, generacionArr) {
  const map = new Map();

  (demandaArr || []).forEach(d => {
    if (d.demHoy == null) return;
    const key = roundTo5min(d.fecha);
    if (key == null) return;
    map.set(key, { hora: parseHour(d.fecha), ts: key, demanda: d.demHoy, demAyer: d.demAyer ?? null });
  });

  (generacionArr || []).forEach(g => {
    const key = roundTo5min(g.fecha);
    if (key == null) return;
    const existing = map.get(key) || { hora: parseHour(g.fecha), ts: key };
    existing.generacion = g.sumTotal ?? null;
    if (existing.demanda != null && existing.generacion != null && existing.demanda > 0) {
      existing.pctGeneracion = +((existing.generacion / existing.demanda) * 100).toFixed(1);
    }
    map.set(key, existing);
  });

  return Array.from(map.values())
    .filter(d => d.hora)
    .sort((a, b) => a.ts - b.ts);
}

const SERIES = [
  { key: 'demanda',      label: 'Demanda Cuyo hoy',  color: '#e53e3e' },
  { key: 'demAyer',      label: 'Demanda Cuyo ayer', color: '#fc8181' },
  { key: 'generacion',   label: 'Generación Cuyo',   color: '#1a9e9e' },
  { key: 'pctGeneracion',label: '% Gen / Dem Cuyo',  color: '#805ad5' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={styles.tooltip}>
      <strong style={{ display: 'block', marginBottom: 4 }}>{label}</strong>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontSize: 13 }}>
          {p.name}: {p.value != null ? p.value.toLocaleString('es-AR') : '—'}
          {p.dataKey === 'pctGeneracion' ? ' %' : ' MW'}
        </div>
      ))}
    </div>
  );
}

export default function RegionalChart({ cuyoDemanda, cuyoGeneracion }) {
  const [visible, setVisible] = useState({ demanda: true, demAyer: false, generacion: true, pctGeneracion: false });
  const chartData = mergeTimeSeries(cuyoDemanda, cuyoGeneracion);

  const toggle = key => setVisible(v => ({ ...v, [key]: !v[key] }));

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Demanda y Generación — Región Cuyo</h2>
          <p style={styles.subtitle}>
            Demanda Real y Generación por Fuente (MW) · Cuyo: San Juan, Mendoza, San Luis
          </p>
        </div>
        <div style={styles.toggles}>
          {SERIES.map(s => (
            <button
              key={s.key}
              onClick={() => toggle(s.key)}
              style={{
                ...styles.toggleBtn,
                background: visible[s.key] ? s.color : 'transparent',
                color: visible[s.key] ? '#fff' : s.color,
                borderColor: s.color,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="hora"
            tick={{ fontSize: 11, fill: '#718096' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="mw"
            tick={{ fontSize: 11, fill: '#718096' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}`}
            width={45}
            label={{ value: 'MW', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#718096', dx: -2 }}
          />
          <YAxis
            yAxisId="pct"
            orientation="right"
            tick={{ fontSize: 11, fill: '#718096' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}%`}
            width={40}
            hide={!visible.pctGeneracion}
          />
          <Tooltip content={<CustomTooltip />} />
          {visible.demanda && (
            <Line yAxisId="mw" type="monotone" dataKey="demanda" name="Demanda hoy"
              stroke="#e53e3e" dot={false} strokeWidth={2} connectNulls />
          )}
          {visible.demAyer && (
            <Line yAxisId="mw" type="monotone" dataKey="demAyer" name="Demanda ayer"
              stroke="#fc8181" dot={false} strokeWidth={1.5} strokeDasharray="4 2" connectNulls />
          )}
          {visible.generacion && (
            <Line yAxisId="mw" type="monotone" dataKey="generacion" name="Generación Cuyo"
              stroke="#1a9e9e" dot={false} strokeWidth={2} connectNulls />
          )}
          {visible.pctGeneracion && (
            <Line yAxisId="pct" type="monotone" dataKey="pctGeneracion" name="%Gen/Dem"
              stroke="#805ad5" dot={false} strokeWidth={2} strokeDasharray="5 3" connectNulls />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '24px 20px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: '#2d3748',
  },
  subtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  note: {
    color: '#a0aec0',
    fontStyle: 'italic',
  },
  toggles: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  toggleBtn: {
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 500,
    border: '1.5px solid',
    borderRadius: 20,
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  tooltip: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
};
