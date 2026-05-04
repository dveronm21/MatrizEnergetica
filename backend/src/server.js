const express = require('express');
const cors = require('cors');
const path = require('path');
const scheduler = require('./scheduler');
const cache = require('./cache');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve dashboard.html at the root
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../dashboard.html'));
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', lastUpdated: cache.get().lastUpdated });
});

// All dashboard data in one call
app.get('/api/dashboard', (_req, res) => {
  if (!cache.isReady()) {
    return res.status(503).json({ error: 'Cargando datos... intentá en unos segundos.' });
  }
  res.json(cache.get());
});

// Force manual refresh
app.post('/api/refresh', async (_req, res) => {
  await scheduler.fetchAll();
  res.json({ ok: true, lastUpdated: cache.get().lastUpdated });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  scheduler.start();
});
