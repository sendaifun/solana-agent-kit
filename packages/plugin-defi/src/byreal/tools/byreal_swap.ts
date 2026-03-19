import type { SwapResult } from "@byreal-io/byreal-sdk";
import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult } from "../utils/sdk";

export async function byrealSwap(
  agent: SolanaAgentKit,
  inputMint: string,
  outputMint: string,
  amount: string,
  slippageBps?: number,
): Promise<SwapResult> {
  const sdk = createByrealSDK(agent);
  const signerCallback = async (
    tx: import("@solana/web3.js").VersionedTransaction,
  ) => agent.wallet.signTransaction(tx);

  const result = await sdk.swap.executeSwap({
    inputMint,
    outputMint,
    amount,
    swapMode: "in",
    slippageBps,
    userPublicKey: agent.wallet.publicKey.toBase58(),
    signerCallback,
  });
  return unwrapResult(result);
}
