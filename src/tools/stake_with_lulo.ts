import { VersionedTransaction } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";

/**
 * Deposit tokens for yields using Lulo
 * @param agent SolanaAgentKit instance
 * @param mintAddress Mint address to deposit
 * @param amount Amount to deposit
 * @returns Transaction signature
 */
export async function depositWithLulo(
  agent: SolanaAgentKit,
  mintAddress: string,
  amount: number,
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.flexlend.fi/generate/account/deposit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-pubkey": agent.wallet.publicKey.toBase58(),
          "x-api-key": process.env.FLEXLEND_API_KEY!
        },
        body: JSON.stringify({
          owner: agent.wallet.publicKey.toBase58(),
          mintAddress: mintAddress,
          depositAmount: amount,
        }),
      },
    );

    const data = await response.json();

    // Deserialize the transaction
    const luloTxn = VersionedTransaction.deserialize(
      Buffer.from(data.transaction, "base64"),
    );

    // Get a recent blockhash and set it
    const { blockhash } = await agent.connection.getLatestBlockhash();
    luloTxn.message.recentBlockhash = blockhash;

    // Sign and send transaction
    luloTxn.sign([agent.wallet]);

    const signature = await agent.connection.sendTransaction(luloTxn, {
      preflightCommitment: "confirmed",
      maxRetries: 3,
    });

    // Wait for confirmation using the latest strategy
    const latestBlockhash = await agent.connection.getLatestBlockhash();
    await agent.connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    return signature;
  } catch (error: any) {
    throw new Error(`Deposit failed: ${error.message}`);
  }
}

/**
 * Withdraw tokens for yields using Lulo
 * @param agent SolanaAgentKit instance
 * @param mintAddress Mint address to deposit
 * @param amount Amount to deposit
 * @returns Transaction signature
 */
export async function withdrawWithLulo(
    agent: SolanaAgentKit,
    mintAddress: string,
    amount: number,
  ): Promise<string> {
    try {
      const response = await fetch(
        `https://api.flexlend.fi/generate/account/withdraw`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-wallet-pubkey": agent.wallet.publicKey.toBase58(),
            "x-api-key": process.env.FLEXLEND_API_KEY!
          },
          body: JSON.stringify({
            owner: agent.wallet.publicKey.toBase58(),
            mintAddress: mintAddress,
            depositAmount: amount,
          }),
        },
      );
  
      const data = await response.json();
  
      const luloTxn = VersionedTransaction.deserialize(
        Buffer.from(data.transaction, "base64"),
      );
  
      const { blockhash } = await agent.connection.getLatestBlockhash();
      luloTxn.message.recentBlockhash = blockhash;
  
      luloTxn.sign([agent.wallet]);
  
      const signature = await agent.connection.sendTransaction(luloTxn, {
        preflightCommitment: "confirmed",
        maxRetries: 3,
      });
  
      const latestBlockhash = await agent.connection.getLatestBlockhash();
      await agent.connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });
  
      return signature;
    } catch (error: any) {
      throw new Error(`Withdraw failed: ${error.message}`);
    }
  }
  