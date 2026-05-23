import { SolanaAgentKit } from "solana-agent-kit";
import type { MoonPayTransaction } from "../types";

/**
 * Retrieve a MoonPay transaction by ID.
 *
 * @param agent         SolanaAgentKit instance
 * @param transactionId MoonPay transaction ID
 * @returns             Transaction details
 */
export async function moonpayGetTransaction(
  agent: SolanaAgentKit,
  transactionId: string,
): Promise<MoonPayTransaction> {
  const apiKey = agent.config?.OTHER_API_KEYS?.MOONPAY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MOONPAY_API_KEY is required in agent config OTHER_API_KEYS",
    );
  }

  const url = `https://api.moonpay.com/v1/transactions/${transactionId}?apiKey=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MoonPay get transaction failed: ${err}`);
  }

  return res.json() as Promise<MoonPayTransaction>;
}
