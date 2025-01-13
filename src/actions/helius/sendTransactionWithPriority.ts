import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { sendTransactionWithPriorityFee } from "../../tools/helius";
import { PublicKey } from "@solana/web3.js";

const sendTransactionWithPriorityFeeAction: Action = {
  name: "SEND_TRANSACTION_WITH_PRIORITY_FEE",
  similes: [
    "send SOL with fee",
    "transfer tokens with priority",
    "execute priority transaction",
  ],
  description:
    "Sends SOL or SPL tokens from a wallet with an estimated priority fee, ensuring faster processing on the Solana network.",
  examples: [
    [
      {
        input: {
          priorityLevel: "High",
          amount: 2,
          to: "BVdNLvyG2DNiWAXBE9qAmc4MTQXymd5Bzfo9xrQSUzVP",
          splmintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          transactionId: "5Xgq9xVABhwXpNStWpfqxS6Vm5Eau91pjfeHNwJbRgis",
          fee: 5000,
          message: "Transaction sent with priority fee successfully.",
        },
        explanation:
          "Sends 2 USDC to BVdNLvyG2DNiWAXBE9qAmc4MTQXymd5Bzfo9xrQSUzVP with High priority fee option.",
      },
    ],
  ],
  schema: z.object({
    priorityLevel: z
      .enum(["Min", "Low", "Medium", "High", "VeryHigh", "UnsafeMax"])
      .describe("Priority level to determine the urgency of the transaction."),
    amount: z
      .number()
      .positive()
      .describe("Amount of SOL or SPL tokens to send."),
    to: z.string().describe("Recipient's PublicKey."),
    splmintAddress: z
      .string()
      .optional()
      .describe(
        "Optional SPL token address, if transferring tokens other than SOL.",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const { priorityLevel, amount, to, splmintAddress } = input;
    const toPublicKey = new PublicKey(to);
    const splmintPublicKey = splmintAddress
      ? new PublicKey(splmintAddress)
      : undefined;

    const result = await sendTransactionWithPriorityFee(
      agent,
      priorityLevel,
      amount,
      toPublicKey,
      splmintPublicKey,
    );

    return {
      status: "success",
      transactionId: result.transactionId,
      fee: result.fee,
      message: "Transaction sent with priority fee successfully.",
    };
  },
};

export default sendTransactionWithPriorityFeeAction;
