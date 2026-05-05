import React, { useState, useEffect } from 'react';

const SJ_LAT = -31.537;
const SJ_LON = -68.536;
const API_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${SJ_LAT}&longitude=${SJ_LON}` +
  `&current=temperature_2m,wind_speed_10m,wind_direction_10m,shortwave_radiation,cloud_cover,weather_code,is_day` +
  `&wind_speed_unit=kmh&timezone=America%2FArgentina%2FSan_Juan`;

const KEYFRAMES = `
@keyframes wb-spin   { to { transform: rotate(360deg); } }
@keyframes wb-blow   { 0%,100% { transform: translateX(0); } 50% { transform: translateX(3px); } }
@keyframes wb-drift  { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-3px); } }
@keyframes wb-pulse  { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes wb-drop   { 0% { transform: translateY(0); opacity:1; } 100% { transform: translateY(4px); opacity:0; } }
@keyframes wb-thermo { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0% 0 0 0); } }
`;

function injectKeyframes() {
  if (document.getElementById('wb-kf')) return;
  const el = document.createElement('style');
  el.id = 'wb-kf';
  el.textContent = KEYFRAMES;
  document.head.appendChild(el);
}

// ── Iconos animados ───────────────────────────────────────────────────────────

function SunIcon({ radiation = 0, isDay = 1 }) {
  if (!isDay) {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <path d="M16 11a6 6 0 1 1-5-5.9A5 5 0 0 0 16 11z" fill="#c4b5fd" />
        {[0,60,120,180,240,300].map(a => (
          <circle key={a}
            cx={11 + 9 * Math.cos((a - 30) * Math.PI / 180)}
            cy={11 + 9 * Math.sin((a - 30) * Math.PI / 180)}
            r="0.8" fill="#c4b5fd"
          />
        ))}
      </svg>
    );
  }
  const pct   = Math.min(radiation / 950, 1);
  const color = pct > 0.6 ? '#f59e0b' : pct > 0.2 ? '#fbbf24' : '#fde68a';
  const dur   = `${2.5 - pct * 1.8}s`;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" overflow="visible">
      <g style={{ transformOrigin: '11px 11px', animation: `wb-spin ${dur} linear infinite` }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
          <line key={a}
            x1={11 + 8  * Math.cos(a * Math.PI / 180)}
            y1={11 + 8  * Math.sin(a * Math.PI / 180)}
            x2={11 + 11 * Math.cos(a * Math.PI / 180)}
            y2={11 + 11 * Math.sin(a * Math.PI / 180)}
            stroke={color} strokeWidth="1.8" strokeLinecap="round"
          />
        ))}
      </g>
      <circle cx="11" cy="11" r="6" fill={color} />
    </svg>
  );
}

function WindIcon({ speed = 0, direction = 0 }) {
  const dur     = speed > 40 ? '0.6s' : speed > 20 ? '1.2s' : speed > 5 ? '2.5s' : '5s';
  const anim    = speed > 1 ? `wb-blow ${dur} ease-in-out infinite` : 'none';
  const dirText = degToCardinal(direction);
  return (
    <svg width="28" height="22" viewBox="0 0 28 22">
      {/* Nube */}
      <g style={{ animation: anim }}>
        <ellipse cx="16" cy="14" rx="9" ry="5.5" fill="#93c5fd" />
        <circle  cx="11" cy="12" r="4.5" fill="#93c5fd" />
        <circle  cx="17" cy="11" r="5.5" fill="#93c5fd" />
      </g>
      {/* Líneas de viento */}
      {[0, 1, 2].map(i => (
        <line key={i}
          x1={2} y1={15 + i * 2.2}
          x2={8} y2={15 + i * 2.2}
          stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"
          style={{
            animation: speed > 1 ? `wb-blow ${dur} ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </svg>
  );
}

function TempIcon({ temp = 0 }) {
  const color = temp >= 35 ? '#ef4444' : temp >= 28 ? '#f97316' : temp >= 20 ? '#f59e0b' : temp >= 10 ? '#3b82f6' : '#818cf8';
  const fillH = Math.max(4, Math.min(14, ((temp + 5) / 50) * 14));
  return (
    <svg width="14" height="22" viewBox="0 0 14 22">
      {/* Tubo */}
      <rect x="5" y="2" width="4" height="13" rx="2" fill="#e2e8f0" />
      {/* Relleno animado */}
      <rect x="5" y={15 - fillH} width="4" height={fillH} rx="1" fill={color}
        style={{ transition: 'all 1s ease' }}
      />
      {/* Bulbo */}
      <circle cx="7" cy="17" r="4" fill={color} />
      <circle cx="7" cy="17" r="2.5" fill="#fff" opacity="0.35" />
    </svg>
  );
}

