import React from 'react';

function getLevel(pct) {
  if (pct >= 60) return { label: 'Excelente', color: '#276749', bg: '#c6f6d5', icon: '🌿' };
  if (pct >= 40) return { label: 'Buena', color: '#2f855a', bg: '#9ae6b4', icon: '⚡' };
  if (pct >= 20) return { label: 'Moderada', color: '#c05621', bg: '#feebc8', icon: '⚠️' };
  return { label: 'Baja', color: '#9b2c2c', bg: '#fed7d7', icon: '🔴' };
}

export default function RenewableIndicator({ cuyoParticipacion, cuyoGeneracion }) {
  const snap = cuyoParticipacion ?? (cuyoGeneracion?.at(-1) ?? null);
  const total = snap?.sumTotal || 1;
  const pctRenovable = Math.round(((snap?.renovable ?? 0) / total) * 100);
  const pctLimpia = Math.round(((( snap?.renovable ?? 0) + (snap?.hidraulico ?? 0)) / total) * 100);
  const nivel = getLevel(pctLimpia);

  const circleCircumference = 2 * Math.PI * 38;
  const dash = (pctLimpia / 100) * circleCircumference;

  return (
    <div style={{ ...styles.card, borderLeft: '3px solid #f59e0b' }}>
      <h2 style={styles.title}>Energía Renovable</h2>
      <p style={styles.sub}>Región Cuyo · Hidro &gt;50MW + Ley 27.191</p>
      <p style={styles.region}>Región Cuyo</p>

      <div style={styles.center}>
        <svg width="110" height="120" viewBox="0 0 110 120">
          <circle cx="55" cy="55" r="38" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="55" cy="55" r="38"
            fill="none"
            stroke={nivel.color}
            strokeWidth="10"
            strokeDasharray={`${dash} ${circleCircumference}`}
            strokeLinecap="round"
            transform="rotate(-90 55 55)"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
          <text x="55" y="45" textAnchor="middle" fontSize="22" fontWeight="700" fill={nivel.color}>
            {pctLimpia}%
          </text>
          <text x="55" y="62" textAnchor="middle" fontSize="11" fill="#718096">
            Gen. Limpia
          </text>
          <text x="55" y="76" textAnchor="middle" fontSize="12" fontWeight="600" fill="#52b788">
            Ley 27.191: {pctRenovable}%
          </text>
        </svg>
      </div>

      <div style={{ ...styles.badge, background: nivel.bg, color: nivel.color }}>
        {nivel.icon} {nivel.label}
      </div>

      <div style={styles.breakdown}>
        <Pill label="Hidro >50MW" value={snap?.hidraulico ?? 0} color="#1a9e9e" />
        <Pill label="Ley 27.191" value={snap?.renovable ?? 0} color="#52b788" />
      </div>
    </div>
  );
}

function Pill({ label, value, color }) {
  return (
    <div style={{ ...pillS.root, borderColor: color + '44' }}>
      <span style={{ ...pillS.dot, background: color }} />
      <div>
        <div style={pillS.label}>{label}</div>
        <div style={{ ...pillS.val, color }}>{Math.round(value).toLocaleString('es-AR')} MW</div>
      </div>
    </div>
  );
}

const pillS = {
  root: {
    display: 'flex', alignItems: 'center', gap: 8,
    border: '1.5px solid', borderRadius: 10, padding: '6px 12px', flex: 1,
  },
  dot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  label: { fontSize: 11, color: '#718096' },
  val: { fontSize: 15, fontWeight: 700 },
};

const styles = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontSize: 16, fontWeight: 600, color: '#2d3748', textAlign: 'center' },
  sub: { fontSize: 12, color: '#718096', textAlign: 'center', marginTop: -8 },
  region: { fontSize: 11, color: '#f59e0b', textAlign: 'center', fontWeight: 600, marginTop: -8 },
  center: { display: 'flex', justifyContent: 'center' },
  badge: {
    padding: '5px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
  },
  breakdown: {
    display: 'flex', gap: 10, width: '100%', flexWrap: 'wrap',
  },
};
