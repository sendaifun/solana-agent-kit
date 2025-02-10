import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { deBridgeOrderInput } from "../../types";

export class CreateDebridgeOrderTool extends Tool {
  name = "create_bridge_order";
  description = `This tool creates a new bridge order for cross-chain token transfers.

  Inputs (input is a JSON string):
  Required fields:
  srcChainId: string, eg "1" for Ethereum or "7565164" for Solana
  srcChainTokenIn: string, eg "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" for EVM or base58 for Solana
  srcChainTokenInAmount: string, eg "1000000" for 1 USDC
  dstChainId: string, eg "56" for BSC
  dstChainTokenOut: string, eg "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
  dstChainTokenOutRecipient: string, eg "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  senderAddress: string, eg "Abws588GagNKeMViBPE2e1WjQ2jViDyw81ZRq8oMSx75" for Solana sender

  Optional fields:
  dstChainTokenOutAmount: string, eg "auto"
  slippage: number, eg 0.5 for 0.5%
  additionalTakerRewardBps: number
  srcIntermediaryTokenAddress: string
  dstIntermediaryTokenAddress: string
  dstIntermediaryTokenSpenderAddress: string
  intermediaryTokenUSDPrice: number
  srcAllowedCancelBeneficiary: string
  referralCode: number
  affiliateFeePercent: number
  srcChainOrderAuthorityAddress: string
  srcChainRefundAddress: string
  dstChainOrderAuthorityAddress: string
  prependOperatingExpenses: boolean
  deBridgeApp: string`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const orderInput = JSON.parse(input) as deBridgeOrderInput;
      const result = await this.solanaKit.createDebridgeOrder(orderInput);
      return JSON.stringify({
        status: "success",
        message: "Successfully created bridge order",
        data: result,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
