import * as dotenv from "dotenv";
import { SolanaAgentKit, KeypairWallet, Action } from "solana-agent-kit";
import { startMcpServer } from "@solana-agent-kit/adapter-mcp";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";

dotenv.config();

if (!process.env.SOLANA_PRIVATE_KEY) {
  throw new Error("Please set your SOLANA_PRIVATE_KEY in .env");
}

if (!process.env.RPC_URL) {
  throw new Error("Please set your RPC_URL in .env");
}

const decodedPrivateKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY as string);
const keypair = Keypair.fromSecretKey(decodedPrivateKey);
const keypairWallet = new KeypairWallet(keypair, process.env.RPC_URL as string);

const agent = new SolanaAgentKit(keypairWallet, keypairWallet.rpcUrl, {});

// Add your required actions here
const mcp_actions: Record<string, Action> = {};

for (const action of agent.actions) {
  mcp_actions[action.name] = action;
}

startMcpServer(mcp_actions, agent, { name: "solana-agent", version: "0.0.1" });
