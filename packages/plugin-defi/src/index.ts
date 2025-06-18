import { Plugin, SolanaAgentKit } from "solana-agent-kit";

// Import Adrena actions & tools
import {
  closePerpTradeLongAction,
  closePerpTradeShortAction,
  openPerpTradeLongAction,
  openPerpTradeShortAction,
} from "./adrena/actions/adrenaPerpTrading";
import {
  closePerpTradeLong,
  closePerpTradeShort,
  openPerpTradeLong,
  openPerpTradeShort,
} from "./adrena/tools";

// Import Flash actions & tools
import flashCloseTradeAction from "./flash/actions/flashCloseTrade";
import flashOpenTradeAction from "./flash/actions/flashOpenTrade";
import { flashCloseTrade, flashOpenTrade } from "./flash/tools";

// Import Lulo actions & tools
import lendAssetAction from "./lulo/actions/lendAsset";
import luloLendAction from "./lulo/actions/luloLend";
import luloWithdrawAction from "./lulo/actions/luloWithdraw";
import { lendAsset, luloLend, luloWithdraw } from "./lulo/tools";

// Import Manifest tools & actions
import cancelAllOrdersAction from "./manifest/actions/cancelAllOrders";
import limitOrderAction from "./manifest/actions/limitOrder";
import manifestCreateMarketAction from "./manifest/actions/manifestCreateMarket";
import withdrawAllAction from "./manifest/actions/withdrawAll";
import {
  cancelAllOrders,
  limitOrder,
  manifestCreateMarket,
  withdrawAll,
} from "./manifest/tools";

// Import OKX actions
import getTokensAction from "./okx/actions/getTokens";
import getSwapDataAction from "./okx/actions/getSwapData";
import getQuoteAction from "./okx/actions/getQuote";
import getLiquidityAction from "./okx/actions/getLiquidity";
import getChainDataAction from "./okx/actions/getChainData";
import executeSwapAction from "./okx/actions/executeSwap";

// Import Debridge tools & actions
import checkDebridgeTransactionStatusAction from "./debridge/actions/checkTransactionStatus";
import createDebridgeBridgeOrderAction from "./debridge/actions/createBridgeOrder";
import executeDebridgeBridgeOrderAction from "./debridge/actions/executeBridgeOrder";
import getDebridgeSupportedChainsAction from "./debridge/actions/getSupportedChains";
import getDebridgeTokensInfoAction from "./debridge/actions/getTokensInfo";
import {
  checkDebridgeTransactionStatus,
  createDebridgeBridgeOrder,
  executeDebridgeBridgeOrder,
  getBridgeQuote,
  getDebridgeSupportedChains,
  getDebridgeTokensInfo,
} from "./debridge/tools";

// Import Fluxbeam tools & actions
import fluxbeamCreatePoolAction from "./fluxbeam/actions/createPool";
import { fluxBeamCreatePool } from "./fluxbeam/tools/create_pool";

// Import Meteora actions & tools
import createMeteoraDLMMPoolAction from "./meteora/actions/createMeteoraDLMMPool";
import createMeteoraDynamicAMMPoolAction from "./meteora/actions/createMeteoraDynamicAMMPool";
import {
  createMeteoraDlmmPool,
  createMeteoraDynamicAMMPool,
} from "./meteora/tools";

// Import Openbook actions
import createOpenbookMarketAction from "./openbook/actions/createOpenbookMarket";

// Import Orca actions
import createOrcaSingleSidedWhirlpoolAction from "./orca/actions/createOrcaSingleSidedWhirlpool";

// Import Raydium actions
import raydiumCreateAmmV4Action from "./raydium/actions/raydiumCreateAmmV4";
import raydiumCreateClmmAction from "./raydium/actions/raydiumCreateClmm";
import raydiumCreateCpmmAction from "./raydium/actions/raydiumCreateCpmm";
import raydiumCreateLaunchlabTokenAction from "./raydium/actions/raydiumCreateLaunchlabToken";

