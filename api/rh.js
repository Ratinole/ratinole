const TARGETS = {
  assets: 'https://api.robinhood.com/rhj/assets',
  price: 'https://api.robinhood.com/rhj/prices/NVDA',
};
module.exports = async (req, res) => {
  const kind = req.query && req.query.p;
  const url = TARGETS[kind];
  if (!url) { res.status(400).json({ error: 'unknown request' }); return; }
  try {
    const r = await fetch(url, { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error('upstream ' + r.status);
    let body = await r.json();
    if (kind === 'assets') {
      const list = Array.isArray(body) ? body : (body.assets || []);
      body = { assets: list.filter((a) => a && a.tokenSymbol === 'NVDA') };
    }
    res.setHeader('Cache-Control', kind === 'price' ? 's-maxage=15, stale-while-revalidate=30' : 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(body);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'upstream unavailable' });
  }
};
