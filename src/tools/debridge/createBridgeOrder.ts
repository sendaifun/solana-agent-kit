import { DEBRIDGE_API } from "../../constants";
import { deBridgeOrderInput, deBridgeOrderResponse } from "../../types";

/**
 * Create a bridge order for cross-chain token transfer
 *
 * @param params Bridge order parameters
 * @param params.srcChainId Source chain ID (e.g., '1' for Ethereum)
 * @param params.srcChainTokenIn Token address on source chain
 * @param params.srcChainTokenInAmount Amount to bridge (in token's smallest unit)
 * @param params.dstChainId Destination chain ID
 * @param params.dstChainTokenOut Token address on destination chain
 * @param params.dstChainTokenOutRecipient Recipient address on destination chain
 * @param params.account Sender's wallet address
 * @returns Bridge order details and transaction data
 */
export async function createDebridgeBridgeOrder(
  params: deBridgeOrderInput,
): Promise<deBridgeOrderResponse> {
  if (params.srcChainId === params.dstChainId) {
    throw new Error("Source and destination chains must be different");
  }

  const queryParams = new URLSearchParams({
    srcChainId: params.srcChainId,
    srcChainTokenIn: params.srcChainTokenIn,
    srcChainTokenInAmount: params.srcChainTokenInAmount,
    dstChainId: params.dstChainId,
    dstChainTokenOut: params.dstChainTokenOut,
    dstChainTokenOutRecipient: params.dstChainTokenOutRecipient,
    senderAddress: params.account,
    srcChainOrderAuthorityAddress: params.account, // Always use sender's address
    srcChainRefundAddress: params.account, // Always use sender's address
    dstChainOrderAuthorityAddress: params.dstChainTokenOutRecipient, // Always use recipient's address
    referralCode: "21064", // deBridge integration analytics
    deBridgeApp: "SOLANA_AGENT_KIT", // deBridge integration analytics
    prependOperatingExpenses: "true", // Always true
  });

  const response = await fetch(
    `${DEBRIDGE_API}/dln/order/create-tx?${queryParams}`,
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create bridge order: ${response.statusText}. ${errorText}`,
    );
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`DeBridge API Error: ${data.error}`);
  }

  if (data.tx?.data) {
    data.tx.data = data.tx.data.toString();
  }

  return data;
}
