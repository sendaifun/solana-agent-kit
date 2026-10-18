import type { SolanaAgentKit } from "solana-agent-kit";
import { CREWPAY_API_URL } from "../types";

/**
 * Resolve the CrewPay agent API key from the agent config.
 * Get one with a single unauthenticated call: POST https://api.crewpay.dev/api/agent/keys/claim
 */
export function getCrewpayApiKey(agent: SolanaAgentKit): string {
  const key =
    agent.config?.CREWPAY_API_KEY ||
    agent.config?.OTHER_API_KEYS?.CREWPAY_API_KEY;
  if (!key) {
    throw new Error(
      "CREWPAY_API_KEY is not configured. Claim a free key with POST https://api.crewpay.dev/api/agent/keys/claim and set it in the SolanaAgentKit config.",
    );
  }
  return key;
}

export async function crewpayFetch<T>(
  path: string,
  init: { method?: "GET" | "POST"; apiKey?: string; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (init.apiKey) {
    headers["x-crew-api-key"] = init.apiKey;
  }
  if (init.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  const res = await fetch(`${CREWPAY_API_URL}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`CrewPay API ${res.status}: ${text.slice(0, 200)}`);
  }
  if (!res.ok || data?.ok === false) {
    throw new Error(
      `CrewPay API ${res.status}: ${data?.error ?? text.slice(0, 200)}`,
    );
  }
  return data as T;
}
