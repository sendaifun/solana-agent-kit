import axios from "axios";
import { SolanaAgentKit } from "../../agent";
import { SANCTUM_TRADE_API_URI } from "../../constants";
import { VersionedTransaction } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js";
import { TransactionMessage } from "@solana/web3.js";

export async function sanctumSwapLST(
  agent: SolanaAgentKit,
  inputLstMint: string,
  amount: string,
  quotedAmount: string,
  priorityFee: number,
  outputLstMint: string,
): Promise<{ txId: string }> {
  try {
    const client = axios.create({
      baseURL: SANCTUM_TRADE_API_URI,
    });

    const response = await client.post("/v1/swap", {
      amount,
      dstLstAcc: null,
      input: inputLstMint,
      mode: "ExactIn",
      priorityFee: {
        Auto: {
          max_unit_price_micro_lamports: priorityFee,
          unit_limit: 300000,
        },
      },
      outputLstMint,
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

    newTx.sign([agent.wallet]);

    const txId = await agent.connection.sendTransaction(newTx, {
      maxRetries: 3,
    });

    return { txId };
  } catch (error: any) {
    throw new Error(`Failed to swap lst: ${error.message}`);
  }
}
