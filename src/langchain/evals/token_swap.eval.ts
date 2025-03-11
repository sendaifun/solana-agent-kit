import { expect } from "vitest";
import * as ls from "langsmith/vitest";
import { createSolanaTools } from "../index";
import { SolanaAgentKit } from "../..";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

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

const correctToolCallArgs = async (params: {
  answer: string;
  referenceAnswer: string;
}) => {
  const answerObj = JSON.parse(params.answer);
  const referenceObj = JSON.parse(params.referenceAnswer);

  return {
    key: "correct_tool_args",
    score:
      answerObj.inputMint === referenceObj.inputMint &&
      answerObj.outputMint === referenceObj.outputMint &&
      answerObj.inputAmount === referenceObj.inputAmount &&
      // check slippageBps if it exists in both
      ((!answerObj.slippageBps && !referenceObj.slippageBps) ||
        answerObj.slippageBps === referenceObj.slippageBps),
  };
};

const TOKEN_SWAP_TOOL_CALL_DATASET = [
  {
    inputs: { query: "I want to trade 5 USDC for SOL" },
    referenceOutputs: {
      response:
        '{"outputMint":"So11111111111111111111111111111111111111112","inputAmount":5,"inputMint":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}',
      tool: "solana_trade",
    },
  },
  {
    inputs: { query: "Exchange 1 SOL for JUP tokens" },
    referenceOutputs: {
      response:
        '{"outputMint":"JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN","inputAmount":1,"inputMint":"So11111111111111111111111111111111111111112"}',
      tool: "solana_trade",
    },
  },
  {
    inputs: { query: "Swap 10 USDC for JUP with 1% slippage" },
    referenceOutputs: {
      response:
        '{"outputMint":"JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN","inputAmount":10,"inputMint":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v","slippageBps":100}',
      tool: "solana_trade",
    },
  },
];

const correctToolCall = async (params: {
  toolName: string | undefined;
  referenceToolCall: string;
}) => {
  return {
    key: "correct_tool",
    score: params.toolName === params.referenceToolCall,
  };
};

ls.describe("Token Swap Tests", () => {
  ls.test.each(TOKEN_SWAP_TOOL_CALL_DATASET)(
    "should call the correct token swap tool",
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

      const wrappedToolEvaluator = ls.wrapEvaluator(correctToolCall);
      const wrappedArgsEvaluator = ls.wrapEvaluator(correctToolCallArgs);

      const toolCall = aiMessage.tool_calls[0];

      await wrappedToolEvaluator({
        toolName: toolCall.name || "",
        referenceToolCall: referenceOutputs?.tool || "",
      });

      await wrappedArgsEvaluator({
        answer: toolCall.args?.input || "",
        referenceAnswer: referenceOutputs?.response || "",
      });

      expect(toolCall.name).toBe(referenceOutputs?.tool || "");

      const actualArgs = JSON.parse(toolCall.args.input);
      const expectedArgs = JSON.parse(referenceOutputs?.response || "{}");

      expect(actualArgs.inputMint).toBe(expectedArgs.inputMint);
      expect(actualArgs.outputMint).toBe(expectedArgs.outputMint);
      expect(actualArgs.inputAmount).toBe(expectedArgs.inputAmount);

      if (expectedArgs.slippageBps) {
        expect(actualArgs.slippageBps).toBe(expectedArgs.slippageBps);
      }
    },
  );
});
