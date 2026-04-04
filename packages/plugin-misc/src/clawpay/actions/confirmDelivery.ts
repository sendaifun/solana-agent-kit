import { PublicKey } from "@solana/web3.js";
import { Action } from "solana-agent-kit";
import { SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { confirmClawPayDelivery } from "../tools";

const confirmDeliveryAction: Action = {
  name: "CLAWPAY_CONFIRM_DELIVERY",
  similes: [
    "confirm delivery",
    "mark delivered",
    "delivery complete",
    "service delivered",
    "confirm clawpay delivery",
  ],
  description:
    "Confirm delivery of a service as the seller in a ClawPay escrow. This signals to the buyer that the work is done and ready for verification.",
  examples: [
    [
      {
        input: {
          escrowAddress: "9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT",
        },
        output: {
          status: "success",
          escrowAddress: "9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT",
          signature: "2nRx...",
        },
        explanation:
          "Seller confirms that the service has been delivered",
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
      const result = await confirmClawPayDelivery(
        agent,
        new PublicKey(input.escrowAddress),
      );

      return {
        status: "success",
        escrowAddress: result.escrowAddress,
        signature: result.signature,
        message: `Delivery confirmed for escrow ${result.escrowAddress}. Waiting for buyer to release funds.`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to confirm delivery: ${error.message}`,
      };
    }
  },
};

export default confirmDeliveryAction;
