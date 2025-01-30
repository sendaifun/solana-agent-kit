import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { getAllTopics } from "../../tools";

const getAllTopicsAction: Action = {
  name: "ALLORA_GET_ALL_TOPICS",
  similes: [
    "get all topics",
    "get all inference topics",
    "get allora topics",
    "get all allora topics",
    "get allora inference topics",
    "get all allora inference topics",
  ],
  description: "Get all topics from Allora's API",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          message: "Topics fetched successfully",
          topics:
            '[{"topic_id":5,"topic_name":"SOL 10min Prediction","description":null,"epoch_length":120,"ground_truth_lag":120,"loss_method":"mse","worker_submission_window":12,"worker_count":26859,"reputer_count":2735,"total_staked_allo":1.0200000004892,"total_emissions_allo":12.610109325686093,"is_active":true,"is_endorsed":false,"forge_competition_id":null,"forge_competition_start_date":null,"forge_competition_end_date":null,"updated_at":"2025-01-21T17:21:21.321Z"}]',
        },
        explanation: "Get all topics from Allora's API",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SolanaAgentKit) => {
    const topics = await getAllTopics(agent);
    return {
      status: "success",
      message: "Topics fetched successfully",
      topics: topics,
    };
  },
};

export default getAllTopicsAction;
