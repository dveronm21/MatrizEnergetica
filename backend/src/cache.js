const store = {
  demandaActual: null,
  matrizGeneracion: null,
  sanjuanDemanda: null,
  cuyoGeneracion: null,
  cuyoParticipacion: null,
  lastUpdated: null,
  error: null,
};

function update(partial) {
  Object.assign(store, partial);
  store.lastUpdated = new Date().toISOString();
}

function get() {
  return { ...store };
}

function isReady() {
  return store.demandaActual !== null;
}

module.exports = { update, get, isReady };
