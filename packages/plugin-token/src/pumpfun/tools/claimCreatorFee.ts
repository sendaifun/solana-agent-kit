import { VersionedTransaction, TransactionMessage, PublicKey, Transaction } from "@solana/web3.js";
import { SolanaAgentKit } from "solana-agent-kit";
import { PumpSdk } from "@pump-fun/pump-sdk";
import { signOrSendTX } from "solana-agent-kit";

/**
 * Claim creator fee on Pump.fun
 * @param agent - SolanaAgentKit instance
 * @returns - Signature of the transaction, mint address and metadata URI, if successful, else error
 */
export default async function claimCreatorFee(agent: SolanaAgentKit): Promise<{ signedTransaction: string } | { txHash: string | VersionedTransaction | Transaction | string[] | Transaction[] | VersionedTransaction[] }> {
  try {
    const pumpSdk = new PumpSdk(agent.connection);

    let REFERRAL_WALLET = new PublicKey(
      "FPfGD3kA8ZXWWMTZHLcFDMhVzyWhqstbgTpg1KoR7Vk4",
    );
    if (agent.config.PUMP_FUN_REFERRAL_WALLET) {
      REFERRAL_WALLET = new PublicKey(agent.config.PUMP_FUN_REFERRAL_WALLET);
    }
    const ix = await pumpSdk.collectCoinCreatorFeeInstructions(REFERRAL_WALLET);

    const { blockhash } = await agent.connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
      payerKey: REFERRAL_WALLET,
      recentBlockhash: blockhash,
      instructions: [...ix],
    }).compileToV0Message();

    const tx = new VersionedTransaction(messageV0);

    if (agent.config.signOnly) {
      const agentSignedTx = await agent.wallet.signTransaction(tx);
      return {
        signedTransaction: Buffer.from(agentSignedTx.serialize()).toString("base64"),
      };
    } else {
      const txHash = await signOrSendTX(agent, tx);
      return {
        txHash: txHash,
      };
    }
  } catch (error) {
    console.error("Error in claimCreatorFee:", error);
    if (error instanceof Error && "logs" in error) {
      console.error("Transaction logs:", (error as any).logs);
    }
    throw error;
  }
}