import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { AlloraInference, AlloraTopic } from "@alloralabs/allora-sdk";

export interface Config {
  OPENAI_API_KEY?: string;
  PERPLEXITY_API_KEY?: string;
  JUPITER_REFERRAL_ACCOUNT?: string;
  JUPITER_FEE_BPS?: number;
  FLASH_PRIVILEGE?: string;
  FLEXLEND_API_KEY?: string;
  HELIUS_API_KEY?: string;
  PRIORITY_LEVEL?: string; // medium, high, or veryHigh
  SOLUTIOFI_API_KEY?: string;
  ETHEREUM_PRIVATE_KEY?: string;
  ALLORA_API_KEY?: string;
  ALLORA_API_URL?: string;
  ALLORA_NETWORK?: string;
  ELFA_AI_API_KEY?: string;
}

export interface Creator {
  address: string;
  percentage: number;
}

export interface CollectionOptions {
  name: string;
  uri: string;
  royaltyBasisPoints?: number;
  creators?: Creator[];
}

// Add return type interface
export interface CollectionDeployment {
  collectionAddress: PublicKey;
  signature: Uint8Array;
}

export interface MintCollectionNFTResponse {
  mint: PublicKey;
  metadata: PublicKey;
}

export interface PumpFunTokenOptions {
  twitter?: string;
  telegram?: string;
  website?: string;
  initialLiquiditySOL?: number;
  slippageBps?: number;
  priorityFee?: number;
}

export interface PumpfunLaunchResponse {
  signature: string;
  mint: string;
  metadataUri?: string;
  error?: string;
}

/**
 * Lulo Account Details response format
 */
export interface LuloAccountDetailsResponse {
  totalValue: number;
  interestEarned: number;
  realtimeApy: number;
  settings: {
    owner: string;
    allowedProtocols: string | null;
    homebase: string | null;
    minimumRate: string;
  };
}

export interface JupiterTokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  tags: string[];
  logoURI: string;
  daily_volume: number;
  freeze_authority: string | null;
  mint_authority: string | null;
  permanent_delegate: string | null;
  extensions: {
    coingeckoId?: string;
  };
}

export interface FetchPriceResponse {
  status: "success" | "error";
  tokenId?: string;
  priceInUSDC?: string;
  message?: string;
  code?: string;
}

export interface PythFetchPriceResponse {
  status: "success" | "error";
  tokenSymbol: string;
  priceFeedID?: string;
  price?: string;
  message?: string;
  code?: string;
}

export interface GibworkCreateTaskReponse {
  status: "success" | "error";
  taskId?: string | undefined;
  signature?: string | undefined;
}

/**
 * Example of an action with input and output
 */
export interface ActionExample {
  input: Record<string, any>;
  output: Record<string, any>;
  explanation: string;
}

/**
 * Handler function type for executing the action
 */
export type Handler = (
  agent: SolanaAgentKit,
  input: Record<string, any>,
) => Promise<Record<string, any>>;

/**
 * Main Action interface inspired by ELIZA
 * This interface makes it easier to implement actions across different frameworks
 */
export interface Action {
  /**
   * Unique name of the action
   */
  name: string;

  /**
   * Alternative names/phrases that can trigger this action
   */
  similes: string[];

  /**
   * Detailed description of what the action does
   */
  description: string;

  /**
   * Array of example inputs and outputs for the action
   * Each inner array represents a group of related examples
   */
  examples: ActionExample[][];

  /**
   * Zod schema for input validation
   */
  schema: z.ZodType<any>;

  /**
   * Function that executes the action
   */
  handler: Handler;
}

export interface TokenCheck {
  tokenProgram: string;
  tokenType: string;
  risks: Array<{
    name: string;
    level: string;
    description: string;
    score: number;
  }>;
  score: number;
}

export interface PythPriceFeedIDItem {
  id: string;
  attributes: {
    asset_type: string;
    base: string;
  };
}

export interface PythPriceItem {
  binary: {
    data: string[];
    encoding: string;
  };
  parsed: [
    Array<{
      id: string;
      price: {
        price: string;
        conf: string;
        expo: number;
        publish_time: number;
      };
      ema_price: {
        price: string;
        conf: string;
        expo: number;
        publish_time: number;
      };
      metadata: {
        slot: number;
        proof_available_time: number;
        prev_publish_time: number;
      };
    }>,
  ];
}

export interface OrderParams {
  quantity: number;
  side: string;
  price: number;
}

export interface BatchOrderPattern {
  side: string;
  totalQuantity?: number;
  priceRange?: {
    min?: number;
    max?: number;
  };
  spacing?: {
    type: "percentage" | "fixed";
    value: number;
  };
  numberOfOrders?: number;
  individualQuantity?: number;
}

export interface FlashTradeParams {
  token: string;
  side: "long" | "short";
  collateralUsd: number;
  leverage: number;
}

export interface FlashCloseTradeParams {
  token: string;
  side: "long" | "short";
}

export interface HeliusWebhookResponse {
  webhookURL: string;
  webhookID: string;
}
export interface HeliusWebhookIdResponse {
  wallet: string;
  webhookURL: string;
  transactionTypes: string[];
  accountAddresses: string[];
  webhookType: string;
}

export interface PriorityFeeResponse {
  jsonrpc: string;
  id: string;
  method: string;
  params: Array<{
    transaction: string;
    options: { priorityLevel: string };
  }>;
}

export interface AlloraPriceInferenceResponse {
  status: "success" | "error";
  tokenSymbol?: string;
  timeframe?: string;
  priceInference?: string;
  message?: string;
  code?: string;
}

export interface AlloraGetAllTopicsResponse {
  status: "success" | "error";
  topics?: AlloraTopic[];
  message?: string;
  code?: string;
}

export interface AlloraGetInferenceByTopicIdResponse {
  status: "success" | "error";
  topicId?: number;
  inference?: AlloraInference;
  message?: string;
  code?: string;
}

export interface SwitchboardSimulateFeedResponse {
  status: "success" | "error";
  feed?: string;
  value?: number;
  message?: string;
  code?: string;
}

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

// Regular expressions for validating addresses
export const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
export const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

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

export interface FluxbeamServerResponse {
  signature: string;
}

export interface Quote {
  amountIn: number;
  inputMint: string;
  minimumOut: number;
  outAmount: number;
  outputMint: string;
  pool: string;
  program: string;
}

export interface TransformedResponse {
  quote: Quote;
}
