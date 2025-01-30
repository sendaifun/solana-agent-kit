import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { AlloraGetInferenceByTopicIdResponse } from "../../types";

export class SolanaAlloraGetInferenceByTopicId extends Tool {
  name = "solana_allora_get_inference_by_topic_id";
  description = `Get the inference for a given topic ID from Allora's API
    Inputs:
    topicId: number as a string, e.g., "42"`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const topicId = Number(input);

      const inference = await this.solanaKit.getInferenceByTopicId(topicId);

      const response: AlloraGetInferenceByTopicIdResponse = {
        status: "success",
        message: "Inference fetched successfully",
        topicId,
        inference,
      };

      return JSON.stringify(response);
    } catch (error: any) {
      const response: AlloraGetInferenceByTopicIdResponse = {
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      };
      return JSON.stringify(response);
    }
  }
}
