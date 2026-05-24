/**
 * `NEXUS_GET_DEPOSIT_ADDRESS` action — discover the on-chain destination
 * the agent should send USDC to in order to top up its prepaid credit
 * balance on a Nexus deployment.
 *
 * Wraps `GET /api/v1/deposit-address`. This is the off-band funding
 * path for agents that prefer batching deposits over per-call x402
 * settlement (the credit ledger amortizes RPC + facilitator overhead
 * across N calls). Per-call x402 via NEXUS_CHAT does NOT require this
 * — it settles inline.
 */

import type { SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import type { ResolvedConfig } from "../config.js";

export const NexusGetDepositAddressSchema = z
  .object({
    network: z
      .string()
      .optional()
      .describe(
        'Optional CAIP-2 network override (e.g. "solana:mainnet", "eip155:8453"). Omit to use the endpoint default.',
      ),
  })
  .describe(
    "Returns the USDC deposit address agents should send funds to in order to top up their prepaid credit balance on a Nexus deployment.",
  );

export type NexusDepositAddressResponse = {
  address: string;
  mint: string;
  network: string;
};

export type NexusGetDepositAddressInput = z.infer<
  typeof NexusGetDepositAddressSchema
>;

export function buildNexusGetDepositAddressAction(config: ResolvedConfig) {
  return {
    name: "NEXUS_GET_DEPOSIT_ADDRESS",
    similes: [
      "get nexus deposit address",
      "topup address",
      "nexus credit topup",
      "fund nexus balance",
      "deposit usdc to nexus",
    ],
    description:
      "Fetch the on-chain USDC deposit address for topping up an " +
      "agent's prepaid credit balance on a VDM Nexus deployment. " +
      "Per-call x402 settlement (NEXUS_CHAT) does NOT require this — " +
      "it settles inline. Use this when batching deposits is cheaper " +
      "than per-call settlement.",
    examples: [
      [
        {
          input: { network: "solana:mainnet" },
          output: {
            ok: true,
            address: "<base58 pubkey>",
            mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            network: "solana:mainnet",
          },
          explanation:
            "Send USDC to `address` on the indicated network. The 2-minute deposit cron credits the ledger keyed by the sender's pubkey.",
        },
      ],
    ],
    schema: NexusGetDepositAddressSchema,
    handler: async (
      _agent: SolanaAgentKit,
      input: Record<string, unknown>,
    ): Promise<Record<string, unknown>> => {
      try {
        const args = NexusGetDepositAddressSchema.parse(input);
        const base = config.endpoint.replace(/\/$/, "");
        const qs = args.network
          ? `?network=${encodeURIComponent(args.network)}`
          : "";
        const url = `${base}/deposit-address${qs}`;

        const r = await fetch(url);
        if (!r.ok) {
          return {
            status: "error",
            error: "deposit_address_fetch_failed",
            httpStatus: r.status,
          };
        }
        const body = (await r.json()) as NexusDepositAddressResponse;
        return {
          status: "success",
          address: body.address,
          mint: body.mint,
          network: body.network,
        };
      } catch (error) {
        return {
          status: "error",
          error: "deposit_address_fetch_failed",
          detail: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}
