const https = require('https');

const BASE = 'https://api.cammesa.com/demanda-svc';
const SADI_ID = 1002;
const SAN_JUAN_ID = 1922;
const CUYO_ID = 429;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Accept: 'application/json' } }, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error(`Parse error: ${e.message} — body: ${raw.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

function ep(path, id) {
  return `${BASE}${path}?id_region=${id}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const [demandaActual, matrizGeneracion, sanjuanDemanda, cuyoGeneracion, cuyoParticipacion] =
      await Promise.all([
        fetchJson(ep('/generacion/ObtieneParticipacionEnergiaPorRegion', SADI_ID)),
        fetchJson(ep('/generacion/ObtieneGeneracioEnergiaPorRegion', SADI_ID)),
        fetchJson(ep('/demanda/ObtieneDemandaYTemperaturaRegion', SAN_JUAN_ID)),
        fetchJson(ep('/generacion/ObtieneGeneracioEnergiaPorRegion', CUYO_ID)),
        fetchJson(ep('/generacion/ObtieneParticipacionEnergiaPorRegion', CUYO_ID)),
      ]);

    res.status(200).json({
      demandaActual,
      matrizGeneracion,
      sanjuanDemanda,
      cuyoGeneracion,
      cuyoParticipacion,
      lastUpdated: new Date().toISOString(),
      error: null,
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};
