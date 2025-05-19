``# OKX DEX Starter Example - Solana Agent Kit V2

This example demonstrates how to use the OKX DEX plugin with the Solana Agent Kit V2. It provides a simple chat interface to get quotes and execute swaps on the OKX DEX.

## Migrated to V2

This example has been migrated to use the Solana Agent Kit V2  following the guidelines in the [MIGRATING](../../../MIGRATING.md) doc. V2 introduces a more modular and extensible architecture with plugins, allowing for easier integration of new features and protocols. Key changes from V1 include:

-   **Plugin Architecture:** Functionality is now delivered via plugins (e.g., `OkxPlugin`).
-   **Wallet Interface:** V2 uses a flexible `Wallet` interface, allowing integration with various wallet providers (e.g., `KeypairWallet` for server-side usage, or browser extension wallets for client-side apps).
-   **Action-Based Tools:** Tools are now more clearly defined as actions within plugins, which can be easily integrated with AI models like those from OpenAI.

### Example: Initializing the OKX Plugin

```ts
import OkxPlugin from '../../../packages/plugin-defi/src/okx';

const agent = new SolanaAgentKit(wallet, process.env.RPC_URL!, {
  OKX_API_KEY: process.env.OKX_API_KEY!,
  OKX_SECRET_KEY: process.env.OKX_SECRET_KEY!,
  OKX_API_PASSPHRASE: process.env.OKX_API_PASSPHRASE!,
  OKX_PROJECT_ID: process.env.OKX_PROJECT_ID || "",
})
.use(OkxPlugin);
```

## Getting Started

Follow these steps to set up and run the OKX DEX starter example:

1.  **Configure Workspace:**

    Ensure your root `pnpm-workspace.yaml` file includes the example directory. If not, add it:

    ```yaml
    packages:
      # ... other packages
      - "examples/defi/okx-dex-starter"
    ```

2.  **Install Root Dependencies:**

    From the root of the `solana-agent-kit` monorepo, install all dependencies:

    ```bash
    pnpm install
    ```

3.  **Build Packages:**

    Build all the packages in the monorepo:

    ```bash
    pnpm build
    ```

4.  **Navigate to Example Directory:**

    Change to the example's directory:

    ```bash
    cd examples/defi/okx-dex-starter
    ```

5.  **Install Example Dependencies:**

    Install the specific dependencies for this example:

    ```bash
    pnpm i
    ```

6.  **Set Up Environment Variables:**

    Create a `.env` file in the `examples/defi/okx-dex-starter` directory by copying the example:

    ```bash
    cp .env.example .env
    ```

    Then, edit the `.env` file and add your credentials:
    *   `SOLANA_PRIVATE_KEY`: Your Solana wallet private key (base58 encoded).
    *   `RPC_URL`: Your Solana RPC endpoint (e.g., from QuickNode, Alchemy, or Helius).
    *   `OPENAI_API_KEY`: Your OpenAI API key.
    *   `OKX_API_KEY`: Your OKX API key.
    *   `OKX_SECRET_KEY`: Your OKX API secret key.
    *   `OKX_API_PASSPHRASE`: Your OKX API passphrase.
    *   `OKX_PROJECT_ID` (Optional): Your OKX Project ID if you have one.

    **Note:** You can obtain your OKX API credentials from the [OKX Developer Portal](https://web3.okx.com/build/dev-portal).

7.  **Run the Example:**

    Start the chat interface:

    ```bash
    pnpm start
    ```

8.  **Interact with the Chat Interface:**

Example Prompts:
    *   "Get a quote for 10 SOL to USDC"
    *   "Execute swap for .01 SOL to USDC with 0.5% slippage"

Output:
```bash
🚀 OKX DEX Chat
────────────────────────────────────────────────────────────
✓ Wallet initialized
  Address: 2CioUyrPpHsXgnQnGsr3AVEFC1368V2rJSSdBJj41whX
✓ Agent initialized with OKX plugin


You: Swap 0.01 SOL to USDC with 0.5% slippage

Executing swap from sol to usdc...

Executing swap from 11111111111111111111111111111111 to EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v...
Transaction sent successfully: zvjqCiiTgR7mg5S56hb4caMcfBBgD3zpRZqBJFbHYnxiaKEzA4GM3f1EcLjpuJqfgpnWyJLrRA6zpgB2zFtc71D

AI: 
  The swap of 0.01 SOL to USDC with a 0.5% slippage has been executed successfully. You can view the transaction details on the OKX Explorer using the following link:
  [View Transaction on OKX Explorer](https://web3.okx.com/explorer/solana/tx/zvjqCiiTgR7mg5S56hb4caMcfBBgD3zpRZqBJFbHYnxiaKEzA4GM3f1EcLjpuJqfgpnWyJLrRA6zpgB2zFtc71D)
```

    You can then interact with the AI in your terminal. For example:
    *   "Get a quote for 10 SOL to USDC"
    *   "Execute swap for .01 SOL to USDC with 0.5% slippage"

## How it Works

The example (`index.ts`) initializes the `SolanaAgentKit` with a `KeypairWallet` and the `OkxPlugin`. It then uses the `ai` SDK (`generateText` and `createOpenAI`) along with `createVercelAITools` to create a chat interface.

The chat interface:
-   Takes user input.
-   Maintains a conversation history and a `SwapContext` to remember details from previous interactions (e.g., a quote received).
-   Sends the user's prompt (potentially augmented with context) to the OpenAI model.
-   The AI can use the tools derived from the `OkxPlugin` actions (like `OKX_DEX_SWAP`) to fetch quotes or prepare transactions.
-   If a swap is executed, the `OkxDexSwapAction` calls the underlying `getOkxSwap` and `executeSwapTransaction` tools to interact with the OKX API and the Solana blockchain.

This setup demonstrates a powerful way to combine AI language understanding with on-chain actions through the Solana Agent Kit. 