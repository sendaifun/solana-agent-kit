import { z } from "zod";
import { Action } from "../../types/action";
import { createDebridgeBridgeOrder } from "../../tools/debridge/createBridgeOrder";
import { SolanaAgentKit } from "../../agent";

const createDebridgeBridgeOrderAction: Action = {
  name: "DEBRIDGE_CREATE_BRIDGE_ORDER",
  description:
    "Create a cross-chain bridge order using deBridge to transfer tokens between chains. Returns both the transaction data and estimated amounts.",
  similes: [
    "create bridge order",
    "bridge tokens between chains",
    "setup cross-chain transfer",
    "initiate token bridge",
    "start bridge transaction",
    "prepare bridge order",
    "transfer tokens cross-chain",
  ],
  examples: [
    [
      {
        input: {
          srcChainId: "7565164", // Solana
          srcChainTokenIn: "11111111111111111111111111111111", // Native SOL
          srcChainTokenInAmount: "1000000000", // 1 SOL (9 decimals)
          dstChainId: "1", // Ethereum
          dstChainTokenOut: "0x0000000000000000000000000000000000000000", // ETH
          dstChainTokenOutRecipient:
            "0x23C279e58ddF1018C3B9D0C224534fA2a83fb1d2", // ETH recipient
        },
        output: {
          status: "success",
          tx: {
            data: "0x...",
            to: "0x...",
            value: "0",
          },
          estimation: {
            srcChainTokenIn: {
              amount: "1000000000",
              tokenAddress: "11111111111111111111111111111111",
              decimals: 9,
              symbol: "SOL",
            },
            dstChainTokenOut: {
              amount: "0.99",
              tokenAddress: "0x0000000000000000000000000000000000000000",
              decimals: 18,
              symbol: "ETH",
            },
            fees: {
              srcChainTokenIn: "0.01",
              dstChainTokenOut: "0.01",
            },
          },
          message: "Bridge order created successfully",
        },
        explanation:
          "Create a bridge order to transfer 1 SOL from Solana to ETH on Ethereum",
      },
    ],
  ],
  schema: z.object({
    srcChainId: z.string().describe("Source chain ID (e.g., '1' for Ethereum)"),
    srcChainTokenIn: z
      .string()
      .describe(
        "Source token address (use '0x0000000000000000000000000000000000000000' for native tokens on EVM)",
      ),
    srcChainTokenInAmount: z
      .string()
      .describe("Amount of source tokens to bridge (in smallest units)"),
    dstChainId: z
      .string()
      .describe("Destination chain ID (e.g., '7565164' for Solana)"),
    dstChainTokenOut: z.string().describe("Destination token address"),
    dstChainTokenOutRecipient: z
      .string()
      .describe("Required: Recipient address on destination chain"),
    dstChainTokenOutAmount: z
      .string()
      .optional()
      .describe(
        "Optional: Expected amount of tokens to receive (default: 'auto')",
      ),
    slippage: z
      .number()
      .optional()
      .describe(
        "Optional: Slippage tolerance in percentage (e.g., 0.5 for 0.5%)",
      ),
    additionalTakerRewardBps: z
      .number()
      .optional()
      .describe("Optional: Additional taker reward in basis points"),
    srcIntermediaryTokenAddress: z
      .string()
      .optional()
      .describe("Optional: Source chain intermediary token address"),
    dstIntermediaryTokenAddress: z
      .string()
      .optional()
      .describe("Optional: Destination chain intermediary token address"),
    dstIntermediaryTokenSpenderAddress: z
      .string()
      .optional()
      .describe(
        "Optional: Destination chain intermediary token spender address",
      ),
    intermediaryTokenUSDPrice: z
      .number()
      .optional()
      .describe("Optional: USD price of intermediary token"),
    srcAllowedCancelBeneficiary: z
      .string()
      .optional()
      .describe("Optional: Fixed recipient for cancelled orders"),
    referralCode: z
      .number()
      .optional()
      .describe("Optional: Referral code for earning deBridge points"),
    affiliateFeePercent: z
      .number()
      .optional()
      .describe("Optional: Affiliate fee percentage"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      // Get the agent's wallet address
      const walletAddress = agent.wallet.publicKey.toBase58();

      const response = await createDebridgeBridgeOrder({
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
        dstIntermediaryTokenSpenderAddress:
          input.dstIntermediaryTokenSpenderAddress,
        intermediaryTokenUSDPrice: input.intermediaryTokenUSDPrice,
        srcAllowedCancelBeneficiary: input.srcAllowedCancelBeneficiary,
        referralCode: input.referralCode,
        affiliateFeePercent: input.affiliateFeePercent,
      });

      return {
        status: "success",
        ...response,
        message: "Bridge order created successfully",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create bridge order: ${error.message}`,
      };
    }
  },
};

export default createDebridgeBridgeOrderAction;
