<div align="center">

# Ratinole

**Powered by your GPU. Directed by you.**

Track NVIDIA GPU compute rewards, estimate operating costs, and plan NVDA swaps on Robinhood Chain, with every swap approved from your own wallet.

[![Website](https://img.shields.io/badge/website-ratinole.co-b6dd34?style=for-the-badge&labelColor=0a0a09)](https://www.ratinole.co)
[![X](https://img.shields.io/badge/X-@RatinoleHQ-b6dd34?style=for-the-badge&labelColor=0a0a09&logo=x&logoColor=white)](https://x.com/RatinoleHQ)
![Chain](https://img.shields.io/badge/chain-Robinhood%20Chain%20·%204663-b6dd34?style=for-the-badge&labelColor=0a0a09)
![Static](https://img.shields.io/badge/stack-static%20HTML%20+%20Vercel%20functions-b6dd34?style=for-the-badge&labelColor=0a0a09)

</div>

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [How a swap works](#how-a-swap-works)
- [Safety checks](#safety-checks)
- [Architecture](#architecture)
- [Data sources](#data-sources)
- [Project structure](#project-structure)
- [Deploy your own](#deploy-your-own)
- [Run locally](#run-locally)
- [Configuration](#configuration)
- [Known limits](#known-limits)
- [FAQ](#faq)
- [The $RAT token](#the-rat-token)
- [Disclaimer](#disclaimer)

---

## Overview

Ratinole is a single-page interface for people who earn from GPU compute and want to turn part of those earnings into NVDA, the NVIDIA Stock Token on Robinhood Chain.

It does three things and nothing more:

1. **Estimates** what a GPU setup can earn after power and network costs.
2. **Shows** the NVDA token price next to Robinhood's reference price for NVIDIA.
3. **Plans** a swap into NVDA that you approve in your own wallet.

Ratinole never holds funds, never asks for a signature other than the swap itself, and has no account system. Your settings live in your browser.

## Features

| Area | What you get |
|---|---|
| **GPU earnings estimate** | Pick a GPU, set count, power draw, electricity price, utilization and hours. See projected rewards, costs and net per day, week or month. Use a manual rate for your own figure. |
| **NVDA market view** | Live NVDA token price from Uniswap on Robinhood Chain, Robinhood's NVIDIA bid/ask with the token multiplier applied, and the difference between the two. |
| **Swap planner** | Quote ETH or USDG into NVDA, set slippage, see the minimum received, and send the swap from your wallet. |
| **Portfolio** | Read ETH, USDG and NVDA balances for the connected wallet. NVDA is shown the way your wallet shows it (raw balance × the token multiplier). |
| **Contract checks** | Token, pool and router contracts are verified on chain on every visit, and NVDA is cross-checked against Robinhood's own asset record. |
| **Mobile wallets** | Open the site inside MetaMask, Trust Wallet or Coinbase Wallet from a phone. |

## How a swap works

1. **Connect** a wallet and switch to Robinhood Chain (chain ID 4663). Connecting only shares your public address.
2. **Confirm** that you are eligible to hold the token (see the [disclaimer](#disclaimer)).
3. **Get a quote.** Ratinole asks the Uniswap v3 quoter for the best route into NVDA. The quote expires after 45 seconds and is not an order.
4. **Approve (USDG only).** If you pay in USDG, you approve exactly the amount being swapped, not an unlimited allowance.
5. **Simulate.** The swap is dry-run against the chain first. If the simulation fails, nothing is sent.
6. **Sign and send.** You approve the transaction in your wallet. The minimum amount out is set from your slippage.
7. **Confirm.** Ratinole waits for the receipt and reads the amount you received from the transfer log.

## Safety checks

Swaps stay switched off until these pass:

- NVDA and USDG are the expected ERC-20 contracts (symbol and decimals match).
- A live NVDA / USDG pool exists on the Uniswap v3 factory.
- The Uniswap router, quoter and factory have code at their addresses.
- The token multiplier can be read from the token.
- Robinhood's asset record lists this NVDA address for chain 4663. If Robinhood's API cannot be reached, you must tick a box to say you checked the contract yourself.
- Robinhood does not report a trading halt.
- The visitor's detected country is not in the restricted list.
- The quote is not more than 3% worse than the Robinhood reference price. If it is, you must accept it explicitly.

## Architecture

```
Browser (index.html)
 ├── Robinhood Chain RPC ──────── balances, contract checks, quotes, simulation, swaps
 ├── /api/price  ──► CoinGecko ── NOS price
 ├── /api/rh     ──► Robinhood ── Stock Token asset record and NVIDIA bid/ask
 └── /api/geo    ──► Vercel edge ─ visitor country
```

- **Frontend:** one static `index.html`, no build step and no framework. State is kept in `localStorage` (keys start with `rn_`).
- **Functions:** three small read-only Vercel functions in `api/`. They keep no database and exist to avoid browser CORS limits and to read the visitor's country.
- **Fallbacks:** if a function is missing (for example on a plain static host), the page calls CoinGecko and Robinhood directly where the provider allows it.

## Data sources

| Source | Used for | How |
|---|---|---|
| Robinhood Chain RPC | Balances, contract reads, quotes, simulation, sending transactions | Public RPC, called from the browser |
| Uniswap v3 contracts | Factory, QuoterV2, SwapRouter02 on Robinhood Chain | On chain |
| Robinhood Stock Token API | Asset record, token multiplier, NVIDIA bid and ask | Through `/api/rh`, with a direct fallback |
| CoinGecko | NOS price | Through `/api/price`, with a direct fallback |
| Vercel edge | Visitor country | `/api/geo` |

## Project structure

```
.
├── index.html     the whole site: landing page, app, docs, privacy and terms
├── api/
│   ├── geo.js     returns the visitor's country
│   ├── price.js   NOS/USD from CoinGecko, cached at the edge for 60 s
│   └── rh.js      allow-listed proxy for two Robinhood Stock Token endpoints
└── README.md
```

## Deploy your own

1. Fork or clone this repo.
2. Import it into [Vercel](https://vercel.com) as a new project. No build settings are needed.
3. Deploy. The `api/` folder becomes serverless functions automatically.
4. Add your domain under **Settings → Domains** and point DNS to Vercel:
   - `A` record, name `@`, value `76.76.21.21`
   - `CNAME` record, name `www`, value `cname.vercel-dns.com`

## Run locally

The page is static, so any file server works:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

The `api/` functions do not run under a plain file server. Locally the page falls back to calling CoinGecko and Robinhood directly, which may be blocked by CORS, and the region check is skipped. To run the functions, use the Vercel CLI (`vercel dev`).

## Configuration

Settings live near the top of the script in `index.html`:

| Setting | Where | Purpose |
|---|---|---|
| `LIVE.rpc`, `LIVE.chainId` | `LIVE` object | Robinhood Chain RPC and chain ID |
| `LIVE.tokens` | `LIVE` object | NVDA and USDG contract addresses |
| `U` | Market module | Uniswap v3 factory, quoter and router addresses |
| `T` | Market module | NVDA, USDG and WETH addresses and decimals |
| `LIVE.ratinole.addr` | Market module | $RAT contract address (empty until deployed) |
| `GEO_BLOCK` | Swap module | Country codes where swaps are switched off |

Contract addresses should always be compared with Robinhood's documentation and the block explorer before use.

## Known limits

- **Node records depend on Nosana.** Enter a host address and Ratinole reads its record, rewards and uptime from Nosana's public API and shows the fields as returned. If Nosana needs a key or has no record, the page says so. Host rates in the calculator are the median of Nosana's public market list when it can be read, otherwise examples.
- **Thin liquidity.** Most NVDA/USDG liquidity on Robinhood Chain sits in Uniswap v4 pools, while Ratinole swaps through v3. Swaps work, but price impact can be high on small pools, which is why the 3% guard exists.
- **ETH quotes are not price-checked.** The reference-price guard needs a USDG input. Use USDG when you want that check.
- **Region check is soft.** It uses the visitor's detected country and can be bypassed with a VPN. It is not legal compliance.
- **Wallets.** Browser wallets and wallet-app browsers are supported. WalletConnect is not.
- **Unaudited.** The swap code has not been audited. Test with a very small amount first.

## FAQ

**Does Ratinole hold my funds or keys?**
No. Swaps are signed in your wallet. Ratinole only reads public data and prepares the transaction.

**Why can't I swap?**
The reason is shown under the swap button. Common ones: a contract check has not passed, the eligibility box is not ticked, no wallet is connected, the wallet is on the wrong network, or your region is restricted.

**Why is the NVDA price different from the NVIDIA share price?**
The token price includes the multiplier, and fees, slippage and pool depth all stand between the token and the share. A difference is not an arbitrage opportunity.

**Are the earnings guaranteed?**
No. Every figure is an estimate built from inputs you can see and change.

**Is it open to everyone?**
No. See the disclaimer below.

## The $RAT token

The contract address has not been published yet. Until it is, the token card on the site reads "Not deployed". Once the address is set in `LIVE.ratinole.addr`, the site reads the name, symbol, supply and owner directly from the chain. Do not trust any address that is not published on [@RatinoleHQ](https://x.com/RatinoleHQ) and on [ratinole.co](https://www.ratinole.co).

## Disclaimer

Ratinole is an independent analytics and allocation interface. NVDA is a Stock Token issued by Robinhood Assets (Jersey) Limited. Robinhood states that the tokens are not offered to U.S. persons and are restricted in Canada, the United Kingdom, Switzerland and other jurisdictions. You are responsible for knowing whether you may hold them where you are. Crypto assets and tokenized securities carry risk, including loss of the full amount. Nothing in this repository or on the website is financial, legal or tax advice.
