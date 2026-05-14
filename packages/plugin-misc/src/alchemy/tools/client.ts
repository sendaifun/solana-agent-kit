import type {
  AlchemyAuth,
  AlchemyRequestOptions,
  AlchemySolanaNetwork,
  AlchemyAgent as SolanaAgentKit,
} from "../types";

export const DEFAULT_ALCHEMY_SOLANA_NETWORK = "solana-mainnet";
export const DEFAULT_ALCHEMY_NOTIFY_NETWORK = "SOLANA_MAINNET";

export class AlchemyApiError extends Error {
  status?: number;
  details?: unknown;
  paymentRequired?: string | null;

  constructor(
    message: string,
    options: {
      status?: number;
      details?: unknown;
      paymentRequired?: string | null;
    } = {},
  ) {
    super(message);
    this.name = "AlchemyApiError";
    this.status = options.status;
    this.details = options.details;
    this.paymentRequired = options.paymentRequired;
  }
}

export function getAlchemySolanaNetwork(
  agent?: SolanaAgentKit,
  network?: AlchemySolanaNetwork,
): AlchemySolanaNetwork {
  return (
    network ??
    agent?.config?.ALCHEMY_SOLANA_NETWORK ??
    DEFAULT_ALCHEMY_SOLANA_NETWORK
  );
}

export function getAlchemyApiKey(
  agent: SolanaAgentKit,
  override?: string,
): string | undefined {
  return override ?? agent.config?.ALCHEMY_API_KEY;
}

export function getAlchemyNotifyAuthToken(
  agent: SolanaAgentKit,
  override?: string,
): string {
  const token = override ?? agent.config?.ALCHEMY_NOTIFY_AUTH_TOKEN;
  if (!token) {
    throw new Error(
      "ALCHEMY_NOTIFY_AUTH_TOKEN is required for Alchemy Notify webhooks",
    );
  }
  return token;
}

export function resolveAlchemyAuth(
  agent: SolanaAgentKit,
  options: AlchemyRequestOptions = {},
): AlchemyAuth {
  const apiKey = getAlchemyApiKey(agent, options.apiKey);
  if (apiKey) {
    return { mode: "api-key", apiKey };
  }

  throw new Error(
    "Alchemy requests require ALCHEMY_API_KEY. x402 requires a wallet payment flow and is not supported by passing a static token.",
  );
}

export function createAlchemyHeaders(
  headers: Record<string, string> = {},
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...headers,
  };
}

export async function fetchAlchemyJson<T>(
  url: string,
  init: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  const paymentRequired =
    response.headers.get("payment-required") ??
    response.headers.get("PAYMENT-REQUIRED");
  const text = await response.text();
  const data = parseJson(text);

  if (!response.ok) {
    const paymentMessage =
      response.status === 402
        ? " x402 payment is required, but this helper does not perform wallet payment retries."
        : "";
    throw new AlchemyApiError(
      `Alchemy request failed with ${response.status} ${response.statusText}.${paymentMessage}`,
      {
        status: response.status,
        details: data ?? text,
        paymentRequired,
      },
    );
  }

  return data as T;
}

function parseJson(text: string): unknown {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
