import { expect } from "vitest";
import * as ls from "langsmith/vitest";
import { createSolanaTools } from "../../index";
import { SolanaAgentKit } from "../../..";
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

const tools = createSolanaTools(solanaAgent).slice(0, 128);

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

function deepCmp(referenceArguments: any, llmArguments: any): boolean {
  if (
    typeof referenceArguments !== "object" ||
    typeof llmArguments !== "object" ||
    referenceArguments === null ||
    llmArguments === null
  ) {
    return referenceArguments === llmArguments;
  }

  const referenceKeys = Object.keys(referenceArguments);
  const llmKeys = Object.keys(llmArguments);

  if (!referenceKeys.every((key) => llmKeys.includes(key))) {
    return false;
  }
  // Only comparse keys from reference (all mandatory) since the llm may return optional parameters that may not be in reference
  return referenceKeys.every((key) =>
    deepCmp(referenceArguments[key], llmArguments[key]),
  );
}

function compareArgs(
  referenceAnswer: { tool: string; response: string },

  llmAnswer: { tool: string; response: string | undefined },
): boolean {
  if (!llmAnswer.response || !referenceAnswer.response) return false;

  // Repsonses can be just strings (single argument) or KV of parameter names and arguments
  let parsedReferenceResponse = referenceAnswer.response.startsWith("{")
    ? JSON.parse(referenceAnswer.response)
    : referenceAnswer.response;
  let parsedLLMResponse = llmAnswer?.response.startsWith("{")
    ? JSON.parse(llmAnswer.response)
    : llmAnswer.response;

  return deepCmp(parsedReferenceResponse, parsedLLMResponse);
}

function compareTools(
  referenceAnswer: { tool: string; response: string },

  llmAnswer: { tool: string; response: string | undefined },
): boolean {
  return llmAnswer.tool === referenceAnswer.tool;
}

export async function runEvals<T>(
  dataset: {
    inputs: { query: string };
    referenceOutputs: { tool: string; response: string };
  }[],
  testName: string,
) {
  ls.describe(testName, () => {
    ls.test.each(dataset)(
      "should call the correct tool with valid arguments",
      async ({ inputs, referenceOutputs }) => {
        if (!referenceOutputs) {
          console.warn("Invalid referenceOutputs: ", referenceOutputs);
          return;
        }
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
        const llmResponse = toolCall?.args?.input;
        if (!toolCall)
          console.warn(
            "No tools called. LLM response: ",
            result.messages[1].content,
          );

        const llmAnswer: { tool: string; response: string } = {
          tool: toolCall?.name || ("" as String),
          response: typeof llmResponse === "string" ? llmResponse : "{}",
        };

        const isCorrect =
          compareArgs(referenceOutputs, llmAnswer) &&
          compareTools(referenceOutputs, llmAnswer);

        const toolEvaluator = async (params: {
          referenceOutputs: { tool: string; response: string };
          llmAnswer: { tool: string; response: string };
        }) => {
          return {
            key: "correct_tool",
            score: compareArgs(params.referenceOutputs, params.llmAnswer),
          };
        };
        const argsEvaluator = async (params: {
          referenceOutputs: { tool: string; response: string };
          llmAnswer: { tool: string; response: string };
        }) => {
          return {
            key: "correct_args",
            score: compareArgs(params.referenceOutputs, params.llmAnswer),
          };
        };

        const wrappedToolEvaluator = ls.wrapEvaluator(toolEvaluator);
        await wrappedToolEvaluator({
          referenceOutputs,
          llmAnswer,
        });

        const wrappedArgsEvaluator = ls.wrapEvaluator(argsEvaluator);
        await wrappedArgsEvaluator({
          referenceOutputs,
          llmAnswer,
        });

        expect(isCorrect).toBe(true);
      },
    );
  });
}
