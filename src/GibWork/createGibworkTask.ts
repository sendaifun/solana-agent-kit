import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { create_gibwork_task } from "../tools";

const createGibworkTaskAction: Action = {
  name: "CREATE_GIBWORK_TASK",
  similes: [
    "create task",
    "post job",
    "create gig",
    "post task",
    "create work",
    "new task on gibwork",
  ],
  description:
    "Create a new task on the Gibwork platform with payment in SPL tokens",
  examples: [
    [
      {
        input: {
          title: "Build a Solana dApp",
          content: "Create a simple Solana dApp with React frontend",
          requirements: "Experience with Rust and React",
          tags: ["solana", "rust", "react"],
          tokenMintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          tokenAmount: 100,
        },
        output: {
          status: "success",
          taskId: "task_123",
          signature: "3YKpM1...",
          message: "Successfully created task: Build a Solana dApp",
        },
        explanation: "Create a new task on Gibwork with 100 USDC payment",
      },
    ],
  ],
  schema: z.object({
    title: z.string().min(1).describe("Title of the task"),
    content: z.string().min(1).describe("Description of the task"),
    requirements: z
      .string()
      .min(1)
      .describe("Requirements to complete the task"),
    tags: z
      .array(z.string())
      .min(1)
      .describe("List of tags associated with the task"),
    tokenMintAddress: z.string().describe("Token mint address for payment"),
    tokenAmount: z.number().positive().describe("Payment amount for the task"),
    payer: z
      .string()
      .optional()
      .describe("Optional payer address (defaults to wallet address)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const responseData = await create_gibwork_task(
        agent,
        input.title,
        input.content,
        input.requirements,
        input.tags,
        new PublicKey(input.tokenMintAddress),
        input.tokenAmount,
        input.payer ? new PublicKey(input.payer) : undefined,
      );

      return {
        status: "success",
        taskId: responseData.taskId,
        signature: responseData.signature,
        message: `Successfully created task: ${input.title}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create task: ${error.message}`,
      };
    }
  },
};

export default createGibworkTaskAction;
