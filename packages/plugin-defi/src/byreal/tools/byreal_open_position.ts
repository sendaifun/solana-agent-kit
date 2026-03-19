import type { SolanaAgentKit } from "solana-agent-kit";
import { createByrealSDK, unwrapResult, signAndSend } from "../utils/sdk";

export async function byrealOpenPosition(
  agent: SolanaAgentKit,
  poolAddress: string,
  priceLower: string | number,
  priceUpper: string | number,
  options?: {
    base?: "MintA" | "MintB";
    amount?: string;
    amountUsd?: number;
    slippageBps?: number;
  },
) {
  const sdk = createByrealSDK(agent);
  const result = await sdk.positions.prepareOpenPosition({
    poolAddress,
    priceLower,
    priceUpper,
    base: options?.base,
    amount: options?.amount,
    amountUsd: options?.amountUsd,
    slippageBps: options?.slippageBps,
    userAddress: agent.wallet.publicKey.toBase58(),
  });
  const prepared = unwrapResult(result);
  return signAndSend(agent, prepared.transaction);
}
