const VYBES_API_URL = "https://vybes.fun";

export interface VybesEarnings {
  tokensLaunched: number;
  totalPredictions: number;
  totalBetLamports: number;
  totalPayoutLamports: number;
  netProfitLamports: number;
  tokens: any[];
  predictions: any[];
}

/**
 * Get earnings summary for a wallet from vybes.fun.
 * Free, read-only endpoint. Returns tokens launched, prediction bets,
 * payouts, and net profit.
 *
 * @param wallet - Solana wallet address
 */
export async function getVybesEarnings(
  wallet: string,
): Promise<VybesEarnings> {
  const res = await fetch(`${VYBES_API_URL}/api/agent/earnings?wallet=${wallet}`);
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to get earnings");
  }

  return data.data;
}
