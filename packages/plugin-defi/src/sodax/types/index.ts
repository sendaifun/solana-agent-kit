export const SODAX_API = "https://api.sodax.com/v1/swaps";

export interface SodaxToken {
  symbol: string;
  address: string;
  decimals: number;
  access?: string;
  name?: string;
  logoURI?: string;
}

export type SodaxTokensResponse = Record<string, SodaxToken[]>;

export interface SodaxQuoteInput {
  tokenSrc: string;
  tokenSrcChainKey: string;
  tokenDst: string;
  tokenDstChainKey: string;
  amount: string;
  quoteType?: "exact_input" | "exact_output";
}

export interface SodaxQuoteResponse {
  /** Output amount in the destination token's base units. The API returns only this field. */
  quotedAmount: string;
}

export interface SodaxIntent {
  intentId: string;
  creator: string;
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  minOutputAmount: string;
  deadline: string;
  allowPartialFill: boolean;
  srcChain: string;
  dstChain: string;
  srcAddress: string;
  dstAddress: string;
  solver: string;
  data: string;
}

export interface SodaxIntentRequest {
  srcChainKey: string;
  dstChainKey: string;
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  minOutputAmount: string;
  deadline: string;
  allowPartialFill: boolean;
  srcAddress: string;
  dstAddress: string;
  solver: string;
  data: string;
}

export interface SodaxIntentResponse {
  tx: {
    data: string;
    encoding: string;
  };
  intent: SodaxIntent;
  relayData: {
    payload: string;
  };
}

export interface SodaxSubmitTxRequest {
  txHash: string;
  srcChainKey: string;
  walletAddress: string;
  intent: SodaxIntent;
  relayData: string;
}

export interface SodaxStatusResponse {
  data: {
    status: string;
    userMessage?: string;
    failureReason?: string;
    result?: {
      dstIntentTxHash?: string;
      fillTxHash?: string;
      intent_hash?: string;
      packetData?: string;
    };
  };
}

export interface SodaxSwapInput {
  srcChainKey: string;
  dstChainKey: string;
  inputTokenAddress: string;
  outputTokenAddress: string;
  inputAmount: string;
  slippageBps?: number;
  srcAddress: string;
  dstAddress: string;
  pollTimeoutMs?: number;
}

export interface SodaxSwapResult {
  status: "solved" | "failed" | "timeout";
  txHash: string;
  dstIntentTxHash?: string;
  fillTxHash?: string;
  userMessage?: string;
}
