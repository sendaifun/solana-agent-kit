import { SolanaAgentKit } from "solana-agent-kit";
import type { MoonPaySellQuote } from "../types";

/**
 * Get a sell quote from MoonPay for selling crypto to fiat.
 *
 * @param agent      SolanaAgentKit instance
 * @param cryptoCode Crypto currency code, e.g. "sol"
 * @param fiatCode   Fiat currency code, e.g. "usd"
 * @param amount     Amount of crypto to sell
 * @returns          MoonPay sell quote
 */
export async function moonpayGetSellQuote(
  agent: SolanaAgentKit,
  cryptoCode: string,
  fiatCode: string,
  amount: number,
): Promise<MoonPaySellQuote> {
  const apiKey = agent.config?.OTHER_API_KEYS?.MOONPAY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MOONPAY_API_KEY is required in agent config OTHER_API_KEYS",
    );
  }

  const url = new URL(
    `https://api.moonpay.com/v3/currencies/${cryptoCode.toLowerCase()}/sell_quote`,
  );
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("quoteCurrencyCode", fiatCode.toLowerCase());
  url.searchParams.set("baseCurrencyAmount", amount.toString());

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MoonPay sell quote failed: ${err}`);
  }

  return res.json() as Promise<MoonPaySellQuote>;
}
