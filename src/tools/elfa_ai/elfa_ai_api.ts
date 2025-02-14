import { SolanaAgentKit } from "../../agent";
import axios, { AxiosInstance } from "axios";

function createAxiosInstance(apiKey: string | undefined): AxiosInstance {
  if (!apiKey) {
    throw new Error(
      "ELFA_AI_API_KEY is not configured in SolanaAgentKit config.",
    );
  }
  return axios.create({
    baseURL: "https://api.elfa.ai",
    headers: {
      "x-elfa-api-key": apiKey,
      "Content-Type": "application/json",
    },
  });
}

export async function pingElfaAiApi(agent: SolanaAgentKit): Promise<any> {
  const apiKey = agent.config.ELFA_AI_API_KEY;
  const axiosInstance = createAxiosInstance(apiKey);
  const response = await axiosInstance.get("/v1/ping");
  return response.data;
}

export async function getElfaAiApiKeyStatus(
  agent: SolanaAgentKit,
): Promise<any> {
  const apiKey = agent.config.ELFA_AI_API_KEY;
  const axiosInstance = createAxiosInstance(apiKey);
  const response = await axiosInstance.get("/v1/key-status");
  return response.data;
}

export async function getSmartMentions(
  agent: SolanaAgentKit,
  limit: number = 100,
  offset: number = 0,
): Promise<any> {
  const apiKey = agent.config.ELFA_AI_API_KEY;
  const axiosInstance = createAxiosInstance(apiKey);
  const response = await axiosInstance.get("/v1/mentions", {
    params: { limit, offset },
  });
  return response.data;
}

export async function getTopMentionsByTicker(
  agent: SolanaAgentKit,
  ticker: string,
  timeWindow: string = "1h",
  page: number = 1,
  pageSize: number = 10,
  includeAccountDetails: boolean = false,
): Promise<any> {
  const apiKey = agent.config.ELFA_AI_API_KEY;
  const axiosInstance = createAxiosInstance(apiKey);
  const response = await axiosInstance.get("/v1/top-mentions", {
    params: { ticker, timeWindow, page, pageSize, includeAccountDetails },
  });
  return response.data;
}

export async function searchMentionsByKeywords(
  agent: SolanaAgentKit,
  keywords: string,
  from: number,
  to: number,
  limit: number = 20,
  cursor?: string,
): Promise<any> {
  const apiKey = agent.config.ELFA_AI_API_KEY;
  const axiosInstance = createAxiosInstance(apiKey);
  const response = await axiosInstance.get("/v1/mentions/search", {
    params: { keywords, from, to, limit, cursor },
  });
  return response.data;
}

export async function getTrendingTokensUsingElfaAi(
  agent: SolanaAgentKit,
  timeWindow: string = "24h",
  page: number = 1,
  pageSize: number = 50,
  minMentions: number = 5,
): Promise<any> {
  const apiKey = agent.config.ELFA_AI_API_KEY;
  const axiosInstance = createAxiosInstance(apiKey);
  const response = await axiosInstance.get("/v1/trending-tokens", {
    params: { timeWindow, page, pageSize, minMentions },
  });
  return response.data;
}

export async function getSmartTwitterAccountStats(
  agent: SolanaAgentKit,
  username: string,
): Promise<any> {
  const apiKey = agent.config.ELFA_AI_API_KEY;
  const axiosInstance = createAxiosInstance(apiKey);
  const response = await axiosInstance.get("/v1/account/smart-stats", {
    params: { username },
  });
  return response.data;
}
