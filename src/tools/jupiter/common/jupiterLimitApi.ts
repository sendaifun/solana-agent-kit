import axios, { AxiosResponse } from "axios";
import {
  CancelJupiterOrderRequest,
  CancelJupiterOrderResponse,
  CreateJupiterOrderRequest,
  CreateJupiterOrderResponse,
  OpenJupiterOrderResponse,
  JupiterOrderHistoryResponse,
} from "../../../types";

const jupiterApi = axios.create({
  baseURL: "https://api.jup.ag/limit/v2",
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
        `Jupiter API error: ${
          error.response?.data
            ? JSON.stringify(error.response.data)
            : error.message
        }`,
      );
    }
    throw error;
  }
}

export async function createOrderApi(
  data: CreateJupiterOrderRequest,
): Promise<CreateJupiterOrderResponse> {
  return handleApiRequest(async () =>
    jupiterApi.post<CreateJupiterOrderResponse>("/createOrder", data),
  );
}

export async function getOpenOrdersApi(
  walletAddress: string,
): Promise<OpenJupiterOrderResponse[]> {
  return handleApiRequest(async () =>
    jupiterApi.get<OpenJupiterOrderResponse[]>("/openOrders", {
      params: { wallet: walletAddress },
    }),
  );
}

export async function cancelOrdersApi(
  data: CancelJupiterOrderRequest,
): Promise<CancelJupiterOrderResponse> {
  return handleApiRequest(async () =>
    jupiterApi.post<CancelJupiterOrderResponse>("/cancelOrders", data),
  );
}

export async function getOrderHistoryApi(
  walletAddress: string,
  page: number = 1,
): Promise<JupiterOrderHistoryResponse> {
  return handleApiRequest(async () =>
    jupiterApi.get<JupiterOrderHistoryResponse>("/orderHistory", {
      params: {
        wallet: walletAddress,
        page,
      },
    }),
  );
}
