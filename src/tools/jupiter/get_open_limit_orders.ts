import { SolanaAgentKit } from "../../index";
import { getOpenOrdersApi } from "./common/jupiterLimitApi";

export async function getOpenLimitOrders(agent: SolanaAgentKit) {
  try {
    const orders = await getOpenOrdersApi(agent.wallet.publicKey.toString());
    return { orders, success: true };
  } catch (error) {
    console.error(error);
    throw new Error(`Error fetching open orders: ${error}`);
  }
}
