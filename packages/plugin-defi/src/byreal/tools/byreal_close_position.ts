import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult, signAndSend } from "../utils/sdk";

export async function byrealClosePosition(
  agent: SolanaAgentKit,
  nftMint: string,
  slippageBps?: number,
) {
  const sdk = createByrealSDK(agent);
  const result = await sdk.positions.prepareClosePosition({
    nftMint,
    slippageBps,
    userAddress: agent.wallet.publicKey.toBase58(),
  });
  const prepared = unwrapResult(result);
  return signAndSend(agent, prepared.transaction);
}
