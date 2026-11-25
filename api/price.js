async function fromNosana() {
  const r = await fetch('https://dashboard.k8s.prd.nos.ci/api/stats', { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error('nosana ' + r.status);
  const j = await r.json();
  const usd = +j.price;
  if (!(usd > 0)) throw new Error('no price');
  return { usd, change: j.dailyPriceChange != null ? +j.dailyPriceChange : null, stakers: j.stakers != null ? +j.stakers : null, mcap: j.marketCap != null ? +j.marketCap : null, src: 'Nosana' };
}
async function fromCoinGecko() {
  const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=nosana&vs_currencies=usd', { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error('coingecko ' + r.status);
  const j = await r.json();
  const usd = j && j.nosana && j.nosana.usd;
  if (!(usd > 0)) throw new Error('no price');
  return { usd, src: 'CoinGecko' };
}
module.exports = async (req, res) => {
  try {
    let out;
    try { out = await fromNosana(); } catch (e) { out = await fromCoinGecko(); }
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json(out);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'price unavailable' });
  }
};
