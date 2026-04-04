import { PublicKey } from "@solana/web3.js";
import { Action } from "solana-agent-kit";
import { SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { releaseClawPayEscrow } from "../tools";

const releaseEscrowAction: Action = {
  name: "CLAWPAY_RELEASE_ESCROW",
  similes: [
    "release escrow",
    "release funds",
    "approve payment",
    "confirm and pay",
    "release clawpay escrow",
  ],
  description:
    "Release funds from a ClawPay escrow to the seller after verifying delivery. Only the buyer can release funds.",
  examples: [
    [
      {
        input: {
          escrowAddress: "9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT",
          seller: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        },
        output: {
          status: "success",
          escrowAddress: "9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT",
          signature: "5kPz...",
        },
        explanation: "Release escrowed SOL to the seller after delivery",
      },
    ],
  ],
  schema: z.object({
    escrowAddress: z
      .string()
      .min(32)
      .describe("The escrow account public key (base58)"),
    seller: z
      .string()
      .min(32)
      .describe("The seller's Solana public key to receive funds (base58)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await releaseClawPayEscrow(
        agent,
        new PublicKey(input.escrowAddress),
        new PublicKey(input.seller),
      );

      return {
        status: "success",
        escrowAddress: result.escrowAddress,
        signature: result.signature,
        message: `Funds released from escrow ${result.escrowAddress} to seller.`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to release escrow: ${error.message}`,
      };
    }
  },
};

export default releaseEscrowAction;
