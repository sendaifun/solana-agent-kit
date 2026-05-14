import axios from "redaxios";
import { SolanaAgentKit } from "solana-agent-kit";
import { CROSSMINT_PRODUCTION_API_URL } from "../constants";
import { Order } from "../types";

export default async function confirmOrder(
  agent: SolanaAgentKit,
  orderId: string,
  retryUptoConfirmation: boolean = false,
): Promise<{
  order?: Order;
  success: boolean;
  error?: string;
  status?: string;
}> {
  try {
    const apiKey = agent.config.OTHER_API_KEYS?.CROSSMINT_API_KEY;

    const checkOrderStatus = async () => {
      const response = await axios.get(
        `${CROSSMINT_PRODUCTION_API_URL}/orders/${orderId}`,
        {
          headers: {
            "X-API-KEY": apiKey || "",
          },
        },
      );

      const order: Order = response.data;
      return order;
    };

    if (!retryUptoConfirmation) {
      const order = await checkOrderStatus();
      return {
        order: order,
        success: true,
      };
    }

    // Start polling for order completion
    const pollInterval = setInterval(async () => {
      try {
        const order = await checkOrderStatus();

        if (order.payment.status === "completed") {
          clearInterval(pollInterval);
          return {
            success: true,
            status: "completed",
            order: order,
          };
        } else {
          clearInterval(pollInterval);
          return {
            success: true,
            status: order.payment.status,
            order: order,
          };
        }
      } catch (error: any) {
        clearInterval(pollInterval);
        return {
          success: false,
          error: error.message,
        };
      }
    }, 3000); // Poll every 3 seconds

    // Timeout after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      return {
        success: false,
        error: "Payment confirmation timeout",
      };
    }, 120000);

    return {
      success: false,
      error: "Payment confirmation timeout",
    };
  } catch (error: any) {
    return {
      status: "pending",
      success: false,
      error: error.message,
    };
  }
}
