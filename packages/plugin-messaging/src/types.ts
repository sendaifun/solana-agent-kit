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
