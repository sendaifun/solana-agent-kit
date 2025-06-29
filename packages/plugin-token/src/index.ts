import type { Plugin, SolanaAgentKit } from "solana-agent-kit";

// Import all actions
// dexscreener
import getTokenDataAction from "./dexscreener/actions/getTokenData";

import cancelLimitOrdersAction from "./jupiter/actions/cancelLimitOrders";
import createLimitOrderAction from "./jupiter/actions/createLimitOrder";
// jupiter
import fetchPriceAction from "./jupiter/actions/fetchPrice";
import getLimitOrderHistoryAction from "./jupiter/actions/getLimitOrderHistory";
import getOpenLimitOrdersAction from "./jupiter/actions/getOpenLimitOrders";
import tokenDataByTickerAction from "./jupiter/actions/getTokenDataByTicker";
import stakeWithJupAction from "./jupiter/actions/stakeWithJup";
import tradeAction from "./jupiter/actions/trade";

// lightprotocol
import compressedAirdropAction from "./lightprotocol/actions/compressedAirdrop";

// solana
import balanceAction from "./solana/actions/balance";
import closeEmptyTokenAccountsAction from "./solana/actions/closeEmptyTokenAccounts";
import getTPSAction from "./solana/actions/getTPS";
import requestFundsAction from "./solana/actions/requestFunds";
import tokenBalancesAction from "./solana/actions/tokenBalances";
import transferAction from "./solana/actions/transfer";
import walletAddressAction from "./solana/actions/walletAddress";

// mayan
import mayanSwapAction from "./mayan/actions/swap";

// pumpfun
import launchPumpfunTokenAction from "./pumpfun/actions/launchPumpfunToken";
import claimCreatorFeeAction from "./pumpfun/actions/claimCreatorFeeAction";
// pyth
import pythFetchPriceAction from "./pyth/actions/pythFetchPrice";

// rugcheck
import rugcheckAction from "./rugcheck/actions/rugcheck";

// solutiofi
import burnTokensUsingSolutiofiAction from "./solutiofi/actions/burnTokens";
import closeAccountsUsingSolutiofiAction from "./solutiofi/actions/closeAccounts";
import mergeTokensUsingSolutiofiAction from "./solutiofi/actions/mergeTokens";
import spreadTokenUsingSolutiofiAction from "./solutiofi/actions/spreadToken";

// Import all tools
import {
  getTokenAddressFromTicker,
  getTokenDataByAddress,
} from "./dexscreener/tools";
import {
  cancelLimitOrders as cancelJupiterLimitOrders,
  createLimitOrder as createJupiterLimitOrder,
  fetchPrice,
  getLimitOrderHistory as getJupiterLimitOrderHistory,
  getOpenLimitOrders as getOpenJupiterLimitOrders,
  stakeWithJup,
  trade,
} from "./jupiter/tools";
import { sendCompressedAirdrop } from "./lightprotocol/tools";
import { swap } from "./mayan/tools";
import launchPumpFunToken from "./pumpfun/tools/launchPumpfunToken";
import claimCreatorFee from "./pumpfun/tools/claimCreatorFee";
import { fetchPythPrice, fetchPythPriceFeedID } from "./pyth/tools";
import { fetchTokenDetailedReport, fetchTokenReportSummary } from "./rugcheck";
import {
  closeEmptyTokenAccounts,
  getTPS,
  getWalletAddress,
  get_balance,
  get_balance_other,
  get_token_balance,
  request_faucet_funds,
  transfer,
} from "./solana/tools";
import {
  burnTokens,
  closeAccounts,
  mergeTokens,
  spreadToken,
} from "./solutiofi/tools/solutiofi";

// Define and export the plugin
const TokenPlugin = {
  name: "token",

  // Combine all tools
  methods: {
    getTokenDataByAddress,
    getTokenAddressFromTicker,
    fetchPrice,
    stakeWithJup,
    trade,
    getJupiterLimitOrderHistory,
    createJupiterLimitOrder,
    cancelJupiterLimitOrders,
    getOpenJupiterLimitOrders,
    sendCompressedAirdrop,
    closeEmptyTokenAccounts,
    getTPS,
    get_balance,
    getWalletAddress,
    get_balance_other,
    get_token_balance,
    request_faucet_funds,
    transfer,
    swap,
    launchPumpFunToken,
    claimCreatorFee,
    fetchPythPrice,
    fetchPythPriceFeedID,
    fetchTokenDetailedReport,
    fetchTokenReportSummary,
    burnTokensUsingSolutiofi: burnTokens,
    closeAccountsUsingSolutiofi: closeAccounts,
    mergeTokensUsingSolutiofi: mergeTokens,
    spreadTokenUsingSolutiofi: spreadToken,
  },

  // Combine all actions
  actions: [
    getTokenDataAction,
    tokenDataByTickerAction,
    fetchPriceAction,
    stakeWithJupAction,
    tradeAction,
    createLimitOrderAction,
    cancelLimitOrdersAction,
    getOpenLimitOrdersAction,
    getLimitOrderHistoryAction,
    compressedAirdropAction,
    balanceAction,
    tokenBalancesAction,
    getTPSAction,
    closeEmptyTokenAccountsAction,
    requestFundsAction,
    transferAction,
    mayanSwapAction,
    launchPumpfunTokenAction,
    claimCreatorFeeAction,
    pythFetchPriceAction,
    rugcheckAction,
    burnTokensUsingSolutiofiAction,
    spreadTokenUsingSolutiofiAction,
    closeAccountsUsingSolutiofiAction,
    mergeTokensUsingSolutiofiAction,
    walletAddressAction,
  ],

  // Initialize function
  initialize: function (): void {
    // Initialize all methods with the agent instance
    for (const [methodName, method] of Object.entries(this.methods)) {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    }
  },
} satisfies Plugin;

// Default export for convenience
export default TokenPlugin;
