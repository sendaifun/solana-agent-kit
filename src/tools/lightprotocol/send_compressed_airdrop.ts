import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";
import {
  buildAndSignTx,
  calculateComputeUnitPrice,
  createRpc,
  Rpc,
  sendAndConfirmTx,
  sleep,
} from "@lightprotocol/stateless.js";
import {
  CompressedTokenProgram,
  createTokenPool,
} from "@lightprotocol/compressed-token";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

// arbitrary
const MAX_AIRDROP_RECIPIENTS = 1000;
const MAX_CONCURRENT_TXS = 30;

/**
 * Estimate the cost of an airdrop in lamports.
 * @param numberOfRecipients      Number of recipients
 * @param priorityFeeInLamports   Priority fee in lamports
 * @returns                       Estimated cost in lamports
 */
export const getAirdropCostEstimate = (
  numberOfRecipients: number,
  priorityFeeInLamports: number,
) => {
  const baseFee = 5000;
  const perRecipientCompressedStateFee = 300;

  const txsNeeded = Math.ceil(numberOfRecipients / 15);
  const totalPriorityFees = txsNeeded * (baseFee + priorityFeeInLamports);

  return (
    perRecipientCompressedStateFee * numberOfRecipients + totalPriorityFees
  );
};

/**
 * Send airdrop with ZK Compressed Tokens.
 * @param agent             Agent
 * @param mintAddress       SPL Mint address
 * @param amount            Amount to send per recipient
 * @param decimals          Decimals of the token
 * @param recipients        Recipient wallet addresses (no ATAs)
 * @param priorityFeeInLamports   Priority fee in lamports
 * @param shouldLog         Whether to log progress to stdout. Defaults to false.
 */
export async function sendCompressedAirdrop(
  agent: SolanaAgentKit,
  mintAddress: PublicKey,
  amount: number,
  decimals: number,
  recipients: PublicKey[],
  priorityFeeInLamports: number,
  shouldLog: boolean = false,
): Promise<string[]> {
  if (recipients.length > MAX_AIRDROP_RECIPIENTS) {
    throw new Error(
      `Max airdrop can be ${MAX_AIRDROP_RECIPIENTS} recipients at a time. For more scale, use open source ZK Compression airdrop tools such as https://github.com/helius-labs/airship.`,
    );
  }

  const url = agent.connection.rpcEndpoint;
  if (url.includes("devnet")) {
    throw new Error("Devnet is not supported for airdrop. Please use mainnet.");
  }
  if (!url.includes("helius")) {
    console.warn(
      "Warning: Must use RPC with ZK Compression support. Double check with your RPC provider if in doubt.",
    );
  }

  try {
    await getOrCreateAssociatedTokenAccount(
      agent.connection,
      agent.wallet,
      mintAddress,
      agent.wallet.publicKey,
    );
  } catch (error) {
    console.error(error);
    throw new Error(
      "Source token account not found and failed to create it. Please add funds to your wallet and try again.",
    );
  }

  try {
    await createTokenPool(
      agent.connection as unknown as Rpc,
      agent.wallet,
      mintAddress,
    );
  } catch (error: any) {
    if (error.message.includes("already in use")) {
      // skip
    } else {
      throw error;
    }
  }

  return await processAll(
    agent,
    amount * 10 ** decimals,
    mintAddress,
    recipients,
    priorityFeeInLamports,
    shouldLog,
  );
}

