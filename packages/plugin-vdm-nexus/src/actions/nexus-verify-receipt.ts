/**
 * `NEXUS_VERIFY_RECEIPT` action — run the SIR v2 five-check verifier.
 *
 * Delegates to `verifyReceipt` from `@vdm-nexus/x402`. The action takes
 * the original prompt + response (so hash checks can recompute) and
 * returns the five boolean checks. Network selection (which RPC to hit
 * for the on-chain lookup) is derived from the receipt's `payment.network`
 * field — the verifier supports Solana (`solana:…`) and Base
 * (`eip155:8453`, `eip155:84532`) automatically.
 *
 * The agent context is intentionally unused — verification is a pure
 * client-side check (plus RPC reads). Stays in the actions list so an
 * LLM agent can chain verify-after-chat without needing a separate
 * non-wallet tool surface.
 *
 * See https://docs.vdmnexus.com/docs/spec/sir-v2 for the canonical
 * verification spec.
 */

import {
  type ChatMessage,
  type NexusReceipt,
  type OpenAIChatCompletion,
  verifyReceipt,
} from "@vdm-nexus/x402";
import type { SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import type { ResolvedConfig } from "../config.js";

export const NexusVerifyReceiptSchema = z
  .object({
    receipt: z
      .unknown()
      .describe(
        "The Signed Inference Receipt (SIR v2) to verify, as returned by NEXUS_CHAT in the `receipt` field.",
      ),
    prompt: z
      .union([
        z.string(),
        z.array(
          z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
          }),
        ),
      ])
      .describe(
        "The prompt the receipt covers. For x402 chat-completion receipts, pass the `messages` array you sent. For prepaid receipts, pass the raw prompt string.",
      ),
    response: z
      .union([z.string(), z.unknown()])
      .describe(
        "The response the receipt covers. For x402 chat-completion receipts, pass the OpenAI response body. For prepaid receipts, pass the raw response string.",
      ),
    endpoint: z
      .string()
      .optional()
      .describe(
        "Optional Nexus base URL (e.g. https://nexus.vdmnexus.com). Used to fetch the operator public key if `operatorKey` is not supplied.",
      ),
    operatorKey: z
      .string()
      .optional()
      .describe(
        "Optional base58 Ed25519 operator public key. If omitted, fetched from `${endpoint}/api/v1/operator-key`.",
      ),
    rpc: z
      .string()
      .optional()
      .describe(
        "Optional RPC URL override for the on-chain check. Defaults derived from `receipt.payment.network`.",
      ),
  })
  .describe(
    "Run the five-check SIR v2 verification: prompt_hash_ok, response_hash_ok, " +
      "nexus_signature_ok, payment_on_chain_ok, payer_matches. Returns the full " +
      "check breakdown so the agent can act on partial failures.",
  );

export type NexusVerifyReceiptInput = z.infer<typeof NexusVerifyReceiptSchema>;

export function buildNexusVerifyReceiptAction(config: ResolvedConfig) {
  return {
    name: "NEXUS_VERIFY_RECEIPT",
    similes: [
      "verify receipt",
      "check signed inference",
      "audit nexus receipt",
      "validate sir v2",
      "verify nexus response",
    ],
    description:
      "Verify a VDM Nexus Signed Inference Receipt (SIR v2) end-to-end. " +
      "Runs five checks: prompt_hash_ok, response_hash_ok, " +
      "nexus_signature_ok, payment_on_chain_ok, payer_matches. Returns " +
      "the full breakdown so the agent can decide what to do on " +
      "partial failure (e.g. ignore vacuous payment checks on prepaid " +
      "receipts).",
    examples: [
      [
        {
          input: {
            receipt: { v: 2, "...": "see SIR v2 spec" },
            prompt: [
              { role: "user", content: "Summarise EIP-3009 in one sentence." },
            ],
            response: {
              id: "chatcmpl-…",
              choices: [
                { message: { role: "assistant", content: "EIP-3009 …" } },
              ],
            },
          },
          output: {
            ok: true,
            checks: {
              prompt_hash_ok: true,
              response_hash_ok: true,
              nexus_signature_ok: true,
              payment_on_chain_ok: true,
              payer_matches: true,
            },
          },
          explanation:
            "All five checks pass — the receipt cryptographically anchors the LLM response to the on-chain settlement tx.",
        },
      ],
    ],
    schema: NexusVerifyReceiptSchema,
    handler: async (
      _agent: SolanaAgentKit,
      input: Record<string, unknown>,
    ): Promise<Record<string, unknown>> => {
      try {
        const args = NexusVerifyReceiptSchema.parse(input);
        const result = await verifyReceipt({
          receipt: args.receipt as NexusReceipt,
          prompt: args.prompt as ChatMessage[] | string,
          response: args.response as OpenAIChatCompletion | string,
          endpoint: args.endpoint ?? config.endpoint,
          operatorKey: args.operatorKey ?? config.operatorKey,
          rpc: args.rpc,
        });
        return {
          status: "success",
          ok: result.ok,
          checks: result.checks,
        };
      } catch (error) {
        return {
          status: "error",
          error: "verify_failed",
          detail: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}
