const B58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const BASE = 'https://dashboard.k8s.prd.nos.ci/api';
async function get(path) {
  try {
    const r = await fetch(BASE + path, { headers: { accept: 'application/json' } });
    if (!r.ok) return { status: r.status, data: null };
    const text = await r.text();
    if (text.length > 400000) return { status: 200, data: { truncated: true } };
    return { status: 200, data: JSON.parse(text) };
  } catch (e) {
    return { status: 0, data: null };
  }
}
module.exports = async (req, res) => {
  const a = req.query && req.query.address;
  if (!B58.test(a || '')) { res.status(400).json({ error: 'not a Solana address' }); return; }
  const [info, rewards, uptime] = await Promise.all([
    get('/nodes/' + a),
    get('/nodes/' + a + '/rewards'),
    get('/nodes/heartbeats/uptime/' + a),
  ]);
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.status(200).json({ info: info.data, rewards: rewards.data, uptime: uptime.data, status: { info: info.status, rewards: rewards.status, uptime: uptime.status } });
};
