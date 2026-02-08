import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";
import {
  getTokens,
  getToken,
  getMessages,
  getLendingInfo,
  getLoanPosition,
  buildBuyTransaction,
  buildSellTransaction,
  buildCreateTokenTransaction,
  buildVoteTransaction,
  buildStarTransaction,
  buildMessageTransaction,
  buildBorrowTransaction,
  buildRepayTransaction,
  buildLiquidateTransaction,
  confirmTransaction,
} from "torchsdk";
import type {
  TokenSummary,
  TokenDetail,
  TokenMessage,
  LendingInfo,
  LoanPositionInfo,
} from "torchsdk";

// Re-export SDK types with Torch-prefixed names for backwards compatibility
export type TorchToken = TokenSummary;
export type TorchTokenDetail = TokenDetail;
export type TorchMessage = TokenMessage;
export type TorchLendingInfo = LendingInfo;
export type TorchLoanPosition = LoanPositionInfo;

export interface TorchConfirmResult {
  confirmed: boolean;
  event_type: "token_launch" | "trade_complete" | "governance_vote" | "unknown";
  feedback_sent: boolean;
}

const SAID_API_URL = "https://api.saidprotocol.com/api";

/**
 * List tokens on Torch Market
 * @param agent SolanaAgentKit instance
 * @param status Filter by status: bonding, complete, migrated, or all
 * @param sort Sort by: newest, volume, or marketcap
 * @param limit Number of tokens to return (max 100)
 * @returns Array of token summaries
 */
export const torchListTokens = async (
  agent: SolanaAgentKit,
  status?: "bonding" | "complete" | "migrated" | "all",
  sort?: "newest" | "volume" | "marketcap",
  limit?: number,
): Promise<TorchToken[]> => {
  const result = await getTokens(agent.connection, {
    status: status || "all",
    sort,
    limit,
  });
  return result.tokens;
};

/**
 * Get detailed information about a token
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @returns Token details including treasury state and votes
 */
export const torchGetToken = async (
  agent: SolanaAgentKit,
  mint: string,
): Promise<TorchTokenDetail> => {
  return getToken(agent.connection, mint);
};

/**
 * Buy tokens on Torch Market bonding curve
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param amountLamports Amount of SOL in lamports (1 SOL = 1e9 lamports)
 * @param slippageBps Slippage tolerance in basis points (default 100 = 1%)
 * @param vote Vote on treasury outcome -- required on first buy, omit on subsequent buys.
 *             "burn" = destroy treasury tokens (deflationary), "return" = add to LP (deeper liquidity)
 * @param message Optional message to bundle with the trade (SPL Memo, max 500 chars)
 * @returns Transaction signature
 */
export const torchBuyToken = async (
  agent: SolanaAgentKit,
  mint: string,
  amountLamports: number,
  slippageBps: number = 100,
  vote?: "burn" | "return",
  message?: string,
) => {
  const result = await buildBuyTransaction(agent.connection, {
    mint,
    buyer: agent.wallet.publicKey.toBase58(),
    amount_sol: amountLamports,
    slippage_bps: slippageBps,
    ...(vote ? { vote } : {}),
  });

  const tx = result.transaction;

  // Bundle message as SPL Memo if provided
  if (message) {
    const MEMO_PROGRAM = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
    tx.add(
      new TransactionInstruction({
        programId: MEMO_PROGRAM,
        keys: [{ pubkey: agent.wallet.publicKey, isSigner: true, isWritable: false }],
        data: Buffer.from(message.slice(0, 500), "utf-8"),
      }),
    );
  }

  return signOrSendTX(agent, tx);
};

/**
 * Sell tokens back to Torch Market bonding curve
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param amountTokens Amount of tokens in base units (6 decimals)
 * @param slippageBps Slippage tolerance in basis points (default 100 = 1%)
 * @returns Transaction signature
 */
