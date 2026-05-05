const https = require('https');

// Claves cargadas como variables de entorno en Vercel (nunca hardcodeadas)
const APP_KEY    = process.env.ECOWITT_APP_KEY;
const API_KEY    = process.env.ECOWITT_API_KEY;
const DEVICE_MAC = process.env.ECOWITT_DEVICE_MAC;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Accept: 'application/json' } }, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error(`Parse error: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!APP_KEY || !API_KEY || !DEVICE_MAC) {
    return res.status(503).json({
      error: 'Ecowitt keys not configured',
      hint: 'Set ECOWITT_APP_KEY, ECOWITT_API_KEY, ECOWITT_DEVICE_MAC in Vercel env vars',
    });
  }

  const params = new URLSearchParams({
    application_key:       APP_KEY,
    api_key:               API_KEY,
    mac:                   DEVICE_MAC,
    call_back:             'outdoor,wind,solar_and_uvi,pressure',
    temp_unitid:           '1',   // Celsius
    wind_speed_unitid:     '7',   // km/h
    solar_irradiance_unitid: '16', // W/m²
    pressure_unitid:       '5',   // hPa
  });

  const url = `https://api.ecowitt.net/api/v3/device/real_time?${params}`;

  try {
    const json = await fetchJson(url);

    if (json.code !== 0) {
      return res.status(502).json({ error: json.msg || 'Ecowitt error', code: json.code });
    }

    const d = json.data ?? {};

    // Normalizar a estructura simple para el frontend
    const weather = {
      temperature:  parseFloat(d.outdoor?.temperature?.value  ?? null),
      humidity:     parseFloat(d.outdoor?.humidity?.value     ?? null),
      wind_speed:   parseFloat(d.wind?.wind_speed?.value      ?? null),
      wind_gust:    parseFloat(d.wind?.wind_gust?.value       ?? null),
      wind_dir:     parseFloat(d.wind?.wind_direction?.value  ?? null),
      radiation:    parseFloat(d.solar_and_uvi?.solar?.value  ?? null),
      uvi:          parseFloat(d.solar_and_uvi?.uvi?.value    ?? null),
      pressure:     parseFloat(d.pressure?.relative?.value    ?? null),
      timestamp:    new Date().toISOString(),
      source:       'ecowitt',
      station_mac:  DEVICE_MAC,
    };

    // Cache 1 minuto (Ecowitt admite polling cada 60 s)
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    res.status(200).json(weather);

  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};
