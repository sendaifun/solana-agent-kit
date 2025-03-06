import {
  Transaction,
  PublicKey,
  VersionedTransaction,
  TransactionMessage,
  Signer,
  Keypair,
  TransactionInstruction,
} from "@solana/web3.js";
import { TransactionOrVersionedTransaction } from ".";
import { SolanaAgentKit } from "../agent";
import {
  sendTx,
  feeTiers,
  getComputeBudgetInstructions,
} from "../utils/send_tx";

/**
 * Interface representing a Solana wallet implementation
 *
 * @interface Wallet
 * @description Defines the standard interface for interacting with a Solana wallet,
 * including transaction signing, message signing, and connection status.
 */
export interface BaseWallet {
  /**
   * The public key of the connected wallet
   * @type {PublicKey}
   */
  readonly publicKey: PublicKey;

  /**
   * Signs a single transaction
   * @template T - Transaction type (Transaction or VersionedTransaction)
   * @param {T} transaction - The transaction to be signed
   * @returns {Promise<T>} Promise resolving to the signed transaction
   */
  signTransaction<
    T extends
      | Transaction
      | VersionedTransaction
      | TransactionOrVersionedTransaction,
  >(
    transaction: T,
  ): Promise<T>;

  /**
   * Signs multiple transactions in batch
   * @template T - Transaction type (Transaction or VersionedTransaction)
   * @param {T[]} transactions - Array of transactions to be signed
   * @returns {Promise<T[]>} Promise resolving to an array of signed transactions
   */
  signAllTransactions<
    T extends
      | Transaction
      | VersionedTransaction
      | TransactionOrVersionedTransaction,
  >(
    transactions: T[],
  ): Promise<T[]>;

  /**
   * Sends a transaction on chain
   * @template T - Transaction type (Transaction or VersionedTransaction)
   * @param {T} transaction - The transaction to be signed and sent
   */
  sendTransaction<
    T extends
      | Transaction
      | VersionedTransaction
      | TransactionOrVersionedTransaction,
  >(
    transaction: T,
  ): Promise<string>;

  // TODO: Implement signAndSendTransaction method to handle transaction signing and sending according to send options
  /**
   * Signs and sends a transaction to the network
   * @template T - Transaction type (Transaction or VersionedTransaction)
   * @param {T} transaction - The transaction to be signed and sent
   * @param {SendOptions} [options] - Optional transaction send configuration
   * @returns {Promise<{signature: TransactionSignature}>} Promise resolving to the transaction signature
   */
  // signAndSendTransaction<T extends Transaction | VersionedTransaction>(
  //     transaction: T,
  //     options?: SendOptions
  // ): Promise<{ signature: TransactionSignature }>;
}

export async function signOrSendTX(
  agent: SolanaAgentKit,
  instructionsOrTransaction:
    | TransactionInstruction[]
    | Transaction
    | VersionedTransaction,
  otherKeypairs?: Keypair[],
  feeTier?: keyof typeof feeTiers,
): Promise<string | TransactionOrVersionedTransaction> {
  if (
    instructionsOrTransaction instanceof Transaction ||
    instructionsOrTransaction instanceof VersionedTransaction
  ) {
    if (agent.config.signOnly) {
      return instructionsOrTransaction;
    }

    return await agent.wallet.sendTransaction(instructionsOrTransaction);
  }

  const ixComputeBudget = await getComputeBudgetInstructions(
    agent,
    instructionsOrTransaction,
    feeTier ?? "mid",
  );
  const allInstructions = [
    ixComputeBudget.computeBudgetLimitInstruction,
    ixComputeBudget.computeBudgetPriorityFeeInstructions,
    ...instructionsOrTransaction,
  ];
  const { blockhash } = await agent.connection.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: agent.wallet.publicKey,
    recentBlockhash: blockhash,
    instructions: allInstructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messageV0);
  transaction.sign([...(otherKeypairs ?? [])] as Signer[]);
  const signedTransaction = await agent.wallet.signTransaction(transaction);

  if (agent.config.signOnly) {
    return signedTransaction;
  }

  return sendTx(agent, instructionsOrTransaction, otherKeypairs, feeTier);
}
