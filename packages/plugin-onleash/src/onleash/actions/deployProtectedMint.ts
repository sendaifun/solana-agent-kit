import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { deployProtectedMint } from "../tools";

const deployProtectedMintAction: Action = {
  name: "ONLEASH_DEPLOY_PROTECTED_MINT",
  similes: [
    "create policy-protected token",
    "deploy onleash mint",
    "create transfer hook mint",
    "protect agent wallet",
    "create spending-limited token",
  ],
  description:
    "Create a Token-2022 mint with an Onleash transfer hook. Every transfer of this mint is " +
    "checked on-chain against: (1) a destination allowlist, (2) a per-tx max, and " +
    "(3) a daily cap. A jailbroken agent cannot bypass these — the chain enforces them. " +
    "Returns the mint address, policy PDA, and transaction signatures.",
  examples: [
    [
      {
        input: {
          decimals: 6,
          perTxMax: "10000000",
          dailyCap: "50000000",
          allowlist: ["8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk"],
        },
        output: {
          status: "success",
          mint: "2KkYRVS2cBnneryveAYxH5hGfnNhdFruXAc4NjeAekcZ",
          policy: "DEnvhrXrmmFGkg9SMBYM2x1fopewoQBiQUXADQzi54jV",
          message: "Protected mint deployed successfully",
        },
        explanation:
          "Deploy a policy-protected mint: 10 tokens per tx, 50 tokens per day, " +
          "one approved destination.",
      },
    ],
  ],
  schema: z.object({
    decimals: z
      .number()
      .int()
      .min(0)
      .max(9)
      .describe("Mint decimals (0–9). Use 6 for USDC-style."),
    perTxMax: z
      .string()
      .describe(
        "Per-transfer max in raw token units as a string (e.g. '10000000' = 10 tokens at 6 decimals).",
      ),
    dailyCap: z
      .string()
      .describe(
        "Daily cumulative cap in raw units (24h rolling window). Same unit as perTxMax.",
      ),
    allowlist: z
      .array(z.string().min(32))
      .max(8)
      .describe(
        "Up to 8 approved destination token-account pubkeys. Transfers to any other address revert.",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const result = await deployProtectedMint(agent, {
      decimals: input.decimals,
      perTxMax: BigInt(input.perTxMax),
      dailyCap: BigInt(input.dailyCap),
      allowlist: input.allowlist,
    });
    return {
      status: "success",
      ...result,
      message: `Protected mint deployed: ${result.mint}. Policy enforces per-tx max ${input.perTxMax}, daily cap ${input.dailyCap}, ${input.allowlist.length} approved destination(s).`,
    };
  },
};

export default deployProtectedMintAction;