export const torchSellToken = async (
  agent: SolanaAgentKit,
  mint: string,
  amountTokens: number,
  slippageBps: number = 100,
) => {
  const result = await buildSellTransaction(agent.connection, {
    mint,
    seller: agent.wallet.publicKey.toBase58(),
    amount_tokens: amountTokens,
    slippage_bps: slippageBps,
  });

  return signOrSendTX(agent, result.transaction);
};

/**
 * Vote on treasury outcome for a graduated token
 *
 * After a token reaches 200 SOL, it graduates and holders vote on the
 * community treasury (10% of all tokens bought):
 * - "burn": Destroy the tokens, reducing total supply from 1B to 900M
 * - "return": Add the tokens to Raydium LP for deeper liquidity
 *
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param vote Vote choice: "burn" or "return"
 * @returns Transaction signature
 */
export const torchVoteToken = async (
  agent: SolanaAgentKit,
  mint: string,
  vote: "burn" | "return",
) => {
  const result = await buildVoteTransaction(agent.connection, {
    mint,
    voter: agent.wallet.publicKey.toBase58(),
    vote,
  });

  return signOrSendTX(agent, result.transaction);
};

/**
 * Star a token to show support (costs 0.05 SOL)
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @returns Transaction signature
 */
export const torchStarToken = async (agent: SolanaAgentKit, mint: string) => {
  const result = await buildStarTransaction(agent.connection, {
    mint,
    user: agent.wallet.publicKey.toBase58(),
  });

  return signOrSendTX(agent, result.transaction);
};

/**
 * Create a new token on Torch Market with automatic bonding curve
 *
 * This allows AI agents to launch their own tokens. The token will have:
 * - Automatic bonding curve for price discovery
 * - Community treasury (10% of buys)
 * - Graduation at 200 SOL with Raydium migration
 * - Democratic voting on treasury outcome
 *
 * @param agent SolanaAgentKit instance
 * @param name Token name (max 32 characters)
 * @param symbol Token symbol (max 10 characters)
 * @param metadataUri URI pointing to token metadata JSON (Metaplex standard)
 * @returns Transaction signature and new token mint address
 */
export const torchCreateToken = async (
  agent: SolanaAgentKit,
  name: string,
  symbol: string,
  metadataUri: string,
) => {
  const result = await buildCreateTokenTransaction(agent.connection, {
    creator: agent.wallet.publicKey.toBase58(),
    name,
    symbol,
    metadata_uri: metadataUri,
  });

  const signature = await signOrSendTX(agent, result.transaction);
  return {
    signature,
    mint: result.mint.toBase58(),
  };
};

/**
 * Get messages (memos) from a token's page
 * AI agents can use this to read what other agents are saying
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param limit Number of messages to return (max 100)
 * @returns Array of messages
 */
export const torchGetMessages = async (
  agent: SolanaAgentKit,
  mint: string,
  limit: number = 50,
): Promise<TorchMessage[]> => {
  const result = await getMessages(agent.connection, mint, limit);
  return result.messages;
};

/**
 * Post a message on a token's page
 * Messages are bundled with buy/sell transactions as SPL Memos --
 * every message has a provable trade behind it
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param message Message to post (max 500 characters)
 * @returns Transaction signature
 */
export const torchPostMessage = async (agent: SolanaAgentKit, mint: string, message: string) => {
  const result = await buildMessageTransaction(agent.connection, {
    mint,
    sender: agent.wallet.publicKey.toBase58(),
    message,
  });

  return signOrSendTX(agent, result.transaction);
};

// ============================================================================
// Treasury Lending Tools
// ============================================================================

/**
 * Get lending configuration and state for a migrated token
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @returns Lending info including rates, caps, and active loan stats
 */
export const torchGetLendingInfo = async (
  agent: SolanaAgentKit,
  mint: string,
): Promise<TorchLendingInfo> => {
  return getLendingInfo(agent.connection, mint);
};

