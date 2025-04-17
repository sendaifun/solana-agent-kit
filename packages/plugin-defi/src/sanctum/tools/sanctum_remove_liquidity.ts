import {
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import axios from "redaxios";
import { SolanaAgentKit, signOrSendTX } from "solana-agent-kit";
import { SANCTUM_TRADE_API_URI } from "../constants";

/**
 * Remove Liquidity to a Sanctum infinite-LST pool
 * @param agent SolanaAgentKit instance
 * @param lstMint mint address of the LST
 * @param amount amount of LST to remove
 * @param quotedAmount amount of the INF token to burn
 * @param priorityFee priority fee for the transaction
 * @return transaction signature
 */

export async function sanctumRemoveLiquidity(
  agent: SolanaAgentKit,
  lstMint: string,
  amount: string,
  quotedAmount: string,
  priorityFee: number,
) {
  try {
    const client = axios.create({
      baseURL: SANCTUM_TRADE_API_URI,
    });

    const response = await client.post("/v1/liquidity/remove", {
      amount,
      dstLstAcc: null,
      lstMint,
      priorityFee: {
        Auto: {
          max_unit_price_micro_lamports: priorityFee,
          unit_limit: 300000,
        },
      },
      quotedAmount,
      signer: agent.wallet.publicKey.toBase58(),
      srcLstAcc: null,
    });

    const txBuffer = Buffer.from(response.data.tx, "base64");
    const { blockhash } = await agent.connection.getLatestBlockhash();

    const tx = VersionedTransaction.deserialize(txBuffer);

    const messages = tx.message;

    const instructions = messages.compiledInstructions.map((ix) => {
      return new TransactionInstruction({
        programId: messages.staticAccountKeys[ix.programIdIndex],
        keys: ix.accountKeyIndexes.map((i) => ({
          pubkey: messages.staticAccountKeys[i],
          isSigner: messages.isAccountSigner(i),
          isWritable: messages.isAccountWritable(i),
        })),
        data: Buffer.from(ix.data as any, "base64"),
      });
    });

    const newMessage = new TransactionMessage({
      payerKey: agent.wallet.publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    const newTx = new VersionedTransaction(newMessage);

    return await signOrSendTX(agent, newTx);
  } catch (error: any) {
    throw new Error(`Remove Liquidity failed: ${error.message}`);
  }
}
