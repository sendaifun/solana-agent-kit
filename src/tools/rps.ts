import { VersionedTransaction } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";

export async function rps(
  agent: SolanaAgentKit,
  amount: number,
  choice: "R" | "P" | "S",
): Promise<string> {
  try {
    const res = await fetch(
      `https://rps.sendarcade.fun/api/actions/backend?amount=${amount}&choice=${choice}&player=B`,
      {
        method: "POST",
        body: JSON.stringify({
          account: agent.wallet.publicKey.toBase58(),
        }),
      },
    );

    const data = await res.json();

    const txn = VersionedTransaction.deserialize(
      Buffer.from(data.transaction, "base64"),
    );

    // Sign and send transaction
    txn.sign([agent.wallet]);
    const signature = await agent.connection.sendTransaction(txn);
    return signature;
  } catch (error: any) {
    console.error(error);
    throw new Error(`RPS game failed: ${error.message}`);
  }
}
