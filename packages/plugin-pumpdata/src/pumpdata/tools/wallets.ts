import type { SolanaAgentKit } from "solana-agent-kit";
import type { PumpDataResponse } from "../types";
import { pumpDataPaidRequest } from "./client";

export const PUMPDATA_MAX_WALLETS = 50;

/**
 * What each wallet has done on pump.fun over the whole history: per wallet a
 * rule-based class (winner, bot, supply_seller, new or none), net SOL, SOL put
 * in and taken out, coins traded and first seen. The classes are the API's
 * rules, not judgements.
 * Costs $0.01 in USDC per call (up to 50 wallets), paid over x402 with the
 * agent's wallet.
 *
 * @param agent - SolanaAgentKit instance whose wallet pays
 * @param addresses - 1 to 50 wallet addresses
 * @param mint - Optional coin these wallets are buying; with it, `new` means
 * no record before that coin was created
 */
export async function pumpdataGetWallets(
  agent: SolanaAgentKit,
  addresses: string[],
  mint?: string,
): Promise<PumpDataResponse> {
  if (addresses.length < 1 || addresses.length > PUMPDATA_MAX_WALLETS) {
    throw new Error(
      `addresses must hold 1 to ${PUMPDATA_MAX_WALLETS} wallet addresses`,
    );
  }
  return pumpDataPaidRequest(agent, "wallets", "/wallets", {
    method: "POST",
    body: JSON.stringify(mint ? { addresses, mint } : { addresses }),
  });
}
