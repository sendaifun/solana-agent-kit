import {
  Intent,
  monitorOrder,
  ORDER_STATUS,
  SubmitIntentResponse,
} from "@dflow-protocol/swap-api-utils";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";
import {
  TOKENS,
  DEFAULT_OPTIONS,
  DFLOW_SWAP_API,
  REFERRAL_PROGRAM_ADDRESS,
} from "../constants";
import { unpackMint } from "@solana/spl-token";
import { assertUnreachable } from "../utils/coding";

export type TradeResult = {
  /** Address of the declarative swap order */
  orderAddress: string;
  /** Input quantity consumed */
  qtyIn: bigint;
  /** Output quantity */
  qtyOut: bigint;
  /** Number of decimals for the input mint */
  inputDecimals: number;
  /** Number of decimals for the output mint */
  outputDecimals: number;
};

/**
 * Swap tokens using DFlow
 * @param agent SolanaAgentKit instance
 * @param outputMint Target token mint address
 * @param inputAmount Amount to swap (in token decimals)
 * @param inputMint Source token mint address (defaults to USDC)
 * @param slippageBps Slippage tolerance in basis points (default: 300 = 3%)
 * @returns Trade result object containing details about the swap
 */

export async function trade(
  agent: SolanaAgentKit,
  outputMint: PublicKey,
  inputAmount: number,
  inputMint: PublicKey = TOKENS.USDC,
  slippageBps: number = DEFAULT_OPTIONS.SLIPPAGE_BPS,
): Promise<TradeResult> {
  try {
    const rpcEndpoint = agent.connection.rpcEndpoint;
    if (rpcEndpoint.includes("api.mainnet-beta.solana.com")) {
      throw new Error(
        `Cannot swap using RPC endpoint ${rpcEndpoint}. Please use a paid RPC endpoint.`,
      );
    }

    const [inputDecimals, outputDecimals] = await getDecimals(
      agent.connection,
      inputMint,
      outputMint,
    );

    // Calculate the correct amount based on actual decimals
    const scaledAmount = inputAmount * Math.pow(10, inputDecimals);

    let feeAccount;
    if (agent.config.JUPITER_REFERRAL_ACCOUNT) {
      [feeAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("referral_ata"),
          new PublicKey(agent.config.JUPITER_REFERRAL_ACCOUNT).toBuffer(),
          outputMint.toBuffer(),
        ],
        new PublicKey(REFERRAL_PROGRAM_ADDRESS),
      );
    }

    const intentResponse = await fetch(
      `${DFLOW_SWAP_API}/intent?` +
        `userPublicKey=${agent.wallet_address.toString()}` +
        `&inputMint=${inputMint.toString()}` +
        `&outputMint=${outputMint.toString()}` +
        `&amount=${scaledAmount}` +
        `&slippageBps=${slippageBps}` +
        `${agent.config.JUPITER_FEE_BPS ? `&platformFeeBps=${agent.config.JUPITER_FEE_BPS}` : ""}` +
        `${feeAccount ? `&feeAccount=${feeAccount}` : ""}` +
        `${agent.config.JUPITER_REFERRAL_ACCOUNT ? `&referralAccount=${agent.config.JUPITER_REFERRAL_ACCOUNT}` : ""}`,
    );
    if (!intentResponse.ok) {
      const msg = await parseApiError(intentResponse);
      throw new Error("Failed to fetch quote" + (msg ? `: ${msg}` : ""));
    }
    const intentData: Intent = await intentResponse.json();
    if (!intentData.openTransaction) {
      throw new Error("Cannot execute quote");
    }

    const openTransaction = Transaction.from(
      Buffer.from(intentData.openTransaction, "base64"),
    );
    openTransaction.sign(agent.wallet);

    const submitIntentResponse = await fetch(
      `${DFLOW_SWAP_API}/submit-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse: intentData,
          signedOpenTransaction: openTransaction.serialize().toString("base64"),
        }),
      },
    );
    if (!submitIntentResponse.ok) {
      const msg = await parseApiError(submitIntentResponse);
      throw new Error("Failed to submit intent" + (msg ? `: ${msg}` : ""));
    }
    const submitIntentData: SubmitIntentResponse =
      await submitIntentResponse.json();

    const result = await monitorOrder({
      connection: agent.connection,
      intent: intentData,
      signedOpenTransaction: openTransaction,
      submitIntentResponse: submitIntentData,
    });

    switch (result.status) {
      case ORDER_STATUS.OPEN_EXPIRED: {
        throw new Error("Transaction expired");
      }

      case ORDER_STATUS.OPEN_FAILED: {
        throw new Error("Transaction failed");
      }

      case ORDER_STATUS.CLOSED: {
        if (result.fills.length > 0) {
          const qtyIn = result.fills.reduce((acc, x) => acc + x.qtyIn, 0n);
          const qtyOut = result.fills.reduce((acc, x) => acc + x.qtyOut, 0n);
          return {
            orderAddress: submitIntentData.orderAddress,
            qtyIn,
            qtyOut,
            inputDecimals,
            outputDecimals,
          };
        } else {
          throw new Error("Order not filled");
        }
      }

      case ORDER_STATUS.PENDING_CLOSE: {
        if (result.fills.length > 0) {
          const qtyIn = result.fills.reduce((acc, x) => acc + x.qtyIn, 0n);
          const qtyOut = result.fills.reduce((acc, x) => acc + x.qtyOut, 0n);
          return {
            orderAddress: submitIntentData.orderAddress,
            qtyIn,
            qtyOut,
            inputDecimals,
            outputDecimals,
          };
        } else {
          throw new Error("Order not filled");
        }
      }

      default: {
        assertUnreachable(result);
      }
    }
  } catch (error: any) {
    throw new Error(`Swap failed: ${error.message}`);
  }
}

async function getDecimals(
  connection: Connection,
  inputMint: PublicKey,
  outputMint: PublicKey,
): Promise<[number, number]> {
  let inputMintAccount, outputMintAccount;
  try {
    [inputMintAccount, outputMintAccount] =
      await connection.getMultipleAccountsInfo([inputMint, outputMint]);
  } catch {
    throw new Error("Failed to fetch mint accounts");
  }

  if (!inputMintAccount) {
    throw new Error("Invalid input mint");
  }
  if (!outputMintAccount) {
    throw new Error("Invalid output mint");
  }

  let inputDecimals;
  try {
    inputDecimals = unpackMint(inputMint, inputMintAccount).decimals;
  } catch {
    throw new Error("Invalid input mint");
  }

  let outputDecimals;
  try {
    outputDecimals = unpackMint(outputMint, outputMintAccount).decimals;
  } catch {
    throw new Error("Invalid output mint");
  }

  return [inputDecimals, outputDecimals];
}

async function parseApiError(response: Response): Promise<string | null> {
  try {
    const body = await response.text();
    try {
      const parsed = JSON.parse(body);
      if (parsed.msg) {
        return parsed.msg;
      } else {
        return body;
      }
    } catch {
      return body;
    }
  } catch {
    return null;
  }
}
