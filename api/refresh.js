// En Vercel serverless no hay estado persistente; redirige a /api/dashboard
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ ok: true, message: 'Use /api/dashboard para obtener datos frescos.' });
};