async function processAll(
  agent: SolanaAgentKit,
  amount: number,
  mint: PublicKey,
  recipients: PublicKey[],
  priorityFeeInLamports: number,
  shouldLog: boolean,
): Promise<string[]> {
  const mintAddress = mint;
  const payer = agent.wallet;

  const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
    agent.connection,
    agent.wallet,
    mintAddress,
    agent.wallet.publicKey,
  );

  const maxRecipientsPerInstruction = 5;
  const maxIxs = 3; // empirically determined (as of 12/15/2024)
  const lookupTableAddress = new PublicKey(
    "9NYFyEqPkyXUhkerbGHXUXkvb4qpzeEdHuGpgbgpH1NJ",
  );

  const lookupTableAccount = (
    await agent.connection.getAddressLookupTable(lookupTableAddress)
  ).value!;

  const batches: PublicKey[][] = [];
  for (
    let i = 0;
    i < recipients.length;
    i += maxRecipientsPerInstruction * maxIxs
  ) {
    batches.push(recipients.slice(i, i + maxRecipientsPerInstruction * maxIxs));
  }

  const instructionSets = await Promise.all(
    batches.map(async (recipientBatch) => {
      const instructions: TransactionInstruction[] = [
        ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }),
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: calculateComputeUnitPrice(
            priorityFeeInLamports,
            500_000,
          ),
        }),
      ];

      const compressIxPromises = [];
      for (
        let i = 0;
        i < recipientBatch.length;
        i += maxRecipientsPerInstruction
      ) {
        const batch = recipientBatch.slice(i, i + maxRecipientsPerInstruction);
        compressIxPromises.push(
          CompressedTokenProgram.compress({
            payer: payer.publicKey,
            owner: payer.publicKey,
            source: sourceTokenAccount.address,
            toAddress: batch,
            amount: batch.map(() => amount),
            mint: mintAddress,
          }),
        );
      }

      const compressIxs = await Promise.all(compressIxPromises);
      return [...instructions, ...compressIxs];
    }),
  );

  const url = agent.connection.rpcEndpoint;
  const rpc = createRpc(url, url, url);

  const results = [];
  let confirmedCount = 0;
  const totalBatches = instructionSets.length;

  const renderProgressBar = (current: number, total: number) => {
    const percentage = Math.floor((current / total) * 100);
    const filled = Math.floor((percentage / 100) * 20);
    const empty = 20 - filled;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    return `Airdropped to ${Math.min(current * 15, recipients.length)}/${
      recipients.length
    } recipients [${bar}] ${percentage}%`;
  };

  const log = (message: string) => {
    if (shouldLog && typeof process !== "undefined" && process.stdout) {
      process.stdout.write(message);
    }
  };

  for (let i = 0; i < instructionSets.length; i += MAX_CONCURRENT_TXS) {
    const batchPromises = instructionSets
      .slice(i, i + MAX_CONCURRENT_TXS)
      .map((instructions, idx) =>
        sendTransactionWithRetry(
          rpc,
          instructions,
          payer,
          lookupTableAccount,
          i + idx,
        ).then((signature) => {
          confirmedCount++;
          log("\r" + renderProgressBar(confirmedCount, totalBatches));
          return signature;
        }),
      );

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
  }

  log("\n");

  const failures = results
    .filter((r) => r.status === "rejected")
    .map((r, idx) => ({
      index: idx,
      error: (r as PromiseRejectedResult).reason,
    }));

  if (failures.length > 0) {
    throw new Error(
      `Failed to process ${failures.length} batches: ${failures
        .map((f) => f.error)
        .join(", ")}`,
    );
  }

  return results.map((r) => (r as PromiseFulfilledResult<string>).value);
}

async function sendTransactionWithRetry(
  connection: Rpc,
  instructions: TransactionInstruction[],
  payer: Keypair,
  lookupTableAccount: AddressLookupTableAccount,
  batchIndex: number,
): Promise<string> {
  const MAX_RETRIES = 3;
  const INITIAL_BACKOFF = 500; // ms

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const { blockhash } = await connection.getLatestBlockhash();
      const tx = buildAndSignTx(
        instructions,
        payer,
        blockhash,
        [],
        [lookupTableAccount],
      );

      const signature = await sendAndConfirmTx(connection, tx);

      return signature;
    } catch (error: any) {
      const isRetryable =
        error.message?.includes("blockhash not found") ||
        error.message?.includes("timeout") ||
        error.message?.includes("rate limit") ||
        error.message?.includes("too many requests");

      if (!isRetryable || attempt === MAX_RETRIES - 1) {
        throw new Error(
          `Batch ${batchIndex} failed after ${attempt + 1} attempts: ${
            error.message
          }`,
        );
      }

      const backoff =
        INITIAL_BACKOFF * Math.pow(2, attempt) * (0.5 + Math.random());
      await sleep(backoff);
    }
  }

  throw new Error("Unreachable");
}
