/**
 * `NEXUS_CHAT` action — pay-per-call signed inference via x402.
 *
 * Runs the standard x402 two-roundtrip handshake against a Nexus
 * `/chat/completions` endpoint, paid in USDC from the agent's Ed25519
 * keypair, and returns the OpenAI chat completion plus the SIR v2 signed
 * receipt.
 *
 * The Solana Agent Kit `BaseWallet` interface does NOT expose the raw
 * secret-key bytes (by design — hardware/browser wallets can plug in too).
 * x402 SVM payment-payload construction needs raw bytes to sign the SPL
 * USDC transfer, so this plugin requires an explicit `signerSecretKey`
 * (base58, 64-byte tweetnacl secret) on the plugin config — the same
 * secret used to construct the SendAI `KeypairWallet`. The wallet's
 * pubkey is asserted to match the signer pubkey at handler time so the
 * agent identity cannot accidentally diverge from the SendAI wallet.
 */

import { X402Agent } from "@vdm-nexus/x402";
import type { SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import type { ResolvedConfig } from "../config.js";

export const NexusChatSchema = z
  .object({
    model: z
      .string()
      .describe(
        'OpenRouter-style model slug (e.g. "openai/gpt-4o-mini", "anthropic/claude-3-haiku").',
      ),
    messages: z
      .array(
        z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        }),
      )
      .min(1)
      .describe("OpenAI-shape chat messages array."),
    network: z
      .string()
      .optional()
      .describe(
        'Optional CAIP-2 settlement network override (e.g. "solana:mainnet", "solana:devnet", "eip155:8453"). Omit to use the server default.',
      ),
  })
  .describe(
    "Pay-per-call signed inference against a VDM Nexus endpoint. " +
      "Returns the OpenAI chat completion plus a Signed Inference Receipt (SIR v2) " +
      "that anchors the inference to an on-chain USDC payment.",
  );

export type NexusChatInput = z.infer<typeof NexusChatSchema>;

export function buildNexusChatAction(config: ResolvedConfig) {
  return {
    name: "NEXUS_CHAT",
    similes: [
      "signed inference",
      "verifiable llm call",
      "pay-per-call chat",
      "x402 chat completion",
      "nexus chat completion",
    ],
    description:
      "Run a paid inference call against VDM Nexus. Settles a USDC " +
      "payment inline via x402 on Solana (or Base), runs the inference " +
      "upstream, and returns the OpenAI chat completion alongside a " +
      "Signed Inference Receipt (SIR v2) anchored to the on-chain " +
      "settlement tx. Use whenever the caller wants a verifiable " +
      "audit trail for an LLM response.",
    examples: [
      [
        {
          input: {
            model: "openai/gpt-4o-mini",
            messages: [
              { role: "user", content: "Summarise EIP-3009 in one sentence." },
            ],
          },
          output: {
            ok: true,
            openai: {
              id: "chatcmpl-…",
              object: "chat.completion",
              choices: [
                {
                  index: 0,
                  message: { role: "assistant", content: "EIP-3009 …" },
                  finish_reason: "stop",
                },
              ],
            },
            receipt: { v: 2, "...": "see SIR v2 spec" },
          },
          explanation:
            "Settles 0.01 USDC inline, runs the chat completion, returns the receipt.",
        },
      ],
    ],
    schema: NexusChatSchema,
    handler: async (
      agent: SolanaAgentKit,
      input: Record<string, unknown>,
    ): Promise<Record<string, unknown>> => {
      try {
        const args = NexusChatSchema.parse(input);

        if (!config.signerSecretKey) {
          return {
            status: "error",
            error: "missing_signer_secret_key",
            detail:
              "VdmNexusPlugin config is missing `signerSecretKey`. " +
              "Pass the same base58 64-byte secret you used to construct " +
              "your SolanaAgentKit KeypairWallet — the SendAI BaseWallet " +
              "interface does not expose secret bytes, and x402 SVM " +
              "settlement needs them to sign the SPL transfer.",
          };
        }

        // Agent identity guard — the SendAI wallet pubkey MUST match the
        // pubkey of the x402 signer secret. If they diverge, the on-chain
        // payment will land from a different address than the wallet the
        // SendAI agent thinks it owns, which breaks the audit trail.
        const agentWalletPubkey = agent.wallet.publicKey.toBase58();
        const x402 = X402Agent.fromBase58(config.signerSecretKey);
        if (x402.pubkey !== agentWalletPubkey) {
          return {
            status: "error",
            error: "wallet_signer_mismatch",
            detail:
              `Configured x402 signerSecretKey corresponds to ${x402.pubkey} ` +
              `but the SolanaAgentKit wallet is ${agentWalletPubkey}. ` +
              "Pass the same secret you used to construct your KeypairWallet.",
          };
        }

        const result = await x402.payAndInfer(config.endpoint, {
          model: args.model,
          messages: args.messages,
          ...(args.network ? { network: args.network } : {}),
        });

        return {
          status: "success",
          openai: result.openai,
          receipt: result.receipt,
          payment: result.payment,
        };
      } catch (error) {
        return {
          status: "error",
          error: "nexus_chat_failed",
          detail: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}