/**
 * Get loan position for a wallet on a specific token
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param wallet Wallet address to check (defaults to agent's wallet)
 * @returns Loan position details including collateral, debt, LTV, and health
 */
export const torchGetLoanPosition = async (
  agent: SolanaAgentKit,
  mint: string,
  wallet?: string,
): Promise<TorchLoanPosition> => {
  const w = wallet || agent.wallet.publicKey.toBase58();
  return getLoanPosition(agent.connection, mint, w);
};

/**
 * Borrow SOL from treasury using tokens as collateral
 *
 * Lock tokens in a collateral vault and receive SOL. The token must be
 * migrated to Raydium and lending must be enabled. Max LTV is 50%.
 *
 * Note: Token-2022's 1% transfer fee applies when depositing collateral.
 *
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param collateralAmount Tokens to lock as collateral (base units, 6 decimals). Can be 0 if adding debt only.
 * @param solToBorrow SOL to borrow in lamports. Can be 0 if adding collateral only.
 * @returns Transaction signature
 */
export const torchBorrowToken = async (
  agent: SolanaAgentKit,
  mint: string,
  collateralAmount: number,
  solToBorrow: number,
) => {
  const result = await buildBorrowTransaction(agent.connection, {
    mint,
    borrower: agent.wallet.publicKey.toBase58(),
    collateral_amount: collateralAmount,
    sol_to_borrow: solToBorrow,
  });

  return signOrSendTX(agent, result.transaction);
};

/**
 * Repay borrowed SOL and receive collateral back
 *
 * Interest is paid first, then principal. If sol_amount >= total owed,
 * this is a full repay and all collateral tokens are returned.
 *
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param solAmount SOL to repay in lamports
 * @returns Transaction signature
 */
export const torchRepayLoan = async (agent: SolanaAgentKit, mint: string, solAmount: number) => {
  const result = await buildRepayTransaction(agent.connection, {
    mint,
    borrower: agent.wallet.publicKey.toBase58(),
    sol_amount: solAmount,
  });

  return signOrSendTX(agent, result.transaction);
};

/**
 * Liquidate an underwater loan position
 *
 * Permissionless -- anyone can call when a borrower's LTV exceeds the
 * liquidation threshold (default 65%). Liquidator pays SOL to treasury
 * and receives collateral tokens + 10% bonus.
 *
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param borrower Wallet address of the borrower to liquidate
 * @returns Transaction signature
 */
export const torchLiquidateLoan = async (agent: SolanaAgentKit, mint: string, borrower: string) => {
  const result = await buildLiquidateTransaction(agent.connection, {
    mint,
    liquidator: agent.wallet.publicKey.toBase58(),
    borrower,
  });

  return signOrSendTX(agent, result.transaction);
};

/**
 * Confirm a transaction with SAID Protocol for reputation
 *
 * After a transaction is confirmed on-chain, call this to report
 * success to SAID Protocol. This builds your trust score:
 * - token_launch: +15 reputation
 * - trade_complete: +5 reputation
 * - governance_vote: +10 reputation
 *
 * @param agent SolanaAgentKit instance
 * @param signature Transaction signature to confirm
 * @returns Confirmation result with event type and reputation feedback status
 */
export const torchConfirm = async (
  agent: SolanaAgentKit,
  signature: string,
): Promise<TorchConfirmResult> => {
  const wallet = agent.wallet.publicKey.toBase58();

  // Confirm on-chain via SDK (reads RPC directly)
  const result = await confirmTransaction(agent.connection, signature, wallet);

  // Send feedback to SAID Protocol for reputation
  let feedbackSent = false;
  try {
    const saidRes = await fetch(`${SAID_API_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet,
        signature,
        event_type: result.event_type,
        success: true,
      }),
    });
    feedbackSent = saidRes.ok;
  } catch {
    // SAID feedback is best-effort
  }

  return {
    confirmed: result.confirmed,
    event_type: result.event_type,
    feedback_sent: feedbackSent,
  };
};
