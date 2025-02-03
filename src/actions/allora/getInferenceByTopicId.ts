import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { getInferenceByTopicId } from "../../tools";

const getInferenceByTopicIdAction: Action = {
  name: "ALLORA_GET_INFERENCE_BY_TOPIC_ID",
  similes: ["get allora inference for topic 42", "get inference for topic 42"],
  description: "Get the inference for a given topic ID from Allora's API",
  examples: [
    [
      {
        input: {
          topicId: "42",
        },
        output: {
          status: "success",
          message: "Inference fetched successfully",
          inference: "The inference for topic 42 is 100",
        },
        explanation: "Get the inference for topic 42",
      },
    ],
  ],
  schema: z.object({
    topicId: z
      .string()
      .min(1)
      .describe("The topic ID to get the inference for"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { topicId } = input;

      const inference = await getInferenceByTopicId(agent, topicId);
      return {
        status: "success",
        message: "Inference fetched successfully",
        inference: `The inference for topic ${topicId} is ${inference}`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch inference from Allora: ${error.message}`,
      };
    }
  },
};

export default getInferenceByTopicIdAction;
