# @solana-agent-kit/plugin-defi

This plugin provides a comprehensive suite of tools and actions to interact with various DeFi protocols on the Solana blockchain. It enables users to perform a wide range of DeFi operations, including trading, lending, borrowing, and cross-chain bridging.

## Tools Available

### Adrena
- **`openPerpTradeLong`**: Open a long perpetual trade.
- **`openPerpTradeShort`**: Open a short perpetual trade.
- **`closePerpTradeLong`**: Close a long perpetual trade.
- **`closePerpTradeShort`**: Close a short perpetual trade.

### Flash
- **`flashOpenTrade`**: Open a flash trade.
- **`flashCloseTrade`**: Close a flash trade.

### Lulo
- **`lendAsset`**: Lend an asset.
- **`luloLend`**: Lend using Lulo.
- **`luloWithdraw`**: Withdraw from Lulo.

### Manifest
- **`limitOrder`**: Create a limit order.
- **`cancelAllOrders`**: Cancel all orders.
- **`withdrawAll`**: Withdraw all assets.
- **`manifestCreateMarket`**: Create a market on Manifest.

### Debridge
- **`checkDebridgeTransactionStatus`**: Check the status of a Debridge transaction.
- **`createDebridgeBridgeOrder`**: Create a bridge order.
- **`executeDebridgeBridgeOrder`**: Execute a bridge order.
- **`getBridgeQuote`**: Get a bridge quote.
- **`getDebridgeSupportedChains`**: Get supported chains for Debridge.
- **`getDebridgeTokensInfo`**: Get token information for Debridge.

### Drift
- **`driftPerpTrade`**: Open a perpetual trade on Drift.
- **`calculatePerpMarketFundingRate`**: Calculate the funding rate for a perpetual market.
- **`createVault`**: Create a vault.
- **`createDriftUserAccount`**: Create a Drift user account.
- **`depositIntoVault`**: Deposit into a vault.
- **`withdrawFromDriftVault`**: Withdraw from a Drift vault.
- **`stakeToDriftInsuranceFund`**: Stake to the Drift insurance fund.

### Openbook
- **`openbookCreateMarket`**: Create a market on the Openbook DEX.

### Fluxbeam
- **`fluxBeamCreatePool`**: Create a pool on FluxBeam.

### Orca
- **`orcaClosePosition`**: Close a position on Orca.
- **`orcaCreateCLMM`**: Create a CLMM on Orca.
- **`orcaOpenCenteredPositionWithLiquidity`**: Open a centered position with liquidity on Orca.

### Raydium
- **`raydiumCreateAmmV4`**: Create an AMM v4 on Raydium.
- **`raydiumCreateClmm`**: Create a CLMM on Raydium.
- **`raydiumCreateCpmm`**: Create a CPMM on Raydium.

## Solayer
- **`stakeWithSolayer`**: Stake SOL with Solayer.

### Voltr
- **`voltrDepositStrategy`**: Deposit into a Voltr strategy.
- **`voltrGetPositionValues`**: Get position values for Voltr.

## Full Documentation

For more detailed information, please refer to the full documentation at [docs.sendai.fun](https://docs.sendai.fun).
