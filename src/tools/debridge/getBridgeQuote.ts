import { DEBRIDGE_API } from "../../constants";
import { deBridgeOrderInput, deBridgeOrderResponse } from "../../types";

/**
 * Get a quote for bridging tokens between chains AND build the transaction.
 * This endpoint returns both the quote and transaction data needed for execution.
 *
 * @param params Required parameters for building a bridge transaction
 * @param params.srcChainId Source chain ID (e.g., "1" for Ethereum)
 * @param params.srcChainTokenIn Source token address (use "0x0000000000000000000000000000000000000000" for native tokens on EVM)
 * @param params.srcChainTokenInAmount Amount of source tokens to bridge (in smallest units)
 * @param params.dstChainId Destination chain ID (e.g., "7565164" for Solana)
 * @param params.dstChainTokenOut Destination token address
 * @param params.dstChainTokenOutRecipient Recipient address on destination chain
 * @param params.slippage Optional slippage tolerance in percentage (e.g., 0.5 for 0.5%)
 * @returns Quote information and transaction data
 */
export async function getBridgeQuote(
  params: deBridgeOrderInput,
): Promise<deBridgeOrderResponse> {
  // Validate required parameters
  if (!params.dstChainTokenOutRecipient) {
    throw new Error(
      "dstChainTokenOutRecipient is required for transaction building",
    );
  }

  const queryParams = new URLSearchParams({
    srcChainId: params.srcChainId,
    srcChainTokenIn: params.srcChainTokenIn,
    srcChainTokenInAmount: params.srcChainTokenInAmount,
    dstChainId: params.dstChainId,
    dstChainTokenOut: params.dstChainTokenOut,
    dstChainTokenOutAmount: params.dstChainTokenOutAmount || "auto",
    dstChainTokenOutRecipient: params.dstChainTokenOutRecipient,
    prependOperatingExpenses: "true",
    additionalTakerRewardBps: (params.additionalTakerRewardBps || 0).toString(),
    ...(params.slippage && { slippage: params.slippage.toString() }),
    ...(params.srcIntermediaryTokenAddress && {
      srcIntermediaryTokenAddress: params.srcIntermediaryTokenAddress,
    }),
    ...(params.dstIntermediaryTokenAddress && {
      dstIntermediaryTokenAddress: params.dstIntermediaryTokenAddress,
    }),
    ...(params.dstIntermediaryTokenSpenderAddress && {
      dstIntermediaryTokenSpenderAddress:
        params.dstIntermediaryTokenSpenderAddress,
    }),
    ...(params.intermediaryTokenUSDPrice && {
      intermediaryTokenUSDPrice: params.intermediaryTokenUSDPrice.toString(),
    }),
    ...(params.srcAllowedCancelBeneficiary && {
      srcAllowedCancelBeneficiary: params.srcAllowedCancelBeneficiary,
    }),
    ...(params.referralCode && {
      referralCode: params.referralCode.toString(),
    }),
    ...(params.affiliateFeePercent && {
      affiliateFeePercent: params.affiliateFeePercent.toString(),
    }),
  });

  const response = await fetch(
    `${DEBRIDGE_API}/dln/order/create-tx?${queryParams}`,
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get bridge quote: ${response.status} - ${errorText}`,
    );
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`API Error: ${data.error}`);
  }

  return data;
}
