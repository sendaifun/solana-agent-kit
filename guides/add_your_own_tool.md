# How to Add Your Own Tool

Extending the **Solana Agent Kit** with custom tools allows you to add specialized functionalities tailored to your needs. This guide walks you through creating and integrating a new tool into the existing framework.

## Overview

1. Create a new tool file
2. Export the new tool
3. Add supporting functions in SolanaAgentKit
4. Implement the Langchain tool class
5. Export the Langchain tool
6. Export your protocol's langchain tools (if not already exported)
7. Define Action class for given tool
8. Export Action
9. Use the custom tool

## Implementation Guide

### 1. Create a New Tool File

Create a new TypeScript file in the `src/tools/your_protocol` directory for your tool (e.g., `custom_tool.ts`). If the `src/tools/your_protocol` directory does not exist, create it.

### 2. Export the Tool (if not already exported)
> `src/tools/index.ts`
```typescript:src/tools/index.ts
export * from "./squads";
export * from "./jupiter";
export * from "./your_protocol"; // Add your protocol here if it's not already in the list
```

### 3. Add Supporting Functions to SolanaAgentKit
> `src/agent/index.ts`
```typescript:src/agent/index.ts
export class SolanaAgentKit {
  // ... existing code ...

  async customFunction(input: string): Promise<string> {
    // Implement your custom functionality
    return `Processed input: ${input}`;
  }
}
```

### 4. Implement the Langchain Tool Class
> `src/langchain/your_protocol/custom_tool.ts`
```typescript:src/langchain/your_protocol/custom_tool.ts
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class CustomTool extends Tool {
  name = "custom_tool";
  description = "Description of what the custom tool does.";

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const result = await this.solanaKit.customFunction(input);
      return JSON.stringify({
        status: "success",
        message: "Custom tool executed successfully",
        data: result,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
```

### 5. Export Langchain Tool
> `src/langchain/your_protocol/index.ts`
```typescript:src/langchain/your_protocol/index.ts
export * from "./custom_tool";
```

### 6. Export your protocol's langchain tools (if not already exported)
> `src/langchain/index.ts`
```typescript:src/langchain/index.ts
export * from "./tiplink";
export * from "./your_protocol"; // Add your protocol here if it's not already in the list
```

### 7. Define Action class for given tool

> `src/actions/your_protocol/custom_action.ts`
```typescript:src/actions/your_protocol/custom_action.ts
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { custom_tool } from "../../tools";

const customAction: Action = {
  name: "CUSTOM_ACTION",
  similes: ["custom tool"],
  description: "Description of what the custom tool does.",
  examples: [
    {
      input: {},
      output: {
        status: "success",
        message: "Custom tool executed successfully",
        data: result,
      },
      explanation: "Custom tool executed successfully",
    },
  ],
  schema: z.object({
    input: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const result = await agent.customFunction(input);
    return result;
  },
};
```

### 8. Export Action
> `src/actions/index.ts`
```typescript:src/actions/index.ts
import customAction from "./your_protocol/custom_action";

export const ACTIONS = {
    // ... existing actions ...
  CUSTOM_ACTION: customAction,
}
```

### 9. Usage Example

Add a code example in the `README.md` file.

```typescript
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";

const agent = new SolanaAgentKit(
  "your-wallet-private-key-as-base58",
  "https://api.mainnet-beta.solana.com",
  "your-openai-api-key"
);

const tools = createSolanaTools(agent);
const customTool = tools.find(tool => tool.name === "custom_tool");

if (customTool) {
  const result = await customTool._call("your-input");
  console.log(result);
}

// or alternatively
const result = await agent.customFunction("your-input"); // assuming you have implemented `customFunction` method in SolanaAgentKit
console.log(result);
```

## Best Practices

- Implement robust error handling
- Add security checks for sensitive operations
- Document your tool's purpose and usage
- Write tests for reliability
- Keep tools focused on single responsibilities

## Example: Token Price Fetching Tool

Here's a complete example of implementing a tool to fetch token prices:
> `src/tools/fetch_token_price.ts`
```typescript:src/tools/fetch_token_price.ts
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../agent";

export class FetchTokenPriceTool extends Tool {
  name = "fetch_token_price";
  description = "Fetches the current price of a specified token.";

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(tokenSymbol: string): Promise<string> {
    try {
      const price = await this.solanaKit.getTokenPrice(tokenSymbol);
      return JSON.stringify({
        status: "success",
        message: `Price fetched successfully for ${tokenSymbol}.`,
        data: { token: tokenSymbol, price },
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
```

Add the supporting function to SolanaAgentKit:
> `src/agent/index.ts`
```typescript:src/agent/index.ts
export class SolanaAgentKit {
  async getTokenPrice(tokenSymbol: string): Promise<number> {
    const mockPrices: { [key: string]: number } = {
      SOL: 150,
      USDC: 1,
      USDT: 1,
      BONK: 0.5,
    };

    if (!mockPrices[tokenSymbol.toUpperCase()]) {
      throw new Error(`Price for token symbol ${tokenSymbol} not found.`);
    }

    return mockPrices[tokenSymbol.toUpperCase()];
  }
}
```

Add Action for given tool:
> `src/actions/fetch_token_price.ts`
```typescript:src/actions/fetch_token_price.ts
import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { fetch_token_price } from "../tools";

const fetchTokenPriceAction: Action = {
  name: "FETCH_TOKEN_PRICE",
  similes: ["fetch token price"],
  description: "Fetches the current price of a specified token.",
  examples: [
    {
      input: { tokenSymbol: "SOL" },
      output: {
        status: "success",
        message: "Price fetched successfully for SOL.",
        price: 150,
      },
      explanation: "Fetch the current price of SOL token in USDC",
    },
  ],
  schema: z.object({
    tokenSymbol: z.string().describe("The symbol of the token to fetch the price for"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const price = await agent.getTokenPrice(input.tokenSymbol);
    return {
      status: "success",
      price,
      message: `Price fetched successfully for ${input.tokenSymbol}.`,
    };
  },
};
```

Then it can be used as such:

```typescript
import { SolanaAgentKit } from "solana-agent-kit";

const agent = new SolanaAgentKit(
  "your-wallet-private-key-as-base58",
  "https://api.mainnet-beta.solana.com",
  "your-openai-api-key"
);

const result = await agent.getTokenPrice("SOL");
console.log(result);
```

## Need Help?

If you encounter any issues while implementing your custom tool:

- Open an issue in the repository
- Contact the maintainer
- Check existing tools for implementation examples

---
