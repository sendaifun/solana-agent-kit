import type { SwapQuote } from "@byreal-io/byreal-sdk";
import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult } from "../utils/sdk";

export async function byrealGetSwapQuote(
  agent: SolanaAgentKit,
  inputMint: string,
  outputMint: string,
  amount: string,
  swapMode?: "in" | "out",
  slippageBps?: number,
): Promise<SwapQuote> {
  const sdk = createByrealSDK(agent);
  const result = await sdk.swap.getQuote({
    inputMint,
    outputMint,
    amount,
    swapMode: swapMode ?? "in",
    slippageBps: slippageBps ?? 200,
    userPublicKey: agent.wallet.publicKey.toBase58(),
  });
  return unwrapResult(result);
}
