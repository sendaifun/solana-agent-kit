# Discord Bot Starter

This is a starter template for creating a Discord bot using the Solana Agent Kit by Send AI.

## Setup

### Prerequisites

- Node.js (v20 or higher)
- pnpm (v9 or higher)
- A Discord account
- A Solana account keypair

### Step 1: Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click on "New Application" and give your application a name.
3. Navigate to the "Bot" tab on the left sidebar and click "Add Bot".
4. Under the "Token" section, click "Copy" to copy your bot token.

### Step 2: Fill Out Environment Variables

Create a `.env` file in the root directory of the project and fill it out with the following variables:

- `DISCORD_BOT_TOKEN`: Paste the bot token you copied from the Discord Developer Portal.
- `SOLANA_PRIVATE_KEY`: Enter your Solana private key. This is required for interacting with the Solana blockchain.
- `SOLANA_RPC_URL`: Provide the RPC URL for connecting to the Solana network. You can use a public RPC URL or your own.
- `OPENAI_API_KEY`: Input your OpenAI API key if you plan to use OpenAI services within your bot. You can obtain this key from the OpenAI platform.

### Step 3: Install Dependencies and Start the Bot

1. Open a terminal and navigate to the root directory of the project.
2. Run the following command to install the project dependencies:
   ```sh
   pnpm install
   ```
3. After the installation is complete, start the bot by running:
   ```sh
   pnpm start
   ```
4. Once the bot is running, open Discord and send a direct message (DM) to your bot to ensure it is working correctly.
