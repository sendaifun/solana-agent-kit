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

## Meteora

- **`createMeteoraDLMMPool`**: Create a DLMMPool on Meteora.
- **`createMeteoraDynamicAMMPool`**: Create a dynamic AMM pool on Meteora.

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
- **`closeOrcaPosition`**: Close a position on Orca.
- **`createOrcaCLMM`**: Create a CLMM on Orca.
- **`openOrcaCenteredPositionWithLiquidity`**: Open a centered position with liquidity on Orca.
- **`openOrcaSingleSidedPosition`**: Open a single-sided position on Orca.
- **`fetchOrcaPositions`**: Fetch a wallet's positions on Orca.
- **`createOrcaSingleSidedWhirlpool`**: Create a single-sided whirlpool on Orca.

### Ranger
- **`closePosition`**: Close a position on Ranger.
- **`decreasePosition`**: Decrease a position on Ranger.
- **`depositCollateral`**: Deposit collateral on Ranger.
- **`getBorrowRatesAccumulated`**: Get accumulated borrow rates on Ranger.
- **`getFundingRateArbs`**: Get funding rate arbitrage opportunities on Ranger.
- **`getFundingRatesAccumulated`**: Get accumulated funding rates on Ranger.
- **`getFundingRatesExtreme`**: Get extreme funding rates on Ranger.
- **`getFundingRatesOiWeighted`**: Get OI weighted funding rates on Ranger.
- **`getFundingRatesTrend`**: Get funding rate trends on Ranger.
- **`getLiquidationsCapitulation`**: Get liquidation capitulation data on Ranger.
- **`getLiquidationsHeatmap`**: Get a heatmap of liquidations on Ranger.
- **`getLiquidationsLargest`**: Get the largest liquidations on Ranger.
- **`getLiquidationsLatest`**: Get the latest liquidations on Ranger.
- **`getLiquidationsTotals`**: Get total liquidations on Ranger.
- **`getPositions`**: Get positions on Ranger.
- **`getQuote`**: Get a quote for a trade on Ranger.
- **`getTradeHistory`**: Get trade history on Ranger.
- **`increasePosition`**: Increase a position on Ranger.
- **`withdrawBalance`**: Withdraw balance from Ranger.
- **`withdrawCollateral`**: Withdraw collateral from Ranger.

### Raydium
- **`raydiumCreateAmmV4`**: Create an AMM v4 on Raydium.
- **`raydiumCreateClmm`**: Create a CLMM on Raydium.
- **`raydiumCreateCpmm`**: Create a CPMM on Raydium.
- **`raydiumCreateLaunchlabToken`**: Create a token on Raydium's Launchlab.

## Solayer
- **`stakeWithSolayer`**: Stake SOL with Solayer.

### Voltr
- **`voltrDepositStrategy`**: Deposit into a Voltr strategy.
- **`voltrGetPositionValues`**: Get position values for Voltr.

### Sanctum
- **`sanctumSwapLST`**: Swap LSTs on Sanctum.
- **`sanctumAddLiquidity`**: Add liquidity on Sanctum.
- **`sanctumRemoveLiquidity`**: Remove liquidity on Sanctum.
- **`sanctumGetLSTAPY`**: Get the APY for LSTs on Sanctum.
- **`sanctumGetLSTPrice`**: Get the price of LSTs on Sanctum.
- **`sanctumGetLSTTVL`**: Get the TVL for LSTs on Sanctum.
- **`sanctumGetOwnedLST`**: Get owned LSTs on Sanctum.

## Full Documentation

For more detailed information, please refer to the full documentation at [docs.sendai.fun](https://docs.sendai.fun).
