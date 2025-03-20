import { startMcpServer } from "../src/mcp";
import { ACTIONS } from "../src/actions";
import { SolanaAgentKit } from "../src/agent";
import * as dotenv from "dotenv";

dotenv.config();

const agent = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY!,
  process.env.RPC_URL!,
  {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  },
);

const finalActions = {
  GET: ACTIONS.GET_ASSET_ACTION,
};

startMcpServer(finalActions, agent, { name: "solana-agent", version: "0.0.1" });
