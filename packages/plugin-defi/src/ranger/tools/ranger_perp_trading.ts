import type { SolanaAgentKit } from "solana-agent-kit";
import { signOrSendTX } from "solana-agent-kit";
import {
  TransactionMessage,
  VersionedTransaction,
  VersionedMessage,
  Message,
} from "@solana/web3.js";
import base64js from "base64-js";
import { RANGER_SOR_API_BASE } from "../index";

/**
 * Open perp trade on Ranger (uses SOR API)
 *
 * Calls the SOR API endpoint POST /v1/increase_position to open or increase a perp position.
 *
 * Request body fields:
 *   - fee_payer: string (your Solana wallet public key)
 *   - symbol: string (e.g., "SOL", "BTC")
 *   - side: "Long" | "Short"
 *   - size: number (position size in base asset)
 *   - collateral: number (collateral in USDC)
 *   - size_denomination: string (must match symbol)
 *   - collateral_denomination: string (must be "USDC")
 *   - adjustment_type: string ("Increase")
 *   - ...other optional params (see SOR API docs)
 *
 * Response fields:
 *   - message: string (base64-encoded Solana transaction message)
 *   - meta: object (venue allocations, total size/collateral, price impact, etc.)
 *
 * The function decodes and deserializes the message, adds a recent blockhash, and signs/sends the transaction.
 *
 * @see https://github.com/ranger-finance/sor-sdk
 * @see https://gist.github.com/yongkangc/9ce79d6f6bf4df9ca5b52359adced1ee
 * @see SOR API docs for full details
 */
export async function openPerpTradeRanger({
  agent,
  symbol,
  side,
  size,
  collateral,
  apiKey,
  ...rest
}: {
  agent: SolanaAgentKit;
  symbol: string;
  side: "Long" | "Short";
  size: number;
  collateral: number;
  apiKey: string;
  [key: string]: any;
}) {
  const body = {
    fee_payer: agent.wallet.publicKey.toBase58(),
    symbol,
    side,
    size,
    collateral,
    size_denomination: symbol,
    collateral_denomination: "USDC",
    adjustment_type: "Increase", // TODO: Confirm if this should be "Increase" or another type for open
    ...rest,
  };
  const response = await fetch(`${RANGER_SOR_API_BASE}/v1/increase_position`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Open position request failed: ${error.message}`);
  }
  const data = await response.json();
  const messageBase64 = data.message;
  const messageBytes = base64js.toByteArray(messageBase64);
  const transactionMessage = deserializeTransactionMessage(messageBytes);
  const transaction = new VersionedTransaction(transactionMessage);
  const { blockhash } = await agent.connection.getLatestBlockhash();
  transaction.message.recentBlockhash = blockhash;
  return signOrSendTX(agent, transaction);
}

/**
 * Close perp trade on Ranger (uses SOR API)
 *
 * Calls the SOR API endpoint POST /v1/close_position to close a perp position.
 *
 * Request body fields:
 *   - fee_payer: string (your Solana wallet public key)
 *   - symbol: string (e.g., "SOL", "BTC")
 *   - side: "Long" | "Short"
 *   - adjustment_type: string (e.g., "CloseFlash", "CloseJupiter", "CloseAll")
 *   - ...other optional params (see SOR API docs)
 *
 * Response fields:
 *   - message: string (base64-encoded Solana transaction message)
 *   - meta: object (venue allocations, etc.)
 *
 * The function decodes and deserializes the message, adds a recent blockhash, and signs/sends the transaction.
 *
 * @see https://github.com/ranger-finance/sor-sdk
 * @see https://gist.github.com/yongkangc/9ce79d6f6bf4df9ca5b52359adced1ee
 * @see SOR API docs for full details
 */
export async function closePerpTradeRanger({
  agent,
  symbol,
  side,
  apiKey,
  ...rest
}: {
  agent: SolanaAgentKit;
  symbol: string;
  side: "Long" | "Short";
  apiKey: string;
  [key: string]: any;
}) {
  const body = {
    fee_payer: agent.wallet.publicKey.toBase58(),
    symbol,
    side,
    adjustment_type: "CloseFlash", // TODO: Confirm adjustment_type for close
    ...rest,
  };
  const response = await fetch(`${RANGER_SOR_API_BASE}/v1/close_position`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Close position request failed: ${error.message}`);
  }
  const data = await response.json();
  const messageBase64 = data.message;
  const messageBytes = base64js.toByteArray(messageBase64);
  const transactionMessage = deserializeTransactionMessage(messageBytes);
  const transaction = new VersionedTransaction(transactionMessage);
  const { blockhash } = await agent.connection.getLatestBlockhash();
  transaction.message.recentBlockhash = blockhash;
  return signOrSendTX(agent, transaction);
}

