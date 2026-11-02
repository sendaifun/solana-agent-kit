// One Action per operation in the upstream shape (name, similes, description, examples[][], zod schema,
// handler(agent, input)). Handlers never throw: an error is {status: 'error', message} the model can read,
// as the upstream plugins do.
import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { DESCRIPTIONS, type OpName, ZOD } from "../core/schemas.js";
import { METHODS, METHOD_OF } from "../tools/index.js";

export interface ActionSpec {
  op: OpName;
  name: string;
  similes: string[];
  examples: Action["examples"];
}

export function makeAction(spec: ActionSpec): Action {
  const method = METHODS[METHOD_OF[spec.op]] as (
    agent: SolanaAgentKit,
    input: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;
  return {
    name: spec.name,
    similes: [spec.op, ...spec.similes],
    description: DESCRIPTIONS[spec.op],
    examples: spec.examples,
    schema: ZOD[spec.op],
    handler: async (agent, input) => {
      try {
        const out = await method(agent, input ?? {});
        return { status: "success", ...out };
      } catch (e) {
        return { status: "error", message: (e as Error).message };
      }
    },
  };
}
