import { tool, type CoreTool } from "ai";
import { SolanaAgentKit } from "../agent";
import { executeAction } from "../utils/actionExecutor";
import { ACTIONS } from "../actions";

export function createSolanaTools(
  solanaAgentKit: SolanaAgentKit,
): Record<string, CoreTool> {
  const tools: Record<string, CoreTool> = {};
  const actionKeys = Object.keys(ACTIONS);

  for (const key of actionKeys) {
    const action = ACTIONS[key as keyof typeof ACTIONS];
    tools[key] = tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: action.name,
      description: action.description,
      parameters: action.schema,
      execute: async (params) =>
        await executeAction(action, solanaAgentKit, params),
    });
  }

  return tools;
}
