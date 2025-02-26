import { z } from "zod";

// DeBridge Types ref: https://dln.debridge.finance/v1.0/
export interface deBridgeChainInfo {
  chainId: string;
  originalChainId: string;
  chainName: string;
}

export interface deBridgeSupportedChainsResponse {
  chains: deBridgeChainInfo[];
}

export interface deBridgeTokenInfo {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  chainId?: string;
}

export interface deBridgeTokensInfoResponse {
  tokens: Record<string, deBridgeTokenInfo>;
}

export interface deBridgeQuoteInput {
  srcChainId: string;
  srcChainTokenIn: string;
  srcChainTokenInAmount: string;
  dstChainId: string;
  dstChainTokenOut: string;
  dstChainTokenOutAmount?: string;
  slippage?: number;
  senderAddress?: string;
}

export interface deBridgeQuoteResponse {
  estimation: {
    srcChainTokenIn: {
      amount: string;
      tokenAddress: string;
      decimals: number;
      symbol: string;
    };
    dstChainTokenOut: {
      amount: string;
      tokenAddress: string;
      decimals: number;
      symbol: string;
    };
    fees: {
      srcChainTokenIn: string;
      dstChainTokenOut: string;
    };
  };
}

export interface deBridgeOrderInput {
  srcChainId: string;
  srcChainTokenIn: string;
  srcChainTokenInAmount: string;
  dstChainId: string;
  dstChainTokenOut: string;
  dstChainTokenOutRecipient: string;
  account: string;
  dstChainTokenOutAmount?: string;
  slippage?: number;
  additionalTakerRewardBps?: number;
  srcIntermediaryTokenAddress?: string;
  dstIntermediaryTokenAddress?: string;
  dstIntermediaryTokenSpenderAddress?: string;
  intermediaryTokenUSDPrice?: number;
  srcAllowedCancelBeneficiary?: string;
  referralCode?: number;
  affiliateFeePercent?: number;
  srcChainOrderAuthorityAddress?: string;
  srcChainRefundAddress?: string;
  dstChainOrderAuthorityAddress?: string;
  prependOperatingExpenses?: boolean;
  deBridgeApp?: string;
}

export interface deBridgeOrderResponse {
  tx: {
    data: string;
    to: string;
    value: string;
  };
  estimation: {
    srcChainTokenIn: {
      amount: string;
      tokenAddress: string;
      decimals: number;
      symbol: string;
    };
    dstChainTokenOut: {
      amount: string;
      tokenAddress: string;
      decimals: number;
      symbol: string;
    };
    fees: {
      srcChainTokenIn: string;
      dstChainTokenOut: string;
    };
  };
}

export interface deBridgeOrderIdsResponse {
  orderIds: string[];
  errorCode?: number;
  errorMessage?: string;
}

export interface deBridgeOrderStatusResponse {
  orderId: string;
  status:
    | "None"
    | "Created"
    | "Fulfilled"
    | "SentUnlock"
    | "OrderCancelled"
    | "SentOrderCancel"
    | "ClaimedUnlock"
    | "ClaimedOrderCancel";
  srcChainTxHash?: string;
  dstChainTxHash?: string;
  orderLink?: string;
  error?: string;
}

// Chain ID validation schema
export const chainIdSchema = z.string().refine(
  (val) => {
    const num = Number.parseInt(val, 10);
    // Regular chain IDs (1-99999)
    if (num > 0 && num < 100000) {
      return true;
    }
    // Special chain IDs (100000000+)
    if (num >= 100000000) {
      return true;
    }
    // Solana chain ID (7565164)
    if (num === 7565164) {
      return true;
    }
    return false;
  },
  {
    message: "Chain ID must be either 1-99999, 7565164 (Solana), or 100000000+",
  },
);

// Token info parameters schema
export const getDebridgeTokensInfoSchema = z.object({
  /** Chain ID to query tokens for */
  chainId: chainIdSchema.describe(
    "Chain ID to get token information for. Examples: '1' (Ethereum), '56' (BNB Chain), '7565164' (Solana)",
  ),

  /** Optional token address to filter results */
  tokenAddress: z
    .string()
    .optional()
    .describe(
      "Token address to query information for. For EVM chains: use 0x-prefixed address. For Solana: use base58 token address",
    ),

  /** Optional search term to filter tokens by name or symbol */
  search: z
    .string()
    .optional()
    .describe(
      "Search term to filter tokens by name or symbol (e.g., 'USDC', 'Ethereum')",
    ),
});

export type GetDebridgeTokensInfoParams = z.infer<
  typeof getDebridgeTokensInfoSchema
>;
