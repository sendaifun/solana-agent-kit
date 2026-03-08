import {
  type PublicKey,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import {
  getGovernanceProgramVersion,
  withCreateRealm,
  MintMaxVoteWeightSource,
} from "@solana/spl-governance";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

/**
 * Create a new Realm in SPL Governance
 * @param agent SolanaAgentKit instance
 * @param programId Governance program ID
 * @param name Name of the realm
 * @param communityMint Community token mint
 * @returns Transaction signature
 */
export async function governanceCreateRealm(
  agent: SolanaAgentKit,
  programId: PublicKey,
  name: string,
  communityMint: PublicKey,
) {
  try {
    const instructions: TransactionInstruction[] = [];
    const programVersion = await getGovernanceProgramVersion(
      agent.connection,
      programId,
    );

    await withCreateRealm(
      instructions,
      programId,
      programVersion,
      name,
      agent.wallet.publicKey,
      communityMint,
      agent.wallet.publicKey,
      undefined, // councilMint
      MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION,
      new BigInt(10000000000), // 100% of community tokens
      undefined, // config
    );

    const transaction = new Transaction().add(...instructions);
    const { blockhash } = await agent.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = agent.wallet.publicKey;

    return await signOrSendTX(agent, transaction);
  } catch (error: any) {
    throw new Error(`Governance create realm failed: ${error.message}`);
  }
}
