import { VersionedTransaction } from "@solana/web3.js";
import { signOrSendTX, type SolanaAgentKit } from "solana-agent-kit";

/**
 * Lend tokens for yields using Lulo
 * @param agent SolanaAgentKit instance
 * @param mintAddress SPL Mint address
 * @param amount Amount to lend
 * @returns Transaction signature
 */
export async function luloLend(
  agent: SolanaAgentKit,
  mintAddress: string,
  amount: number,
) {
  try {
    const response = await fetch(
      "https://api.flexlend.fi/generate/account/deposit?priorityFee=50000",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-pubkey": agent.wallet.publicKey.toBase58(),
          "x-api-key": process.env.FLEXLEND_API_KEY!,
        },
        body: JSON.stringify({
          owner: agent.wallet.publicKey.toBase58(),
          mintAddress: mintAddress,
          depositAmount: amount.toString(),
        }),
      },
    );
    const {
      data: { transactionMeta },
    } = await response.json();

    // Deserialize the transaction
    const luloTxn = VersionedTransaction.deserialize(
      Buffer.from(transactionMeta[0].transaction, "base64"),
    );

    // Get a recent blockhash and set it
    const { blockhash } = await agent.connection.getLatestBlockhash();
    luloTxn.message.recentBlockhash = blockhash;

    return signOrSendTX(agent, luloTxn);
  } catch (error: any) {
    throw new Error(`Lending failed: ${error.message}`);
  }
}
