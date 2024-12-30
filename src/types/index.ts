import { PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
export interface Creator {
  address: string;
  percentage: number;
}

export interface CollectionOptions {
  name: string;
  uri: string;
  royaltyBasisPoints?: number;
  creators?: Creator[];
}

// Add return type interface
export interface CollectionDeployment {
  collectionAddress: PublicKey;
  signature: Uint8Array;
}

export interface MintCollectionNFTResponse {
  mint: PublicKey;
  metadata: PublicKey;
}

export interface PumpFunTokenOptions {
  twitter?: string;
  telegram?: string;
  website?: string;
  initialLiquiditySOL?: number;
  slippageBps?: number;
  priorityFee?: number;
}

export interface PumpfunLaunchResponse {
  signature: string;
  mint: string;
  metadataUri?: string;
  error?: string;
}

/**
 * Lulo Account Details response format
 */
export interface LuloAccountDetailsResponse {
  totalValue: number;
  interestEarned: number;
  realtimeApy: number;
  settings: {
    owner: string;
    allowedProtocols: string | null;
    homebase: string | null;
    minimumRate: string;
  };
}

export interface JupiterTokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  tags: string[];
  logoURI: string;
  daily_volume: number;
  freeze_authority: string | null;
  mint_authority: string | null;
  permanent_delegate: string | null;
  extensions: {
    coingeckoId?: string;
  };
}

export interface FetchPriceResponse {
  status: "success" | "error";
  tokenId?: string;
  priceInUSDC?: string;
  message?: string;
  code?: string;
}

export interface PythFetchPriceResponse {
  status: "success" | "error";
  priceFeedID: string;
  price?: string;
  message?: string;
  code?: string;
}

export interface GibworkCreateTaskReponse {
  status: "success" | "error";
  taskId?: string | undefined;
  signature?: string | undefined;
}

// Core action types
export type Handler = (
  agent: SolanaAgentKit,
  input: Record<string, any>,
) => Promise<ActionResult>;

export type Validator = (input: Record<string, any>) => Promise<boolean>;

// Context and runtime interfaces
export interface ActionContext {
  runtime: Runtime;
  message: Message;
  state?: Record<string, any>;
}

export interface Runtime {
  services: Map<string, any>;
  memory: MemoryManager;
  state: StateManager;
}

export interface MemoryManager {
  get(id: string): Promise<Memory | null>;
  create(memory: Omit<Memory, 'id'>): Promise<Memory>;
  update(id: string, update: Partial<Memory>): Promise<Memory>;
  delete(id: string): Promise<boolean>;
}

export interface StateManager {
  get(): Promise<Record<string, any>>;
  set(state: Record<string, any>): Promise<void>;
  update(update: Partial<Record<string, any>>): Promise<Record<string, any>>;
  clear(): Promise<void>;
}

// Message and memory interfaces
export interface Message {
  id: string;
  content: MessageContent;
  userId: string;
  timestamp: number;
}

export interface MessageContent {
  text: string;
  metadata?: Record<string, any>;
  attachments?: Attachment[];
  actions?: string[];
}

export interface Attachment {
  id: string;
  type: string;
  url: string;
  metadata?: Record<string, any>;
}

export interface Memory extends Message {
  roomId?: string;
  threadId?: string;
  replyTo?: string;
  reactions?: Reaction[];
}

export interface Reaction {
  type: string;
  userId: string;
  timestamp: number;
}

// Action interfaces
export interface Action {
  name: string;
  similes: string[];
  description: string;
  examples: ActionExample[][];
  handler: Handler;
  validate: Validator;
}

export interface ActionExample {
  input: ActionInput;
  output: ActionResult;
}

export interface ActionInput {
  message: Message;
  state?: Record<string, any>;
}

export interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}
