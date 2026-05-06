const axios = require('axios');

const BASE = 'https://api.cammesa.com/demanda-svc';

const SADI_ID = 1002;
const SAN_JUAN_ID = 1922;  // demand data — province level
const CUYO_ID = 429;       // Cuyo macro-region: San Juan + Mendoza + San Luis

const client = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: { 'Accept': 'application/json' },
});

async function getDemandaActualSADI() {
  const { data } = await client.get('/generacion/ObtieneParticipacionEnergiaPorRegion', {
    params: { id_region: SADI_ID },
  });
  return data;
}

async function getMatrizGeneracionSADI() {
  const { data } = await client.get('/generacion/ObtieneGeneracioEnergiaPorRegion', {
    params: { id_region: SADI_ID },
  });
  return data;
}

async function getDemandaSanJuan() {
  const { data } = await client.get('/demanda/ObtieneDemandaYTemperaturaRegion', {
    params: { id_region: SAN_JUAN_ID },
  });
  return data;
}

async function getDemandaCuyo() {
  const { data } = await client.get('/demanda/ObtieneDemandaYTemperaturaRegion', {
    params: { id_region: CUYO_ID },
  });
  return data;
}

async function getGeneracionCuyo() {
  const { data } = await client.get('/generacion/ObtieneGeneracioEnergiaPorRegion', {
    params: { id_region: CUYO_ID },
  });
  return data;
}

async function getGeneracionParticipacionCuyo() {
  const { data } = await client.get('/generacion/ObtieneParticipacionEnergiaPorRegion', {
    params: { id_region: CUYO_ID },
  });
  return data;
}

module.exports = {
  getDemandaActualSADI,
  getMatrizGeneracionSADI,
  getDemandaSanJuan,
  getDemandaCuyo,
  getGeneracionCuyo,
  getGeneracionParticipacionCuyo,
};
