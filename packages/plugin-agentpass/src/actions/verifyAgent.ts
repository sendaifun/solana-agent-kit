import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { verify_agent } from "../tools/verify_agent";

const verifyAgentAction: Action = {
  name: "VERIFY_AGENT_IDENTITY",
  similes: [
    "verify agent",
    "check agent identity",
    "is this agent real",
    "validate agent passport",
    "agent identity check",
    "who is this agent",
  ],
  description:
    "Verify an AI agent's identity using AgentPass. Checks the agent's passport status via the AgentPass API and optionally verifies on-chain wallet binding on Solana. Use this before interacting with unknown agents or before high-value operations.",
  examples: [
    [
      {
        input: { passport_id: "ap_a622a643aa71" },
        output: {
          verified: true,
          passport_id: "ap_a622a643aa71",
          name: "Kai",
          onchain_bound: true,
        },
        explanation: "Verifies that the agent with passport ap_a622a643aa71 has a valid identity and is bound to a Solana wallet on-chain.",
      },
    ],
    [
      {
        input: { passport_id: "ap_fake123", check_onchain: false },
        output: {
          verified: false,
          passport_id: "ap_fake123",
          error: "Passport not found (404)",
        },
        explanation: "Attempts to verify a non-existent passport. Returns verified: false with error details.",
      },
    ],
  ],
  schema: z.object({
    passport_id: z.string().describe("The AgentPass passport ID to verify (e.g., ap_a622a643aa71)"),
    check_onchain: z.boolean().optional().describe("Whether to check on-chain wallet binding (default: true)"),
  }),
  handler: async (agent, input) => {
    return await verify_agent(agent, input as any);
  },
};

export default verifyAgentAction;
