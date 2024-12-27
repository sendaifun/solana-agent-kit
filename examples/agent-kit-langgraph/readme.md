# Solana Agent Kit with LangGraph Example

This example demonstrates how to use the Solana Agent Kit with LangGraph to interact with the Solana blockchain. The example includes fetching the balance of a token address and sending a transaction.

## Setup

1. Clone the repository and navigate to the example directory:

   ```sh
   git clone https://github.com/your-repo/solana-agent-kit.git
   cd solana-agent-kit/examples/agent-kit-langgraph
   ```
2. Install the dependencies:
    ```bash
    yarn install
    ``` 
    or
    ```
    npm install
    ```
3. Create a .env file in the root directory and add your environment variables:
    ```
    SOLANA_PRIVATE_KEY=your_solana_private_key
    RPC_URL=https://api.mainnet-beta.solana.com
    OPENAI_API_KEY=your_openai_api_key
    ```
## Running the Example
To run the example, use the following command:
```bash
ts-node examples/agent-kit-langgraph/index.ts
```
You will be prompted to enter a message. For example, you can enter:
```
What's the Balance for this token address: F6Rg7bkYAUYnuXMggiD6czF9W9RJh3AJuo7Q2WmmchCK
```
The agent will respond with the balance of the specified token address.