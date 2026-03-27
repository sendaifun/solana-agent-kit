import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult, signAndSend } from "../utils/sdk";

export async function byrealClaimFees(
  agent: SolanaAgentKit,
  nftMints: string[],
) {
  const sdk = createByrealSDK(agent);
  const result = await sdk.positions.prepareClaimFees({
    nftMints,
    userAddress: agent.wallet.publicKey.toBase58(),
  });
  const preparedTxs = unwrapResult(result);

  const signatures: string[] = [];
  for (const prepared of preparedTxs) {
    const sig = await signAndSend(agent, prepared.transaction);
    signatures.push(sig);
  }
  return signatures;
}
