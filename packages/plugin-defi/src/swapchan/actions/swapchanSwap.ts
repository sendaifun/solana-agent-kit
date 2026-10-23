import { Action, SolanaAgentKit } from "solana-agent-kit";
import { swapchanSwap } from "../tools";
import { swapchanQuoteSchema } from "./swapchanQuote";

const swapchanSwapAction: Action = {
  name: "SWAPCHAN_SWAP",
  similes: ["swap at best price", "bridge from solana", "swap sol to eth on base", "swapchan swap"],
  description:
    "Swap tokens on Solana, or bridge out of Solana to EVM chains, Bitcoin or Tron, using the best route SwapChan finds (Jupiter, LI.FI, Relay, deBridge and more). Signs and sends with the agent wallet.",
  examples: [
    [
      {
        input: { inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", outputMint: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", amount: 50, toChainId: 8453, toAddress: "0x..." },
        output: { status: "success", signature: "5Uf...", provider: "relay" },
        explanation: "Bridge 50 USDC from Solana to ETH on Base",
      },
    ],
  ],
  schema: swapchanQuoteSchema,
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const r = await swapchanSwap(agent, input as any);
      return { status: "success", signature: r.signature, quote: r.quote };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  },
};

export default swapchanSwapAction;
