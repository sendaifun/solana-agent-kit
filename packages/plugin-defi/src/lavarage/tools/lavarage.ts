import type { SolanaAgentKit } from "solana-agent-kit";
import { VersionedTransaction } from "@solana/web3.js";
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

async function buildSignAndSend(
  agent: SolanaAgentKit,
  txBase58: string,
): Promise<string> {
  const txBuffer = Buffer.from(bs58.decode(txBase58));
  const tx = VersionedTransaction.deserialize(txBuffer);

  // Sign and send directly — can't use signOrSendTX because its instanceof
  // check fails when @solana/web3.js versions differ between plugin and core.
  // This is the same pattern other plugins use for pre-built transactions.
  if (agent.wallet.signAndSendTransaction) {
    const { signature } = await agent.wallet.signAndSendTransaction(tx);
    return signature;
  }

  // Fallback: sign then send separately
  const signed = await agent.wallet.signTransaction(tx);
  return await agent.connection.sendRawTransaction(
    (signed as VersionedTransaction).serialize(),
    { skipPreflight: true, maxRetries: 3 },
  );
}

async function getTipAndBuild(
  agent: SolanaAgentKit,
  path: string,
  body: any,
): Promise<string> {
  const { tipLamports } = await lavaApi("/bundle/tip");
  const result = await lavaApi(path, {
    method: "POST",
    body: { ...body, astralaneTipLamports: tipLamports },
  });
  return await buildSignAndSend(agent, result.transaction);
}

// ── Market Data ──

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
    )
      seen.set(mint, o);
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

export async function lavarageGetMaxLeverage(
  _agent: SolanaAgentKit,
  search: string,
  quoteCurrency?: string,
): Promise<any[]> {
  const params = new URLSearchParams({ includeTokens: "true", search, limit: "10" });
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

// ── Trading ──

export async function lavarageOpenPosition(
  agent: SolanaAgentKit,
  offerPublicKey: string,
  collateralAmount: string,
  leverage: number,
  slippageBps = 50,
): Promise<string> {
  return getTipAndBuild(agent, "/positions/open", {
    offerPublicKey,
    userPublicKey: agent.wallet.publicKey.toBase58(),
    collateralAmount,
    leverage,
    slippageBps,
  });
}

export async function lavarageClosePosition(
  agent: SolanaAgentKit,
  positionAddress: string,
  slippageBps = 50,
): Promise<string> {
  return getTipAndBuild(agent, "/positions/close", {
    positionAddress,
    userPublicKey: agent.wallet.publicKey.toBase58(),
    slippageBps,
  });
}

// ── Positions ──

export async function lavarageGetPositions(
  agent: SolanaAgentKit,
  status = "OPEN",
): Promise<any[]> {
  const wallet = agent.wallet.publicKey.toBase58();
  return lavaApi(`/positions?owner=${wallet}&status=${status}`);
}

export async function lavarageGetPositionStatus(
  agent: SolanaAgentKit,
  positionAddress: string,
): Promise<any> {
  const wallet = agent.wallet.publicKey.toBase58();
  const positions = await lavaApi(`/positions?owner=${wallet}&limit=250`);
  const match = (Array.isArray(positions) ? positions : []).find(
    (p: any) => p.address === positionAddress,
  );
  if (!match) throw new Error(`Position ${positionAddress} not found`);
  return match;
}

// ── Borrow ──

export async function lavarageRepay(
  agent: SolanaAgentKit,
  positionAddress: string,
): Promise<string> {
  return getTipAndBuild(agent, "/positions/repay", {
    positionAddress,
    userPublicKey: agent.wallet.publicKey.toBase58(),
  });
}

export async function lavaragePartialRepay(
  agent: SolanaAgentKit,
  positionAddress: string,
  repaymentBps: number,
): Promise<string> {
  return getTipAndBuild(agent, "/positions/partial-repay", {
    positionAddress,
    userPublicKey: agent.wallet.publicKey.toBase58(),
    repaymentBps,
  });
}

export async function lavarageIncreaseBorrow(
  agent: SolanaAgentKit,
  positionAddress: string,
  additionalBorrowAmount: string,
  mode: "withdraw" | "compound",
  slippageBps = 50,
): Promise<string> {
  return getTipAndBuild(agent, "/positions/increase-borrow", {
    positionAddress,
    userPublicKey: agent.wallet.publicKey.toBase58(),
    additionalBorrowAmount,
    mode,
    slippageBps,
  });
}

// ── Position Management ──

export async function lavarageAddCollateral(
  agent: SolanaAgentKit,
  positionAddress: string,
  collateralAmount: string,
): Promise<string> {
  return getTipAndBuild(agent, "/positions/add-collateral", {
    positionAddress,
    userPublicKey: agent.wallet.publicKey.toBase58(),
    collateralAmount,
  });
}

export async function lavarageSplitPosition(
  agent: SolanaAgentKit,
  positionAddress: string,
  splitRatioBps: number,
): Promise<string> {
  return getTipAndBuild(agent, "/positions/split", {
    positionAddress,
    userPublicKey: agent.wallet.publicKey.toBase58(),
    splitRatioBps,
  });
}

export async function lavarageMergePositions(
  agent: SolanaAgentKit,
  firstPositionAddress: string,
  secondPositionAddress: string,
): Promise<string> {
  return getTipAndBuild(agent, "/positions/merge", {
    firstPositionAddress,
    secondPositionAddress,
    userPublicKey: agent.wallet.publicKey.toBase58(),
  });
}

// ── Quotes ──

export async function lavarageGetQuote(
  agent: SolanaAgentKit,
  offerPublicKey: string,
  collateralAmount: string,
  leverage: number,
  slippageBps = 50,
): Promise<any> {
  return lavaApi("/positions/quote", {
    method: "POST",
    body: {
      offerPublicKey,
      userPublicKey: agent.wallet.publicKey.toBase58(),
      collateralAmount,
      leverage,
      slippageBps,
    },
  });
}

export async function lavarageCloseQuote(
  agent: SolanaAgentKit,
  positionAddress: string,
  slippageBps = 50,
): Promise<any> {
  return lavaApi("/positions/close-quote", {
    method: "POST",
    body: {
      positionAddress,
      userPublicKey: agent.wallet.publicKey.toBase58(),
      slippageBps,
    },
  });
}

// ── History ──

export async function lavarageTradeHistory(
  agent: SolanaAgentKit,
  limit = 20,
): Promise<any> {
  const wallet = agent.wallet.publicKey.toBase58();
  return lavaApi(`/positions/trade-history?owner=${wallet}&limit=${limit}`);
}
