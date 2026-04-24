import { Action } from "solana-agent-kit";
import { z } from "zod";
import { algovoi_pay_checkout } from "../tools";

const algovoiPayCheckoutAction: Action = {
  name: "ALGOVOI_PAY_CHECKOUT",
  similes: [
    "pay algovoi checkout",
    "settle algovoi payment",
    "pay algovoi invoice",
    "pay usdc checkout on solana",
    "complete algovoi payment link",
    "pay solana action",
  ],
  description:
    "Settle a hosted AlgoVoi checkout on Solana. AlgoVoi exposes every " +
    "Solana checkout as a Solana Action; the agent's wallet signs an " +
    "SPL USDC transfer that carries a Solana Pay `reference` pubkey so " +
    "the AlgoVoi facilitator can verify settlement on-chain " +
    "deterministically. Accepts a bare checkout token, the hosted " +
    "checkout URL, or a `solana-action:` URL. Defaults to the public " +
    "AlgoVoi gateway; pass `baseUrl` to point at a self-hosted instance.",
  examples: [
    [
      {
        input: {
          tokenOrUrl: "xZMDMhNfBXrisrhv6Fdv2Y5i2ImOKTTx",
        },
        output: {
          status: "success",
          signature: "5vY8...Bkn4",
          message:
            "Signed and broadcast the Solana USDC transfer for AlgoVoi checkout xZMDMhNfBXrisrhv6Fdv2Y5i2ImOKTTx.",
        },
        explanation:
          "Pay a bare AlgoVoi checkout token using the default public gateway.",
      },
      {
        input: {
          tokenOrUrl:
            "https://api1.ilovechicken.co.uk/checkout/xZMDMhNfBXrisrhv6Fdv2Y5i2ImOKTTx",
        },
        output: {
          status: "success",
          signature: "3aBC...xyz1",
        },
        explanation:
          "Full hosted checkout URL — tool rewrites to /actions/checkout/{token} automatically.",
      },
      {
        input: {
          tokenOrUrl:
            "solana-action:https%3A%2F%2Fapi1.ilovechicken.co.uk%2Factions%2Fcheckout%2FxZMDMhNfBXrisrhv6Fdv2Y5i2ImOKTTx",
        },
        output: {
          status: "success",
          signature: "9pQR...abc2",
        },
        explanation:
          "Solana Action scheme URL as pasted from any Blink host (Dialect, Phantom, Solflare, Backpack).",
      },
    ],
  ],
  schema: z.object({
    tokenOrUrl: z
      .string()
      .min(8)
      .describe(
        "AlgoVoi checkout token, hosted checkout URL, or solana-action: URL",
      ),
    baseUrl: z
      .string()
      .url()
      .optional()
      .describe(
        "Override AlgoVoi API base URL (default: https://api1.ilovechicken.co.uk)",
      ),
  }),
  handler: async (agent, input) => {
    const sig = await algovoi_pay_checkout(
      agent,
      input.tokenOrUrl as string,
      (input.baseUrl as string | undefined) ??
        "https://api1.ilovechicken.co.uk",
    );
    return {
      status: "success",
      signature: typeof sig === "string" ? sig : undefined,
      transaction: typeof sig === "string" ? undefined : sig,
      message: "AlgoVoi checkout settled on Solana.",
    };
  },
};

export default algovoiPayCheckoutAction;
