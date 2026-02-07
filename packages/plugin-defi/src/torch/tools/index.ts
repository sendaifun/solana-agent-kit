import { Transaction } from "@solana/web3.js";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

const TORCH_API = "https://torch.market/api/v1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponse = { success: boolean; data?: any; error?: { message: string } };

export interface TorchToken {
  mint: string;
  name: string;
  symbol: string;
  status: "bonding" | "complete" | "migrated";
  price_sol: number;
  market_cap_sol: number;
  progress_percent: number;
  holders: number;
  created_at: number;
}

export interface TorchTokenDetail extends TorchToken {
  description?: string;
  image?: string;
  sol_raised: number;
  sol_target: number;
  total_supply: number;
  circulating_supply: number;
  treasury_sol_balance: number;
  treasury_token_balance: number;
  votes_return: number;
  votes_burn: number;
  creator: string;
  stars: number;
}

export interface TorchMessage {
  signature: string;
  memo: string;
  sender: string;
  timestamp: number;
}

/**
 * List tokens on Torch Market
 * @param agent SolanaAgentKit instance
 * @param status Filter by status: bonding, complete, migrated, or all
 * @param sort Sort by: newest, volume, or marketcap
 * @param limit Number of tokens to return (max 100)
 * @returns Array of token summaries
 */
export async function torchListTokens(
  agent: SolanaAgentKit,
  status?: "bonding" | "complete" | "migrated" | "all",
  sort?: "newest" | "volume" | "marketcap",
  limit?: number,
): Promise<TorchToken[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (sort) params.set("sort", sort);
  if (limit) params.set("limit", limit.toString());

  const res = await fetch(`${TORCH_API}/tokens?${params}`);
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to list tokens");
  return json.data.tokens;
}

/**
 * Get detailed information about a token
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @returns Token details including treasury state and votes
 */
export async function torchGetToken(
  agent: SolanaAgentKit,
  mint: string,
): Promise<TorchTokenDetail> {
  const res = await fetch(`${TORCH_API}/tokens/${mint}`);
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Token not found");
  return json.data;
}

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
export async function torchBuyToken(
  agent: SolanaAgentKit,
  mint: string,
  amountLamports: number,
  slippageBps: number = 100,
  vote?: "burn" | "return",
  message?: string,
) {
  const res = await fetch(`${TORCH_API}/transactions/buy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mint,
      buyer: agent.wallet.publicKey.toBase58(),
      amount_sol: amountLamports,
      slippage_bps: slippageBps,
      ...(vote ? { vote } : {}),
    }),
  });
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to build buy transaction");

  const tx = Transaction.from(Buffer.from(json.data.transaction, "base64"));

  // Bundle message as SPL Memo if provided
  if (message) {
    const { TransactionInstruction, PublicKey } = await import("@solana/web3.js");
    const MEMO_PROGRAM = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
    tx.add(new TransactionInstruction({
      programId: MEMO_PROGRAM,
      keys: [{ pubkey: agent.wallet.publicKey, isSigner: true, isWritable: false }],
      data: Buffer.from(message.slice(0, 500), "utf-8"),
    }));
  }

  const { blockhash } = await agent.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  return signOrSendTX(agent, tx);
}

/**
 * Sell tokens back to Torch Market bonding curve
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param amountTokens Amount of tokens in base units (6 decimals)
 * @param slippageBps Slippage tolerance in basis points (default 100 = 1%)
 * @returns Transaction signature
 */
export async function torchSellToken(
  agent: SolanaAgentKit,
  mint: string,
  amountTokens: number,
  slippageBps: number = 100,
) {
  const res = await fetch(`${TORCH_API}/transactions/sell`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mint,
      seller: agent.wallet.publicKey.toBase58(),
      amount_tokens: amountTokens,
      slippage_bps: slippageBps,
    }),
  });
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to build sell transaction");

  const tx = Transaction.from(Buffer.from(json.data.transaction, "base64"));
  const { blockhash } = await agent.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  return signOrSendTX(agent, tx);
}

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
export async function torchVoteToken(
  agent: SolanaAgentKit,
  mint: string,
  vote: "burn" | "return",
) {
  const res = await fetch(`${TORCH_API}/transactions/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mint,
      voter: agent.wallet.publicKey.toBase58(),
      vote,
    }),
  });
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to build vote transaction");

  const tx = Transaction.from(Buffer.from(json.data.transaction, "base64"));
  const { blockhash } = await agent.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  return signOrSendTX(agent, tx);
}

/**
 * Star a token to show support (costs 0.05 SOL)
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @returns Transaction signature
 */
