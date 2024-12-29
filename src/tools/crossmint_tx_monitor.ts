import { SolanaAgentKit } from "../index";
import { EventEmitter } from "events";

interface CrossmintTransactionMonitorResponse {
  status: "success" | "error";
  transactionStatus?: string;
  signature?: string;
  timestamp?: number;
  message?: string;
  code?: string;
}

interface TransactionStatusUpdate {
  status: string;
  signature?: string;
  timestamp: number;
}

/**
 * Transaction Monitor class for tracking Crossmint transactions
 */
export class CrossmintTransactionMonitor extends EventEmitter {
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(
    private agent: SolanaAgentKit,
    private walletLocator: string,
    private apiKey: string,
    private interval: number = 2000,
  ) {
    super();
  }

  /**
   * Start monitoring a specific transaction
   * @param transactionId Transaction ID to monitor
   * @returns Promise that resolves when monitoring starts
   */
  async startMonitoring(transactionId: string): Promise<void> {
    if (this.isMonitoring) {
      throw new Error("Already monitoring a transaction");
    }

    this.isMonitoring = true;

    const monitorTransaction = async () => {
      try {
        const status = await this.getTransactionStatus(transactionId);

        if (status.status === "success" && status.transactionStatus) {
          this.emit("statusUpdate", {
            status: status.transactionStatus,
            signature: status.signature,
            timestamp: Date.now(),
          });

          if (
            status.transactionStatus === "confirmed" ||
            status.transactionStatus === "failed"
          ) {
            this.stopMonitoring();
            this.emit("complete", status);
          }
        } else if (status.status === "error") {
          this.emit("error", new Error(status.message));
          this.stopMonitoring();
        }
      } catch (error) {
        this.emit("error", error);
      }
    };

    // Initial check
    await monitorTransaction();

    // Set up interval for continuous monitoring
    this.monitoringInterval = setInterval(monitorTransaction, this.interval);
  }

  /**
   * Stop monitoring the current transaction
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    this.emit("stopped");
  }

  /**
   * Get the current status of a transaction
   * @param transactionId Transaction ID to check
   * @returns Promise resolving to transaction status
   */
  private async getTransactionStatus(
    transactionId: string,
  ): Promise<CrossmintTransactionMonitorResponse> {
    try {
      const response = await fetch(
        `https://staging.crossmint.com/api/v1-alpha2/wallets/${this.walletLocator}/transactions/${transactionId}`,
        {
          method: "GET",
          headers: {
            "X-API-KEY": this.apiKey,
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
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
        code: error.code || "TRANSACTION_STATUS_ERROR",
      };
    }
  }
}

/**
 * Create a transaction monitor instance
 * @param agent SolanaAgentKit instance
 * @param walletLocator Wallet identifier/address
 * @param apiKey Crossmint API key
 * @param interval Polling interval in milliseconds (default: 2000)
 * @returns TransactionMonitor instance
 */
export function createTransactionMonitor(
  agent: SolanaAgentKit,
  walletLocator: string,
  apiKey: string,
  interval?: number,
): CrossmintTransactionMonitor {
  return new CrossmintTransactionMonitor(agent, walletLocator, apiKey, interval);
}

/**
 * Monitor a transaction with a callback approach
 * @param agent SolanaAgentKit instance
 * @param walletLocator Wallet identifier/address
 * @param transactionId Transaction ID to monitor
 * @param apiKey Crossmint API key
 * @param callbacks Callback functions for different events
 * @param interval Polling interval in milliseconds (default: 2000)
 * @returns Function to stop monitoring
 */
export function monitorTransaction(
  agent: SolanaAgentKit,
  walletLocator: string,
  transactionId: string,
  apiKey: string,
  callbacks: {
    onStatusUpdate?: (update: TransactionStatusUpdate) => void;
    onComplete?: (status: CrossmintTransactionMonitorResponse) => void;
    onError?: (error: Error) => void;
    onStopped?: () => void;
  },
  interval: number = 2000,
): () => void {
  const monitor = createTransactionMonitor(agent, walletLocator, apiKey, interval);

  if (callbacks.onStatusUpdate) {
    monitor.on("statusUpdate", callbacks.onStatusUpdate);
  }
  if (callbacks.onComplete) {
    monitor.on("complete", callbacks.onComplete);
  }
  if (callbacks.onError) {
    monitor.on("error", callbacks.onError);
  }
  if (callbacks.onStopped) {
    monitor.on("stopped", callbacks.onStopped);
  }

  monitor.startMonitoring(transactionId).catch((error) => {
    if (callbacks.onError) {
      callbacks.onError(error);
    }
  });

  return () => monitor.stopMonitoring();
}
