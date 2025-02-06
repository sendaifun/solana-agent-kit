import { SolanaAgentKit } from "../../agent";
import { DEBRIDGE_API } from "../../constants";
import { BridgeOrderIdsResponse, BridgeOrderStatusResponse } from "../../types";

/**
 * Check the status of bridge transactions using their transaction hash
 * This method retrieves the current status of one or more bridge transactions
 *
 * @param agent SolanaAgentKit instance
 * @param txHash Transaction hash to check status for
 * @returns Status information for the bridge transaction
 * @throws {Error} If the API request fails or returns an error
 */
export async function checkTransactionStatus(
  agent: SolanaAgentKit,
  txHash: string
): Promise<BridgeOrderStatusResponse[]> {
  try {
    // First get the order IDs for the transaction
    const orderIdsUrl = `${DEBRIDGE_API}/dln/tx/${txHash}/order-ids`;
    const orderIdsResponse = await fetch(orderIdsUrl);
    const responseData = await orderIdsResponse.json();

    if (!orderIdsResponse.ok) {
      if (responseData.errorCode === 2) {
        throw new Error("Invalid transaction hash format");
      } else {
        throw new Error(responseData.errorMessage || 'Unknown error');
      }
    }

    const orderIdsData = responseData as BridgeOrderIdsResponse;
    if (!orderIdsData.orderIds || orderIdsData.orderIds.length === 0) {
      throw new Error("No bridge orders found for this transaction");
    }

    // Then get the status for each order
    const statuses = await Promise.all(
      orderIdsData.orderIds.map(async (orderId) => {
        const statusUrl = `${DEBRIDGE_API}/dln/order/${orderId}/status`;
        const statusResponse = await fetch(statusUrl);
        
        if (!statusResponse.ok) {
          const text = await statusResponse.text();
          throw new Error(`Failed to get status for order ${orderId}: ${text}`);
        }

        const statusData = await statusResponse.json();
        // Add the deBridge app link
        statusData.orderLink = `https://app.debridge.finance/order?orderId=${orderId}`;
        return statusData;
      })
    );

    return statuses;
  } catch (error: any) {
    throw error;
  }
}
