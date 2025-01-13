import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { GibworkCreateTaskReponse } from "../../index";

export class SolanaCreateGibworkTask extends Tool {
  name = "create_gibwork_task";
  description = `Create a task on Gibwork.

  Inputs (input is a JSON string):
  title: string, title of the task (required)
  content: string, description of the task (required)
  requirements: string, requirements to complete the task (required)
  tags: string[], list of tags associated with the task (required)
  payer: string, payer address (optional, defaults to agent wallet)
  tokenMintAddress: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" (required)
  amount: number, payment amount (required)
  `;

  constructor(private solanaSdk: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const taskData = await this.solanaSdk.createGibworkTask(
        parsedInput.title,
        parsedInput.content,
        parsedInput.requirements,
        parsedInput.tags,
        parsedInput.tokenMintAddress,
        parsedInput.amount,
        parsedInput.payer,
      );

      const response: GibworkCreateTaskReponse = {
        status: "success",
        taskId: taskData.taskId,
        signature: taskData.signature,
      };

      return JSON.stringify(response);
    } catch (err: any) {
      return JSON.stringify({
        status: "error",
        message: err.message,
        code: err.code || "CREATE_TASK_ERROR",
      });
    }
  }
}
