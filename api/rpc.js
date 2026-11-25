const RPC = 'https://rpc.mainnet.chain.robinhood.com';
const OK = new Set(['eth_chainId','eth_blockNumber','eth_call','eth_getBalance','eth_getCode','eth_estimateGas','eth_gasPrice','eth_maxPriorityFeePerGas','eth_feeHistory','eth_getTransactionCount','eth_getTransactionReceipt','eth_getTransactionByHash','eth_getBlockByNumber','net_version']);
module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b.method !== 'string' || !OK.has(b.method) || !Array.isArray(b.params || [])) {
    res.status(400).json({ error: 'method not allowed' }); return;
  }
  try {
    const r = await fetch(RPC, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: b.method, params: b.params || [] }) });
    const t = await r.text();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.status(r.ok ? 200 : 502).send(t);
  } catch (e) {
    res.status(502).json({ error: 'rpc unreachable' });
  }
};
