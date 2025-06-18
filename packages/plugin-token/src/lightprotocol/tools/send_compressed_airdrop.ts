import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import {
  buildTx,
  calculateComputeUnitPrice,
} from "@lightprotocol/stateless.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";
import { SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

// arbitrary
const MAX_AIRDROP_RECIPIENTS = 1000;
// const MAX_CONCURRENT_TXS = 30;

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
 */
export async function sendCompressedAirdrop(
  agent: SolanaAgentKit,
  mintAddress: PublicKey,
  amount: number,
  decimals: number,
  recipients: PublicKey[],
  priorityFeeInLamports: number,
): Promise<Awaited<ReturnType<typeof signOrSendTX>>> {
  const setupTransaction = new Transaction();

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
    await getAssociatedTokenAddress(mintAddress, agent.wallet.publicKey);
  } catch (_error) {
    const associatedToken = getAssociatedTokenAddressSync(
      mintAddress,
      agent.wallet.publicKey,
    );
    setupTransaction.add(
      createAssociatedTokenAccountInstruction(
        agent.wallet.publicKey,
        associatedToken,
        agent.wallet.publicKey,
        mintAddress,
      ),
    );
  }

  try {
    const createTokenPoolInstruction =
      await CompressedTokenProgram.createTokenPool({
        mint: mintAddress,
        feePayer: agent.wallet.publicKey,
      });
    setupTransaction.add(createTokenPoolInstruction);
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
    setupTransaction,
  );
}

async function processAll(
  agent: SolanaAgentKit,
  amount: number,
  mint: PublicKey,
  recipients: PublicKey[],
  priorityFeeInLamports: number,
  setupTransaction: Transaction,
) {
  const mintAddress = mint;
  const transaction = Transaction.from(setupTransaction.serialize());

  // modify compute units and price
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: calculateComputeUnitPrice(priorityFeeInLamports, 500_000),
    }),
  );

  const sourceTokenAccount = getAssociatedTokenAddressSync(
    mint,
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

  const compressInstructionSet = await Promise.all(
    batches.map(async (recipientBatch) => {
      const compressIxPromises = [];
      for (
        let i = 0;
        i < recipientBatch.length;
        i += maxRecipientsPerInstruction
      ) {
        const batch = recipientBatch.slice(i, i + maxRecipientsPerInstruction);
        compressIxPromises.push(
          CompressedTokenProgram.compress({
            payer: agent.wallet.publicKey,
            owner: agent.wallet.publicKey,
            source: sourceTokenAccount,
            toAddress: batch,
            amount: batch.map(() => amount),
            mint: mintAddress,
          }),
        );
      }

      const compressIxs = await Promise.all(compressIxPromises);
      return compressIxs;
    }),
  );

  transaction.add(...compressInstructionSet.flat());

  const { blockhash } = await agent.connection.getLatestBlockhash();
  const tx = buildTx(
    transaction.instructions,
    agent.wallet.publicKey,
    blockhash,
    [lookupTableAccount],
  );

  return await signOrSendTX(agent, tx);
}
