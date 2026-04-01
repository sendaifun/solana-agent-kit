import {
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

const VYBES_API_URL = "https://vybes.fun";

export interface LaunchTokenParams {
  name: string;
  symbol: string;
  description?: string;
  imageUrl?: string;
  style?: string;
}

export interface LaunchTokenResult {
  success: boolean;
  tokenAddress: string;
  uuid: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  viewUrl: string;
  paymentTx: string;
}

/**
 * Launch a token on vybes.fun with bonding curve.
 * Handles the full flow: get fee info -> generate logo (optional) -> send payment -> create token.
 *
 * Free to launch (0 SOL creation fee). Token gets a bonding curve for trading
 * and graduates to Meteora DEX at ~85 SOL raised.
 *
 * @param agent - SolanaAgentKit instance
 * @param params - Token name, symbol, description, and optional imageUrl/style
 */
export async function launchTokenOnVybes(
  agent: SolanaAgentKit,
  params: LaunchTokenParams,
): Promise<LaunchTokenResult> {
  const walletAddress = agent.wallet.publicKey.toBase58();

  // 1. Get fee info
  const infoRes = await fetch(`${VYBES_API_URL}/api/agent/launch?action=info`);
  const infoData = await infoRes.json();
  if (!infoData.success) throw new Error("Failed to get vybes launch info");
  const { feeLamports, revenueWallet } = infoData.data;

  // 2. Generate logo if no imageUrl provided
  let imageUrl = params.imageUrl;
  if (!imageUrl) {
    const logoRes = await fetch(`${VYBES_API_URL}/api/agent/logo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: params.name,
        symbol: params.symbol,
        style: params.style || "meme",
      }),
    });
    const logoData = await logoRes.json();
    if (logoData.success) {
      imageUrl = logoData.data.imageUrl;
    }
  }

  // 3. Send payment (only if fee > 0)
  let paymentTx = "";
  if (feeLamports > 0) {
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: agent.wallet.publicKey,
        toPubkey: new PublicKey(revenueWallet),
        lamports: feeLamports,
      }),
    );
    const { blockhash } = await agent.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = agent.wallet.publicKey;

    const result = await signOrSendTX(agent, tx);
    paymentTx = typeof result === "string" ? result : "";
  }

  // 4. Launch token
  const launchRes = await fetch(`${VYBES_API_URL}/api/agent/launch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentWallet: walletAddress,
      ...(paymentTx && { paymentTxSignature: paymentTx }),
      name: params.name,
      symbol: params.symbol.toUpperCase(),
      description: params.description || "",
      imageUrl,
    }),
  });
  const result = await launchRes.json();

  if (!result.success) {
    throw new Error(result.error || "Token launch failed");
  }

  return {
    success: true,
    tokenAddress: result.data.tokenAddress,
    uuid: result.data.uuid,
    name: params.name,
    symbol: params.symbol.toUpperCase(),
    imageUrl,
    viewUrl: `${VYBES_API_URL}/launch/${result.data.uuid}`,
    paymentTx,
  };
}