function CloudIcon({ cover = 0 }) {
  const opacity = 0.3 + (cover / 100) * 0.7;
  const anim    = cover > 20 ? 'wb-drift 4s ease-in-out infinite' : 'none';
  return (
    <svg width="26" height="20" viewBox="0 0 26 20">
      <g style={{ opacity, animation: anim }}>
        <ellipse cx="13" cy="13" rx="10" ry="5.5" fill="#94a3b8" />
        <circle  cx="8"  cy="11" r="5"   fill="#94a3b8" />
        <circle  cx="15" cy="10" r="6"   fill="#94a3b8" />
        <ellipse cx="13" cy="13" rx="10" ry="5.5" fill="#cbd5e1" opacity="0.5" />
      </g>
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function degToCardinal(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return dirs[Math.round(deg / 45) % 8];
}

function windLabel(speed) {
  if (speed < 1)  return 'Calma';
  if (speed < 20) return 'Suave';
  if (speed < 40) return 'Moderado';
  if (speed < 60) return 'Fuerte';
  return 'Muy fuerte';
}

function radLabel(rad, isDay) {
  if (!isDay) return 'Nocturno';
  if (rad < 50)  return 'Sin sol';
  if (rad < 300) return 'Parcial';
  if (rad < 600) return 'Buena';
  return 'Intensa';
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function WeatherBar() {
  const [wx, setWx]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    injectKeyframes();
    let cancelled = false;
    async function load() {
      try {
        const res  = await fetch(API_URL);
        const json = await res.json();
        if (!cancelled) setWx(json.current);
      } catch (_) {
        // silently fail — weather is non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 15 * 60 * 1000); // refresh cada 15 min (límite Open-Meteo)
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (loading || !wx) return null;

  const temp      = Math.round(wx.temperature_2m ?? 0);
  const wind      = Math.round(wx.wind_speed_10m ?? 0);
  const windDir   = wx.wind_direction_10m ?? 0;
  const radiation = Math.round(wx.shortwave_radiation ?? 0);
  const cloud     = Math.round(wx.cloud_cover ?? 0);
  const isDay     = wx.is_day ?? 1;

  return (
    <div style={styles.row}>
      {/* Radiación solar */}
      <div style={styles.pill} title={`Radiación solar: ${radiation} W/m²`}>
        <SunIcon radiation={radiation} isDay={isDay} />
        <div style={styles.text}>
          <span style={styles.val}>{radiation} <span style={styles.unit}>W/m²</span></span>
          <span style={styles.sub}>{radLabel(radiation, isDay)}</span>
        </div>
      </div>

      {/* Viento */}
      <div style={styles.pill} title={`Viento: ${wind} km/h dirección ${degToCardinal(windDir)}`}>
        <WindIcon speed={wind} direction={windDir} />
        <div style={styles.text}>
          <span style={styles.val}>{wind} <span style={styles.unit}>km/h</span> <span style={{ fontSize: 10, color: '#60a5fa' }}>{degToCardinal(windDir)}</span></span>
          <span style={styles.sub}>{windLabel(wind)}</span>
        </div>
      </div>

      {/* Temperatura */}
      <div style={styles.pill} title={`Temperatura: ${temp}°C`}>
        <TempIcon temp={temp} />
        <div style={styles.text}>
          <span style={styles.val}>{temp}<span style={styles.unit}>°C</span></span>
          <span style={styles.sub}>San Juan</span>
        </div>
      </div>

      {/* Nubosidad */}
      <div style={styles.pill} title={`Nubosidad: ${cloud}%`}>
        <CloudIcon cover={cloud} />
        <div style={styles.text}>
          <span style={styles.val}>{cloud}<span style={styles.unit}>%</span></span>
          <span style={styles.sub}>Nubosidad</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
    flexWrap: 'wrap',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 20,
    padding: '3px 10px 3px 6px',
    cursor: 'default',
    userSelect: 'none',
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  val: {
    fontSize: 12,
    fontWeight: 700,
    color: '#2d3748',
  },
  unit: {
    fontSize: 10,
    fontWeight: 400,
    color: '#718096',
  },
  sub: {
    fontSize: 9,
    color: '#a0aec0',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
};
