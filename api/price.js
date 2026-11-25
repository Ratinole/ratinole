module.exports = async (req, res) => {
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=nosana&vs_currencies=usd', {
      headers: { accept: 'application/json' },
    });
    if (!r.ok) throw new Error('upstream ' + r.status);
    const j = await r.json();
    const usd = j && j.nosana && j.nosana.usd;
    if (!(usd > 0)) throw new Error('no price');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({ usd });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'price unavailable' });
  }
};
