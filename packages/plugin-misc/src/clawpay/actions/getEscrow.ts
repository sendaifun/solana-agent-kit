import { PublicKey } from "@solana/web3.js";
import { Action } from "solana-agent-kit";
import { SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { getClawPayEscrow } from "../tools";

const getEscrowAction: Action = {
  name: "CLAWPAY_GET_ESCROW",
  similes: [
    "check escrow",
    "get escrow status",
    "escrow details",
    "view escrow",
    "check clawpay escrow",
  ],
  description:
    "Get the current status and details of a ClawPay escrow account, including buyer, seller, amount, state, and deadline.",
  examples: [
    [
      {
        input: {
          escrowAddress: "9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT",
        },
        output: {
          status: "success",
          escrowAddress: "9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT",
          buyer: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
          seller: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          amount: 0.5,
          state: "Funded",
          deadline: 1711929600,
        },
        explanation: "Check the status of an escrow account",
      },
    ],
  ],
  schema: z.object({
    escrowAddress: z
      .string()
      .min(32)
      .describe("The escrow account public key (base58)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await getClawPayEscrow(
        agent,
        new PublicKey(input.escrowAddress),
      );

      return {
        status: "success",
        escrowAddress: result.escrowAddress,
        buyer: result.buyer,
        seller: result.seller,
        amount: result.amount,
        state: result.state,
        deadline: result.deadline,
        message: `Escrow ${result.escrowAddress}: ${result.amount} SOL, state: ${result.state}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get escrow: ${error.message}`,
      };
    }
  },
};

export default getEscrowAction;
