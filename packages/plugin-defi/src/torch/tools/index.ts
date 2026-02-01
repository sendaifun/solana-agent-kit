import { Transaction } from "@solana/web3.js";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

const TORCH_API = "https://torch.market/api/v1";

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
  const json = await res.json();
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
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Token not found");
  return json.data;
}

/**
 * Buy tokens on Torch Market bonding curve
 * @param agent SolanaAgentKit instance
 * @param mint Token mint address
 * @param amountLamports Amount of SOL in lamports (1 SOL = 1e9 lamports)
 * @param slippageBps Slippage tolerance in basis points (default 100 = 1%)
 * @returns Transaction signature
 */
export async function torchBuyToken(
  agent: SolanaAgentKit,
  mint: string,
  amountLamports: number,
  slippageBps: number = 100,
) {
  const res = await fetch(`${TORCH_API}/transactions/buy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mint,
      buyer: agent.wallet.publicKey.toBase58(),
      amount_sol: amountLamports,
      slippage_bps: slippageBps,
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to build buy transaction");

  const tx = Transaction.from(Buffer.from(json.data.transaction, "base64"));
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
  const json = await res.json();
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
 * - "burn": Destroy the tokens, reducing total supply
 * - "return": Return the tokens to the token creator
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
  const json = await res.json();
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
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to build star transaction");

  const tx = Transaction.from(Buffer.from(json.data.transaction, "base64"));
  const { blockhash } = await agent.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  return signOrSendTX(agent, tx);
}

export interface TorchMessage {
  signature: string;
  memo: string;
  sender: string;
  timestamp: number;
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
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to build create transaction");

  const tx = Transaction.from(Buffer.from(json.data.transaction, "base64"));
  const { blockhash } = await agent.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  const signature = await signOrSendTX(agent, tx);
  return {
    signature,
    mint: json.data.mint,
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
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to get messages");
  return json.data.messages;
}

/**
 * Post a message on a token's page
 * AI agents can use this to communicate with each other
 * Messages are stored on-chain as SPL Memos
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
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to build message transaction");

  const tx = Transaction.from(Buffer.from(json.data.transaction, "base64"));
  const { blockhash } = await agent.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  return signOrSendTX(agent, tx);
}
