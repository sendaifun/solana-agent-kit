import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { protectedTransfer, getPolicy } from "../tools";

/**
 * pay.sh + Onleash integration action.
 *
 * pay.sh uses HTTP 402 / x402 to let AI agents pay for API calls autonomously.
 * The agent detects a 402 Payment Required challenge, signs a payment, retries.
 *
 * The attack: a jailbroken agent gets a 402 response from an ATTACKER
 * (not a real API provider) and sends the payment there instead.
 *
 * The fix: the agent's payment tokens are an Onleash-protected Token-2022 mint.
 * Only approved pay.sh provider payment addresses are on the allowlist.
 * The chain blocks any payment to an unapproved destination — atomically,
 * before funds move, regardless of what the agent signed.
 */
const payShProtectedPaymentAction: Action = {
  name: "ONLEASH_PAY_SH_PAYMENT",
  similes: [
    "pay for api call",
    "pay.sh payment",
    "pay for http 402",
    "agent api payment",
    "x402 payment",
    "pay for tool call",
  ],
  description:
    "Send a policy-protected payment to a pay.sh API provider using an Onleash-protected mint. " +
    "The on-chain hook verifies the destination is an approved pay.sh provider address before " +
    "the payment settles. If a jailbroken agent tries to redirect the payment to an attacker, " +
    "the chain blocks it with DestinationNotAllowed (6001). " +
    "Use this instead of a standard transfer whenever your agent pays for API calls via pay.sh / x402.",
  examples: [
    [
      {
        input: {
          mint: "2KkYRVS2cBnneryveAYxH5hGfnNhdFruXAc4NjeAekcZ",
          source: "3qHDnLYazYYbhhUHb1ZAAg2tJPrFqPCMfShiEyGsDWtn",
          providerPaymentAddress: "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk",
          amount: "1000",
          decimals: 6,
          apiEndpoint: "https://api.quicknode.com/rpc",
        },
        output: {
          status: "success",
          signature: "2QAvoByj2EZUeL5SZXSNKMkSe6bgFyGmxLDdb92LHrEK",
          message: "Payment of 1000 raw units sent to approved pay.sh provider",
        },
        explanation:
          "Agent pays a QuickNode RPC endpoint via pay.sh. " +
          "Onleash verifies the destination is whitelisted before the payment settles.",
      },
    ],
    [
      {
        input: {
          mint: "2KkYRVS2cBnneryveAYxH5hGfnNhdFruXAc4NjeAekcZ",
          source: "3qHDnLYazYYbhhUHb1ZAAg2tJPrFqPCMfShiEyGsDWtn",
          providerPaymentAddress: "AttackerWallet111111111111111111111111111111",
          amount: "1000",
          decimals: 6,
          apiEndpoint: "https://attacker.example.com/fake-api",
        },
        output: {
          status: "error",
          error: "DestinationNotAllowed",
          code: 6001,
          message: "Payment blocked by Onleash — destination not in allowlist",
        },
        explanation:
          "Jailbroken agent tries to pay an attacker address disguised as a pay.sh provider. " +
          "Onleash blocks it atomically — the chain refused to clear the transfer.",
      },
    ],
  ],
  schema: z.object({
    mint: z.string().min(32).describe(
      "Onleash-protected Token-2022 mint used for payments."
    ),
    source: z.string().min(32).describe(
      "Agent's source token account (must hold the protected mint tokens)."
    ),
    providerPaymentAddress: z.string().min(32).describe(
      "The pay.sh provider's payment token account address from the 402 challenge. " +
      "Must be in the Onleash allowlist — the chain rejects payments to any other address."
    ),
    amount: z.string().describe(
      "Payment amount in raw token units (e.g. '1000' = 0.001 tokens at 6 decimals)."
    ),
    decimals: z.number().int().min(0).max(9).describe("Mint decimals."),
    apiEndpoint: z.string().url().optional().describe(
      "The API endpoint being paid for (informational — logged but not validated on-chain)."
    ),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    // Before sending, confirm the destination is in the on-chain allowlist.
    // This is a pre-flight check — the chain will enforce it anyway, but we
    // surface a clearer error message if the provider isn't approved yet.
    const policy = await getPolicy(agent, input.mint);

    if (policy) {
      const approved = policy.destinationAllowlist.includes(
        input.providerPaymentAddress
      );
      if (!approved) {
        return {
          status: "error",
          error: "DestinationNotAllowed",
          code: 6001,
          message:
            `Payment blocked (pre-flight): ${input.providerPaymentAddress} is not in the ` +
            `Onleash allowlist for mint ${input.mint}. ` +
            `Approved destinations: ${policy.destinationAllowlist.join(", ")}. ` +
            `Use ONLEASH_UPDATE_POLICY to add this provider if it is legitimate.`,
        };
      }
    }

    try {
      const result = await protectedTransfer(agent, {
        mint: input.mint,
        source: input.source,
        destination: input.providerPaymentAddress,
        amount: BigInt(input.amount),
        decimals: input.decimals,
      });

      return {
        status: "success",
        signature: result.signature,
        message:
          `Payment of ${input.amount} raw units sent to pay.sh provider ` +
          `${input.providerPaymentAddress}` +
          (input.apiEndpoint ? ` for ${input.apiEndpoint}` : "") +
          `. Signature: ${result.signature}`,
      };
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      const isOnleashRevert =
        /DestinationNotAllowed|0x1771|6001|ExceedsPerTxMax|0x1772|6002|ExceedsDailyCap|0x1773|6003/.test(msg);

      if (isOnleashRevert) {
        const code = /6001|0x1771/.test(msg)
          ? { name: "DestinationNotAllowed", code: 6001 }
          : /6002|0x1772/.test(msg)
          ? { name: "ExceedsPerTxMax", code: 6002 }
          : { name: "ExceedsDailyCap", code: 6003 };

        return {
          status: "error",
          error: code.name,
          code: code.code,
          message: `Payment blocked by Onleash on-chain (${code.name} ${code.code}). Funds were never moved.`,
        };
      }

      throw e;
    }
  },
};

export default payShProtectedPaymentAction;
