import { z } from "zod";
import { Action } from "../../types";

const evaluateMathAction: Action = {
  name: "EVALUATE_MATH_ACTION",
  description: "Evaluate mathematical expressions",
  similes: [
    "Calculate mathematical expressions",
    "evaluate this math problem",
    "solve this equation",
  ],
  examples: [
    [
      {
        input: {
          query: "What is the result of 5 + 3?",
        },
        explanation: "Calculate the sum of 5 and 3",
        output: {
          original_query: "What is the result of 5 + 3?",
          route: {
            tool: "math",
            confidence: 1.0,
            parameters: { expression: "5 + 3" },
            description:
              "The query is a straightforward mathematical expression that requires evaluation, making the math tool the most appropriate choice.",
          },
          response: {
            processed_response: "8",
            original_response: {
              expression: "5 + 3",
              result: "8.0",
              steps: [
                "Received expression: '5 + 3'",
                "Parsed expression (Sympy form): 3 + 5",
                "Simplified expression: 8",
                "Final numeric result: 8.0",
              ],
            },
          },
        },
      },
    ],
  ],
  schema: z.object({
    query: z.string(),
  }),
  handler: async (agent, input) => {
    try {
      return {
        status: "success",
        result: await agent.evaluateMathExpressionUsingSOM(input.query),
      };
    } catch (e) {
      return {
        status: "error",
        message: e,
      };
    }
  },
};

export default evaluateMathAction;
