import { PublicKey } from "@solana/web3.js";
import { Action } from "solana-agent-kit";
import { SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { refundClawPayEscrow } from "../tools";

const refundEscrowAction: Action = {
  name: "CLAWPAY_REFUND_ESCROW",
  similes: [
    "refund escrow",
    "get refund",
    "cancel escrow",
    "reclaim funds",
    "refund clawpay escrow",
  ],
  description:
    "Refund an expired ClawPay escrow back to the buyer. Can be called by anyone after the deadline has passed without delivery confirmation.",
  examples: [
    [
      {
        input: {
          escrowAddress: "9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT",
          buyer: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
        },
        output: {
          status: "success",
          escrowAddress: "9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT",
          signature: "3mBq...",
        },
        explanation:
          "Refund escrowed SOL to the buyer after the deadline passed",
      },
    ],
  ],
  schema: z.object({
    escrowAddress: z
      .string()
      .min(32)
      .describe("The escrow account public key (base58)"),
    buyer: z
      .string()
      .min(32)
      .describe("The buyer's Solana public key to receive the refund (base58)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await refundClawPayEscrow(
        agent,
        new PublicKey(input.escrowAddress),
        new PublicKey(input.buyer),
      );

      return {
        status: "success",
        escrowAddress: result.escrowAddress,
        signature: result.signature,
        message: `Escrow ${result.escrowAddress} refunded to buyer.`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to refund escrow: ${error.message}`,
      };
    }
  },
};

export default refundEscrowAction;
