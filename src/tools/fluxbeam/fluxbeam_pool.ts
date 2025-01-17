import { Tool } from "langchain/tools";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import axios from "axios";

const FLUXBEAM_API_URL = "https://api.fluxbeam.xyz/v1";

export class FluxBeamLiquidityTool extends Tool {
  name = "fluxbeam_liquidity";
  description = "Manage liquidity positions in FluxBeam pools";
  connection: Connection;

  constructor(connection: Connection) {
    super();
    this.connection = connection;
  }

  async _call(input: string): Promise<string> {
    try {
      const { action, payer, tokenA, tokenB, amountA, amountB } =
        JSON.parse(input);

      if (action === "add") {
        const response = await axios.post(
          `${FLUXBEAM_API_URL}/token_pools`,
          {
            payer,
            token_a: tokenA,
            token_b: tokenB,
            token_a_amount: amountA,
            token_b_amount: amountB,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        // Decode the transaction from base64
        const transactionBuffer = Buffer.from(
          response.data.transaction,
          "base64",
        );
        const transaction = VersionedTransaction.deserialize(transactionBuffer);

        return JSON.stringify({
          success: true,
          poolAddress: response.data.pool,
          transaction: response.data.transaction, // Return base64 transaction
          decodedTransaction: transaction,
        });
      }

      return JSON.stringify({
        success: false,
        error: "Unsupported action",
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return JSON.stringify({
          success: false,
          error: `API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
          details: error.response?.data,
        });
      }
      if (error instanceof Error) {
        return JSON.stringify({
          success: false,
          error: error.message,
        });
      }
      return JSON.stringify({
        success: false,
        error: "An unknown error occurred",
      });
    }
  }
}

export class FluxBeamPoolInfoTool extends Tool {
  name = "fluxbeam_pool_info";
  description = "Get information about FluxBeam pools";
  connection: Connection;

  constructor(connection: Connection) {
    super();
    this.connection = connection;
  }

  async _call(input: string): Promise<string> {
    try {
      const { tokenA, tokenB } = JSON.parse(input);

      // Get pool information using GET request
      const response = await axios.get(`${FLUXBEAM_API_URL}/token_pools`, {
        params: {
          token_a: tokenA,
          token_b: tokenB,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      return JSON.stringify({
        success: true,
        poolInfo: response.data,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return JSON.stringify({
          success: false,
          error: `API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
          details: error.response?.data,
        });
      }
      if (error instanceof Error) {
        return JSON.stringify({
          success: false,
          error: error.message,
        });
      }
      return JSON.stringify({
        success: false,
        error: "An unknown error occurred",
      });
    }
  }
}