// Import Solayer actions
import stakeWithSolayerAction from "./solayer/actions/stakeWithSolayer";

// Import Voltr actions
import depositVoltrStrategyAction from "./voltr/actions/depositStrategy";
import getVoltrPositionValuesAction from "./voltr/actions/getPositionValues";
import withdrawVoltrStrategyAction from "./voltr/actions/withdrawStrategy";

// Import Drift actions
import availableDriftMarketsAction from "./drift/actions/availableMarkets";
import createDriftUserAccountAction from "./drift/actions/createDriftUserAccount";
import createVaultAction from "./drift/actions/createVault";
import depositIntoDriftVaultAction from "./drift/actions/depositIntoVault";
import depositToDriftUserAccountAction from "./drift/actions/depositToDriftUserAccount";
import deriveDriftVaultAddressAction from "./drift/actions/deriveVaultAddress";
import doesUserHaveDriftAccountAction from "./drift/actions/doesUserHaveDriftAccount";
import driftUserAccountInfoAction from "./drift/actions/driftUserAccountInfo";
import entryQuoteOfDriftPerpTradeAction from "./drift/actions/entryQuoteOfPerpTrade";
import getDriftLendAndBorrowAPYAction from "./drift/actions/getLendAndBorrowAPY";
import driftPerpMarketFundingRateAction from "./drift/actions/perpMarketFundingRate";
import requestUnstakeFromDriftInsuranceFundAction from "./drift/actions/requestUnstakeFromDriftInsuranceFund";
import requestWithdrawalFromDriftVaultAction from "./drift/actions/requestWithdrawalFromVault";
import stakeToDriftInsuranceFundAction from "./drift/actions/stakeToDriftInsuranceFund";
import swapSpotTokenOnDriftAction from "./drift/actions/swapSpotToken";
import tradeDelegatedDriftVaultAction from "./drift/actions/tradeDelegatedDriftVault";
import tradeDriftPerpAccountAction from "./drift/actions/tradePerpAccount";
import unstakeFromDriftInsuranceFundAction from "./drift/actions/unstakeFromDriftInsuranceFund";
import updateDriftVaultDelegateAction from "./drift/actions/updateDriftVaultDelegate";
import updateDriftVaultAction from "./drift/actions/updateVault";
import vaultInfoAction from "./drift/actions/vaultInfo";
import withdrawFromDriftAccountAction from "./drift/actions/withdrawFromDriftAccount";
import withdrawFromDriftVaultAction from "./drift/actions/withdrawFromVault";

// Import Openbook tools
import { openbookCreateMarket } from "./openbook/tools";

// Import Orca tools
import {
  orcaClosePosition,
  orcaCreateCLMM,
  orcaCreateSingleSidedLiquidityPool,
  orcaFetchPositions,
  orcaOpenCenteredPositionWithLiquidity,
  orcaOpenSingleSidedPosition,
} from "./orca/tools";

// Import Raydium tools
import {
  raydiumCreateAmmV4,
  raydiumCreateClmm,
  raydiumCreateCpmm,
  raydiumCreateLaunchlabToken,
} from "./raydium";

// Import Solayer tools
import { stakeWithSolayer } from "./solayer/tools";

// Import Voltr tools
import {
  voltrDepositStrategy,
  voltrGetPositionValues,
  voltrWithdrawStrategy,
} from "./voltr/tools";

// Import Drift tools
import {
  calculatePerpMarketFundingRate,
  createDriftUserAccount,
  createVault,
  depositIntoVault,
  depositToDriftUserAccount,
  deriveDriftVaultAddress,
  doesUserHaveDriftAccount,
  driftPerpTrade,
  driftUserAccountInfo,
  getAvailableDriftPerpMarkets,
  getAvailableDriftSpotMarkets,
  getEntryQuoteOfPerpTrade,
  getFundingRateAsPercentage,
  getL2OrderBook,
  getLendingAndBorrowAPY,
  getMarketIndexAndType,
  getVaultAddress,
  getVaultInfo,
  requestUnstakeFromDriftInsuranceFund,
  requestWithdrawalFromVault,
  stakeToDriftInsuranceFund,
  swapSpotToken,
  tradeDriftVault,
  unstakeFromDriftInsuranceFund,
  updateVault,
  updateVaultDelegate,
  validateAndEncodeAddress,
  withdrawFromDriftUserAccount,
  withdrawFromDriftVault,
} from "./drift/tools";

