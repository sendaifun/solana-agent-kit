import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { updatePolicy } from "../tools";

const updatePolicyAction: Action = {
  name: "ONLEASH_UPDATE_POLICY",
  similes: [
    "update spending policy",
    "change transfer limits",
    "update allowlist",
    "raise daily cap",
    "lower per tx limit",
  ],
  description:
    "Update the Onleash policy for a protected mint. Only the policy authority " +
    "(the wallet that created the mint) can call this. Pass null for fields to leave unchanged.",
  examples: [
    [
      {
        input: {
          mint: "2KkYRVS2cBnneryveAYxH5hGfnNhdFruXAc4NjeAekcZ",
          dailyCap: "100000000",
        },
        output: {
          status: "success",
          signature: "5UfgJ5vVZxUxefDGqzqkVLHzHxVTyYH9StYyHKgvHYmXJgq",
          message: "Policy updated: daily cap raised to 100000000",
        },
        explanation: "Raise the daily cap to 100 tokens (100000000 at 6 dp).",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().min(32).describe("The protected mint address to update."),
    perTxMax: z
      .string()
      .optional()
      .describe("New per-tx max in raw units. Omit to leave unchanged."),
    dailyCap: z
      .string()
      .optional()
      .describe("New daily cap in raw units. Omit to leave unchanged."),
    allowlist: z
      .array(z.string().min(32))
      .max(8)
      .optional()
      .describe(
        "New full allowlist (replaces existing). Omit to leave unchanged.",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const result = await updatePolicy(agent, {
      mint: input.mint,
      perTxMax: input.perTxMax != null ? BigInt(input.perTxMax) : null,
      dailyCap: input.dailyCap != null ? BigInt(input.dailyCap) : null,
      allowlist: input.allowlist ?? null,
    });
    return {
      status: "success",
      ...result,
      message: `Policy updated for mint ${input.mint}.`,
    };
  },
};

export default updatePolicyAction;
