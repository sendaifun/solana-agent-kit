import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { checkUnsignedSolanaTx } from "../apex";

const txCheckAction: Action = {
  name: "APEX_TX_CHECK",
  similes: [
    "check unsigned solana transaction",
    "is this solana tx safe",
    "simulate unsigned tx",
    "flag a token drain",
    "check a delegate approval",
  ],
  description:
    "Check one unsigned Solana transaction and return SAFE or RISKY. Flags a token drain, a delegate approval, and a rug mint. Nothing is signed or broadcast. 0.001 USDC. On HTTP 402, pay the terms with your own wallet. Do not pass a private key.",
  examples: [
    [
      {
        input: { signer: "SignerPubkey", tx: "base64-unsigned-transaction" },
        output: { status: "success", result: { http: 402, paid: false } },
        explanation: "An unpaid check returns the x402 terms. The wallet signs those terms itself.",
      },
    ],
  ],
  schema: z.object({
    signer: z.string().describe("Solana account that would sign. Not a private key."),
    tx: z.string().describe("Unsigned transaction, base64 or base58."),
  }),
  handler: async (_agent: SolanaAgentKit, input: Record<string, string>) => {
    return checkUnsignedSolanaTx(input.signer, input.tx);
  },
};

export default txCheckAction;
