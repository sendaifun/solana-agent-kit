import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";
import { TOKENS, DEFAULT_OPTIONS } from "../../constants";
import { getMint } from "@solana/spl-token";

/**
 * Swap tokens using FluxBeam DEX
 * @param solanaAgent SolanaAgentKit instance
 * @param targetTokenMint Mint address of the target (output) token
 * @param inputTokenAmount Amount of the source (input) token to swap (in token decimals)
 * @param inputTokenMint Mint address of the source (input) token (defaults to USDC)
 * @param slippageTolerance Slippage tolerance in basis points (default: 300 = 3%)
 * @returns Transaction signature
 */
export async function swapFluxBeam(
  solanaAgent: SolanaAgentKit,
  targetTokenMint: PublicKey,
  inputTokenAmount: number,
  inputTokenMint: PublicKey = TOKENS.USDC,
  slippageTolerance: number = DEFAULT_OPTIONS.SLIPPAGE_BPS,
): Promise<string> {
  try {
    const FLUXBEAM_API_URL = `https://api.fluxbeam.xyz/v1`;

    // Determine if the input token is native SOL
    const isNativeSOL = inputTokenMint.equals(TOKENS.SOL);

    // Get the decimals for the input token (use 9 for native SOL)
    const inputTokenDecimals = isNativeSOL
      ? 9
      : (await getMint(solanaAgent.connection, inputTokenMint)).decimals;

    // Scale the input amount based on its decimals
    const scaledInputTokenAmount =
      inputTokenAmount * Math.pow(10, inputTokenDecimals);

    // Fetch a quote for the swap
    const quoteResponse = await fetch(
      `${FLUXBEAM_API_URL}/quote?` +
        `inputMint=${isNativeSOL ? TOKENS.SOL.toString() : inputTokenMint.toString()}` +
        `&outputMint=${targetTokenMint.toString()}` +
        `&amount=${scaledInputTokenAmount}` +
        `&slippageBps=${slippageTolerance}`,
    );

    if (!quoteResponse.ok) {
      throw new Error(`Failed to fetch quote. Status: ${quoteResponse.status}`);
    }

    const quoteData = await quoteResponse.json();
    console.log("Quote Response:", quoteData);

    // Create a transaction for the swap
    const swapResponse = await fetch(`${FLUXBEAM_API_URL}/swap/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse: quoteData,
        userPublicKey: solanaAgent.wallet_address.toString(),
        wrapAndUnwrapSol: true,
      }),
    });

    if (!swapResponse.ok) {
      throw new Error(
        `Failed to create swap transaction. Status: ${swapResponse.status}`,
      );
    }

    const swapData = await swapResponse.json();
    console.log("Swap Response:", swapData);

    // Deserialize the transaction
    const transactionBuffer = Buffer.from(swapData.transaction, "base64");
    const transaction = VersionedTransaction.deserialize(transactionBuffer);

    // Sign the transaction with the wallet
    transaction.sign([solanaAgent.wallet]);

    // Send the signed transaction
    const transactionSignature =
      await solanaAgent.connection.sendRawTransaction(transaction.serialize(), {
        maxRetries: 3,
        skipPreflight: true,
      });

    return transactionSignature;
  } catch (error: any) {
    throw new Error(`Token swap failed: ${error.message}`);
  }
}
