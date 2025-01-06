// src/tools/launch_pumpfun_token.ts
import { VersionedTransaction, Keypair } from "@solana/web3.js";
import {
  PumpfunLaunchResponse,
  PumpFunTokenOptions,
  SolanaAgentKit,
} from "../index";

async function uploadMetadata(
  tokenName: string,
  tokenTicker: string,
  description: string,
  imageUrl: string,
  options?: PumpFunTokenOptions,
): Promise<any> {
  // Create metadata object
  const formData = new URLSearchParams();
  formData.append("name", tokenName);
  formData.append("symbol", tokenTicker);
  formData.append("description", description);

  formData.append("showName", "true");

  if (options?.twitter) {
    formData.append("twitter", options.twitter);
  }
  if (options?.telegram) {
    formData.append("telegram", options.telegram);
  }
  if (options?.website) {
    formData.append("website", options.website);
  }

  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();
  const files = {
    file: new File([imageBlob], "token_image.png", { type: "image/png" }),
  };

  // Create form data with both metadata and file
  const finalFormData = new FormData();
  // Add all metadata fields
  for (const [key, value] of formData.entries()) {
    finalFormData.append(key, value);
  }
  // Add file if exists
  if (files?.file) {
    finalFormData.append("file", files.file);
  }

  const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
    method: "POST",
    body: finalFormData,
  });

  if (!metadataResponse.ok) {
    throw new Error(`Metadata upload failed: ${metadataResponse.statusText}`);
  }

  return await metadataResponse.json();
}

async function createTokenTransaction(
  agent: SolanaAgentKit,
  mintKeypair: Keypair,
  metadataResponse: any,
  options?: PumpFunTokenOptions,
) {
  const payload = {
    publicKey: agent.wallet_address.toBase58(),
    action: "create",
    tokenMetadata: {
      name: metadataResponse.metadata.name,
      symbol: metadataResponse.metadata.symbol,
      uri: metadataResponse.metadataUri,
    },
    mint: mintKeypair.publicKey.toBase58(),
    denominatedInSol: "true", // API expects string "true"
    amount: options?.initialLiquiditySOL || 0.0001,
    slippage: options?.slippageBps || 5,
    priorityFee: options?.priorityFee || 0.00005,
    pool: "pump",
  };

  const response = await fetch("https://pumpportal.fun/api/trade-local", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Transaction creation failed: ${response.status} - ${errorText}`,
    );
  }

  return response;
}

async function signAndSendTransaction(
  kit: SolanaAgentKit,
  tx: VersionedTransaction,
  mintKeypair: Keypair,
) {
  try {
    // Get the latest blockhash
    const { blockhash, lastValidBlockHeight } =
      await kit.connection.getLatestBlockhash();

    // Update transaction with latest blockhash
    tx.message.recentBlockhash = blockhash;

    // Sign the transaction
    tx.sign([mintKeypair, kit.wallet]);

    // Send and confirm transaction with options
    const signature = await kit.connection.sendTransaction(tx, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
      maxRetries: 5,
    });

    // Wait for confirmation
    const confirmation = await kit.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    return signature;
  } catch (error) {
    console.error("Transaction send error:", error);
    if (error instanceof Error && "logs" in error) {
      console.error("Transaction logs:", error.logs);
    }
    throw error;
  }
}

/**
 * Launch a token on Pump.fun
 * @param agent - SolanaAgentKit instance
 * @param tokenName - Name of the token
 * @param tokenTicker - Ticker of the token
 * @param description - Description of the token
 * @param imageUrl - URL of the token image
 * @param options - Optional token options (twitter, telegram, website, initialLiquiditySOL, slippageBps, priorityFee)
 * @returns - Signature of the transaction, mint address and metadata URI, if successful, else error
 */
export async function launchPumpFunToken(
  agent: SolanaAgentKit,
  tokenName: string,
  tokenTicker: string,
  description: string,
  imageUrl: string,
  options?: PumpFunTokenOptions,
): Promise<PumpfunLaunchResponse> {
  try {
    const mintKeypair = Keypair.generate();
    const metadataResponse = await uploadMetadata(
      tokenName,
      tokenTicker,
      description,
      imageUrl,
      options,
    );
    const response = await createTokenTransaction(
      agent,
      mintKeypair,
      metadataResponse,
      options,
    );
    const transactionData = await response.arrayBuffer();
    const tx = VersionedTransaction.deserialize(
      new Uint8Array(transactionData),
    );
    const signature = await signAndSendTransaction(agent, tx, mintKeypair);

    return {
      signature,
      mint: mintKeypair.publicKey.toBase58(),
      metadataUri: metadataResponse.metadataUri,
    };
  } catch (error) {
    console.error("Error in launchpumpfuntoken:", error);
    if (error instanceof Error && "logs" in error) {
      console.error("Transaction logs:", (error as any).logs);
    }
    throw error;
  }
}
