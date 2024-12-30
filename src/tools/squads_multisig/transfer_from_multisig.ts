import { SolanaAgentKit } from "../../index";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
} from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getMint,
} from "@solana/spl-token";
import * as multisig from "@sqds/multisig";
const { Multisig } = multisig.accounts;

/**
 * Transfer SOL or SPL tokens to a recipient from a multisig vault.
 * @param agent - SolanaAgentKit instance.
 * @param amount - Amount to transfer.
 * @param to - Recipient's public key.
 * @param vaultIndex - Optional vault index, default is 0.
 * @param mint - Optional mint address for SPL tokens.
 * @returns Transaction signature.
 */
export async function transfer_from_multisig(
  agent: SolanaAgentKit,
  amount: number,
  to: PublicKey,
  vaultIndex: number = 0,
  mint?: PublicKey,
): Promise<string> {
  try {
    let transferInstruction: TransactionInstruction;

    const createKey = agent.wallet;
    const [multisigPda] = multisig.getMultisigPda({
      createKey: createKey.publicKey,
    });
    const multisigInfo = await Multisig.fromAccountAddress(
      agent.connection,
      multisigPda,
    );
    const currentTransactionIndex = Number(multisigInfo.transactionIndex);
    const transactionIndex = BigInt(currentTransactionIndex + 1);
    const [vaultPda] = multisig.getVaultPda({
      multisigPda,
      index: vaultIndex,
    });

    if (!mint) {
      // Transfer native SOL
      transferInstruction = SystemProgram.transfer({
        fromPubkey: agent.wallet_address,
        toPubkey: to,
        lamports: amount * LAMPORTS_PER_SOL,
      });
    } else {
      // Transfer SPL token
      const fromAta = await getAssociatedTokenAddress(mint, vaultPda, true);
      const toAta = await getAssociatedTokenAddress(mint, to, true);
      const mintInfo = await getMint(agent.connection, mint);
      const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

      transferInstruction = createTransferInstruction(
        fromAta,
        toAta,
        agent.wallet_address,
        adjustedAmount,
      );
    }

    const transferMessage = new TransactionMessage({
      payerKey: vaultPda,
      recentBlockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      instructions: [transferInstruction],
    });

    const multisigTx = multisig.transactions.vaultTransactionCreate({
      blockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      feePayer: agent.wallet_address,
      multisigPda,
      transactionIndex,
      creator: agent.wallet_address,
      vaultIndex: 0,
      ephemeralSigners: 0,
      transactionMessage: transferMessage,
    });

    multisigTx.sign([agent.wallet]);
    const tx = await agent.connection.sendRawTransaction(
      multisigTx.serialize(),
    );
    return tx;
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error}`);
  }
}
