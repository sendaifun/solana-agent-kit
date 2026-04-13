import { SolanaAgentKit } from "solana-agent-kit";
import type { MoonPayBuyQuote } from "../types";

/**
 * Get a buy quote from MoonPay for purchasing crypto with fiat.
 *
 * @param agent      SolanaAgentKit instance (provides MOONPAY_API_KEY from config)
 * @param cryptoCode Crypto currency code, e.g. "sol"
 * @param fiatCode   Fiat currency code, e.g. "usd"
 * @param amount     Amount of fiat to spend
 * @returns          MoonPay buy quote
 */
export async function moonpayGetBuyQuote(
  agent: SolanaAgentKit,
  cryptoCode: string,
  fiatCode: string,
  amount: number,
): Promise<MoonPayBuyQuote> {
  const apiKey = agent.config?.OTHER_API_KEYS?.MOONPAY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MOONPAY_API_KEY is required in agent config OTHER_API_KEYS",
    );
  }

  const url = new URL(
    `https://api.moonpay.com/v3/currencies/${cryptoCode.toLowerCase()}/buy_quote`,
  );
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("baseCurrencyCode", fiatCode.toLowerCase());
  url.searchParams.set("baseCurrencyAmount", amount.toString());

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MoonPay buy quote failed: ${err}`);
  }

  return res.json() as Promise<MoonPayBuyQuote>;
}
