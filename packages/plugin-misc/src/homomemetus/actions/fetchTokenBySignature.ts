import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { fetch_token_by_signature } from "../tools/fetch_token_by_signature";

const fetchTokenBySignatureAction: Action = {
  name: "HOMOMEMETUS_FETCH_TOKEN_BY_SIGNATURE",
  description: "Creation-signature-based token filter",
  similes: ["Fetch token by signature", "Get token by signature"],
  examples: [
    [
      {
        input: {
          signature:
            "4RbsQ2u4LyVf16H4Ni1cDWvr22jwVRfdU3dYjLuGTMdeSTE4xEGjVJ9d3Rc3RfQdBAM2CFx6YAEtRjbK9AQM37PB",
        },
        output: {
          success: true,
          data: [
            {
              signature:
                "4RbsQ2u4LyVf16H4Ni1cDWvr22jwVRfdU3dYjLuGTMdeSTE4xEGjVJ9d3Rc3RfQdBAM2CFx6YAEtRjbK9AQM37PB",
              mint_pubkey: "2sYy6HuL6YsdJPWFD8vW6xCXxSWs9equAk2tjF7Mpump",
              initial_buy_account_pubkey:
                "6WvqHhcwB2TLdX9HkmScC95W8jXrp8c2mYVdqYdW9C8m",
              initial_buy_token_account_pubkey:
                "25AvQ1HhUX7GSv3MakRRNCAU3ZHajghzCpZzqhwygUPN",
              creator_pubkey: "6WvqHhcwB2TLdX9HkmScC95W8jXrp8c2mYVdqYdW9C8m",
              creator_token_account_pubkey:
                "25AvQ1HhUX7GSv3MakRRNCAU3ZHajghzCpZzqhwygUPN",
              initial_buy_amount: 17418831.135929,
              initial_buy_sol_amount: 0.495049504,
              bondingcurve_pubkey:
                "3PrYKQZfcDaHVfa8UrFMMHMV6ANE8bfVxJEjrH15ZckC",
              market_cap: 28.889345891625005,
              name: "Damn I Love Freedom",
              symbol: "DILF",
              uri: "https://ipfs.io/ipfs/bafkreih7iokkuz5njghxig4piek7eigb7noo5mvf6mxjzg6kcdtsa6azva",
              timestamp: "2025-06-24T07:00:41.722+00:00",
            },
          ],
        },
        explanation: "Filtered token by signature successfully fetched",
      },
    ],
  ],
  schema: z.object({
    signature: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const { signature } = input;

      const result = await fetch_token_by_signature(signature);
      return {
        status: "success",
        data: result,
        message: "Token by signature successfully fetched",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch token by signature ${error.message}`,
        code: error.code || "HOMOMEMETUS_FETCH_TOKEN_BY_SIGNATURE_FALIED",
      };
    }
  },
};

export default fetchTokenBySignatureAction;
