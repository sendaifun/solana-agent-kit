import { SolanaAgentKit } from "../../index";
import { getOrderHistoryApi } from "./common/jupiterLimitApi";

export async function getLimitOrderHistory(agent: SolanaAgentKit) {
  try {
    const history = await getOrderHistoryApi(agent.wallet.publicKey.toString());
    return { history, success: true };
  } catch (error) {
    console.error(error);
    throw new Error(`Error fetching order history: ${error}`);
  }
}