/**
 * Increase perp position on Ranger (uses SOR API)
 *
 * Calls the SOR API endpoint POST /v1/increase_position to increase the size of an existing perp position.
 *
 * Request body fields:
 *   - fee_payer: string (your Solana wallet public key)
 *   - symbol: string (e.g., "SOL", "BTC")
 *   - side: "Long" | "Short"
 *   - size: number (position size in base asset)
 *   - collateral: number (collateral in USDC)
 *   - size_denomination: string (must match symbol)
 *   - collateral_denomination: string (must be "USDC")
 *   - adjustment_type: string ("Increase")
 *   - ...other optional params (see SOR API docs)
 *
 * Response fields:
 *   - message: string (base64-encoded Solana transaction message)
 *   - meta: object (venue allocations, total size/collateral, price impact, etc.)
 *
 * The function decodes and deserializes the message, adds a recent blockhash, and signs/sends the transaction.
 *
 * @see https://github.com/ranger-finance/sor-sdk
 * @see https://gist.github.com/yongkangc/9ce79d6f6bf4df9ca5b52359adced1ee
 * @see SOR API docs for full details
 */
export async function increasePerpPositionRanger({
  agent,
  symbol,
  side,
  size,
  collateral,
  apiKey,
  ...rest
}: {
  agent: SolanaAgentKit;
  symbol: string;
  side: "Long" | "Short";
  size: number;
  collateral: number;
  apiKey: string;
  [key: string]: any;
}) {
  const body = {
    fee_payer: agent.wallet.publicKey.toBase58(),
    symbol,
    side,
    size,
    collateral,
    size_denomination: symbol,
    collateral_denomination: "USDC",
    adjustment_type: "Increase",
    ...rest,
  };
  const response = await fetch(`${RANGER_SOR_API_BASE}/v1/increase_position`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Increase position request failed: ${error.message}`);
  }
  const data = await response.json();
  const messageBase64 = data.message;
  const messageBytes = base64js.toByteArray(messageBase64);
  const transactionMessage = deserializeTransactionMessage(messageBytes);
  const transaction = new VersionedTransaction(transactionMessage);
  const { blockhash } = await agent.connection.getLatestBlockhash();
  transaction.message.recentBlockhash = blockhash;
  return signOrSendTX(agent, transaction);
}

/**
 * Decrease perp position on Ranger (uses SOR API)
 *
 * Calls the SOR API endpoint POST /v1/decrease_position to decrease the size of an existing perp position.
 *
 * Request body fields:
 *   - fee_payer: string (your Solana wallet public key)
 *   - symbol: string (e.g., "SOL", "BTC")
 *   - side: "Long" | "Short"
 *   - size: number (amount to decrease)
 *   - adjustment_type: string (e.g., "DecreaseFlash", "DecreaseJupiter")
 *   - ...other optional params (see SOR API docs)
 *
 * Response fields:
 *   - message: string (base64-encoded Solana transaction message)
 *   - meta: object (venue allocations, etc.)
 *
 * The function decodes and deserializes the message, adds a recent blockhash, and signs/sends the transaction.
 *
 * @see https://github.com/ranger-finance/sor-sdk
 * @see https://gist.github.com/yongkangc/9ce79d6f6bf4df9ca5b52359adced1ee
 * @see SOR API docs for full details
 */
export async function decreasePerpPositionRanger({
  agent,
  symbol,
  side,
  size,
  apiKey,
  ...rest
}: {
  agent: SolanaAgentKit;
  symbol: string;
  side: "Long" | "Short";
  size: number;
  apiKey: string;
  [key: string]: any;
}) {
  const body = {
    fee_payer: agent.wallet.publicKey.toBase58(),
    symbol,
    side,
    size,
    adjustment_type: "DecreaseFlash", // TODO: Confirm adjustment_type for decrease
    ...rest,
  };
  const response = await fetch(`${RANGER_SOR_API_BASE}/v1/decrease_position`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Decrease position request failed: ${error.message}`);
  }
  const data = await response.json();
  const messageBase64 = data.message;
  const messageBytes = base64js.toByteArray(messageBase64);
  const transactionMessage = deserializeTransactionMessage(messageBytes);
  const transaction = new VersionedTransaction(transactionMessage);
  const { blockhash } = await agent.connection.getLatestBlockhash();
  transaction.message.recentBlockhash = blockhash;
  return signOrSendTX(agent, transaction);
}

