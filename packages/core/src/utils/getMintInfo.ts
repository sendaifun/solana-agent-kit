import {
  getMint,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";
import { Commitment, Connection, PublicKey } from "@solana/web3.js";

export async function getMintInfo(
  connection: Connection,
  mint: string,
  commitment?: Commitment,
) {
  const publicKey = new PublicKey(mint);

  try {
    const mintInfo = await getMint(
      connection,
      publicKey,
      commitment,
      TOKEN_PROGRAM_ID,
    );
    return mintInfo;
  } catch (e) {
    if (e instanceof TokenInvalidAccountOwnerError) {
      const mintInfo = await getMint(
        connection,
        publicKey,
        commitment,
        TOKEN_2022_PROGRAM_ID,
      );
      return mintInfo;
    }

    throw new Error(
      `Failed to fetch mint info for token ${mint}: ${e instanceof Error ? e.message : "Unknown error"}`,
    );
  }
}
