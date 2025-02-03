import { SolanaAgentKit } from "../../index";
import { HeliusWebhookResponse, HeliusWebhookIdResponse } from "../../index";

export async function create_HeliusWebhook(
  agent: SolanaAgentKit,
  accountAddresses: string[],
  webhookURL: string,
): Promise<HeliusWebhookResponse> {
  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/webhooks?api-key=${agent.config.HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookURL,
          transactionTypes: ["Any"],
          accountAddresses,
          webhookType: "enhanced",
          txnStatus: "all",
        }),
      },
    );

    const data = await response.json();
    return {
      webhookURL: data.webhookURL,
      webhookID: data.webhookID,
    };
  } catch (error: any) {
    throw new Error(`Failed to create Webhook: ${error.message}`);
  }
}

/**
 * Retrieves a Helius Webhook by ID, returning only the specified fields.
 *
 * @param agent     - An instance of SolanaAgentKit (with .config.HELIUS_API_KEY)
 * @param webhookID - The unique ID of the webhook to retrieve
 *
 * @returns A HeliusWebhook object containing { wallet, webhookURL, transactionTypes, accountAddresses, webhookType }
 */
export async function getHeliusWebhook(
  agent: SolanaAgentKit,
  webhookID: string,
): Promise<HeliusWebhookIdResponse> {
  try {
    const apiKey = agent.config.HELIUS_API_KEY;
    if (!apiKey) {
      throw new Error("HELIUS_API_KEY is missing in agent.config");
    }

    const response = await fetch(
      `https://api.helius.xyz/v0/webhooks/${webhookID}?api-key=${apiKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch webhook with ID ${webhookID}. ` +
          `Status Code: ${response.status}`,
      );
    }

    const data = await response.json();

    return {
      wallet: data.wallet,
      webhookURL: data.webhookURL,
      transactionTypes: data.transactionTypes,
      accountAddresses: data.accountAddresses,
      webhookType: data.webhookType,
    };
  } catch (error: any) {
    throw new Error(`Failed to get webhook by ID: ${error.message}`);
  }
}

/**
 * Deletes a Helius Webhook by its ID.
 *
 * @param agent     - An instance of SolanaAgentKit (with .config.HELIUS_API_KEY)
 * @param webhookID - The unique ID of the webhook to delete
 *
 * @returns The response body from the Helius API (which may contain status or other info)
 */
export async function deleteHeliusWebhook(
  agent: SolanaAgentKit,
  webhookID: string,
): Promise<any> {
  try {
    const apiKey = agent.config.HELIUS_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Helius API key in agent.config.HELIUS_API_KEY");
    }

    const url = `https://api.helius.xyz/v0/webhooks/${webhookID}?api-key=${apiKey}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete webhook: ${response.status} ${response.statusText}`,
      );
    }
    if (response.status === 204) {
      return { message: "Webhook deleted successfully (no content returned)" };
    }
    const contentLength = response.headers.get("Content-Length");
    if (contentLength === "0" || !contentLength) {
      return { message: "Webhook deleted successfully (empty body)" };
    }

    // Otherwise, parse as JSON
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error deleting Helius Webhook:", error.message);
    throw new Error(`Failed to delete Helius Webhook: ${error.message}`);
  }
}
