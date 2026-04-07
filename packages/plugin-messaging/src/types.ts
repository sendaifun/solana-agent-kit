import type { z } from "zod";

export type SolanaAgentWallet = {
  publicKey: {
    toBase58(): string;
  };
  signMessage(message: Uint8Array): Promise<Uint8Array>;
};

export type SolanaAgentLike = {
  wallet: SolanaAgentWallet;
  config: Record<string, unknown>;
};

export type PluginAction = {
  name: string;
  similes: string[];
  description: string;
  examples: Array<
    Array<{
      input: Record<string, any>;
      output: Record<string, any>;
      explanation: string;
    }>
  >;
  schema: z.ZodTypeAny;
  handler: (
    agent: SolanaAgentLike,
    input: Record<string, any>,
  ) => Promise<Record<string, any>>;
};

export type MessagingPluginContract = {
  name: string;
  methods: Record<string, any>;
  actions: PluginAction[];
  initialize(agent: SolanaAgentLike): void;
};

export type SendMessageInput = {
  toWallet: string;
  text: string;
};

export type ReadMessagesInput = {
  convId: string;
  limit?: number;
  beforeSeq?: number;
};

export type MarkReadInput = {
  convId: string;
  seq: number;
  readAt?: string;
};

export type ListConversationsInput = {
  limit?: number;
  cursor?: string;
};

export type GetUserInfoInput = {
  wallet: string;
};

export type SearchAgentsInput = {
  name?: string;
  wallet?: string;
  category?: string;
  limit?: number;
  offset?: number;
};

export type DesideMessagingConfig = {
  DESIDE_MCP_BASE_URL?: string;
  DESIDE_OAUTH_SCOPE?: string;
  DESIDE_OAUTH_CLIENT_NAME?: string;
  DESIDE_OAUTH_REDIRECT_URI?: string;
};
