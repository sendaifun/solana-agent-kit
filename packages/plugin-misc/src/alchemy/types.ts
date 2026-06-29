import type { z } from "zod";

export interface AlchemyAgentConfig {
  ALCHEMY_API_KEY?: string;
  ALCHEMY_NOTIFY_AUTH_TOKEN?: string;
  ALCHEMY_SOLANA_NETWORK?: string;
  ALCHEMY_SOLANA_GRPC_URL?: string;
}

export interface AlchemyAgent {
  config?: AlchemyAgentConfig;
}

export interface AlchemyActionExample {
  input: Record<string, any>;
  output: Record<string, any>;
  explanation: string;
}

export interface AlchemyAction {
  name: string;
  similes: string[];
  description: string;
  examples: AlchemyActionExample[][];
  schema: z.ZodType<any>;
  handler: (
    agent: AlchemyAgent,
    input: Record<string, any>,
  ) => Promise<Record<string, any>>;
}

export type AlchemySolanaNetwork =
  | "solana-mainnet"
  | "solana-devnet"
  | (string & {});

export type AlchemyNotifyNetwork =
  | "SOLANA_MAINNET"
  | "SOLANA_DEVNET"
  | (string & {});

export type AlchemyAuthMode = "api-key";

export interface AlchemyRequestOptions {
  apiKey?: string;
  network?: AlchemySolanaNetwork;
  id?: string | number;
}

export interface AlchemyAuth {
  mode: AlchemyAuthMode;
  apiKey: string;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface AlchemyPriceAddress {
  network: string;
  address: string;
}

export interface AlchemyPortfolioAddress {
  address: string;
  networks: string[];
}

export interface AlchemyPortfolioTokensRequest {
  addresses: AlchemyPortfolioAddress[];
  withMetadata?: boolean;
  withPrices?: boolean;
  includeNativeTokens?: boolean;
  includeErc20Tokens?: boolean;
  pageKey?: string;
}

export interface AlchemyWebhookRequest {
  network: AlchemyNotifyNetwork;
  webhook_type: "ADDRESS_ACTIVITY" | "GRAPHQL" | "NFT_ACTIVITY";
  webhook_url: string;
  addresses?: string[];
  graphql_query?: string | Record<string, unknown>;
  name?: string;
  app_id?: string;
  nft_filters?: Array<{
    contract_address: string;
    token_id?: string;
  }>;
}

export interface AlchemyUpdateWebhookAddressesRequest {
  webhook_id: string;
  addresses_to_add: string[];
  addresses_to_remove: string[];
}

export interface AlchemyReplaceWebhookAddressesRequest {
  webhook_id: string;
  addresses: string[];
}

export interface AlchemyEndpointInfo {
  network: AlchemySolanaNetwork;
  rpcUrl: string;
  websocketUrl: string;
  grpcUrl: string;
  grpcAuthHeader: "X-Token";
  x402RpcUrl: string;
  x402PaymentFlow: string;
}
