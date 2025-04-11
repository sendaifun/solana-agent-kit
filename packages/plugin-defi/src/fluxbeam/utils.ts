import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getMint,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "solana-agent-kit";

// handles the case where a token in the pool is a token 2022 token
export async function getTokenDecimals(
  agent: SolanaAgentKit,
  mint: PublicKey,
): Promise<number> {
  try {
    return (
      await getMint(agent.connection, mint, "finalized", TOKEN_PROGRAM_ID)
    ).decimals;
  } catch (_error) {
    try {
      return (
        await getMint(
          agent.connection,
          mint,
          "finalized",
          TOKEN_2022_PROGRAM_ID,
        )
      ).decimals;
    } catch (finalError: any) {
      throw new Error(
        `Failed to fetch mint info for token ${mint.toBase58()}: ${finalError.message}`,
      );
    }
  }
}
