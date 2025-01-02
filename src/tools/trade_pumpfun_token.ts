// src/tools/trade_pumpfun_token.ts
import { VersionedTransaction, Keypair } from "@solana/web3.js";
import {
  PumpfunTradeAction,
  PumpfunTradeResponse,
  PumpFunTokenTradeOptions,
  SolanaAgentKit,
} from "../index";

async function tradeTokenTransaction(
    agent: SolanaAgentKit,
    action: PumpfunTradeAction,
    tokenTicker: string,
    solAmount: number,
    options?: PumpFunTokenTradeOptions,
  ) {
    const payload = {
      publicKey: agent.wallet_address.toBase58(),
      action: action,
      mint: tokenTicker,
      denominatedInSol: "true",
      amount: solAmount,
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
  ) {
    try {
      // Get the latest blockhash
      const { blockhash, lastValidBlockHeight } =
        await kit.connection.getLatestBlockhash();
  
      // Update transaction with latest blockhash
      tx.message.recentBlockhash = blockhash;
  
      // Sign the transaction
      tx.sign([kit.wallet]);
  
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
 * Trade a token on Pump.fun
 * @param agent - SolanaAgentKit instance
 * @param action - Action of trading, buy or sell
 * @param tokenTicker - Ticker of the token
 * @param solAmount - Amount of the sol to trade
 * @param options - Optional token options (action, tradingSOL, slippageBps, priorityFee)
 * @returns - Signature of the transaction, mint address and metadata URI, if successful, else error
 */
export async function tradePumpFunToken(
    agent: SolanaAgentKit,
    action: PumpfunTradeAction,
    tokenTicker: string,
    solAmount: number,
    options?: PumpFunTokenTradeOptions,
  ): Promise<PumpfunTradeResponse> {
    try {
      const response = await tradeTokenTransaction(
        agent,
        action,
        tokenTicker,
        solAmount,
        options,
      );
      const transactionData = await response.arrayBuffer();
      const tx = VersionedTransaction.deserialize(
        new Uint8Array(transactionData),
      );
      const signature = await signAndSendTransaction(agent, tx);
  
      return {
        signature,
      };
    } catch (error) {
      console.error("Error in tradePumpFunToken:", error);
      if (error instanceof Error && "logs" in error) {
        console.error("Transaction logs:", (error as any).logs);
      }
      throw error;
    }
  }
  