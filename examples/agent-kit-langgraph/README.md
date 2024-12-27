# Solana Agent Kit with LangGraph Example

This example demonstrates how to set up and use the Solana Agent Kit with LangGraph to create a Solana-specific agent that can interact with the Solana blockchain and respond to user queries.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later)
- npm or yarn
- A Solana private key
- An OpenAI API key

## Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-repo/solana-agent-kit-langgraph-example.git
    cd solana-agent-kit-langgraph-example
    ```

2. **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3. **Create a `.env` file:**

    ```bash
    cp .env.example .env
    ```


    Fill in the .env file with your Solana private key and OpenAI API key:

    ```plaintext
    // Sample .env file
    
    SOLANA_PRIVATE_KEY=your_solana_private_key
    RPC_URL=https://api.mainnet-beta.solana.com
    OPENAI_API_KEY=your_openai_api_key
    ```

## Running the Example

To run the example, execute the following command:

```bash
npm start
# or
yarn start
```

## Code Explanation

The main code is located in the `index.ts` file. Here's a breakdown of its key components:

1. **Imports and Configuration:**

    The code imports necessary modules from solana-agent-kit, LangChain, and other utilities.

    ```typescript
    import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
    import { ChatOpenAI } from "@langchain/openai";
    import { BaseMessage, HumanMessage } from "@langchain/core/messages";
    // ... other imports
    ```

2. **LangGraph State Management:**

    Defines the state annotation for managing conversation messages.

    ```typescript
    const StateAnnotation = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: messagesStateReducer,
      }),
    });
    ```

3. **Agent Graph Creation:**

    The `createSolanaAgentGraph` function sets up the LangChain workflow:
    - Creates Solana-specific tools
    - Initializes the ChatGPT model
    - Configures the state graph for handling interactions



> For a detailed capabilities of solana-agent-kit, refer to the [official documentation](https://github.com/sendaifun/solana-agent-kit)