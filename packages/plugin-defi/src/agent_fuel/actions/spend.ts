import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { agentFuelSpend } from "../tools";

const agentFuelSpendAction: Action = {
  name: "AGENT_FUEL_SPEND",
  similes: [
    "pay through agent fuel",
    "spend from agent vault",
    "x402 payment",
    "pay service from vault",
    "use credit vault",
    "agent fuel spend",
  ],
  description:
    "Pay a service through an Agent Fuel credit vault. The owner-funded vault " +
    "enforces per-tx / hourly / lifetime caps on-chain and the spend is " +
    "attributable to a specific AI-agent identity that accrues reputation. " +
    "Use this when the agent needs to settle an x402-style micropayment to a " +
    "paid API or downstream service.",
  examples: [
    [
      {
        input: {
          service: "djdQXvhpKZ4QaqKMaG2qfETnvNzWuvKKkSLPb3rHBmgL",
          amountUsdc: 10000,
        },
        output: {
          status: "success",
          signature: "5fzGq...",
          message: "Paid 0.01 USDC to service djdQXv… via Agent Fuel",
        },
        explanation:
          "Pay 0.01 USDC (10000 micro-USDC) to the named service from the agent's vault",
      },
    ],
  ],
  schema: z.object({
    service: z
      .string()
      .min(32)
      .max(64)
      .describe("Service pubkey (base58) to receive payment"),
    amountUsdc: z
      .number()
      .int()
      .positive()
      .describe(
        "Amount in micro-USDC. 1 USDC = 1_000_000. Must clear the vault's per-tx cap.",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { signature } = await agentFuelSpend(
        agent,
        input.service as string,
        input.amountUsdc as number,
      );
      return {
        status: "success",
        signature,
        message: `Paid ${(input.amountUsdc / 1_000_000).toFixed(6)} USDC to ${input.service} via Agent Fuel`,
      };
    } catch (err: any) {
      return {
        status: "error",
        message: err?.message ?? String(err),
      };
    }
  },
};

export default agentFuelSpendAction;