/**
 * Withdraw balance from Ranger (uses SOR API)
 *
 * Calls the SOR API endpoint POST /v1/withdraw_balance to withdraw available balance from a venue account (e.g., Drift).
 *
 * Request body fields:
 *   - fee_payer: string (your Solana wallet public key)
 *   - symbol: string (token symbol, e.g., "USDC")
 *   - amount: number (amount to withdraw)
 *   - adjustment_type: string ("WithdrawBalanceDrift")
 *   - ...other optional params (see SOR API docs)
 *
 * Response fields:
 *   - message: string (base64-encoded Solana transaction message)
 *   - meta: object (venue, amount, symbol, etc.)
 *
 * The function decodes and deserializes the message, adds a recent blockhash, and signs/sends the transaction.
 *
 * @see https://github.com/ranger-finance/sor-sdk
 * @see https://gist.github.com/yongkangc/9ce79d6f6bf4df9ca5b52359adced1ee
 * @see SOR API docs for full details
 */
export async function withdrawBalanceRanger({
  agent,
  symbol,
  amount,
  apiKey,
  ...rest
}: {
  agent: SolanaAgentKit;
  symbol: string;
  amount: number;
  apiKey: string;
  [key: string]: any;
}) {
  const body = {
    fee_payer: agent.wallet.publicKey.toBase58(),
    symbol,
    amount,
    adjustment_type: "WithdrawBalanceDrift", // TODO: Confirm adjustment_type for withdraw
    ...rest,
  };
  const response = await fetch(`${RANGER_SOR_API_BASE}/v1/withdraw_balance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Withdraw balance request failed: ${error.message}`);
  }
  const data = await response.json();
  const messageBase64 = data.message;
  const messageBytes = base64js.toByteArray(messageBase64);
  const transactionMessage = deserializeTransactionMessage(messageBytes);
  const transaction = new VersionedTransaction(transactionMessage);
  const { blockhash } = await agent.connection.getLatestBlockhash();
  transaction.message.recentBlockhash = blockhash;
  return signOrSendTX(agent, transaction);
}

/**
 * Withdraw collateral from Ranger (uses SOR API)
 *
 * Calls the SOR API endpoint POST /v1/withdraw_collateral to withdraw collateral from an existing position.
 *
 * Request body fields:
 *   - fee_payer: string (your Solana wallet public key)
 *   - symbol: string (e.g., "SOL", "BTC")
 *   - side: "Long" | "Short"
 *   - collateral: number (amount to withdraw)
 *   - collateral_denomination: string (must be "USDC")
 *   - adjustment_type: string ("WithdrawCollateralFlash", etc.)
 *   - ...other optional params (see SOR API docs)
 *
 * Response fields:
 *   - message: string (base64-encoded Solana transaction message)
 *   - meta: object (venue, amount, symbol, etc.)
 *
 * The function decodes and deserializes the message, adds a recent blockhash, and signs/sends the transaction.
 *
 * @see https://github.com/ranger-finance/sor-sdk
 * @see https://gist.github.com/yongkangc/9ce79d6f6bf4df9ca5b52359adced1ee
 * @see SOR API docs for full details
 */
export async function withdrawCollateralRanger({
  agent,
  symbol,
  side,
  collateral,
  apiKey,
  ...rest
}: {
  agent: SolanaAgentKit;
  symbol: string;
  side: "Long" | "Short";
  collateral: number;
  apiKey: string;
  [key: string]: any;
}) {
  const body = {
    fee_payer: agent.wallet.publicKey.toBase58(),
    symbol,
    side,
    collateral,
    collateral_denomination: "USDC",
    adjustment_type: "WithdrawCollateralFlash", // TODO: Confirm adjustment_type for withdraw collateral
    ...rest,
  };
  const response = await fetch(
    `${RANGER_SOR_API_BASE}/v1/withdraw_collateral`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Withdraw collateral request failed: ${error.message}`);
  }
  const data = await response.json();
  const messageBase64 = data.message;
  const messageBytes = base64js.toByteArray(messageBase64);
  const transactionMessage = deserializeTransactionMessage(messageBytes);
  const transaction = new VersionedTransaction(transactionMessage);
  const { blockhash } = await agent.connection.getLatestBlockhash();
  transaction.message.recentBlockhash = blockhash;
  return signOrSendTX(agent, transaction);
}

// Helper function for deserialization
function deserializeTransactionMessage(messageBytes: Uint8Array) {
  try {
    return VersionedMessage.deserialize(messageBytes);
  } catch {
    return Message.from(messageBytes);
  }
}
