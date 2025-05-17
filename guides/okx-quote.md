# OKX DEX Plugin Guide

This guide provides an overview of the OKX DEX plugin, including setup instructions, example flows, and important notes.

The plugin has two main functionalities:

1. **Quote**: Get a quote for a swap between two tokens.
2. **Swap**: Execute a swap between two tokens.

**Common Token Addresses:**
- SOL (native): `So11111111111111111111111111111111111111112`
- USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- USDT: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`

## Example Flow

```
You: Get a swap quote for .01 SOL to USDC

Getting quote for swap from sol to usdc...

Here's the swap quote for 0.01 SOL to USDC:

- Input Amount: 0.01 SOL
- Output Amount: 1.74007 USDC
- Exchange Rate: 174.007 USDC per SOL
- Price Impact: 0.01%
- Trade Fee: 0.00087285 USDC
- Estimated Gas Fee: 0.000442 SOL

Would you like to proceed with the swap? (yes/no): yes

> Swap executed! Transaction: https://web3.okx.com/explorer/solana/tx/eRCt74EWTvgQN4APZFgzbcVjdYXPn9C3yEp62r2de1DXC1fitKz3SWGUVsZzZnjUBUH6MbFozrAWpQ6dJFns9QB
```

**Additional Parameters:**
- `directRoute=true` - Use single liquidity pool for better execution
- `feePercent` - Maximum 3%
- `swapReceiverAddress` - Optional recipient address (defaults to user's wallet)
- `fromTokenReferrerWalletAddress` - Optional referrer address for fromToken fee
- `toTokenReferrerWalletAddress` - Optional referrer address for toToken fee
- `positiveSlippagePercent` - Optional positive slippage percentage (0-10)
- `computeUnitPrice` - Optional compute unit price
- `computeUnitLimit` - Optional compute unit limit
- `priceImpactProtectionPercentage` - Optional price impact protection (0-1)

**Important Notes:**
1. You can pass in Solana mint addresses directly
2. Solana and USDC decimals are hardcoded, other tokens are assumed to be 18 decimals