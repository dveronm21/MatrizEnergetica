import React from 'react';

const MAX_SAN_JUAN = 700; // máximo estimado San Juan (pico verano ~700 MW)

function arc(pct, r) {
  const angle = Math.PI * (pct / 100);
  const x = 100 - r * Math.cos(angle);
  const y = 100 - r * Math.sin(angle);
  return `M ${100 - r} 100 A ${r} ${r} 0 0 1 ${x} ${y}`;
}

// Marker point (x, y) at a given pct on the semicircle arc of radius r centered at (100, 100)
function arcPoint(pct, r) {
  const angle = Math.PI * (pct / 100);
  return {
    x: 100 - r * Math.cos(angle),
    y: 100 - r * Math.sin(angle),
  };
}

function gaugeColor(pct) {
  if (pct < 50) return '#52b788';
  if (pct < 75) return '#f6ad55';
  return '#e53e3e';
}

function gaugeLabel(pct) {
  if (pct < 50) return 'Normal';
  if (pct < 75) return 'Moderada';
  return 'Alta';
}

export default function EnergyGauge({ sanjuanDemanda }) {
  const last = sanjuanDemanda?.findLast(d => d.demHoy != null) ?? null;
  const total = last?.demHoy ?? 0;
  const picoDia = Math.max(...(sanjuanDemanda?.map(d => d.demHoy ?? 0) ?? [0]));
  const pct = Math.min(100, Math.round((total / MAX_SAN_JUAN) * 100));
  const picoPct = Math.min(100, Math.round((picoDia / MAX_SAN_JUAN) * 100));
  const color = gaugeColor(pct);
  const label = gaugeLabel(pct);
  const isAlta = pct >= 85;

  const R = 70;
  const bgPath = arc(100, R);
  const fgPath = arc(pct, R);

  // Pico marker: short tick perpendicular to the arc at picoPct
  const picoAngle = Math.PI * (picoPct / 100);
  const innerR = R - 9;
  const outerR = R + 9;
  const px1 = 100 - innerR * Math.cos(picoAngle);
  const py1 = 100 - innerR * Math.sin(picoAngle);
  const px2 = 100 - outerR * Math.cos(picoAngle);
  const py2 = 100 - outerR * Math.sin(picoAngle);

  return (
    <div style={{ ...styles.card, borderLeft: '3px solid #1a73e8' }}>
      <h2 style={styles.title}>Nivel de Carga — San Juan</h2>
      <p style={styles.sub}>% sobre máximo estimado ({MAX_SAN_JUAN.toLocaleString('es-AR')} MW pico verano)</p>
      <span style={styles.badge}>San Juan</span>

      <svg viewBox="0 0 200 110" style={styles.svg}>
        {/* Alert pulse keyframes injected inline */}
        {isAlta && (
          <defs>
            <style>{`
              @keyframes pulseFill {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.45; }
              }
              .gauge-alert { animation: pulseFill 1.1s ease-in-out infinite; }
            `}</style>
          </defs>
        )}

        {/* Background track */}
        <path d={bgPath} fill="none" stroke="#e2e8f0" strokeWidth={14} strokeLinecap="round" />

        {/* Foreground arc */}
        <path d={fgPath} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />

        {/* Pico diario marker tick */}
        {picoPct > 0 && (
          <line
            x1={px1} y1={py1}
            x2={px2} y2={py2}
            stroke="#f6ad55"
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}

        {/* Percentage label */}
        <text
          x="100"
          y="82"
          textAnchor="middle"
          fontSize="28"
          fontWeight={isAlta ? 900 : 700}
          fill={isAlta ? '#e53e3e' : color}
          className={isAlta ? 'gauge-alert' : undefined}
        >
          {pct}%
        </text>

        {/* Status label */}
        <text x="100" y="100" textAnchor="middle" fontSize="11" fill="#718096">
          {label}
        </text>
      </svg>

      {/* Three-column footer */}
      <div style={styles.footer}>
        <div style={styles.footerCol}>
          <span style={styles.footerLabel}>Actual</span>
          <span style={{ ...styles.footerValue, color }}>{total.toLocaleString('es-AR')} MW</span>
        </div>
        <div style={styles.footerCol}>
          <span style={styles.footerLabel}>Pico hoy</span>
          <span style={{ ...styles.footerValue, color: '#f6ad55' }}>{picoDia.toLocaleString('es-AR')} MW</span>
        </div>
        <div style={styles.footerCol}>
          <span style={styles.footerLabel}>Cap. ref.</span>
          <span style={{ ...styles.footerValue, color: '#a0aec0' }}>{MAX_SAN_JUAN.toLocaleString('es-AR')} MW</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: 600, color: '#2d3748', textAlign: 'center' },
  sub: { fontSize: 12, color: '#718096', textAlign: 'center', marginBottom: 4 },
  badge: {
    fontSize: 11,
    color: '#1a73e8',
    fontWeight: 600,
    marginBottom: 8,
    letterSpacing: '0.02em',
  },
  svg: { width: '100%', maxWidth: 220 },
  footer: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  footerLabel: {
    fontSize: 10,
    color: '#a0aec0',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  footerValue: {
    fontSize: 13,
    fontWeight: 700,
  },
};
