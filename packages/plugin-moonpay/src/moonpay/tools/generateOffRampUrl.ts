import { SolanaAgentKit } from "solana-agent-kit";

/**
 * Generate a MoonPay off-ramp widget URL for selling crypto to fiat.
 *
 * @param agent         SolanaAgentKit instance
 * @param cryptoCode    Crypto currency code to sell, e.g. "sol"
 * @param amount        Amount of crypto to sell
 * @param fiatCode      Target fiat currency code (default: "usd")
 * @returns             Widget URL string
 */
export async function moonpayGenerateOffRampUrl(
  agent: SolanaAgentKit,
  cryptoCode: string,
  amount?: number,
  fiatCode = "usd",
): Promise<string> {
  const apiKey = agent.config?.OTHER_API_KEYS?.MOONPAY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MOONPAY_API_KEY is required in agent config OTHER_API_KEYS",
    );
  }

  const url = new URL("https://sell.moonpay.com");
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("baseCurrencyCode", cryptoCode.toLowerCase());
  if (amount !== undefined) {
    url.searchParams.set("baseCurrencyAmount", amount.toString());
  }
  url.searchParams.set("quoteCurrencyCode", fiatCode.toLowerCase());

  return url.toString();
}
