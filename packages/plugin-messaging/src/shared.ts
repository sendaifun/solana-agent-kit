import { DesideMcpSdk, type DesideSigner } from "@desideapp/mcp-sdk";
import type {
  DesideMessagingConfig,
  GetUserInfoInput,
  ListConversationsInput,
  MarkReadInput,
  ReadMessagesInput,
  SearchAgentsInput,
  SendMessageInput,
  SolanaAgentLike,
} from "./types";

const sdkByAgent = new WeakMap<SolanaAgentLike, DesideMcpSdk>();

function getPluginConfig(agent: SolanaAgentLike): DesideMessagingConfig {
  return agent.config as DesideMessagingConfig;
}

export function getDesideSdk(agent: SolanaAgentLike): DesideMcpSdk {
  const existing = sdkByAgent.get(agent);
  if (existing) {
    return existing;
  }

  const config = getPluginConfig(agent);
  if (!config.DESIDE_OAUTH_REDIRECT_URI) {
    throw new Error("DESIDE_OAUTH_REDIRECT_URI is required for Deside messaging");
  }

  const sdk = new DesideMcpSdk({
    baseUrl: config.DESIDE_MCP_BASE_URL,
    oauthRedirectUri: config.DESIDE_OAUTH_REDIRECT_URI,
    oauthScope: config.DESIDE_OAUTH_SCOPE,
    oauthClientName: config.DESIDE_OAUTH_CLIENT_NAME || "solana-agent-kit-plugin-messaging",
    signatureEncoding: "base64",
  });

  sdkByAgent.set(agent, sdk);
  return sdk;
}

export function getDesideSigner(agent: SolanaAgentLike): DesideSigner {
  return {
    getAddress: () => agent.wallet.publicKey.toBase58(),
    signMessage: async (message: string) => {
      const signature = await agent.wallet.signMessage(new TextEncoder().encode(message));
      return Buffer.from(signature).toString("base64");
    },
  };
}

async function getReadyContext(
  agent: SolanaAgentLike,
): Promise<{ sdk: DesideMcpSdk; signer: DesideSigner }> {
  const sdk = getDesideSdk(agent);
  const signer = getDesideSigner(agent);
  await sdk.connect(signer);
  return { sdk, signer };
}

export async function sendMessage(
  agent: SolanaAgentLike,
  input: SendMessageInput,
): Promise<unknown> {
  const { sdk, signer } = await getReadyContext(agent);
  return sdk.sendDm(signer, {
    to_wallet: input.toWallet,
    text: input.text,
  });
}

export async function readMessages(
  agent: SolanaAgentLike,
  input: ReadMessagesInput,
): Promise<unknown> {
  const { sdk, signer } = await getReadyContext(agent);
  return sdk.readDms(signer, {
    conv_id: input.convId,
    limit: input.limit,
    before_seq: input.beforeSeq,
  });
}

export async function markRead(
  agent: SolanaAgentLike,
  input: MarkReadInput,
): Promise<unknown> {
  const { sdk, signer } = await getReadyContext(agent);
  return sdk.markDmRead(signer, {
    conv_id: input.convId,
    seq: input.seq,
    read_at: input.readAt,
  });
}

export async function listConversations(
  agent: SolanaAgentLike,
  input: ListConversationsInput = {},
): Promise<unknown> {
  const { sdk, signer } = await getReadyContext(agent);
  return sdk.listConversations(signer, input);
}

export async function getUserInfo(
  agent: SolanaAgentLike,
  input: GetUserInfoInput,
): Promise<unknown> {
  const { sdk, signer } = await getReadyContext(agent);
  return sdk.getUserInfo(signer, {
    wallet: input.wallet,
  });
}

export async function getMyIdentity(agent: SolanaAgentLike): Promise<unknown> {
  const { sdk, signer } = await getReadyContext(agent);
  return sdk.getMyIdentity(signer);
}

export async function searchAgents(
  agent: SolanaAgentLike,
  input: SearchAgentsInput,
): Promise<unknown> {
  const { sdk, signer } = await getReadyContext(agent);
  return sdk.searchAgents(signer, input);
}
