import { VersionedTransaction } from "@solana/web3.js";
import { LuloAccountDetailsResponse } from "../types";
import { SolanaAgentKit } from "../agent";

/**
 * Lend tokens for yields using Lulo
 * @param agent SolanaAgentKit instance
 * @param amount Amount of USDC to lend
 * @returns Transaction signature
 */
export async function lendAsset(
  agent: SolanaAgentKit,
  amount: number,
): Promise<string> {
  try {
    const response = await fetch(
      `https://blink.lulo.fi/actions?amount=${amount}&symbol=USDC`,
      {
        method: "POST",
        body: JSON.stringify({
          account: agent.wallet.publicKey.toBase58(),
        }),
      },
    );

    const data = await response.json();

    const luloTxn = VersionedTransaction.deserialize(
      Buffer.from(data.transaction, "base64"),
    );

    // Sign and send transaction
    luloTxn.sign([agent.wallet]);
    const signature = await agent.connection.sendTransaction(luloTxn);

    return signature;
  } catch (error: any) {
    throw new Error(`Lending failed: ${error.message}`);
  }
}

/**
 * Fetch lending details for agent
 * @param agent SolanaAgentKit instance
 * @param LULO_API_KEY Valid API key for Lulo
 * @returns Lending account details
 */
export async function getLendingDetails(
  agent: SolanaAgentKit,
  LULO_API_KEY = "",
): Promise<LuloAccountDetailsResponse> {
  try {
    if (!LULO_API_KEY) {
      throw new Error("Missing Lulo API key");
    }

    const response = await fetch(`${LULO_API}/account`, {
      headers: {
        "x-wallet-pubkey": agent.wallet.publicKey.toBase58(),
        "x-api-key": LULO_API_KEY,
      },
    });

    const { data } = await response.json();

    return data as LuloAccountDetailsResponse;
  } catch (error: any) {
    throw new Error(`Failed to fetch lending details: ${error.message}`);
  }
}
