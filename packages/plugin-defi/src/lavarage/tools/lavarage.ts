import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";
import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

const API_BASE = "https://api.lavarage.xyz/api/v1";
const API_KEY =
  "lv2_prod_f10d28b9ef5694e38b61eb614556ed85ab480585ef03c39c";

async function lavaApi(
  path: string,
  opts?: { method?: string; body?: any },
): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts?.method ?? "GET",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      `Lavarage API ${res.status}: ${data?.message ?? JSON.stringify(data)}`,
    );
  return data;
}

/**
 * List available tokens for leverage trading with best offers.
 */
export async function lavarageListTokens(
  _agent: SolanaAgentKit,
  search: string,
): Promise<any[]> {
  const offers = await lavaApi(
    `/offers?includeTokens=true&search=${encodeURIComponent(search)}&limit=20`,
  );
  const seen = new Map<string, any>();
  for (const o of offers) {
    const mint = o.tradedTokenAddress ?? o.tokenMint;
    if (!mint) continue;
    const existing = seen.get(mint);
    if (
      !existing ||
      Number(o.availableForOpen ?? 0) > Number(existing.availableForOpen ?? 0)
    ) {
      seen.set(mint, o);
    }
  }
  return Array.from(seen.values())
    .slice(0, 20)
    .map((o) => ({
      offerPublicKey: o.publicKey,
      symbol: o.baseToken?.symbol ?? "unknown",
      name: o.baseToken?.name ?? null,
      mint: o.tradedTokenAddress ?? o.tokenMint,
      price: o.baseToken?.price ?? null,
      quoteSymbol: o.quoteToken?.symbol ?? "unknown",
      maxLeverage: o.maxLeverage,
      apr: o.apr,
      side: o.side,
    }));
}

/**
 * Get max leverage and available liquidity for a token.
 */
export async function lavarageGetMaxLeverage(
  _agent: SolanaAgentKit,
  search: string,
  quoteCurrency?: string,
): Promise<any[]> {
  const params = new URLSearchParams({
    includeTokens: "true",
    search,
    limit: "10",
  });
  if (quoteCurrency && quoteCurrency !== "all") {
    const quoteMap: Record<string, string> = {
      SOL: "So11111111111111111111111111111111111111112",
      USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    };
    if (quoteMap[quoteCurrency]) params.set("quoteToken", quoteMap[quoteCurrency]);
  }
  const offers = await lavaApi(`/offers?${params}`);
  return (Array.isArray(offers) ? offers : []).map((o: any) => ({
    offerPublicKey: o.publicKey,
    symbol: o.baseToken?.symbol ?? "unknown",
    quoteSymbol: o.quoteToken?.symbol ?? "unknown",
    maxLeverage: o.maxLeverage,
    apr: o.apr,
    availableLiquidity: o.availableForOpen ?? o.availableLiquidity,
    side: o.side,
  }));
}

/**
 * Open a leveraged position. Builds TX via API, signs with agent wallet, submits.
 */
export async function lavarageOpenPosition(
  agent: SolanaAgentKit,
  offerPublicKey: string,
  collateralAmount: string,
  leverage: number,
  slippageBps = 50,
): Promise<string> {
  const wallet = agent.wallet.publicKey.toBase58();

  // Get tip for MEV protection
  const { tipLamports } = await lavaApi("/bundle/tip");

  // Build the transaction
  const result = await lavaApi("/positions/open", {
    method: "POST",
    body: {
      offerPublicKey,
      userPublicKey: wallet,
      collateralAmount,
      leverage,
      slippageBps,
      astralaneTipLamports: tipLamports,
    },
  });

  // Deserialize (API returns base58)
  const txBuffer = Buffer.from(bs58.decode(result.transaction));
  const tx = VersionedTransaction.deserialize(txBuffer);

  // Sign and send via agent's wallet
  return await signOrSendTX(agent, tx);
}

/**
 * Close a leveraged position.
 */
export async function lavarageClosePosition(
  agent: SolanaAgentKit,
  positionAddress: string,
  slippageBps = 50,
): Promise<string> {
  const wallet = agent.wallet.publicKey.toBase58();
  const { tipLamports } = await lavaApi("/bundle/tip");

  const result = await lavaApi("/positions/close", {
    method: "POST",
    body: {
      positionAddress,
      userPublicKey: wallet,
      slippageBps,
      astralaneTipLamports: tipLamports,
    },
  });

  const txBuffer = Buffer.from(bs58.decode(result.transaction));
  const tx = VersionedTransaction.deserialize(txBuffer);
  return await signOrSendTX(agent, tx);
}

/**
 * List positions for the agent's wallet.
 */
export async function lavarageGetPositions(
  agent: SolanaAgentKit,
  status = "OPEN",
): Promise<any[]> {
  const wallet = agent.wallet.publicKey.toBase58();
  return lavaApi(`/positions?owner=${wallet}&status=${status}`);
}

/**
 * Get details for a specific position.
 */
export async function lavarageGetPositionStatus(
  agent: SolanaAgentKit,
  positionAddress: string,
): Promise<any> {
  const wallet = agent.wallet.publicKey.toBase58();
  const positions = await lavaApi(
    `/positions?owner=${wallet}&limit=250`,
  );
  const match = (Array.isArray(positions) ? positions : []).find(
    (p: any) => p.address === positionAddress,
  );
  if (!match) throw new Error(`Position ${positionAddress} not found`);
  return match;
}
