import { SolanaAgentKit } from "solana-agent-kit";

/**
 * Generate a MoonPay on-ramp widget URL for buying crypto with fiat.
 * The URL can be opened in a browser to complete the purchase.
 *
 * @param agent         SolanaAgentKit instance
 * @param cryptoCode    Crypto currency code, e.g. "sol"
 * @param walletAddress Destination wallet address (defaults to agent's wallet)
 * @param amount        Optional fiat amount to pre-fill
 * @param fiatCode      Optional fiat currency code (default: "usd")
 * @returns             Widget URL string
 */
export async function moonpayGenerateOnRampUrl(
  agent: SolanaAgentKit,
  cryptoCode: string,
  walletAddress?: string,
  amount?: number,
  fiatCode = "usd",
): Promise<string> {
  const apiKey = agent.config?.OTHER_API_KEYS?.MOONPAY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MOONPAY_API_KEY is required in agent config OTHER_API_KEYS",
    );
  }

  const wallet = walletAddress ?? agent.wallet_address.toBase58();

  const url = new URL("https://buy.moonpay.com");
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("currencyCode", cryptoCode.toLowerCase());
  url.searchParams.set("walletAddress", wallet);
  if (amount !== undefined) {
    url.searchParams.set("baseCurrencyAmount", amount.toString());
  }
  if (fiatCode) {
    url.searchParams.set("baseCurrencyCode", fiatCode.toLowerCase());
  }

  return url.toString();
}
