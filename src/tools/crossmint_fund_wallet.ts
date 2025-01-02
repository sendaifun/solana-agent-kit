import { SolanaAgentKit } from "../index";

interface CrossmintFundingResponse {
  status: "success" | "error";
  transactionId?: string;
  amount?: number;
  currency?: string;
  message?: string;
  code?: string;
}

/**
 * Fund a Crossmint wallet with sol
 * @param agent SolanaAgentKit instance
 * @param walletLocator Wallet identifier/address
 * @param amount Amount to fund in sol
 * @param apiKey Crossmint API key
 * @returns Object containing funding transaction details or error information
 */
export async function fundCrossmintWallet(
  agent: SolanaAgentKit,
  walletLocator: string,
  amount: number,
  apiKey: string,
): Promise<CrossmintFundingResponse> {
  try {
    // Validate inputs
    if (!walletLocator) {
      throw new Error("Wallet locator is required");
    }

    if (!apiKey || !apiKey.startsWith("sk_")) {
      throw new Error("Invalid Crossmint API key format");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const response = await fetch(
      `https://staging.crossmint.com/api/v1-alpha2/wallets/${walletLocator}/balances`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          currency: "sol", // Currently only sol is supported
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
      amount: amount,
      currency: "sol",
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message,
      code: error.code || "WALLET_FUNDING_ERROR",
    };
  }
}

/**
 * Get the balance of a Crossmint wallet
 * @param agent SolanaAgentKit instance
 * @param walletLocator Wallet identifier/address
 * @param apiKey Crossmint API key
 * @returns Object containing wallet balance information or error details
 */
export async function getCrossmintWalletBalance(
agent: SolanaAgentKit, walletLocator: string, apiKey: string, network: string,
): Promise<CrossmintFundingResponse> {
  try {
    if (!walletLocator) {
      throw new Error("Wallet locator is required");
    }

    if (!apiKey || !apiKey.startsWith("sk_")) {
      throw new Error("Invalid Crossmint API key format");
    }

    const response = await fetch(
      `https://staging.crossmint.com/api/v1-alpha2/wallets/${walletLocator}/balances`,
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
      amount: data.balance,
      currency: "sol",
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message,
      code: error.code || "BALANCE_FETCH_ERROR",
    };
  }
}

/**
 * Get transaction history for a Crossmint wallet
 * @param agent SolanaAgentKit instance
 * @param walletLocator Wallet identifier/address
 * @param apiKey Crossmint API key
 * @returns Object containing transaction history or error details
 */
export async function getCrossmintWalletTransactions(
  agent: SolanaAgentKit,
  walletLocator: string,
  apiKey: string,
): Promise<CrossmintFundingResponse | { status: "success"; transactions: any[] }> {
  try {
    if (!walletLocator) {
      throw new Error("Wallet locator is required");
    }

    if (!apiKey || !apiKey.startsWith("sk_")) {
      throw new Error("Invalid Crossmint API key format");
    }

    const response = await fetch(
      `https://staging.crossmint.com/api/v1-alpha2/wallets/${walletLocator}/transactions`,
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
      transactions: data.transactions || [],
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message,
      code: error.code || "TRANSACTION_FETCH_ERROR",
    };
  }
}
