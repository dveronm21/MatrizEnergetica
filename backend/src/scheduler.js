const cron = require('node-cron');
const {
  getDemandaActualSADI,
  getMatrizGeneracionSADI,
  getDemandaSanJuan,
  getGeneracionCuyo,
  getGeneracionParticipacionCuyo,
} = require('./cammesaClient');
const cache = require('./cache');

async function fetchAll() {
  const ts = new Date().toISOString();
  console.log(`[${ts}] Fetching CAMMESA data...`);

  try {
    const [demandaActual, matrizGeneracion, sanjuanDemanda, cuyoGeneracion, cuyoParticipacion] =
      await Promise.all([
        getDemandaActualSADI(),
        getMatrizGeneracionSADI(),
        getDemandaSanJuan(),
        getGeneracionCuyo(),
        getGeneracionParticipacionCuyo(),
      ]);

    cache.update({
      demandaActual,
      matrizGeneracion,
      sanjuanDemanda,
      cuyoGeneracion,
      cuyoParticipacion,
      error: null,
    });
    console.log(`[${new Date().toISOString()}] Data updated OK`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Fetch error: ${err.message}`);
    cache.update({ error: err.message });
  }
}

function start() {
  fetchAll();
  cron.schedule('*/5 * * * *', fetchAll);
  console.log('Scheduler running — CAMMESA poll every 5 minutes');
}

module.exports = { start, fetchAll };
