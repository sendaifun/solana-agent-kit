import { tool } from "@langchain/core/tools";
import { SolanaAgentKit } from "../agent";
import { Action } from "../types";
import { transformToZodObject } from "../utils/zod";

export function createLangchainTools(
  solanaAgentKit: SolanaAgentKit,
  actions: Action[],
) {
  if (actions.length > 128) {
    console.warn(
      `Too many actions provided. Only a maximum of 128 actions allowed. You provided ${actions.length}, the last ${actions.length - 128} will be ignored.`,
    );
  }

  const tools = actions.slice(0, 127).map((action) => {
    //@ts-ignore - type instantiation is not recognized by TypeScript, but it works at runtime
    const toolInstance = tool(
      async (inputs) =>
        JSON.stringify(await action.handler(solanaAgentKit, inputs)),
      {
        name: action.name,
        description: `
      ${action.description}

      Similes: ${action.similes.map(
        (simile) => `
        ${simile}
      `,
      )}

      Examples: ${action.examples.map(
        (example) => `
        Input: ${JSON.stringify(example[0].input)}
        Output: ${JSON.stringify(example[0].output)}
        Explanation: ${example[0].explanation}
      `,
      )}`,
        // convert action.schema from ZodType to ZodObject
        schema: transformToZodObject(action.schema),
      },
    );

    return toolInstance;
  });

  return tools;
}