import {
  sanctumAddLiquidityAction,
  sanctumGetLSTAPYAction,
  sanctumGetLSTPriceAction,
  sanctumGetLSTTVLAction,
  sanctumGetOwnedLSTAction,
  sanctumRemoveLiquidityAction,
  sanctumSwapLSTAction,
} from "./sanctum/actions";
// Import Sanctum tools and actions
import {
  sanctumAddLiquidity,
  sanctumGetLSTAPY,
  sanctumGetLSTPrice,
  sanctumGetLSTTVL,
  sanctumGetOwnedLST,
  sanctumRemoveLiquidity,
  sanctumSwapLST,
} from "./sanctum/tools";

// Import OKX tools
import {
  getTokens,
  getSwapData,
  getQuote,
  getLiquidity,
  getChainData,
  executeSwap,
} from "./okx/tools";

// Define and export the plugin
const DefiPlugin = {
  name: "defi",

  // Combine all tools
  methods: {
    // Adrena methods
    openPerpTradeLong,
    openPerpTradeShort,
    closePerpTradeLong,
    closePerpTradeShort,

    // Flash methods
    flashCloseTrade,
    flashOpenTrade,

    // Lulo methods
    lendAsset,
    luloLend,
    luloWithdraw,

    // Manifest methods
    limitOrder,
    cancelAllOrders,
    withdrawAll,
    manifestCreateMarket,

    // Meteora methods
    createMeteoraDlmmPool,
    createMeteoraDynamicAMMPool,

    // Openbook methods
    openbookCreateMarket,

    // Orca methods
    orcaClosePosition,
    orcaCreateCLMM,
    orcaCreateSingleSidedLiquidityPool,
    orcaFetchPositions,
    orcaOpenCenteredPositionWithLiquidity,
    orcaOpenSingleSidedPosition,

    // Raydium methods
    raydiumCreateAmmV4,
    raydiumCreateClmm,
    raydiumCreateCpmm,
    raydiumCreateLaunchlabToken,

    // Solayer methods
    stakeWithSolayer,

    // Voltr methods
    voltrDepositStrategy,
    voltrGetPositionValues,
    voltrWithdrawStrategy,

    // Drift methods,
    driftPerpTrade,
    deriveDriftVaultAddress,
    calculatePerpMarketFundingRate,
    createDriftVault: createVault,
    createDriftUserAccount,
    depositIntoDriftVault: depositIntoVault,
    depositToDriftUserAccount,
    doesUserHaveDriftAccount,
    driftUserAccountInfo,
    getAvailableDriftPerpMarkets,
    getAvailableDriftSpotMarkets,
    getLendingAndBorrowAPY,
    updateVault,
    withdrawFromDriftVault,
    withdrawFromDriftUserAccount,
    requestWithdrawalFromVault,
    updateDriftVaultDelegate: updateVaultDelegate,
    getVaultInfo,
    getVaultAddress,
    tradeDriftVault,
    swapSpotToken,
    stakeToDriftInsuranceFund,
    requestUnstakeFromDriftInsuranceFund,
    unstakeFromDriftInsuranceFund,
    getDriftMarketIndexAndType: getMarketIndexAndType,
    getDriftFundingRateAsPercentage: getFundingRateAsPercentage,
    getEntryQuoteOfDriftPerpTrade: getEntryQuoteOfPerpTrade,
    validateAndEncodeDriftAddress: validateAndEncodeAddress,
    getDriftL2OrderBook: getL2OrderBook,

    // Debridge methods,
    checkDebridgeTransactionStatus,
    createDebridgeBridgeOrder,
    executeDebridgeBridgeOrder,
    getBridgeQuote,
    getDebridgeSupportedChains,
    getDebridgeTokensInfo,

    // Fluxbeam methods
    fluxBeamCreatePool,

    // Sanctum methods
    sanctumSwapLST,
    sanctumAddLiquidity,
    sanctumGetLSTAPY,
    sanctumGetLSTPrice,
    sanctumGetLSTTVL,
    sanctumGetOwnedLST,
    sanctumRemoveLiquidity,

    // OKX methods
    getTokens,
    getSwapData,
    getQuote,
    getLiquidity,
    getChainData,
    executeSwap,
  },

  // Combine all actions
  actions: [
    // Adrena actions
    openPerpTradeLongAction,
    openPerpTradeShortAction,
    closePerpTradeLongAction,
    closePerpTradeShortAction,

    // Flash actions
    flashCloseTradeAction,
    flashOpenTradeAction,

    // Lulo actions
    lendAssetAction,
    luloLendAction,
    luloWithdrawAction,

    // Manifest actions
    withdrawAllAction,
    limitOrderAction,
    cancelAllOrdersAction,
    manifestCreateMarketAction,

    // Meteora actions
    createMeteoraDLMMPoolAction,
    createMeteoraDynamicAMMPoolAction,

    // Openbook actions
    createOpenbookMarketAction,

    // Orca actions
    createOrcaSingleSidedWhirlpoolAction,

    // Raydium actions
    raydiumCreateAmmV4Action,
    raydiumCreateClmmAction,
    raydiumCreateCpmmAction,
    raydiumCreateLaunchlabTokenAction,

    // Solayer actions
    stakeWithSolayerAction,

    // Voltr actions
    depositVoltrStrategyAction,
    getVoltrPositionValuesAction,
    withdrawVoltrStrategyAction,

    // Drift actions
    availableDriftMarketsAction,
    createDriftUserAccountAction,
    createVaultAction,
    depositIntoDriftVaultAction,
    depositToDriftUserAccountAction,
    deriveDriftVaultAddressAction,
    doesUserHaveDriftAccountAction,
    driftUserAccountInfoAction,
    entryQuoteOfDriftPerpTradeAction,
    getDriftLendAndBorrowAPYAction,
    driftPerpMarketFundingRateAction,
    requestUnstakeFromDriftInsuranceFundAction,
    vaultInfoAction,
    withdrawFromDriftVaultAction,
    withdrawFromDriftAccountAction,
    updateDriftVaultAction,
    updateDriftVaultDelegateAction,
    unstakeFromDriftInsuranceFundAction,
    tradeDriftPerpAccountAction,
    tradeDelegatedDriftVaultAction,
    swapSpotTokenOnDriftAction,
    stakeToDriftInsuranceFundAction,
    requestWithdrawalFromDriftVaultAction,

    // Debridge actions
    checkDebridgeTransactionStatusAction,
    createDebridgeBridgeOrderAction,
    executeDebridgeBridgeOrderAction,
    getDebridgeSupportedChainsAction,
    getDebridgeTokensInfoAction,

    // Fluxbeam actions
    fluxbeamCreatePoolAction,

    // Sanctum actions
    sanctumAddLiquidityAction,
    sanctumGetLSTAPYAction,
    sanctumGetLSTPriceAction,
    sanctumGetLSTTVLAction,
    sanctumGetOwnedLSTAction,
    sanctumRemoveLiquidityAction,
    sanctumSwapLSTAction,

    // OKX actions
    getTokensAction,
    getSwapDataAction,
    getQuoteAction,
    getLiquidityAction,
    getChainDataAction,
    executeSwapAction,
  ],

  // Initialize function
  initialize: function (): void {
    // Initialize all methods with the agent instance
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    });
  },
} satisfies Plugin;

// Default export for convenience
export default DefiPlugin;
