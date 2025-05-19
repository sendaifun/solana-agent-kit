// okx/index.ts
import { Plugin, SolanaAgentKit } from 'solana-agent-kit';
import OkxDexQuoteAction from './actions/OkxDexQuoteAction';
import OkxDexSwapAction from './actions/OkxDexSwapAction';
import { getOkxDexQuote, getOkxSwap } from './tools';

const OkxPlugin = {
  name: 'OkxPlugin',
  methods: {
    // Don't use 'this' type annotation in the plugin definition
    getOkxDexQuote: async (
      agent: SolanaAgentKit,
      fromTokenAddress: string,
      toTokenAddress: string,
      amount: string,
      slippage: string = "0.5"
    ) => {
      return getOkxDexQuote(agent, fromTokenAddress, toTokenAddress, amount, slippage);
    },
    getOkxSwap: async (
      agent: SolanaAgentKit,
      fromTokenAddress: string,
      toTokenAddress: string,
      amount: string,
      slippage: string = "0.5",
      userWalletAddress: string,
      swapReceiverAddress?: string,
      feePercent?: string,
      fromTokenReferrerWalletAddress?: string,
      toTokenReferrerWalletAddress?: string,
      positiveSlippagePercent?: string,
      computeUnitPrice?: string,
      computeUnitLimit?: string,
      directRoute?: boolean,
      priceImpactProtectionPercentage?: string
    ) => {
      return getOkxSwap(
        agent,
        fromTokenAddress,
        toTokenAddress,
        amount,
        slippage,
        userWalletAddress,
        swapReceiverAddress,
        feePercent,
        fromTokenReferrerWalletAddress,
        toTokenReferrerWalletAddress,
        positiveSlippagePercent,
        computeUnitPrice,
        computeUnitLimit,
        directRoute,
        priceImpactProtectionPercentage
      );
    },
  },
  actions: [
    OkxDexQuoteAction,
    OkxDexSwapAction,
  ],
  initialize: function (agent: SolanaAgentKit) {
    // Initialize all methods with the agent instance
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName] = method.bind(null, agent);
      }
    });
  }
} satisfies Plugin;

export default OkxPlugin;