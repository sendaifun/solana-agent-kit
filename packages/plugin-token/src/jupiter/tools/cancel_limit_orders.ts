import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";
import type { CancelJupiterOrderRequest } from "../types";
import { cancelOrdersApi } from "./common/jupiterLimitApi";
import { deserializeTransaction } from "./common/transactions";

export async function cancelLimitOrders(
  agent: SolanaAgentKit,
  params: CancelJupiterOrderRequest,
) {
  params.maker = agent.wallet.publicKey.toString();
  try {
    const data = await cancelOrdersApi(params);
    const transactions = data.txs.map((tx: string) =>
      deserializeTransaction(tx),
    );

    const signatures = await signOrSendTX(agent, transactions);

    return {
      signatures,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Error canceling limit orders: ${error}`);
  }
}
