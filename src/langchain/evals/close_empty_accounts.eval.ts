import { expect } from "vitest";
import * as ls from "langsmith/vitest";
import { createSolanaTools } from "../index";
import { SolanaAgentKit } from "../..";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

// Setup test environment
const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.3,
});

const solanaAgent = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY!,
  process.env.RPC_URL!,
  {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    HELIUS_API_KEY: process.env.HELIUS_API_KEY!,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY!,
  },
);

const tools = createSolanaTools(solanaAgent);

const memory = new MemorySaver();

const agent = createReactAgent({
  llm,
  tools,
  checkpointSaver: memory,
  interruptBefore: ["tools"],
  messageModifier: `
      You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
      empowered to interact onchain using your tools. If you ever need funds, you can request them from the
      faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
      (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
      can't do with your currently available tools, you must say so, and encourage them to implement it
      themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
      concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
    `,
});

const CLOSE_EMPTY_ACCOUNTS_TOOL_CALL_DATASET = [
  {
    inputs: {
      query: "Close all my empty token accounts",
    },
    referenceOutputs: {
      tool: "close_empty_token_accounts",
    },
  },
];

const correctToolCall = async (params: {
  toolName: string;
  referenceToolCall: string;
}) => {
  return {
    key: "correct_tool",
    score: params.toolName === params.referenceToolCall,
  };
};

ls.describe("Close Empty Accounts Tests", () => {
  ls.test.each(CLOSE_EMPTY_ACCOUNTS_TOOL_CALL_DATASET)(
    "should call the correct close empty accounts tool",
    async ({ inputs, referenceOutputs }) => {
      const result = await agent.invoke(
        {
          messages: [{ role: "user", content: inputs.query }],
        },
        {
          configurable: {
            thread_id: inputs.query,
          },
        },
      );

      ls.logOutputs(result);

      const aiMessage = result.messages[1];
      const toolCall = aiMessage.tool_calls[0];

      // Store evaluation results in langsmith
      const wrappedToolEvaluator = ls.wrapEvaluator(correctToolCall);
      await wrappedToolEvaluator({
        toolName: toolCall.name,
        referenceToolCall: referenceOutputs?.tool || "",
      });

      // Fail test if tool call is incorrect
      expect(toolCall.name).toBe(referenceOutputs?.tool || "");
    },
  );
});
