# @solana-agent-kit/token-plugin

This plugin provides a set of tools and actions to interact with, create and transfer tokens on the Solana blockchain.

## Tools Available

### Dexscreener
- `getTokenDataByAddress` - Get token data using a token's mint address
- `getTokenAddressFromTicker` - Get a token's mint address using its ticker symbol

### Jupiter
- `cancelLimitOrders` - Cancel limit orders on Jupiter
- `createLimitOrder` - Create a limit order on Jupiter
- `fetchPrice` - Fetch the price of a token
- `getLimitOrderHistory` - Get the history of limit orders
- `getOpenLimitOrders` - Get open limit orders
- `getTokenDataByTicker` - Get token data using a ticker symbol
- `stakeWithJup` - Stake tokens using Jupiter
- `trade` - Trade tokens using Jupiter

### Light Protocol
- `sendCompressedAirdrop` - Send compressed token airdrops to multiple addresses efficiently

### Solana
- `closeEmptyTokenAccounts` - Close empty token accounts to reclaim rent
- `getTPS` - Get current transactions per second on Solana
- `get_balance` - Get SOL or token balance for a wallet
- `get_balance_other` - Get balance for another wallet address
- `get_token_balance` - Get detailed token balances including metadata
- `request_faucet_funds` - Request tokens from a faucet (devnet/testnet)
- `transfer` - Transfer SOL or tokens to another address
- `getWalletAddress` - Get the wallet address of the current user

### Mayan
- `swap` - Cross-chain token swaps using Mayan DEX

### Pumpfun
- `launchPumpFunToken` - Launch new tokens on pump.fun

### Pyth
- `fetchPythPrice` - Get real-time price data from Pyth oracles
- `fetchPythPriceFeedID` - Get price feed ID for a token

### Rugcheck
- `fetchTokenDetailedReport` - Get detailed token security analysis
- `fetchTokenReportSummary` - Get summarized token security report

### Solana
- `balance` - Get SOL balance for a wallet
- `closeEmptyTokenAccounts` - Close empty token accounts
- `getTPS` - Get transactions per second on Solana
- `requestFunds` - Request funds from a faucet on devnet/testnet
- `tokenBalances` - Get token balances for a wallet
- `transfer` - Transfer SOL or tokens to another address
- `walletAddress` - Get the wallet address of the current user

### Solutiofi
- `burnTokens` - Burn tokens using Solutiofi
- `closeAccounts` - Close token accounts using Solutiofi
- `mergeTokens` - Merge multiple tokens into one
- `spreadToken` - Split tokens across multiple addresses

## Some example Usage

### Checking Token Balances
```typescript
// Get all token balances for your wallet
const balances = await agent.methods.get_token_balance(agent);
console.log("SOL Balance:", balances.sol);
console.log("Token Balances:", balances.tokens);

// Get specific token balance
const usdcBalance = await agent.methods.get_balance(
  agent,
  new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
);
```

### Trading Tokens
```typescript
// Swap 1 SOL for USDC
const trade = await agent.methods.trade(
  agent,
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC mint
  1, // amount
  undefined, // input mint (undefined means SOL)
  100 // 1% slippage
);
```

### Token Security
```typescript
// Check if a token might be a rugpull
const report = await agent.methods.fetchTokenDetailedReport(
  "TokenMintAddress123"
);
console.log("Security Score:", report.score);
console.log("Risk Factors:", report.risks);
```

### Compressed Airdrops
```typescript
// Send compressed airdrop to multiple addresses
const airdrop = await agent.methods.sendCompressedAirdrop(
  agent,
  100, // amount per recipient
  new PublicKey("TokenMintAddress"), // token mint
  [
    new PublicKey("Recipient1"),
    new PublicKey("Recipient2")
  ],
  30000 // priority fee
);
```

For more detailed information about each action and its parameters, you can check the individual action files in the source code or refer to the official documentation at [docs.sendai.fun](https://docs.sendai.fun).
