# Solana Agent Kit MCP Server Utility

This utility provides a framework for creating a Model Context Protocol (MCP) server to handle protocol operations on the Solana blockchain using the Solana Agent Kit.

## Features

- Supports all actions from the Solana Agent Kit
- MCP server implementation for standardized interactions with MCP clients such as Claude Desktop and Codex
- Environment-based configuration

## Prerequisites

- Node.js (v16 or higher recommended)
- pnpm, yarn, or npm
- Solana wallet with private key
- Solana RPC URL

## Installation

```bash
pnpm install
```

## Configuration

1. Configure the `claude_desktop_config.json` file by editing the `env` fields.

```env
SOLANA_PRIVATE_KEY=your_private_key_here
RPC_URL=your_solana_rpc_url_here
```

2. Change the MCP client settings. For Claude Desktop:

For MacOS:
```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

For Windows:
```bash
code $env:AppData\Claude\claude_desktop_config.json
```

The final configuration should look like the following (replace the path with your absolute project path):

```json
{
    "mcpServers": {
        "agent-kit": {
            "command": "node",
            "env": {
                "RPC_URL": "your_solana_rpc_url_here",
                "SOLANA_PRIVATE_KEY": "your_private_key_here"
            },
            "args": [
                "/ABSOLUTE/PATH/TO/YOUR/MCP/PROJECT/FILE" // e.g /Users/username/Projects/solana-agent-kit-mcp-server/index.js
            ]
        }
    }
}
```

Note: Make sure to restart Claude Desktop after updating the configuration and building the project.

For Codex, add the same server to `~/.codex/config.toml`:

```toml
[mcp_servers.solana-agent]
command = "node"
args = ["/ABSOLUTE/PATH/TO/YOUR/MCP/PROJECT/FILE"]
startup_timeout_sec = 20
tool_timeout_sec = 60

[mcp_servers.solana-agent.env]
RPC_URL = "your_solana_rpc_url_here"
SOLANA_PRIVATE_KEY = "your_private_key_here"
OPENAI_API_KEY = "your_openai_api_key_here"
```

You can also register it with the Codex CLI:

```bash
codex mcp add solana-agent \
  --env RPC_URL=your_solana_rpc_url_here \
  --env SOLANA_PRIVATE_KEY=your_private_key_here \
  --env OPENAI_API_KEY=your_openai_api_key_here \
  -- node /ABSOLUTE/PATH/TO/YOUR/MCP/PROJECT/FILE
```

Restart Codex after editing `config.toml`, then run `/mcp` in Codex to confirm the server is active.

## Building the Project

To build the project, run:

```bash
pnpm run build
```

This will compile the TypeScript code and set the appropriate permissions for the executable.

## Project Structure

- `src/` - Source code directory
- `src/index.ts` - Main entry point implementing the MCP server

## Usage Examples

### Starting the MCP Server

To start the MCP server, use the following command:

#### Installation

First you'll need to create a node project

```bash
pnpm init
```

Then install the solana-agent-kit, desired plugins and the mcp utility

```bash
pnpm add solana-agent-kit @solana-agent-kit/plugin-token @solana-agent-kit/adapter-mcp dotenv
```

#### Usage

```js
import { SolanaAgentKit, KeypairWallet } from "solana-agent-kit";
import  { startMcpServer } from '@solana-agent-kit/adapter-mcp'
import TokenPlugin from '@solana-agent-kit/plugin-token'
import * as dotenv from "dotenv";

dotenv.config();

const wallet = new KeypairWallet(process.env.SOLANA_PRIVATE_KEY)

const agent = new SolanaAgentKit(
  wallet,
  process.env.RPC_URL,
  {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
).use(TokenPlugin);

const finalActions = {
  BALANCE_ACTION: agent.actions.find((action) => action.name === "BALANCE_ACTION")!,
  TOKEN_BALANCE_ACTION: agent.actions.find((action) => action.name === "TOKEN_BALANCE_ACTION")!,
  GET_WALLET_ADDRESS_ACTION: agent.actions.find((action) => action.name === "GET_WALLET_ADDRESS_ACTION")!,
};

startMcpServer(finalActions, agent, { name: "solana-agent", version: "0.0.1" });
```

This will start the server once you start up Claude. You can add actions by simply adding them to the `finalActions` object.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Refer to [CONTRIBUTING.md](../../CONTRIBUTING.md) for detailed guidelines on how to contribute to this project.
