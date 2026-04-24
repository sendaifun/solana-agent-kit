import { Action } from "solana-agent-kit";
import { z } from "zod";
import { algovoi_get_checkout } from "../tools";

const algovoiGetCheckoutAction: Action = {
  name: "ALGOVOI_GET_CHECKOUT",
  similes: [
    "inspect algovoi checkout",
    "preview algovoi payment",
    "get algovoi checkout metadata",
    "check algovoi invoice",
    "read solana action metadata",
  ],
  description:
    "Fetch metadata for a hosted AlgoVoi Solana checkout without " +
    "signing. Returns the spec-compliant ActionGetResponse: label, " +
    "title, description, icon, and disabled state. Use this before " +
    "ALGOVOI_PAY_CHECKOUT to confirm the amount and mint with the user.",
  examples: [
    [
      {
        input: {
          tokenOrUrl: "xZMDMhNfBXrisrhv6Fdv2Y5i2ImOKTTx",
        },
        output: {
          status: "success",
          metadata: {
            type: "action",
            label: "Pay 0.5 USDC",
            title: "AlgoVoi · Invoice 1234",
            description:
              "Pay 0.5 USDC on Solana to complete this checkout.",
            disabled: false,
          },
        },
        explanation:
          "Inspect a live AlgoVoi checkout to show the user what they're about to sign.",
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
    const metadata = await algovoi_get_checkout(
      agent,
      input.tokenOrUrl as string,
      (input.baseUrl as string | undefined) ??
        "https://api1.ilovechicken.co.uk",
    );
    return {
      status: "success",
      metadata,
    };
  },
};

export default algovoiGetCheckoutAction;
