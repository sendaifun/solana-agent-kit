import { z } from "zod";
import { Action } from "../../types/action";
import { createBridgeOrder } from "../../tools/debridge/createBridgeOrder";
import { SolanaAgentKit } from "../../agent";

const createBridgeOrderAction: Action = {
  name: "CREATE_BRIDGE_ORDER",
  description: "Create a bridge order to transfer tokens between chains. Returns both the transaction data and estimated amounts.",
  similes: [
    "create bridge order",
    "bridge tokens between chains",
    "setup cross-chain transfer",
    "initiate token bridge",
    "start bridge transaction",
    "prepare bridge order",
    "transfer tokens cross-chain"
  ],
  examples: [
    [
      {
        input: {
          srcChainId: "1",
          srcChainTokenIn: "0x0000000000000000000000000000000000000000",
          srcChainTokenInAmount: "1000000000000000000",
          dstChainId: "7565164",
          dstChainTokenOut: "DBRiDgJAMsM95moTzJs7M9LnkGErpbv9v6CUR1DXnUu5",
          dstChainTokenOutRecipient: "DYw8jCTfwHNRJhhmFcbXvVDXqmHZiPXQXqTOsPcZN1Nm"
        },
        output: {
          status: "success",
          tx: {
            data: "0x23b872dd000000000000000000000000742d35cc6634c0532925a3b844bc454e4438f44e000000000000000000000000e7351fd770a37282b91d153ee690b63579b6e837000000000000000000000000000000000000000000000000000de0b6b3a7640000",
            to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            value: "0"
          },
          estimation: {
            srcChainTokenIn: {
              amount: "1000000000000000000",
              tokenAddress: "0x0000000000000000000000000000000000000000",
              decimals: 18,
              symbol: "ETH"
            },
            dstChainTokenOut: {
              amount: "50000000",
              tokenAddress: "DBRiDgJAMsM95moTzJs7M9LnkGErpbv9v6CUR1DXnUu5",
              decimals: 6,
              symbol: "DBR"
            },
            fees: {
              srcChainTokenIn: "10000000000000000",
              dstChainTokenOut: "500000"
            }
          },
          message: "Successfully created bridge order from ETH to DBR"
        },
        explanation: "Create a bridge order to transfer 1 ETH from Ethereum to DBR on Solana"
      }
    ]
  ],
  schema: z.object({
    srcChainId: z.string().describe("Source chain ID (e.g., '1' for Ethereum)"),
    srcChainTokenIn: z.string().describe("Source token address (use '0x0000000000000000000000000000000000000000' for native tokens on EVM)"),
    srcChainTokenInAmount: z.string().describe("Amount of source tokens to bridge (in smallest units)"),
    dstChainId: z.string().describe("Destination chain ID (e.g., '7565164' for Solana)"),
    dstChainTokenOut: z.string().describe("Destination token address"),
    dstChainTokenOutRecipient: z.string().describe("Required: Recipient address on destination chain"),
    dstChainTokenOutAmount: z.string().optional().describe("Optional: Expected amount of tokens to receive (default: 'auto')"),
    slippage: z.number().optional().describe("Optional: Slippage tolerance in percentage (e.g., 0.5 for 0.5%)"),
    additionalTakerRewardBps: z.number().optional().describe("Optional: Additional taker reward in basis points"),
    srcIntermediaryTokenAddress: z.string().optional().describe("Optional: Source chain intermediary token address"),
    dstIntermediaryTokenAddress: z.string().optional().describe("Optional: Destination chain intermediary token address"),
    dstIntermediaryTokenSpenderAddress: z.string().optional().describe("Optional: Destination chain intermediary token spender address"),
    intermediaryTokenUSDPrice: z.number().optional().describe("Optional: USD price of intermediary token"),
    srcAllowedCancelBeneficiary: z.string().optional().describe("Optional: Fixed recipient for cancelled orders"),
    referralCode: z.number().optional().describe("Optional: Referral code for earning deBridge points"),
    affiliateFeePercent: z.number().optional().describe("Optional: Affiliate fee percentage")
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      // Get the agent's wallet address
      const walletAddress = agent.wallet.publicKey.toBase58();
      
      const response = await createBridgeOrder({
        srcChainId: input.srcChainId,
        srcChainTokenIn: input.srcChainTokenIn,
        srcChainTokenInAmount: input.srcChainTokenInAmount,
        dstChainId: input.dstChainId,
        dstChainTokenOut: input.dstChainTokenOut,
        dstChainTokenOutRecipient: input.dstChainTokenOutRecipient,
        account: walletAddress, // Use the agent's wallet address
        dstChainTokenOutAmount: input.dstChainTokenOutAmount,
        slippage: input.slippage,
        additionalTakerRewardBps: input.additionalTakerRewardBps,
        srcIntermediaryTokenAddress: input.srcIntermediaryTokenAddress,
        dstIntermediaryTokenAddress: input.dstIntermediaryTokenAddress,
        dstIntermediaryTokenSpenderAddress: input.dstIntermediaryTokenSpenderAddress,
        intermediaryTokenUSDPrice: input.intermediaryTokenUSDPrice,
        srcAllowedCancelBeneficiary: input.srcAllowedCancelBeneficiary,
        referralCode: input.referralCode,
        affiliateFeePercent: input.affiliateFeePercent
      });

      // Get token symbols for better message
      const srcSymbol = response.estimation.srcChainTokenIn.symbol;
      const dstSymbol = response.estimation.dstChainTokenOut.symbol;

      return {
        status: "success",
        tx: response.tx,
        estimation: response.estimation,
        message: `Successfully created bridge order from ${srcSymbol} to ${dstSymbol}`
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create bridge order: ${error.message}`
      };
    }
  }
};

export default createBridgeOrderAction;
