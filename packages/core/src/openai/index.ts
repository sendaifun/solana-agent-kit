import { SolanaAgentKit } from "@/agent";
import { Action } from "@/types/action";
import { executeAction } from "../utils/actionExecutor"
import { Tool as OpenAITool, tool } from "@openai/agents";
import { zodToOpenAITool } from "./utils";

export function createOpenAITools(
  solanaAgentKit: SolanaAgentKit,
  actions: Action[],
) {
  const tools: OpenAITool[] = [];

  if (actions.length > 128) {
    console.warn(
      `Too many actions provided. Only a maximum of 128 actions allowed. You provided ${actions.length}, the last ${actions.length - 128} will be ignored.`,
    );
  }

  for (const [_index, action] of actions.slice(0, 127).entries()) {
    tools.push(
      tool({
        name: action.name,
        description: action.description,
        execute: async (params: Record<string, unknown>) =>
          await executeAction(action, solanaAgentKit, params),
        parameters: zodToOpenAITool(
          action.schema,
          action.name,
          action.description,
        ).function.parameters,
      }),
    );
  }

  return tools;
}
