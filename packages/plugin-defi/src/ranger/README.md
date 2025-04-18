# Ranger Finance Plugin for Solana Agent Kit

This package provides a plugin implementation for the **Solana Agent Kit**, enabling seamless interaction with the [Ranger Finance API](https://www.ranger.finance/). It allows Solana agents or plugins to access Ranger's Smart Order Router (SOR) and Data API functionalities for DeFi trading and analytics.

## Features

- **Smart Order Routing (SOR API):**

  - `getQuote`: Get a trade quote
  - `increasePosition`: Open or increase a position
  - `decreasePosition`: Decrease a position
  - `closePosition`: Close a position
  - `withdrawBalance`: Withdraw available balance
  - `depositCollateral`: Deposit collateral to a position
  - `withdrawCollateral`: Withdraw collateral from a position

- **Data Access (Data API):**
  - `getPositions`: Get user positions
  - `getTradeHistory`: Get user trade history
  - `getLiquidationsLatest`: Get latest liquidations
  - `getLiquidationsTotals`: Get liquidation totals
  - `getLiquidationsCapitulation`: Get liquidation capitulation signals
  - `getLiquidationsHeatmap`: Get liquidation heatmap
  - `getLiquidationsLargest`: Get largest liquidations
  - `getFundingRateArbs`: Get funding rate arbitrage opportunities
  - `getFundingRatesAccumulated`: Get accumulated funding rates
  - `getBorrowRatesAccumulated`: Get accumulated borrow rates
  - `getFundingRatesExtreme`: Get extreme funding rates
  - `getFundingRatesOiWeighted`: Get OI-weighted funding rates
  - `getFundingRatesTrend`: Get funding rate trend

## Setup

1. **API Key:** Obtain an API key from [Ranger Finance](https://www.app.ranger.finance/trade).
2. **Environment Variable:** Set the `RANGER_API_KEY` environment variable to your API key.
   ```bash
   export RANGER_API_KEY="your-api-key-here"
   # Or use a .env file
   ```
3. **Integration:** Import and use the exported actions/tools in your Solana Agent Kit agent or plugin.

## API Documentation

- **Ranger API Docs:** [Notion Link](https://www.notion.so/Ranger-API-Documentation-19ef0480d276804cbca4d9bec9204f79?pvs=21)
- **TypeScript SDK:** [GitHub Repository](https://github.com/ranger-finance/sor-sdk)
- **Implementation Example:** [Gist Link](https://gist.github.com/yongkangc/9ce79d6f6bf4df9ca5b52359adced1ee)

## Usage Example

```ts
import { getQuote, increasePosition, getPositions } from "./ranger/actions";

const apiKey = process.env.RANGER_API_KEY;

// Get a quote
const quote = await getQuote(
  {
    fee_payer: "...",
    symbol: "SOL",
    side: "Long",
    size: 1.0,
    collateral: 10.0,
    size_denomination: "SOL",
    collateral_denomination: "USDC",
    adjustment_type: "Increase",
  },
  apiKey
);

// Increase position
const tx = await increasePosition(
  {
    fee_payer: "...",
    symbol: "SOL",
    side: "Long",
    size: 1.0,
    collateral: 10.0,
    size_denomination: "SOL",
    collateral_denomination: "USDC",
    adjustment_type: "Increase",
  },
  apiKey
);

// Get positions
const positions = await getPositions({ public_key: "..." }, apiKey);
```

## Base URLs (Staging)

- SOR API: `https://staging-sor-api-437363704888.asia-northeast1.run.app`
- Data API: `https://data-api-staging-437363704888.asia-northeast1.run.app`

## Note

This implementation currently uses the **staging** API endpoints. Update the base URLs in the action files if you need to use production endpoints.
