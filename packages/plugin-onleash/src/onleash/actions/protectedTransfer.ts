import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { protectedTransfer } from "../tools";

const protectedTransferAction: Action = {
  name: "ONLEASH_PROTECTED_TRANSFER",
  similes: [
    "send protected tokens",
    "transfer policy-protected tokens",
    "onleash transfer",
    "transfer with spending limits",
  ],
  description:
    "Transfer tokens from a policy-protected Onleash mint. " +
    "The on-chain hook validates destination, per-tx max, and daily cap before settling. " +
    "Any policy violation reverts the entire transaction atomically — funds are never moved.",
  examples: [
    [
      {
        input: {
          mint: "2KkYRVS2cBnneryveAYxH5hGfnNhdFruXAc4NjeAekcZ",
          source: "3qHDnLYazYYbhhUHb1ZAAg2tJPrFqPCMfShiEyGsDWtn",
          destination: "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk",
          amount: "5000000",
          decimals: 6,
        },
        output: {
          status: "success",
          signature: "2QAvoByj2EZUeL5SZXSNKMkSe6bgFyGmxLDdb92LHrEK",
          message: "Transfer of 5000000 raw units completed successfully",
        },
        explanation: "Transfer 5 tokens (5000000 at 6 dp) to an approved destination.",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().min(32).describe("The policy-protected mint address."),
    source: z.string().min(32).describe("Source token account address."),
    destination: z.string().min(32).describe("Destination token account address. Must be in the policy allowlist."),
    amount: z.string().describe("Amount in raw token units (e.g. '5000000' = 5 tokens at 6 decimals)."),
    decimals: z.number().int().min(0).max(9).describe("Mint decimals."),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const result = await protectedTransfer(agent, {
      mint: input.mint,
      source: input.source,
      destination: input.destination,
      amount: BigInt(input.amount),
      decimals: input.decimals,
    });
    return {
      status: "success",
      ...result,
      message: `Transfer of ${input.amount} raw units completed. Signature: ${result.signature}`,
    };
  },
};

export default protectedTransferAction;
