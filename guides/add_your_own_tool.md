# How to Add Your Own Tool

Extending the **Solana Agent Kit** with custom tools allows you to add specialized functionalities tailored to your needs. This guide walks you through creating and integrating a new tool into the existing framework.

## Overview

1. Create a new tool file
2. Implement the tool class
3. Implement supporting functions in SolanaAgentKit
4. Export the new tool
5. Integrate the tool into the agent
6. Use the custom tool

## Implementation Guide

### 1. Create a New Tool File

Create a new TypeScript file in the `src/tools/` directory for your tool (e.g., `custom_tool.ts`).

### 2. Implement the Tool Class
> `src/langchain/index.ts`
```typescript:src/langchain/index.ts
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../agent";

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

### 4. Export the Tool
> `src/tools/index.ts`
```typescript:src/tools/index.ts
export * from "./request_faucet_funds";
export * from "./deploy_token";
export * from "./custom_tool"; // Add your new tool
```

### 5. Integrate with Agent
> `src/langchain/index.ts`
```typescript:src/langchain/index.ts
import { CustomTool } from "../tools/custom_tool";

export function createSolanaTools(agent: SolanaAgentKit) {
  return [
    // ... existing tools ...
    new CustomTool(agent),
  ];
}
```

### 6. Usage Example

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
const result = await agent.customFunction("your-input"); // assuming you have a `customFunction` method in SolanaAgentKit
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
