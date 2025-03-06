import { Plugin, SolanaAgentKit } from "solana-agent-kit";

// Import Adrena actions & tools
import {
  openPerpTradeLongAction,
  openPerpTradeShortAction,
  closePerpTradeLongAction,
  closePerpTradeShortAction,
} from "./adrena/actions/adrenaPerpTrading";
import {
  openPerpTradeLong,
  openPerpTradeShort,
  closePerpTradeLong,
  closePerpTradeShort,
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
import {
  limitOrder,
  cancelAllOrders,
  withdrawAll,
  manifestCreateMarket,
} from "./manifest/tools";
import withdrawAllAction from "./manifest/actions/withdrawAll";
import limitOrderAction from "./manifest/actions/limitOrder";
import cancelAllOrdersAction from "./manifest/actions/cancelAllOrders";
import manifestCreateMarketAction from "./manifest/actions/manifestCreateMarket";

// Import Debridge tools & actions
import {
  checkDebridgeTransactionStatus,
  createDebridgeBridgeOrder,
  executeDebridgeBridgeOrder,
  getBridgeQuote,
  getDebridgeSupportedChains,
  getDebridgeTokensInfo,
} from "./debridge/tools";
import checkDebridgeTransactionStatusAction from "./debridge/actions/checkTransactionStatus";
import createDebridgeBridgeOrderAction from "./debridge/actions/createBridgeOrder";
import executeDebridgeBridgeOrderAction from "./debridge/actions/executeBridgeOrder";
import getDebridgeSupportedChainsAction from "./debridge/actions/getSupportedChains";
import getDebridgeTokensInfoAction from "./debridge/actions/getTokensInfo";

// Import Fluxbeam tools & actions
import { fluxBeamCreatePool } from "./fluxbeam/tools/create_pool";
import fluxbeamCreatePoolAction from "./fluxbeam/actions/createPool";

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
import doesUserHaveDriftAcccountAction from "./drift/actions/doesUserHaveDriftAccount";
import driftUserAccountInfoAction from "./drift/actions/driftUserAccountInfo";
import entryQuoteOfDriftPerpTradeAction from "./drift/actions/entryQuoteOfPerpTrade";
import getDriftLendAndBorrowAPYAction from "./drift/actions/getLendAndBorrowAPY";
import driftPerpMarketFundingRateAction from "./drift/actions/perpMarketFundingRate";
import requestUnstakeFromDriftInsuranceFundAction from "./drift/actions/requestUnstakeFromDriftInsuranceFund";
import vaultInfoAction from "./drift/actions/vaultInfo";
import withdrawFromDriftVaultAction from "./drift/actions/withdrawFromVault";
import withdrawFromDriftAccountAction from "./drift/actions/withdrawFromDriftAccount";
import updateDriftVaultAction from "./drift/actions/updateVault";
import updateDriftVaultDelegateAction from "./drift/actions/updateDriftVaultDelegate";
import unstakeFromDriftInsuranceFundAction from "./drift/actions/unstakeFromDriftInsuranceFund";
import tradeDriftPerpAccountAction from "./drift/actions/tradePerpAccount";
import tradeDelegatedDriftVaultAction from "./drift/actions/tradeDelegatedDriftVault";
import swapSpotTokenOnDriftAction from "./drift/actions/swapSpotToken";
import stakeToDriftInsuranceFundAction from "./drift/actions/stakeToDriftInsuranceFund";
import requestWithdrawalFromDriftVaultAction from "./drift/actions/requestWithdrawalFromVault";

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
  driftPerpTrade,
  calculatePerpMarketFundingRate,
  createVault,
  createDriftUserAccount,
  depositIntoVault,
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
  updateVaultDelegate,
  getVaultInfo,
  getVaultAddress,
  tradeDriftVault,
  swapSpotToken,
  stakeToDriftInsuranceFund,
  requestUnstakeFromDriftInsuranceFund,
  unstakeFromDriftInsuranceFund,
  getMarketIndexAndType,
  getFundingRateAsPercentage,
  getEntryQuoteOfPerpTrade,
  validateAndEncodeAddress,
  getL2OrderBook,
  deriveDriftVaultAddress,
} from "./drift/tools";

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
    doesUserHaveDriftAcccountAction,
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
  ],

  // Initialize function
  initialize: function (agent: SolanaAgentKit): void {
    // Initialize all methods with the agent instance
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName] = method.bind(null, agent);
      }
    });

    // Any necessary initialization logic
    if (!agent.config.OPENAI_API_KEY) {
      console.warn("Warning: OPENAI_API_KEY not provided in config");
    }
  },
} satisfies Plugin;

// Default export for convenience
export = DefiPlugin;
