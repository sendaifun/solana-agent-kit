import { SolanaAgentKit } from "../agent";
import { Action, ActionResult } from "../types";
import { z } from "zod";
import { GibworkCreateTaskReponse } from "../types";

export const SolanaCreateGibworkTaskAction: Action = {
  name: "create_gibwork_task",
  similes: ["create_gibwork_task", "create_task"],
  description: `Create a task on Gibwork.

  Inputs:
  title: string (required)
  content: string (required)
  requirements: string (required)
  tags: string[] (required)
  tokenMintAddress: string (required)
  amount: number (required)
  payer?: string (optional, defaults to agent wallet)`,
  examples: [
    [
      {
        input: {
          message: {
            id: "1",
            content: {
              text: JSON.stringify({
                title: "Create a DApp",
                content: "Need a new DApp built",
                requirements: "Solidity experience required",
                tags: ["solidity", "web3"],
                tokenMintAddress: "So11111111111111111111111111111111111111112",
                amount: 1000
              }),
            },
            userId: "user1",
            timestamp: Date.now(),
          },
        },
        output: {
          success: true,
          data: { taskId: "task_id_here", signature: "tx_signature_here" }
        },
      },
    ],
  ],

  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const taskData = await agent.createGibworkTask(
      input.title,
      input.content,
      input.requirements,
      input.tags,
      input.tokenMintAddress,
      input.amount,
      input.payer,
    );

    const response: GibworkCreateTaskReponse = {
      status: "success",
      taskId: taskData.taskId,
      signature: taskData.signature,
    };

    return {
      success: true,
      data: response,
    };
  },

  validate: async (context, ...args) => {
    const input = args[0];
    try {
      const schema = z.object({
        title: z.string(),
        content: z.string(),
        requirements: z.string(),
        tags: z.array(z.string()),
        tokenMintAddress: z.string(),
        amount: z.number().positive(),
        payer: z.string().optional()
      });
      return schema.safeParse(input).success;
    } catch {
      return false;
    }
  },
};
