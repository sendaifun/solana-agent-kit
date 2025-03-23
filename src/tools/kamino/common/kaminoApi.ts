import axios, { AxiosResponse } from "axios";
import {
  KaminoStakingYieldsResponse,
} from "../../../types";

const kaminoApi = axios.create({
  baseURL: "https://api.kamino.finance/v2",
  headers: {
    "Content-Type": "application/json",
  },
});

async function handleApiRequest<T>(
  apiCall: () => Promise<AxiosResponse<T>>,
): Promise<T> {
  try {
    const { data } = await apiCall();
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Kamino API error: ${
          error.response?.data
            ? JSON.stringify(error.response.data)
            : error.message
        }`,
      );
    }
    throw error;
  }
}

export async function getStakingYieldsApi(): Promise<KaminoStakingYieldsResponse> {
  return handleApiRequest(async () =>
    kaminoApi.get<KaminoStakingYieldsResponse>("/staking-yields"),
  );
}
