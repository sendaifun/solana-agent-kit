import { SolanaAgentKit } from "../../index";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getMint,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import * as multisig from "@sqds/multisig";

/**
 * Transfer SOL or SPL tokens to a multisig vault.
 * @param agent SolanaAgentKit instance
 * @param amount Amount to transfer
 * @param vaultIndex Optional vault index, default is 0
 * @param mint Optional mint address for SPL tokens
 * @returns Transaction signature
 */
export async function deposit_to_multisig(
  agent: SolanaAgentKit,
  amount: number,
  vaultIndex?: number,
  mint?: PublicKey,
): Promise<string> {
  try {
    let tx: string;
    if (!vaultIndex) {
      vaultIndex = 0;
    }
    const createKey = agent.wallet;
    const [multisigPda] = multisig.getMultisigPda({
      createKey: createKey.publicKey,
    });
    const [vaultPda] = multisig.getVaultPda({
      multisigPda,
      index: vaultIndex,
    });
    const to = vaultPda;
    if (!mint) {
      // Transfer native SOL
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: agent.wallet_address,
          toPubkey: to,
          lamports: amount * LAMPORTS_PER_SOL,
        }),
      );

      tx = await agent.connection.sendTransaction(transaction, [agent.wallet]);
    } else {
      // Transfer SPL token
      const fromAta = await getAssociatedTokenAddress(
        mint,
        agent.wallet_address,
      );
      let transaction = new Transaction();
      const toAta = await getAssociatedTokenAddress(mint, to, true);
      const toTokenAccountInfo = await agent.connection.getAccountInfo(toAta);
      // Create associated token account if it doesn't exist
      if (!toTokenAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            agent.wallet_address,
            toAta,
            to,
            mint,
          ),
        );
      }
      // Get mint info to determine decimals
      const mintInfo = await getMint(agent.connection, mint);
      const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

      transaction.add(
        createTransferInstruction(
          fromAta,
          toAta,
          agent.wallet_address,
          adjustedAmount,
        ),
      );

      tx = await agent.connection.sendTransaction(transaction, [agent.wallet]);
    }

    return tx;
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error}`);
  }
}
