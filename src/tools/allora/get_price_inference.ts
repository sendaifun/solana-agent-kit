import {
  AlloraAPIClient,
  PriceInferenceTimeframe,
  PriceInferenceToken,
  AlloraAPIClientConfig,
  ChainSlug,
} from "@alloralabs/allora-sdk";
import { SolanaAgentKit } from "../../agent";

export async function getPriceInference(
  agent: SolanaAgentKit,
  tokenSymbol: string,
  timeframe: string,
): Promise<string> {
  try {
    const chainSlug =
      agent.config.ALLORA_NETWORK === "mainnet"
        ? ChainSlug.MAINNET
        : ChainSlug.TESTNET;
    const apiKey = agent.config.ALLORA_API_KEY || "UP-d33e797de5134909854be2b7";
    const apiUrl = agent.config.ALLORA_API_URL || "";

    const config: AlloraAPIClientConfig = {
      apiKey: apiKey,
      chainSlug: chainSlug,
      baseAPIUrl: apiUrl,
    };
    const client = new AlloraAPIClient(config);
    const inference = await client.getPriceInference(
      tokenSymbol as PriceInferenceToken,
      timeframe as PriceInferenceTimeframe,
    );

    return inference.inference_data.network_inference_normalized;
  } catch (error: any) {
    throw new Error(
      `Error fetching price inference from Allora: ${error.message}`,
    );
  }
}
