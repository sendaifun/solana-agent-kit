import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { checkDestination, checkDestinationOnChain } from "../tools";

const checkDestinationAction: Action = {
  name: "CHECK_DESTINATION_SAFETY",
  description:
    "Validate a transfer destination address before sending SOL or SPL tokens to it. Catches costly, unrecoverable mistakes: invalid / non-canonical pubkeys, addresses not on the ed25519 curve (no signer can ever move the funds), known program / system / burn addresses, and — when on-chain checks are enabled — non-existent destinations or sending to an SPL mint account. Returns a structured verdict (allow/warn/halt). Fail-safe: unparseable or unknown input never returns a clean allow. Use this as a pre-flight before any transfer.",
  similes: [
    "is this address safe to send to",
    "validate a recipient address before transfer",
    "check transfer destination",
    "pre-flight a payout address",
    "verify wallet address before sending SOL",
  ],
  examples: [
    [
      {
        input: {
          address: "7oDgMfFRHyVVP7YQT6Kywe2Uj37rKWkpThFMpGQBzxyG",
        },
        output: {
          status: "success",
          ok: true,
          verdict: "allow",
          flags: [],
          summary:
            "✅ 7oDgMfFRHyVVP7YQT6Kywe2Uj37rKWkpThFMpGQBzxyG looks like a normal, signable wallet address",
        },
        explanation:
          "A normal wallet address with no on-chain lookup passes the static safety check",
      },
    ],
    [
      {
        input: {
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
        output: {
          status: "success",
          ok: false,
          verdict: "halt",
          flags: [
            {
              code: "KNOWN_PROGRAM_ADDRESS",
              severity: "halt",
              message:
                "destination is the SPL Token Program; transferring funds here is almost certainly a mistake and likely unrecoverable",
            },
          ],
          summary: "⛔ unsafe destination (1 issue) — do not send",
        },
        explanation:
          "Transferring to a well-known program address is flagged as a halt",
      },
    ],
    [
      {
        input: {
          address: "So11111111111111111111111111111111111111112",
          onChain: true,
        },
        output: {
          status: "success",
          ok: false,
          verdict: "halt",
          flags: [
            {
              code: "DESTINATION_IS_MINT",
              severity: "halt",
              message:
                "destination is an SPL token MINT account; sending SOL or tokens to a mint is a classic, unrecoverable loss",
            },
          ],
          summary: "⛔ unsafe destination (1 issue) — do not send",
        },
        explanation:
          "With on-chain checks enabled, sending to a mint account is halted",
      },
    ],
  ],
  schema: z.object({
    address: z
      .string()
      .describe("The destination wallet address (base58) to validate"),
    isNativeSol: z
      .boolean()
      .optional()
      .describe(
        "Whether the planned transfer is native SOL (vs an SPL token). Defaults to true.",
      ),
    onChain: z
      .boolean()
      .optional()
      .describe(
        "If true, also run RPC enrichment (mint / non-existent / token-account checks) using the agent connection. Defaults to false (offline static check only).",
      ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { address, isNativeSol, onChain } = input;
      const opts = { isNativeSol };
      const result = onChain
        ? await checkDestinationOnChain(agent, address, opts)
        : checkDestination(address, opts);

      return {
        status: "success",
        ...result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to check destination safety: ${error.message}`,
        code: error.code || "CHECK_DESTINATION_SAFETY_FAILED",
      };
    }
  },
};

export default checkDestinationAction;
