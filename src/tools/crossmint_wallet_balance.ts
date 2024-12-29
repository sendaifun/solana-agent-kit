import { SolanaAgentKit } from "../index";

interface CrossmintBalanceResponse {
  status: "success" | "error";
  balance?: number;
  currency?: string;
  message?: string;
  code?: string;
}

/**
 * Get detailed balance information for a Crossmint wallet
 * @param agent SolanaAgentKit instance
 * @param walletLocator Wallet identifier/address
 * @param currency Currency to check balance for (default: 'SOL')
 * @param network Network to use (default: 'devnet')
 * @returns Object containing detailed balance information or error details
 */
export async function getCrossmintWalletBalance(
  agent: SolanaAgentKit,
  walletLocator: string,
  currency: string = "SOL",
  network: string = "devnet"
): Promise<CrossmintBalanceResponse> {
  try {
    // Input validation
    if (!walletLocator) {
      throw new Error("Wallet locator is required");
    }

    // Get API key from environment
    const apiKey = process.env.CROSSMINT_API_KEY;
    if (!apiKey || !apiKey.startsWith("sk_")) {
      throw new Error("Invalid or missing CROSSMINT_API_KEY in environment variables");
    }

    // Make API request
    const response = await fetch(
      `https://staging.crossmint.com/api/v1-alpha2/wallets/${walletLocator}/balances?currency=${currency.toLowerCase()}&network=${network}`,
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
      balance: data.balance || 0,
      currency: currency,
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
 * Check if a wallet has sufficient balance for a given amount
 * @param agent SolanaAgentKit instance
 * @param walletLocator Wallet identifier/address
 * @param requiredAmount Amount needed
 * @param apiKey Crossmint API key
 * @param currency Currency to check balance for (default: 'usdc')
 * @returns Object containing balance check result
 */
export async function checkSufficientBalance(
  agent: SolanaAgentKit,
  walletLocator: string,
  requiredAmount: number,
  apiKey: string,
  currency: string = "SOL",
): Promise<{
  status: "success" | "error";
  isEnough: boolean;
  availableBalance?: number;
  shortfall?: number;
  message?: string;
}> {
  try {
    const balanceResponse = await getCrossmintWalletBalance(
      agent,
      walletLocator,
      apiKey,
      currency,
    );

    if (balanceResponse.status === "error") {
      throw new Error(balanceResponse.message);
    }

    const availableBalance = balanceResponse.balance!;
    const isEnough = availableBalance >= requiredAmount;
    const shortfall = isEnough ? 0 : requiredAmount - availableBalance;

    return {
      status: "success",
      isEnough,
      availableBalance,
      shortfall,
      message: isEnough
        ? "Sufficient balance available"
        : `Insufficient balance. Shortfall: ${shortfall} ${currency.toUpperCase()}`,
    };
  } catch (error: any) {
    return {
      status: "error",
      isEnough: false,
      message: error.message,
    };
  }
}

/**
 * Monitor balance changes for a wallet
 * @param agent SolanaAgentKit instance
 * @param walletLocator Wallet identifier/address
 * @param apiKey Crossmint API key
 * @param callback Callback function to handle balance updates
 * @param interval Polling interval in milliseconds (default: 30000)
 * @returns Function to stop monitoring
 */
export function monitorWalletBalance(
  agent: SolanaAgentKit,
  walletLocator: string,
  apiKey: string,
  callback: (balance: CrossmintBalanceResponse) => void,
  interval: number = 30000,
): () => void {
  let isMonitoring = true;

  const poll = async () => {
    while (isMonitoring) {
      try {
        const balance = await getCrossmintWalletBalance(
          agent,
          walletLocator,
          apiKey,
        );
        callback(balance);
        await new Promise((resolve) => setTimeout(resolve, interval));
      } catch (error) {
        console.error("Balance monitoring error:", error);
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }
  };

  poll();

  // Return function to stop monitoring
  return () => {
    isMonitoring = false;
  };
}
