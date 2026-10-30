import { Action } from "solana-agent-kit";
import { z } from "zod";
import { rampartSpend } from "../tools";

const rampartSpendAction: Action = {
  name: "RAMPART_SPEND",
  description:
    "Build a spend intent routed through a Rampart policy vault on Solana devnet. The vault enforces a destination allowlist, per-transaction USD cap, per-epoch USD cap, and a Pyth price band before lamports move. Returns a refusal when policy says no. Gate and release only: no token, no mainnet, no audit, no swap execution.",
  similes: [
    "Spend through Rampart vault",
    "Route a spend intent through the Rampart policy vault",
  ],
  examples: [
    [
      {
        explanation: "Build a spend intent for a devnet Rampart vault.",
        input: { destination: "SomeBase58Pubkey", amountUsd: 10 },
        output: { status: "interface_only" },
      },
    ],
  ],
  schema: z.object({
    destination: z.string().nonempty(),
    amountUsd: z.number().positive(),
    epochId: z.string().optional(),
  }),
  handler: async (agent, input: Record<string, any>) => {
    try {
      const result = await rampartSpend(agent, {
        destination: input.destination as string,
        amountUsd: input.amountUsd as number,
        epochId: input.epochId as string | undefined,
      });
      return { status: "success", data: result };
    } catch (error: any) {
      return { status: "error", message: error?.message || "Unknown error" };
    }
  },
};

export default rampartSpendAction;
