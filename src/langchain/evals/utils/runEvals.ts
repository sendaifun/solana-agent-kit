import { expect } from "vitest";
import * as ls from "langsmith/vitest";
import { createSolanaTools } from "../../index";
import { SolanaAgentKit } from "../../..";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { systemPrompts } from "./systemPrompts";

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
  messageModifier: systemPrompts[2],
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
  // Only compare keys from reference (all mandatory) since the llm may return optional parameters that may not be in reference
  return referenceKeys.every((key) =>
    deepCmp(referenceArguments[key], llmArguments[key]),
  );
}

function compareArgs(
  referenceAnswer: { tool: string; response: string },
  llmAnswer: { tool: string; response: string | undefined },
): boolean {
  if (!llmAnswer.response || !referenceAnswer.response) return false;

  // Responses can be just strings (single argument) or KV of parameter names and arguments
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

const toolEvaluator = async (params: {
  referenceOutputs: { tool: string; response: string };
  llmAnswer: { tool: string; response: string };
}) => {
  return {
    key: "correct_tool",
    score: compareTools(params.referenceOutputs, params.llmAnswer),
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

export type ConversationTurn = {
  input: string;
  expectedToolCall?: {
    tool: string;
    params: any;
  };
};

export type ComplexEvalDataset = {
  description: string;
  turns: ConversationTurn[];
  inputs: Record<string, string>;
};

export async function runComplexEval(
  dataset: ComplexEvalDataset[],
  testName: string,
) {
  ls.describe(testName, () => {
    ls.test.each(dataset as any)(testName, async (scenario) => {
      const conversation: Array<{
        role: string;
        content: string | null;
        tool_calls?: any;
      }> = [];
      let foundCorrectToolCall = true;

      for (let i = 0; i < scenario.turns.length; i++) {
        const turn = scenario.turns[i];
        conversation.push({ role: "user", content: turn.input });

        const result = await agent.invoke(
          { messages: conversation },
          {
            configurable: {
              thread_id: `${testName}-${new Date().toISOString()}`, // Need unique thread-id to keep context seperate betweet tests
            },
          },
        );

        ls.logOutputs(result);
        const assistantMessage = result.messages[result.messages.length - 1];
        conversation.push(assistantMessage);
        // conversation.forEach((message) => console.log(message.content));
        if (
          turn.expectedToolCall &&
          !(
            assistantMessage.tool_calls &&
            assistantMessage.tool_calls.length > 0
          )
        ) {
          foundCorrectToolCall = false;
          continue;
        }
        if (
          assistantMessage.tool_calls &&
          assistantMessage.tool_calls.length > 0 &&
          turn.expectedToolCall
        ) {
          const toolCall = assistantMessage.tool_calls[0];

          const toolName = toolCall?.name || "";
          const llmArgs = toolCall.args.input;
          const toolArgs: string = typeof llmArgs === "string" ? llmArgs : "{}";
          const params = turn.expectedToolCall.params;

          if (toolName === turn.expectedToolCall.tool) {
            const referenceOutputs = {
              tool: turn.expectedToolCall.tool,
              response:
                typeof params === "string"
                  ? params
                  : JSON.stringify(turn.expectedToolCall.params),
            };
            const llmAnswer: { tool: string; response: string } = {
              tool: toolName,
              response: toolArgs,
            };

            const argsMatch = compareArgs(referenceOutputs, llmAnswer);
            const toolMatches = compareTools(referenceOutputs, llmAnswer);

            foundCorrectToolCall =
              foundCorrectToolCall && argsMatch && toolMatches; // && so if it fails on one tool the whole test fails

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
          }
        }
      }
      expect(foundCorrectToolCall).toBe(true);
    });
  });
}
