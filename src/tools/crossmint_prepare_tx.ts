import { SolanaAgentKit } from "../index";
import {
  TransactionMessage,
  PublicKey,
  VersionedTransaction,
  Connection,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";

interface CrossmintTransactionResponse {
  status: "success" | "error";
  serializedTransaction?: string;
  message?: string;
  code?: string;
}

/**
 * Prepare a USDC transfer transaction for Crossmint
 * @param agent SolanaAgentKit instance
 * @param senderAddress Sender's wallet address
 * @param recipientAddress Recipient's wallet address
 * @param amount Amount of USDC to transfer
 * @param usdcMint USDC token mint address (optional, defaults to devnet USDC)
 * @returns Object containing serialized transaction or error details
 */
export async function prepareCrossmintUSDCTransfer(
  agent: SolanaAgentKit,
  senderAddress: string,
  recipientAddress: string,
  amount: number,
  usdcMint: string = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Devnet USDC
): Promise<CrossmintTransactionResponse> {
  try {
    // Input validation
    if (!senderAddress || !recipientAddress) {
      throw new Error("Sender and recipient addresses are required");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Convert addresses to PublicKeys
    const senderPublicKey = new PublicKey(senderAddress);
    const recipientPublicKey = new PublicKey(recipientAddress);
    const usdcMintPublicKey = new PublicKey(usdcMint);

    // Get associated token accounts
    const senderTokenAccount = await getAssociatedTokenAddress(
      usdcMintPublicKey,
      senderPublicKey,
    );
    const recipientTokenAccount = await getAssociatedTokenAddress(
      usdcMintPublicKey,
      recipientPublicKey,
    );

    // Convert amount to base units (USDC has 6 decimals)
    const amountInBaseUnits = amount * 1_000_000;

    // Create instructions array
    const instructions = [];

    // Check if recipient token account exists
    const recipientAccountInfo = await agent.connection.getAccountInfo(
      recipientTokenAccount,
    );

    // If recipient token account doesn't exist, add creation instruction
    if (!recipientAccountInfo) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          senderPublicKey,
          recipientTokenAccount,
          recipientPublicKey,
          usdcMintPublicKey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
      );
    }

    // Add transfer instruction
    instructions.push(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        senderPublicKey,
        amountInBaseUnits,
        [],
        TOKEN_PROGRAM_ID,
      ),
    );

    // Create transaction message
    const message = new TransactionMessage({
      instructions,
      recentBlockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      payerKey: senderPublicKey,
    }).compileToV0Message();

    // Create versioned transaction
    const transaction = new VersionedTransaction(message);

    // Serialize and encode transaction
    const serializedTransaction = bs58.encode(transaction.serialize());

    return {
      status: "success",
      serializedTransaction,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message,
      code: error.code || "TRANSACTION_PREPARATION_ERROR",
    };
  }
}

/**
 * Prepare a SOL transfer transaction for Crossmint
 * @param agent SolanaAgentKit instance
 * @param senderAddress Sender's wallet address
 * @param recipientAddress Recipient's wallet address
 * @param amount Amount of SOL to transfer
 * @returns Object containing serialized transaction or error details
 */
export async function prepareCrossmintSOLTransfer(
  agent: SolanaAgentKit,
  senderAddress: string,
  recipientAddress: string,
  amount: number,
): Promise<CrossmintTransactionResponse> {
  try {
    // Input validation
    if (!senderAddress || !recipientAddress) {
      throw new Error("Sender and recipient addresses are required");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Convert addresses to PublicKeys
    const senderPublicKey = new PublicKey(senderAddress);
    const recipientPublicKey = new PublicKey(recipientAddress);

    // Create transfer instruction
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: recipientPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    });

    // Create transaction message
    const message = new TransactionMessage({
      instructions: [transferInstruction],
      recentBlockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      payerKey: senderPublicKey,
    }).compileToV0Message();

    // Create versioned transaction
    const transaction = new VersionedTransaction(message);

    // Serialize and encode transaction
    const serializedTransaction = bs58.encode(transaction.serialize());

    return {
      status: "success",
      serializedTransaction,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message,
      code: error.code || "TRANSACTION_PREPARATION_ERROR",
    };
  }
}

/**
 * Validate and decode a serialized transaction
 * @param agent SolanaAgentKit instance
 * @param serializedTransaction Base58 encoded serialized transaction
 * @returns Object containing decoded transaction details or error information
 */
export function validateTransaction(
  agent: SolanaAgentKit,
  serializedTransaction: string,
): {
  status: "success" | "error";
  decodedTransaction?: any;
  message?: string;
} {
  try {
    const decodedData = bs58.decode(serializedTransaction);
    const transaction = VersionedTransaction.deserialize(decodedData);

    return {
      status: "success",
      decodedTransaction: {
        instructions: transaction.message.compiledInstructions,
        signers: transaction.signatures,
      },
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message,
    };
  }
}
