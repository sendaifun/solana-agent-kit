import { createHmac, timingSafeEqual } from "crypto";
import type {
  AlchemyNotifyNetwork,
  AlchemyReplaceWebhookAddressesRequest,
  AlchemyUpdateWebhookAddressesRequest,
  AlchemyWebhookRequest,
  AlchemyAgent as SolanaAgentKit,
} from "../types";
import {
  DEFAULT_ALCHEMY_NOTIFY_NETWORK,
  fetchAlchemyJson,
  getAlchemyNotifyAuthToken,
} from "./client";

const ALCHEMY_NOTIFY_API_URL = "https://dashboard.alchemy.com/api";

export async function alchemyCreateWebhook<T = unknown>(
  agent: SolanaAgentKit,
  requestBody: AlchemyWebhookRequest,
  notifyAuthToken?: string,
): Promise<T> {
  const token = getAlchemyNotifyAuthToken(agent, notifyAuthToken);

  return fetchAlchemyJson<T>(`${ALCHEMY_NOTIFY_API_URL}/create-webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Alchemy-Token": token,
    },
    body: JSON.stringify(requestBody),
  });
}

export async function alchemyCreateAddressActivityWebhook<T = unknown>(
  agent: SolanaAgentKit,
  addresses: string[],
  webhookUrl: string,
  options: {
    network?: AlchemyNotifyNetwork;
    name?: string;
    notifyAuthToken?: string;
  } = {},
): Promise<T> {
  if (!addresses.length) {
    throw new Error("At least one address is required");
  }

  return alchemyCreateWebhook<T>(
    agent,
    {
      network: options.network ?? DEFAULT_ALCHEMY_NOTIFY_NETWORK,
      webhook_type: "ADDRESS_ACTIVITY",
      webhook_url: webhookUrl,
      addresses,
      name: options.name,
    },
    options.notifyAuthToken,
  );
}

export async function alchemyDeleteWebhook<T = unknown>(
  agent: SolanaAgentKit,
  webhookId: string,
  notifyAuthToken?: string,
): Promise<T> {
  const token = getAlchemyNotifyAuthToken(agent, notifyAuthToken);
  const url = new URL(`${ALCHEMY_NOTIFY_API_URL}/delete-webhook`);
  url.searchParams.set("webhook_id", webhookId);

  return fetchAlchemyJson<T>(url.toString(), {
    method: "DELETE",
    headers: {
      "X-Alchemy-Token": token,
    },
  });
}

export async function alchemyUpdateWebhookAddresses<T = unknown>(
  agent: SolanaAgentKit,
  webhookId: string,
  addressesToAdd: string[] = [],
  addressesToRemove: string[] = [],
  notifyAuthToken?: string,
): Promise<T> {
  if (!addressesToAdd.length && !addressesToRemove.length) {
    throw new Error("At least one address must be added or removed");
  }

  const token = getAlchemyNotifyAuthToken(agent, notifyAuthToken);
  const requestBody: AlchemyUpdateWebhookAddressesRequest = {
    webhook_id: webhookId,
    addresses_to_add: addressesToAdd,
    addresses_to_remove: addressesToRemove,
  };

  return fetchAlchemyJson<T>(
    `${ALCHEMY_NOTIFY_API_URL}/update-webhook-addresses`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Alchemy-Token": token,
      },
      body: JSON.stringify(requestBody),
    },
  );
}

export async function alchemyReplaceWebhookAddresses<T = unknown>(
  agent: SolanaAgentKit,
  webhookId: string,
  addresses: string[],
  notifyAuthToken?: string,
): Promise<T> {
  if (!addresses.length) {
    throw new Error("At least one address is required");
  }

  const token = getAlchemyNotifyAuthToken(agent, notifyAuthToken);
  const requestBody: AlchemyReplaceWebhookAddressesRequest = {
    webhook_id: webhookId,
    addresses,
  };

  return fetchAlchemyJson<T>(
    `${ALCHEMY_NOTIFY_API_URL}/update-webhook-addresses`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Alchemy-Token": token,
      },
      body: JSON.stringify(requestBody),
    },
  );
}

export async function alchemyListWebhooks<T = unknown>(
  agent: SolanaAgentKit,
  notifyAuthToken?: string,
): Promise<T> {
  const token = getAlchemyNotifyAuthToken(agent, notifyAuthToken);

  return fetchAlchemyJson<T>(`${ALCHEMY_NOTIFY_API_URL}/team-webhooks`, {
    method: "GET",
    headers: {
      "X-Alchemy-Token": token,
    },
  });
}

export function alchemyVerifyWebhookSignature(
  rawBody: string,
  signature: string,
  signingKey: string,
): boolean {
  const digest = createHmac("sha256", signingKey)
    .update(rawBody, "utf8")
    .digest("hex");

  const signatureBuffer = Buffer.from(signature, "hex");
  const digestBuffer = Buffer.from(digest, "hex");

  if (signatureBuffer.length !== digestBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, digestBuffer);
}
