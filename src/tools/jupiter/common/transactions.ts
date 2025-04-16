import {
  Connection,
  Keypair,
  SendOptions,
  VersionedTransaction,
} from "@solana/web3.js";

interface SendTransactionOptions {
  maxRetries?: number;
  skipPreflight?: boolean;
}

const DEFAULT_SEND_OPTIONS = {
  maxRetries: 2,
  skipPreflight: true,
};

export async function signAndSendTransaction(
  connection: Connection,
  transaction: VersionedTransaction,
  signer: Keypair,
  options: SendTransactionOptions = DEFAULT_SEND_OPTIONS,
): Promise<string> {
  transaction.sign([signer]);
  const transactionBinary = transaction.serialize();

  return await connection.sendRawTransaction(transactionBinary, {
    maxRetries: options.maxRetries,
    skipPreflight: options.skipPreflight,
  } as SendOptions);
}

export async function signAndSendTransactions(
  connection: Connection,
  transactions: VersionedTransaction[],
  signer: Keypair,
  options: SendTransactionOptions = DEFAULT_SEND_OPTIONS,
): Promise<string[]> {
  const signatures: string[] = [];

  for (const transaction of transactions) {
    const signature = await signAndSendTransaction(
      connection,
      transaction,
      signer,
      options,
    );
    signatures.push(signature);
  }

  return signatures;
}

export function deserializeTransaction(txBase64: string): VersionedTransaction {
  return VersionedTransaction.deserialize(Buffer.from(txBase64, "base64"));
}
