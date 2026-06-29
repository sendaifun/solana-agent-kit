import type {
  AlchemyEndpointInfo,
  AlchemyRequestOptions,
  AlchemyAgent as SolanaAgentKit,
} from "../types";
import {
  DEFAULT_ALCHEMY_SOLANA_NETWORK,
  getAlchemyApiKey,
  getAlchemySolanaNetwork,
} from "./client";

export function getAlchemySolanaRpcUrl(
  agent?: SolanaAgentKit,
  options: AlchemyRequestOptions = {},
): string {
  const network = getAlchemySolanaNetwork(agent, options.network);
  const apiKey =
    options.apiKey ?? (agent ? getAlchemyApiKey(agent) : undefined);
  if (!apiKey) {
    return `https://${network}.g.alchemy.com/v2/<ALCHEMY_API_KEY>`;
  }
  return `https://${network}.g.alchemy.com/v2/${apiKey}`;
}

export function getAlchemySolanaWsUrl(
  agent?: SolanaAgentKit,
  options: AlchemyRequestOptions = {},
): string {
  const network = getAlchemySolanaNetwork(agent, options.network);
  const apiKey =
    options.apiKey ?? (agent ? getAlchemyApiKey(agent) : undefined);
  if (!apiKey) {
    return `wss://${network}.g.alchemy.com/v2/<ALCHEMY_API_KEY>`;
  }
  return `wss://${network}.g.alchemy.com/v2/${apiKey}`;
}

export function getAlchemySolanaGrpcUrl(
  agent?: SolanaAgentKit,
  options: AlchemyRequestOptions = {},
): string {
  if (agent?.config?.ALCHEMY_SOLANA_GRPC_URL) {
    return agent.config.ALCHEMY_SOLANA_GRPC_URL;
  }
  const network = getAlchemySolanaNetwork(agent, options.network);
  return `https://${network}.g.alchemy.com`;
}

export function getAlchemyX402SolanaRpcUrl(
  agent?: SolanaAgentKit,
  options: AlchemyRequestOptions = {},
): string {
  const network = getAlchemySolanaNetwork(agent, options.network);
  return `https://x402.alchemy.com/${network}/v2`;
}

export function getAlchemyPricesBaseUrl(apiKey: string): string {
  return `https://api.g.alchemy.com/prices/v1/${apiKey}`;
}

export function getAlchemyPortfolioBaseUrl(apiKey: string): string {
  return `https://api.g.alchemy.com/data/v1/${apiKey}`;
}

export function getAlchemySolanaEndpointInfo(
  agent?: SolanaAgentKit,
  options: AlchemyRequestOptions = {},
): AlchemyEndpointInfo {
  const network =
    options.network ??
    agent?.config?.ALCHEMY_SOLANA_NETWORK ??
    DEFAULT_ALCHEMY_SOLANA_NETWORK;

  return {
    network,
    rpcUrl: `https://${network}.g.alchemy.com/v2/<ALCHEMY_API_KEY>`,
    websocketUrl: `wss://${network}.g.alchemy.com/v2/<ALCHEMY_API_KEY>`,
    grpcUrl: getAlchemySolanaGrpcUrl(agent, { network }),
    grpcAuthHeader: "X-Token",
    x402RpcUrl: getAlchemyX402SolanaRpcUrl(agent, { network }),
    x402PaymentFlow:
      "Requires the full wallet-based x402 payment flow; this plugin does not authenticate x402 requests with a static token.",
  };
}
