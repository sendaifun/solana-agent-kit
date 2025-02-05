import {
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { SolanaAgentKit } from "../../agent";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { TOKENS } from "../../constants";
import { getWrapSOLInstructions } from "./wrap_sol_fluxbeam";

export async function getUnwrapSOLInstructions(
  agent: SolanaAgentKit,
  owner: PublicKey,
  amount: number, // Amount in SOL (not lamports)
): Promise<TransactionInstruction[]> {
  try {
    const ixs: TransactionInstruction[] = [];
    const amountInLamports = amount * LAMPORTS_PER_SOL;

    const ata = getAssociatedTokenAddressSync(TOKENS.wSOL, owner, true);
    //convert all the WSOL back to sol
    const wsolBalance = await agent.connection
      .getTokenAccountBalance(TOKENS.wSOL) // prob in lamports
      .then((val) => {
        if (!val?.value?.uiAmount) {
          throw new Error("Failed to fetch wSOL balance");
        }
        return val.value.uiAmount;
      });
    if (wsolBalance === null || 0) {
      throw Error("You have no WSOL to unwrap");
    }
    if (amount === wsolBalance) {
      ixs.push(createCloseAccountInstruction(ata, owner, owner));
    } else {
      ixs.push(createCloseAccountInstruction(ata, owner, owner));

      const amountToWrap = wsolBalance - amountInLamports;
      const instructions = await getWrapSOLInstructions(
        agent,
        agent.wallet_address,
        amountToWrap,
      );
      ixs.push(...instructions);
    }
    return ixs;
  } catch (error: any) {
    throw new Error(
      `Failed to generate unwrap SOL instructions: ${error.message}`,
    );
  }
}

/**
 * Unwraps wSOL back to SOL
 * @param agent SolanaAgentKit instance
 * @returns Transaction signature
 */
export async function fluxbeamUnwrapSOL(
  agent: SolanaAgentKit,
  amount: number,
): Promise<string> {
  try {
    const instructions = await getUnwrapSOLInstructions(
      agent,
      agent.wallet_address,
      amount,
    );

    const transaction = new Transaction().add(...instructions);
    const blockhash = await agent.connection.getLatestBlockhash();

    transaction.feePayer = agent.wallet_address;
    transaction.recentBlockhash = blockhash.blockhash;

    const signature = await agent.connection.sendTransaction(transaction, [
      agent.wallet,
    ]);
    return signature;
  } catch (error: any) {
    throw new Error(`SOL unwrapping failed: ${error.message}`);
  }
}
