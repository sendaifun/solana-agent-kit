import { SolanaAgentKit } from "solana-agent-kit";

const SOL_MINT = "So11111111111111111111111111111111111111112";

/**
 * A single decoded DEX swap extracted from a Helius enhanced transaction.
 */
export interface WalletSwapEvent {
  dex: string;
  signature: string;
  timestamp: number;
  tokenIn: { mint: string; amount: number };
  tokenOut: { mint: string; amount: number };
}

/**
 * Structured, agent-friendly intelligence derived from a wallet's recent
 * transactions.
 */
export interface WalletIntelligence {
  walletAddress: string;
  transactionsAnalyzed: number;
  totalSwapCount: number;
  topProtocols: string[];
  recentSwaps: WalletSwapEvent[];
  lastActiveAt: number | null;
  signals: string[];
}

function tokenUiAmount(item: any): number {
  const raw = item?.rawTokenAmount;
  if (!raw) {
    return 0;
  }
  const amount = Number(raw.tokenAmount ?? 0);
  const decimals = Number(raw.decimals ?? 0);
  return decimals > 0 ? amount / Math.pow(10, decimals) : amount;
}

function extractLeg(
  tokenLeg: any,
  nativeLeg: any,
): { mint: string; amount: number } {
  if (tokenLeg) {
    return { mint: tokenLeg.mint ?? "", amount: tokenUiAmount(tokenLeg) };
  }
  if (nativeLeg) {
    return { mint: SOL_MINT, amount: Number(nativeLeg.amount ?? 0) / 1e9 };
  }
  return { mint: "", amount: 0 };
}

/**
 * Fetch a wallet's recent enhanced transactions using the Helius Enhanced
 * Transactions API.
 *
 * see details here: https://docs.helius.dev/api/transactions-api
 * @param agent SolanaAgentKit instance
 * @param walletAddress Wallet address to fetch transactions for
 * @param limit Number of transactions to retrieve (default 20)
 * @returns Array of enhanced transactions
 */
export async function getWalletEnhancedTransactions(
  agent: SolanaAgentKit,
  walletAddress: string,
  limit = 20,
): Promise<any[]> {
  try {
    const apiKey = agent.config?.HELIUS_API_KEY;
    if (!apiKey) {
      throw new Error("HELIUS_API_KEY not found in environment variables");
    }

    const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${apiKey}&limit=${limit}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} - ${response.statusText}`,
      );
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error("Error fetching wallet transactions: ", error.message);
    throw new Error(`Wallet transaction fetch failed: ${error.message}`);
  }
}

/**
 * Summarize raw Helius enhanced transactions into wallet intelligence
 * (DEX swaps, top venues, and trading-behavior signals) for an AI agent.
 * @param walletAddress The wallet the transactions belong to
 * @param transactions Raw enhanced transactions from getWalletEnhancedTransactions
 * @returns Structured wallet intelligence
 */
export function summarizeWalletIntelligence(
  walletAddress: string,
  transactions: any[],
): WalletIntelligence {
  const txs = Array.isArray(transactions) ? transactions : [];
  const recentSwaps: WalletSwapEvent[] = [];
  const protocolCounts = new Map<string, number>();
  let lastActiveAt: number | null = null;

  for (const tx of txs) {
    if (typeof tx?.source === "string" && tx.source) {
      protocolCounts.set(tx.source, (protocolCounts.get(tx.source) ?? 0) + 1);
    }
    if (typeof tx?.timestamp === "number") {
      if (lastActiveAt === null || tx.timestamp > lastActiveAt) {
        lastActiveAt = tx.timestamp;
      }
    }
    const swap = tx?.events?.swap;
    if (swap) {
      const tokenIn = extractLeg(swap.tokenInputs?.[0], swap.nativeInput);
      const tokenOut = extractLeg(swap.tokenOutputs?.[0], swap.nativeOutput);
      recentSwaps.push({
        dex: tx.source ?? "unknown",
        signature: tx.signature ?? "",
        timestamp: tx.timestamp ?? 0,
        tokenIn,
        tokenOut,
      });
    }
  }

  const topProtocols = Array.from(protocolCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name);

  const signals: string[] = [];
  if (recentSwaps.length > 0) {
    signals.push(
      `Executed ${recentSwaps.length} DEX swap(s) across ${txs.length} recent transaction(s).`,
    );
    const top = topProtocols.slice(0, 3);
    if (top.length > 0) {
      signals.push(`Top venue(s): ${top.join(", ")}.`);
    }
  } else {
    signals.push("No DEX swaps detected in the analyzed transactions.");
  }
  if (lastActiveAt !== null) {
    const hoursAgo = (Date.now() / 1000 - lastActiveAt) / 3600;
    if (hoursAgo <= 24) {
      signals.push(
        `Recently active (last activity ~${Math.max(0, hoursAgo).toFixed(1)}h ago).`,
      );
    }
  }

  return {
    walletAddress,
    transactionsAnalyzed: txs.length,
    totalSwapCount: recentSwaps.length,
    topProtocols,
    recentSwaps,
    lastActiveAt,
    signals,
  };
}
