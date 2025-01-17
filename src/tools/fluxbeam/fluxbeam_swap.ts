import { Tool } from "langchain/tools";
import { Connection, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import axios, { AxiosError } from "axios";

const FLUXBEAM_API_URL = "https://api.fluxbeam.xyz/v1";

export class FluxBeamSwapTool extends Tool {
  name = "fluxbeam_swap";
  description = "Execute token swaps using FluxBeam's liquidity pools";
  connection: Connection;
  wallet: Keypair;

  constructor(connection: Connection, wallet: Keypair) {
    super();
    this.connection = connection;
    this.wallet = wallet;
  }

  async _call(input: string): Promise<string> {
    try {
      const {
        inputMint,
        outputMint,
        amount,
        execute = false,
      } = JSON.parse(input);

      // Get quote from FluxBeam API
      console.log("Getting quote from FluxBeam...");
      const quoteResponse = await axios.get(`${FLUXBEAM_API_URL}/quote`, {
        params: {
          inputMint,
          outputMint,
          amount,
          slippageBps: 50, // 0.5% default slippage
        },
      });

      console.log("Quote received:", quoteResponse.data);

      // Get swap transaction
      const swapRequestData = {
        quote: quoteResponse.data.quote,
        userPublicKey: this.wallet.publicKey.toBase58(),
      };

      console.log("Getting swap transaction...");
      const swapResponse = await axios.post(
        `${FLUXBEAM_API_URL}/swap/transaction`,
        swapRequestData,
      );

      // If execute is true, sign and send the transaction
      if (execute) {
        console.log("Executing swap transaction...");

        // Create token account for output token if it doesn't exist
        const outputMintPubkey = new PublicKey(outputMint);
        const tokenAccount = await getAssociatedTokenAddress(
          outputMintPubkey,
          this.wallet.publicKey,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        );

        // Check if token account exists
        const tokenAccountInfo =
          await this.connection.getAccountInfo(tokenAccount);

        // If token account doesn't exist, create it
        if (!tokenAccountInfo) {
          console.log("Creating token account for output token...");
          const createAtaIx = createAssociatedTokenAccountInstruction(
            this.wallet.publicKey, // payer
            tokenAccount, // ata
            this.wallet.publicKey, // owner
            outputMintPubkey, // mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
          );

          // Decode the swap transaction
          const decodedTransaction = Buffer.from(
            swapResponse.data.transaction,
            "base64",
          );
          const transaction = Transaction.from(decodedTransaction);

          // Add create ATA instruction at the beginning
          transaction.instructions = [createAtaIx, ...transaction.instructions];

          // Get a recent blockhash
          const { blockhash } = await this.connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = this.wallet.publicKey;

          // Sign the transaction
          transaction.sign(this.wallet);

          // Send the signed transaction
          const signature = await this.connection.sendRawTransaction(
            transaction.serialize(),
            { skipPreflight: false, maxRetries: 3 },
          );

          // Wait for confirmation
          const confirmation = await this.connection.confirmTransaction(
            signature,
            {
              maxRetries: 3,
            },
          );

          return JSON.stringify({
            success: true,
            signature,
            quote: quoteResponse.data.quote,
            confirmation,
          });
        } else {
          // Token account exists, proceed with original transaction
          const decodedTransaction = Buffer.from(
            swapResponse.data.transaction,
            "base64",
          );
          const transaction = Transaction.from(decodedTransaction);

          // Get a recent blockhash
          const { blockhash } = await this.connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = this.wallet.publicKey;

          // Sign the transaction
          transaction.sign(this.wallet);

          // Send the signed transaction
          const signature = await this.connection.sendRawTransaction(
            transaction.serialize(),
            { skipPreflight: false, maxRetries: 3 },
          );

          // Wait for confirmation
          const confirmation = await this.connection.confirmTransaction(
            signature,
            {
              maxRetries: 3,
            },
          );

          return JSON.stringify({
            success: true,
            signature,
            quote: quoteResponse.data.quote,
            confirmation,
          });
        }
      }

      return JSON.stringify({
        success: true,
        transaction: swapResponse.data.transaction,
        quote: quoteResponse.data.quote,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        return JSON.stringify({
          success: false,
          error: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      } else if (error instanceof Error) {
        return JSON.stringify({
          success: false,
          error: error.message,
        });
      } else {
        return JSON.stringify({
          success: false,
          error: "An unknown error occurred",
        });
      }
    }
  }
}
