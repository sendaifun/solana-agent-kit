import { PublicKey } from "@solana/web3.js";
import { Action } from "solana-agent-kit";
import { SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { createClawPayEscrow } from "../tools";

const createEscrowAction: Action = {
  name: "CLAWPAY_CREATE_ESCROW",
  similes: [
    "create escrow",
    "lock funds in escrow",
    "escrow payment",
    "pay with escrow",
    "trustless payment",
    "create clawpay escrow",
  ],
  description:
    "Create a new ClawPay escrow to lock SOL for a trustless agent-to-agent payment. Funds are locked until the seller delivers and the buyer verifies, with auto-refund if the deadline passes.",
  examples: [
    [
      {
        input: {
          seller: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          amount: 0.5,
          deadline: 3600,
          description: "Scrape 1000 product listings from target website",
        },
        output: {
          status: "success",
          escrowAddress: "9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT",
          signature: "4nGz...",
        },
        explanation:
          "Create an escrow locking 0.5 SOL for a data scraping service, with a 1-hour deadline",
      },
    ],
  ],
  schema: z.object({
    seller: z
      .string()
      .min(32)
      .describe("The seller agent's Solana public key (base58)"),
    amount: z
      .number()
      .positive()
      .describe("Amount of SOL to lock in escrow"),
    deadline: z
      .number()
      .positive()
      .describe("Deadline in seconds from now for the seller to deliver"),
    description: z
      .string()
      .min(1)
      .describe("Description of the service being purchased"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const result = await createClawPayEscrow(
        agent,
        new PublicKey(input.seller),
        input.amount,
        input.deadline,
        input.description,
      );

      return {
        status: "success",
        escrowAddress: result.escrowAddress,
        signature: result.signature,
        message: `Escrow created: ${result.escrowAddress}. ${input.amount} SOL locked for "${input.description}". Deadline: ${input.deadline}s.`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create escrow: ${error.message}`,
      };
    }
  },
};

export default createEscrowAction;
