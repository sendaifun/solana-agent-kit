import { PublicKey } from "@solana/web3.js";
import { type SolanaAgentKit, getMintInfo } from "solana-agent-kit";
import { HelmswapApi, helmswapApiKey } from "./api";
import { DEFAULT_HELMSWAP_SLIPPAGE_BPS, HELMSWAP_SOL_MINT } from "./constants";

export function isHelmswapNativeSol(mint: PublicKey): boolean {
  return mint.equals(HELMSWAP_SOL_MINT);
}

export async function toHelmswapBaseUnits(
  agent: SolanaAgentKit,
  inputMint: PublicKey,
  inputAmount: number,
): Promise<string> {
  if (!(inputAmount > 0) || !Number.isFinite(inputAmount)) {
    throw new Error("Input amount must be a positive number");
  }
  const decimals = isHelmswapNativeSol(inputMint)
    ? 9
    : (await getMintInfo(agent.connection, inputMint.toBase58())).decimals;
  return Math.floor(inputAmount * Math.pow(10, decimals)).toString();
}

export async function fetchHelmswapQuote(
  agent: SolanaAgentKit,
  outputMint: PublicKey,
  inputAmount: number,
  inputMint: PublicKey = HELMSWAP_SOL_MINT,
  slippageBps: number = DEFAULT_HELMSWAP_SLIPPAGE_BPS,
) {
  const api = new HelmswapApi(undefined, helmswapApiKey(agent));
  const amount = await toHelmswapBaseUnits(agent, inputMint, inputAmount);
  return api.quote({
    chain: "solana",
    inputMint: inputMint.toBase58(),
    outputMint: outputMint.toBase58(),
    amount,
    slippageBps,
  });
}

/**
 * Get a HelmSwap swap quote on Solana.
 * Amounts are in whole tokens (e.g. 0.01 SOL). The signed quote ticket is
 * omitted from the result; call tradeWithHelmswap to build and send a swap.
 */
export async function getHelmswapQuote(
  agent: SolanaAgentKit,
  outputMint: PublicKey,
  inputAmount: number,
  inputMint: PublicKey = HELMSWAP_SOL_MINT,
  slippageBps: number = DEFAULT_HELMSWAP_SLIPPAGE_BPS,
) {
  const { quoteTicket: _quoteTicket, ...quote } = await fetchHelmswapQuote(
    agent,
    outputMint,
    inputAmount,
    inputMint,
    slippageBps,
  );
  return {
    ...quote,
    inputAmount,
    inputMint: inputMint.toBase58(),
    outputMint: outputMint.toBase58(),
    expectedOut: quote.quote?.netOutAmount,
    minOut: quote.quote?.minNetOutAmount,
    fee: quote.quote?.fee,
  };
}
