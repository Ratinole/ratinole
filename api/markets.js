module.exports = async (req, res) => {
  try {
    const r = await fetch('https://dashboard.k8s.prd.nos.ci/api/markets', { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error('upstream ' + r.status);
    const j = await r.json();
    if (!Array.isArray(j)) throw new Error('unexpected answer');
    const out = j.map((m) => ({ name: m.name, type: m.type, usd_reward_per_hour: m.usd_reward_per_hour, metadata: m.metadata }));
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
    res.status(200).json(out);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'markets unavailable' });
  }
};
