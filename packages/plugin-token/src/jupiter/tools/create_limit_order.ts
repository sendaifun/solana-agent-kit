import { signOrSendTX } from "solana-agent-kit";
import type { SolanaAgentKit } from "solana-agent-kit";
import type { CreateJupiterOrderRequest } from "../types";
import { createOrderApi } from "./common/jupiterLimitApi";
import { deserializeTransaction } from "./common/transactions";

interface CreateLimitOrderResponse {
  order: string;
  signature: Awaited<ReturnType<typeof signOrSendTX>>;
  success: boolean;
}

export async function createLimitOrder(
  agent: SolanaAgentKit,
  params: CreateJupiterOrderRequest,
): Promise<CreateLimitOrderResponse> {
  const wallet = agent.wallet.publicKey.toString();
  params.maker = params.payer = wallet;

  try {
    const data = await createOrderApi(params);
    const transaction = deserializeTransaction(data.tx);
    const signature = await signOrSendTX(agent, transaction);

    return {
      signature,
      order: data.order,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Error creating limit order: ${error}`);
  }
}
