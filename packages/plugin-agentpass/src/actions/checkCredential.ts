import { z } from "zod";
import type { Action } from "solana-agent-kit";
import { check_credential } from "../tools/check_credential";

const checkCredentialAction: Action = {
  name: "CHECK_AGENT_CREDENTIAL",
  similes: [
    "check credential",
    "verify credential",
    "does agent have permission",
    "agent capabilities",
    "check agent trust",
    "credential verification",
  ],
  description:
    "Check if an AI agent has specific verifiable credentials via AgentPass. Credentials are MVA (Minimum Viable Attestation) format — other agents or auditors issue them to vouch for capabilities, completed audits, or endorsements. Optionally checks if credentials are anchored on-chain on Solana.",
  examples: [
    [
      {
        input: { passport_id: "ap_a622a643aa71", credential_type: "capability" },
        output: {
          has_credential: true,
          credentials: [
            { type: "capability", issuer: "ap_auditor123", anchored_onchain: true },
          ],
        },
        explanation: "Checks if the agent has any 'capability' credentials. Found one issued by an auditor, anchored on Solana.",
      },
    ],
  ],
  schema: z.object({
    passport_id: z.string().describe("The AgentPass passport ID to check"),
    credential_type: z.string().optional().describe("Filter by credential type (e.g., 'capability', 'endorsement', 'audit')"),
    credential_hash: z.string().optional().describe("Specific credential hash to verify (hex string)"),
  }),
  handler: async (agent, input) => {
    return await check_credential(agent, input as any);
  },
};

export default checkCredentialAction;
