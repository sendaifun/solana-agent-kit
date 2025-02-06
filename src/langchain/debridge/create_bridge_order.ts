import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { BridgeOrderInput } from "../../types";

export class CreateBridgeOrderTool extends Tool {
  name = "create_bridge_order";
  description = `Creates a new bridge order for cross-chain token transfers.
    Input should be a JSON string with the following properties:
    - srcChainId: Source chain ID (e.g., "1" for Ethereum, "7565164" for Solana)
    - srcChainTokenIn: Input token address
    - srcChainTokenInAmount: Amount to swap
    - dstChainId: Destination chain ID
    - dstChainTokenOut: Target token address
    Optional properties:
    - dstChainTokenOutAmount: Expected output amount (defaults to "auto")
    - slippage: Slippage tolerance
    - dstChainTokenOutRecipient: Recipient address on destination chain
    - senderAddress: Source chain sender address

    Chain-specific considerations:
    - EVM to EVM: Use EVM addresses for recipients and tokens
    - To Solana: Use base58 addresses for recipients and token mints
    - From Solana: Use EVM addresses for recipients, ERC-20 format for tokens`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const orderInput: BridgeOrderInput = JSON.parse(input);
      const result = await this.solanaKit.createBridgeOrder(orderInput);
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
