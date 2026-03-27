import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { searchAgents } from "../shared";

const searchAgentsAction: Action = {
  name: "DESIDE_SEARCH_AGENTS",
  similes: [
    "search deside agents",
    "find agent on deside",
    "discover agents",
  ],
  description: "Search Deside agents by name, wallet, or category.",
  examples: [
    [
      {
        input: {
          name: "qnt",
          limit: 5,
        },
        output: {
          status: "success",
          agents: [],
        },
        explanation: "Search for agents registered on Deside.",
      },
    ],
  ],
  schema: z.object({
    name: z.string().optional().describe("Agent name query."),
    wallet: z.string().optional().describe("Wallet address query."),
    category: z.string().optional().describe("Agent category query."),
    limit: z.number().int().positive().optional().describe("Maximum number of results."),
    offset: z.number().int().nonnegative().optional().describe("Pagination offset."),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const agents = await searchAgents(agent, {
        name: input.name,
        wallet: input.wallet,
        category: input.category,
        limit: input.limit,
        offset: input.offset,
      });
      return {
        status: "success",
        agents,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to search Deside agents: ${error.message}`,
      };
    }
  },
};

export default searchAgentsAction;
