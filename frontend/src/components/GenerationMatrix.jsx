import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = {
  renovableLey: '#52b788',   // Renovable Ley 26.190 (green)
  hidraulico: '#1a9e9e',     // Renovable Hidro>50MW (teal)
  termico: '#f4845f',        // Térmico (orange)
  nuclear: '#fbbf24',        // Nuclear (yellow)
  importacion: '#a78bfa',    // Importación (purple)
};

const LABELS = {
  renovableLey: 'Renovable Ley 26.190',
  hidraulico: 'Renovable Hidro>50MW',
  termico: 'Térmico',
  nuclear: 'Nuclear',
  importacion: 'Importación',
};

function buildSlices(snapshot) {
  if (!snapshot) return [];
  const { hidraulico = 0, termico = 0, nuclear = 0, renovable = 0, importacion = 0, sumTotal = 1 } = snapshot;
  const total = sumTotal || 1;

  return [
    { key: 'renovableLey', value: renovable, pct: Math.round((renovable / total) * 100) },
    { key: 'hidraulico', value: hidraulico, pct: Math.round((hidraulico / total) * 100) },
    { key: 'termico', value: termico, pct: Math.round((termico / total) * 100) },
    { key: 'nuclear', value: nuclear, pct: Math.round((nuclear / total) * 100) },
    { key: 'importacion', value: importacion, pct: Math.round((importacion / total) * 100) },
  ];
}

function CenterLabel({ viewBox, renovablePct, noRenovablePct }) {
  const { cx, cy } = viewBox;
  return (
    <>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#52b788" fontSize={14} fontWeight={700}>
        Renovable
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="#52b788" fontSize={22} fontWeight={700}>
        {renovablePct}%
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="#718096" fontSize={11}>
        No Renov. {noRenovablePct}%
      </text>
    </>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { key, value, pct } = payload[0].payload;
  return (
    <div style={styles.tooltip}>
      <strong>{LABELS[key]}</strong>
      <div>{Math.round(value).toLocaleString('es-AR')} MW — {pct}%</div>
    </div>
  );
}

function renderLegend(slices) {
  return (
    <div style={styles.legend}>
      {slices.map(s => (
        <span key={s.key} style={styles.legendItem}>
          <span style={{ ...styles.dot, background: COLORS[s.key] }} />
          {LABELS[s.key]} {s.pct}%
        </span>
      ))}
    </div>
  );
}

export default function GenerationMatrix({ demandaActual }) {
  // Use the snapshot (single object) from ObtieneParticipacionEnergiaPorRegion
  const slices = buildSlices(demandaActual);
  const renovablePct = slices
    .filter(s => s.key === 'renovableLey' || s.key === 'hidraulico')
    .reduce((sum, s) => sum + s.pct, 0);
  const noRenovablePct = 100 - renovablePct;

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Matriz de Generación Eléctrica</h2>
      <p style={styles.subtitle}>% de participación</p>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={slices}
            dataKey="pct"
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={115}
            startAngle={90}
            endAngle={-270}
            paddingAngle={1}
          >
            {slices.map(s => (
              <Cell key={s.key} fill={COLORS[s.key]} stroke="#fff" strokeWidth={2} />
            ))}
            <CenterLabel renovablePct={renovablePct} noRenovablePct={noRenovablePct} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {renderLegend(slices)}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '24px 20px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: '#2d3748',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#1a73e8',
    textAlign: 'center',
    marginBottom: 4,
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 16px',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#4a5568',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
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
