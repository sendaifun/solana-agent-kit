import { SolanaAgentKit } from "../index";

interface CrossmintSendTransactionResponse {
  status: "success" | "error";
  transactionId?: string;
  signature?: string;
  message?: string;
  code?: string;
}

/**
 * Send a prepared transaction through Crossmint
 * @param agent SolanaAgentKit instance
 * @param walletLocator Wallet identifier/address
 * @param serializedTransaction Base58 encoded transaction
 * @param apiKey Crossmint API key
 * @returns Object containing transaction details or error information
 */
export async function sendCrossmintTransaction(
  agent: SolanaAgentKit,
  walletLocator: string,
  serializedTransaction: string,
  apiKey: string,
): Promise<CrossmintSendTransactionResponse> {
  try {
    // Input validation
    if (!walletLocator) {
      throw new Error("Wallet locator is required");
    }

    if (!serializedTransaction) {
      throw new Error("Serialized transaction is required");
    }

    if (!apiKey || !apiKey.startsWith("sk_")) {
      throw new Error("Invalid Crossmint API key format");
    }

    const response = await fetch(
      `https://staging.crossmint.com/api/v1-alpha2/wallets/${walletLocator}/transactions`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          params: {
            transaction: serializedTransaction,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();

    return {
      status: "success",
      transactionId: data.transactionId,
      signature: data.signature,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message,
      code: error.code || "TRANSACTION_SEND_ERROR",
    };
  }
}

/**
 * Get transaction status from Crossmint
 * @param agent SolanaAgentKit instance
 * @param walletLocator Wallet identifier/address
 * @param transactionId Transaction ID to check
 * @param apiKey Crossmint API key
 * @returns Object containing transaction status or error information
 */
export async function getCrossmintTransactionStatus(
  agent: SolanaAgentKit,
  walletLocator: string,
  transactionId: string,
  apiKey: string,
): Promise<{
  status: "success" | "error";
  transactionStatus?: string;
  signature?: string;
  message?: string;
}> {
  try {
    const response = await fetch(
      `https://staging.crossmint.com/api/v1-alpha2/wallets/${walletLocator}/transactions/${transactionId}`,
      {
        method: "GET",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();

    return {
      status: "success",
      transactionStatus: data.status,
      signature: data.signature,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message,
    };
  }
}

/**
 * Wait for a transaction to be confirmed
 * @param agent SolanaAgentKit instance
 * @param walletLocator Wallet identifier/address
 * @param transactionId Transaction ID to monitor
 * @param apiKey Crossmint API key
 * @param timeout Timeout in milliseconds (default: 60000)
 * @param interval Polling interval in milliseconds (default: 2000)
 * @returns Object containing final transaction status
 */
export async function waitForTransactionConfirmation(
  agent: SolanaAgentKit,
  walletLocator: string,
  transactionId: string,
  apiKey: string,
  timeout: number = 60000,
  interval: number = 2000,
): Promise<{
  status: "success" | "error";
  transactionStatus?: string;
  signature?: string;
  message?: string;
}> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const status = await getCrossmintTransactionStatus(
      agent,
      walletLocator,
      transactionId,
      apiKey,
    );

    if (status.status === "error") {
      return status;
    }

    if (
      status.transactionStatus === "confirmed" ||
      status.transactionStatus === "failed"
    ) {
      return status;
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return {
    status: "error",
    message: "Transaction confirmation timeout",
  };
}
