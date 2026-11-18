import type { Action } from "solana-agent-kit";
import { z } from "zod";
import { rentshieldScanWallet } from "../tools";

const rentshieldScanWalletAction: Action = {
  name: "RENTSHIELD_SCAN_WALLET_RENT",
  similes: [
    "scan unclaimed solana rent",
    "check empty token accounts",
    "preview reclaimable ata rent",
    "find locked sol rent",
  ],
  description:
    "Read-only, non-custodial scan for reclaimable rent-exempt SOL locked in empty SPL and Token-2022 Associated Token Accounts via Rent & Rug Shield (0% fee on first claim). Accepts only a public base58 wallet address; never pass private keys.",
  examples: [
    [
      {
        input: {
          wallet: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV",
        },
        output: {
          status: "success",
          wallet: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV",
          isFirstFreeClaim: true,
          effectiveFeeBps: 0,
          emptyCount: 3,
          totalReclaimableSol: 0.006117,
        },
        explanation:
          "Preview reclaimable SOL rent across empty SPL and Token-2022 token accounts",
      },
    ],
  ],
  schema: z.object({
    wallet: z
      .string()
      .min(32)
      .max(44)
      .optional()
      .describe(
        "Optional public base58 Solana wallet address (defaults to agent wallet publicKey). Never pass private keys.",
      ),
  }),
  handler: async (agent, input: Record<string, any>) => {
    try {
      const result = await rentshieldScanWallet(agent, input.wallet);
      return {
        status: "success",
        ...result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Rent & Rug Shield wallet scan failed: ${error.message}`,
      };
    }
  },
};

export default rentshieldScanWalletAction;
