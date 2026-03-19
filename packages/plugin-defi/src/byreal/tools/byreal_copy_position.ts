import type { OpenPositionResult } from "@byreal-io/byreal-sdk";
import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult } from "../utils/sdk";

export async function byrealCopyPosition(
  agent: SolanaAgentKit,
  sourcePositionAddress: string,
  amountUsd: number,
  slippageBps?: number,
): Promise<OpenPositionResult> {
  const sdk = createByrealSDK(agent);
  const signerCallback = async (
    tx: import("@solana/web3.js").VersionedTransaction,
  ) => agent.wallet.signTransaction(tx);

  const result = await sdk.copyFarmer.copyPosition({
    sourcePositionAddress,
    amountUsd,
    slippageBps,
    userAddress: agent.wallet.publicKey.toBase58(),
    signerCallback,
  });
  return unwrapResult(result);
}
