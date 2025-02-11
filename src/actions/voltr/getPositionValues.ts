import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";

const getVoltrPositionValuesAction: Action = {
  name: "GET_VOLTR_POSITION_VALUES",
  similes: [
    "get voltr vault value",
    "check voltr position",
    "get voltr vault assets",
    "view voltr holdings",
    "check voltr portfolio",
    "get voltr vault breakdown",
  ],
  description:
    "Get the current position values and total assets for a Voltr vault",
  examples: [
    [
      {
        input: {
          vault: "7opUkqYtxmQRriZvwZkPcg6LqmGjAh1RSEsVrdsGDx5K",
        },
        output: {
          status: "success",
          data: {
            totalValue: 1000000,
            positions: [
              {
                strategy: "4JHtgXyMb9gFJ1hGd2sh645jrZcxurSG3QP7Le3aTMTx",
                value: 600000,
              },
              {
                strategy: "4i9kzGr1UkxBCCUkQUQ4vsF51fjdt2knKxrwM1h1NW4g",
                value: 400000,
              },
            ],
          },
          message: "Successfully retrieved Voltr vault position values",
        },
        explanation:
          "Get position values for a Voltr vault showing total value and value per strategy",
      },
    ],
  ],
  schema: z.object({
    vault: z
      .string()
      .min(1)
      .describe("The public key of the Voltr vault to query, e.g., 'Ga27...'"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const vault = new PublicKey(input.vault);

      const result = await agent.voltrGetPositionValues(vault);
      const positionData = JSON.parse(result);

      return {
        status: "success",
        vault: vault.toBase58(),
        data: positionData,
        message: "Successfully retrieved Voltr vault position values",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get vault position values: ${error.message}`,
      };
    }
  },
};

export default getVoltrPositionValuesAction;
