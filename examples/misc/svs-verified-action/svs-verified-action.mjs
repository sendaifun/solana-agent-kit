import * as SolanaAgentKit from "solana-agent-kit";
import {
  SOLANA_AGENT_KIT_ADAPTER_VERSION,
  SOLANA_AGENT_KIT_TOOL_NAME,
  createSvsSolanaAgentKitAdapter
} from "@svsprotocol/solana/solana-agent-kit";

const REQUIRED_ENV = [
  "SVS_SERVER_URL",
  "SVS_BOT_ID",
  "SVS_BOT_POLICY_ID",
  "SVS_BOT_API_KEY",
  "SVS_BOT_REQUEST_SIGNING_SECRET",
  "SVS_BOT_EXPECTED_INTEGRATION_CONTRACT_HASH",
  "SOLANA_RPC_URL"
];

const LIVE_SUBMIT_REQUIRED_ENV = [
  ...REQUIRED_ENV,
  "SVS_SERIALIZED_TRANSACTION_BASE64"
];

export function createSvsVerifiedSolanaAgentKitTool(env = process.env) {
  assertRequiredEnv(env);

  const svsTool = createSvsSolanaAgentKitAdapter({
    baseUrl: env.SVS_SERVER_URL,
    apiKey: env.SVS_BOT_API_KEY,
    requestSigningSecret: env.SVS_BOT_REQUEST_SIGNING_SECRET,
    expectedIntegrationContractHash: env.SVS_BOT_EXPECTED_INTEGRATION_CONTRACT_HASH,
    botId: env.SVS_BOT_ID,
    policyId: env.SVS_BOT_POLICY_ID,
    rpcUrl: env.SOLANA_RPC_URL,
    waitForProof: env.SVS_WAIT_FOR_PROOF === "true",
    fetchProof: true,
    checkReceiptRegistryChain: true
  });

  return svsTool;
}

export async function requireSvsVerifiedAgentReady(env = process.env) {
  const svsTool = createSvsVerifiedSolanaAgentKitTool(env);

  return svsTool.requireSvsProductionReady({
    requireNoExpiredPreviousSigningSecrets: true
  });
}

export async function submitSvsVerifiedSolanaAction({
  requestId,
  intent,
  serializedTransaction,
  simulation,
  metadata = {}
}, env = process.env) {
  const svsTool = createSvsVerifiedSolanaAgentKitTool(env);

  await svsTool.requireSvsProductionReady({
    requireNoExpiredPreviousSigningSecrets: true
  });

  return svsTool.verifyAndSubmitSolanaAction({
    requestId,
    idempotencyKey: requestId,
    intent,
    serializedTransaction,
    simulation,
    metadata,
    source: {
      agentFramework: "solana-agent-kit",
      adapter: SOLANA_AGENT_KIT_ADAPTER_VERSION,
      example: "svs-verified-action"
    }
  });
}

export function getSvsSolanaAgentKitExampleInfo() {
  return {
    ok: true,
    runtime: "Solana Agent Kit",
    hostPackageImported: typeof SolanaAgentKit === "object",
    hostExportCount: Object.keys(SolanaAgentKit).length,
    adapterVersion: SOLANA_AGENT_KIT_ADAPTER_VERSION,
    toolName: SOLANA_AGENT_KIT_TOOL_NAME,
    packageExport: "@svsprotocol/solana/solana-agent-kit",
    liveSubmitOptIn: "SVS_RUN_LIVE_SUBMIT=true"
  };
}

function assertRequiredEnv(env) {
  const missing = REQUIRED_ENV.filter((name) => !env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required SVS env values: ${missing.join(", ")}`);
  }
}

function assertLiveSubmitEnv(env) {
  const missing = LIVE_SUBMIT_REQUIRED_ENV.filter((name) => !env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required SVS live-submit env values: ${missing.join(", ")}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const info = getSvsSolanaAgentKitExampleInfo();

  if (process.env.SVS_RUN_LIVE_SUBMIT !== "true") {
    console.log(JSON.stringify({
      ...info,
      status: "dry_run",
      nextAction: "Set SVS_RUN_LIVE_SUBMIT=true only after filling real SVS credentials and a prepared transaction."
    }, null, 2));
    process.exit(0);
  }

  assertLiveSubmitEnv(process.env);

  const result = await submitSvsVerifiedSolanaAction({
    requestId: `svs-solana-agent-kit-${Date.now()}`,
    intent: {
      botId: process.env.SVS_BOT_ID,
      type: "memo",
      summary: "Submit a Solana Agent Kit action through SVS human approval."
    },
    serializedTransaction: process.env.SVS_SERIALIZED_TRANSACTION_BASE64,
    simulation: {
      ok: true,
      source: "provided-by-agent"
    }
  });

  console.log(JSON.stringify(result, null, 2));
}
