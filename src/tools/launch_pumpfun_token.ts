// src/tools/launch_pumpfun_token.ts
import { VersionedTransaction, Keypair } from "@solana/web3.js";
import { PumpFunTokenOptions, SolanaAgentKit } from "../index";
import fetch from "node-fetch";
import FormData from 'form-data';

async function uploadMetadata(
  tokenName: string, 
  tokenTicker: string,
  options: PumpFunTokenOptions
): Promise<any> {

  // Create form data for IPFS
  const formData: FormData = new FormData();
  
  // required fields
  formData.append("name", tokenName);
  formData.append("symbol", tokenTicker);
  formData.append("description", options.description || `${tokenName} token created via PumpPortal.fun`);
  formData.append("showName", "true");

  // optional fields
  if (options.twitter) formData.append("twitter", options.twitter);
  if (options.telegram) formData.append("telegram", options.telegram);
  if (options.website) formData.append("website", options.website);

  // If imageUrl is provided, fetch and append the image
  if (options.imageUrl) {
    const imageResponse = await fetch(options.imageUrl);
    const imageBuffer = await imageResponse.buffer();
    formData.append("file", imageBuffer, {
      filename: "token_image.png",
      contentType: "image/png"
    });
  }

  // TBD : Remove after approval
  console.log("Uploading metadata with fields:", {
    name: tokenName,
    symbol: tokenTicker,
    description: options.description,
    hasImage: !!options.imageUrl
  });

  const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
    method: "POST",
    body: formData as any,
    headers: formData.getHeaders()
  });

  if (!metadataResponse.ok) {
    const errorText = await metadataResponse.text();
    throw new Error(`Metadata upload failed: ${errorText || metadataResponse.statusText}`);
  }

  return await metadataResponse.json();
}

async function createTokenTransaction(
  kit: SolanaAgentKit,
  mintKeypair: Keypair,
  metadataResponse: any,
  options: PumpFunTokenOptions
) {
  const response = await fetch("https://pumpportal.fun/api/trade-local", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      publicKey: kit.wallet_address.toBase58(),
      action: "create",
      tokenMetadata: {
        name: metadataResponse.metadata.name,
        symbol: metadataResponse.metadata.symbol,
        uri: metadataResponse.metadataUri,
      },
      mint: mintKeypair.publicKey.toBase58(),
      denominatedInSol: "true",
      amount: options.initialLiquiditySOL || 0.0001,
      slippage: 5,
      priorityFee: 0.00005,
      pool: "pump",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Transaction creation failed: ${response.status} - ${errorText}`);
  }

  return response;
}

async function signAndSendTransaction(
  kit: SolanaAgentKit,
  tx: VersionedTransaction,
  mintKeypair: Keypair
) {
  try {
    // Get the latest blockhash
    const { blockhash, lastValidBlockHeight } = await kit.connection.getLatestBlockhash();
    
    // Update transaction with latest blockhash
    tx.message.recentBlockhash = blockhash;

    // Sign the transaction
    tx.sign([mintKeypair, kit.wallet]);

    // Send and confirm transaction with options
    const signature = await kit.connection.sendTransaction(tx, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 5
    });

    // Wait for confirmation
    const confirmation = await kit.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    return signature;
  } catch (error) {
    console.error('Transaction send error:', error);
    if (error instanceof Error && 'logs' in error) {
      console.error('Transaction logs:', error.logs);
    }
    throw error;
  }
}

export async function launchpumpfuntoken(
  kit: SolanaAgentKit,
  tokenName: string,
  tokenTicker: string,
  options: PumpFunTokenOptions = {}
) {
  try {
    // TBD : Remove clgs after approval
    console.log("Starting token launch process...");

    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    console.log("Mint public key:", mintKeypair.publicKey.toBase58());

    // Upload metadata
    console.log("Uploading metadata to IPFS...");
    const metadataResponse = await uploadMetadata(tokenName, tokenTicker, options);
    console.log("Metadata response:", metadataResponse);

    // Create token transaction
    console.log("Creating token transaction...");
    const response = await createTokenTransaction(kit, mintKeypair, metadataResponse, options);

    const transactionData = await response.arrayBuffer();
    const tx = VersionedTransaction.deserialize(new Uint8Array(transactionData));

    // Send transaction with proper blockhash handling
    console.log("Sending transaction...");
    const signature = await signAndSendTransaction(kit, tx, mintKeypair);

    console.log("Token launch successful!");
    return {
      signature,
      mint: mintKeypair.publicKey.toBase58(),
      metadataUri: metadataResponse.metadataUri,
    };

  } catch (error) {
    console.error("Error in launchpumpfuntoken:", error);
    if (error instanceof Error && 'logs' in error) {
      console.error('Transaction logs:', (error as any).logs);
    }
    throw error;
  }
}