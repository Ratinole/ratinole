const TARGETS = {
  assets: 'https://api.robinhood.com/rhj/assets',
  price: 'https://api.robinhood.com/rhj/prices/NVDA',
};
module.exports = async (req, res) => {
  const url = TARGETS[req.query && req.query.p];
  if (!url) { res.status(400).json({ error: 'unknown request' }); return; }
  try {
    const r = await fetch(url, { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error('upstream ' + r.status);
    const body = await r.text();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', req.query.p === 'price' ? 's-maxage=15, stale-while-revalidate=30' : 's-maxage=300, stale-while-revalidate=600');
    res.status(200).send(body);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'upstream unavailable' });
  }
};