export async function torchStarToken(
  agent: SolanaAgentKit,
  mint: string,
) {
  const res = await fetch(`${TORCH_API}/transactions/star`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mint,
      user: agent.wallet.publicKey.toBase58(),
    }),
  });
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to build star transaction");

  const tx = Transaction.from(Buffer.from(json.data.transaction, "base64"));
  const { blockhash } = await agent.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  return signOrSendTX(agent, tx);
}

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
export async function torchCreateToken(
  agent: SolanaAgentKit,
  name: string,
  symbol: string,
  metadataUri: string,
) {
  const res = await fetch(`${TORCH_API}/transactions/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creator: agent.wallet.publicKey.toBase58(),
      name,
      symbol,
      metadata_uri: metadataUri,
    }),
  });
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to build create transaction");

  const tx = Transaction.from(Buffer.from(json.data.transaction, "base64"));
  const { blockhash } = await agent.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  const signature = await signOrSendTX(agent, tx);
  return {
    signature,
    mint: json.data.mint as string,
  };
}

/**
 * Get messages (memos) from a token's page
 * AI agents can use this to read what other agents are saying
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param limit Number of messages to return (max 100)
 * @returns Array of messages
 */
export async function torchGetMessages(
  agent: SolanaAgentKit,
  mint: string,
  limit: number = 50,
): Promise<TorchMessage[]> {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit.toString());

  const res = await fetch(`${TORCH_API}/tokens/${mint}/messages?${params}`);
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to get messages");
  return json.data.messages;
}

/**
 * Post a message on a token's page
 * Messages are bundled with buy/sell transactions as SPL Memos --
 * every message has a provable trade behind it
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param message Message to post (max 500 characters)
 * @returns Transaction signature
 */
export async function torchPostMessage(
  agent: SolanaAgentKit,
  mint: string,
  message: string,
) {
  const res = await fetch(`${TORCH_API}/transactions/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mint,
      sender: agent.wallet.publicKey.toBase58(),
      message,
    }),
  });
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to build message transaction");

  const tx = Transaction.from(Buffer.from(json.data.transaction, "base64"));
  const { blockhash } = await agent.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  return signOrSendTX(agent, tx);
}

// ============================================================================
// Treasury Lending Tools (V2.4)
// ============================================================================

export interface TorchLendingInfo {
  interest_rate_bps: number;
  max_ltv_bps: number;
  liquidation_threshold_bps: number;
  liquidation_bonus_bps: number;
  total_sol_lent: number;
  active_loans: number;
  treasury_sol_available: number;
}

export interface TorchLoanPosition {
  collateral_amount: number;
  borrowed_amount: number;
  accrued_interest: number;
  total_owed: number;
  collateral_value_sol: number;
  current_ltv_bps: number;
  health: "healthy" | "at_risk" | "liquidatable" | "none";
}

/**
 * Get lending configuration and state for a migrated token
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @returns Lending info including rates, caps, and active loan stats
 */
export async function torchGetLendingInfo(
  agent: SolanaAgentKit,
  mint: string,
): Promise<TorchLendingInfo> {
  const res = await fetch(`${TORCH_API}/lending/${mint}/info`);
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to get lending info");
  return json.data;
}

/**
 * Get loan position for a wallet on a specific token
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param wallet Wallet address to check (defaults to agent's wallet)
 * @returns Loan position details including collateral, debt, LTV, and health
 */
export async function torchGetLoanPosition(
  agent: SolanaAgentKit,
  mint: string,
  wallet?: string,
): Promise<TorchLoanPosition> {
  const w = wallet || agent.wallet.publicKey.toBase58();
  const res = await fetch(`${TORCH_API}/lending/${mint}/position?wallet=${w}`);
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to get loan position");
  return json.data;
}

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
export async function torchBorrowToken(
  agent: SolanaAgentKit,
  mint: string,
  collateralAmount: number,
  solToBorrow: number,
) {
  const res = await fetch(`${TORCH_API}/transactions/borrow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mint,
      borrower: agent.wallet.publicKey.toBase58(),
      collateral_amount: collateralAmount,
      sol_to_borrow: solToBorrow,
    }),
  });
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to build borrow transaction");

  const tx = Transaction.from(Buffer.from(json.data.transaction, "base64"));
  const { blockhash } = await agent.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  return signOrSendTX(agent, tx);
}

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
export async function torchRepayLoan(
  agent: SolanaAgentKit,
  mint: string,
  solAmount: number,
) {
  const res = await fetch(`${TORCH_API}/transactions/repay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mint,
      borrower: agent.wallet.publicKey.toBase58(),
      sol_amount: solAmount,
    }),
  });
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to build repay transaction");

  const tx = Transaction.from(Buffer.from(json.data.transaction, "base64"));
  const { blockhash } = await agent.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  return signOrSendTX(agent, tx);
}

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
export async function torchLiquidateLoan(
  agent: SolanaAgentKit,
  mint: string,
  borrower: string,
) {
  const res = await fetch(`${TORCH_API}/transactions/liquidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mint,
      liquidator: agent.wallet.publicKey.toBase58(),
      borrower,
    }),
  });
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to build liquidate transaction");

  const tx = Transaction.from(Buffer.from(json.data.transaction, "base64"));
  const { blockhash } = await agent.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  return signOrSendTX(agent, tx);
}

export interface TorchConfirmResult {
  confirmed: boolean;
  event_type: "token_launch" | "trade_complete" | "governance_vote";
  feedback_sent: boolean;
}

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
export async function torchConfirm(
  agent: SolanaAgentKit,
  signature: string,
): Promise<TorchConfirmResult> {
  const res = await fetch(`${TORCH_API}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      signature,
      wallet: agent.wallet.publicKey.toBase58(),
    }),
  });
  const json = await res.json() as ApiResponse;
  if (!json.success) throw new Error(json.error?.message || "Failed to confirm transaction");
  return json.data;
}
