import { SolanaAgentKit } from "../../src";
import { createVercelAITools } from "../../src";
import * as dotenv from "dotenv";
import * as readline from "readline";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

dotenv.config();

const CONFIG = {
  temperature: 0.7,
  maxSteps: 10,
  interval: 10 * 1000,
};

function validateEnvironment(): void {
  const missingVars: string[] = [];
  const requiredVars = ["OPENAI_API_KEY", "RPC_URL", "SOLANA_PRIVATE_KEY"];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Missing required environment variables:");
    missingVars.forEach((varName) => {
      console.error(`  - ${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }
}

validateEnvironment();

const createAgentTools = () => {
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY as string });
  const solanaAgent = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY!,
    process.env.RPC_URL!,
    process.env.OPENAI_API_KEY!,
  );

  return { openai, solanaAgent, tools: createVercelAITools(solanaAgent) };
};

async function runAutonomousMode(interval = CONFIG.interval) {
  console.log("Starting autonomous mode...");
  const { openai, tools } = createAgentTools();

  while (true) {
    try {
      const prompt = `
        Be creative and demonstrate your capabilities by executing meaningful actions on the Solana blockchain.
        You can:
          - Deploy tokens or interact with programs.
          - Request funds when necessary.
          - Log and provide concise details about your actions.
      `;

      const response = streamText({
        prompt,
        tools,
        model: openai("gpt-4"),
        temperature: CONFIG.temperature,
        system: `You are an autonomous agent with access to the Solana blockchain via tools. Interact thoughtfully, log your progress, and adapt to user queries.`,
        maxSteps: CONFIG.maxSteps,
      });

      for await (const textPart of response.textStream) {
        process.stdout.write(textPart);
      }
      console.log();

      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error in autonomous mode:", error.message);
      } else {
        console.error("Error in autonomous mode:", error);
      }
    
      if (typeof error === "object" && error !== null && "code" in error && typeof (error as any).code === "number" && (error as any).code >= 500) {
        console.log("Retrying in a moment...");
        await new Promise((resolve) => setTimeout(resolve, interval));
      } else {
        process.exit(1);
      }
    }
  }
}

async function runChatMode() {
  console.log("Starting chat mode... Type 'exit' to quit.");
  const { openai, tools } = createAgentTools();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    while (true) {
      const userInput = await question("\nYour Input: ");

      if (userInput.toLowerCase() === "exit") break;

      const response = streamText({
        prompt: userInput,
        tools,
        model: openai("gpt-4o-mini"),
        temperature: CONFIG.temperature,
        system: `You are an intelligent assistant capable of executing on-chain Solana actions. Respond thoughtfully and log your interactions.`,
        maxSteps: CONFIG.maxSteps,
      });

      for await (const textPart of response.textStream) {
        process.stdout.write(textPart);
      }
      console.log();
    }
  }  catch (error) {
    if (error instanceof Error) {
      console.error("Error in chat mode:", error.message);
    } else {
      console.error("Error in chat mode:", error);
    }
  } finally {
    rl.close();
  }
}

async function main() {
  console.log("Starting Solana Agent...");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    while (true) {
      console.log("\nSelect a Mode:");
      console.log("1. Chat Mode - Interactive conversations.");
      console.log("2. Auto Mode - Fully autonomous actions.");

      const choice = (await question("Enter your choice (1/2): ")).trim();

      if (choice === "1") {
        await runChatMode();
        break;
      } else if (choice === "2") {
        await runAutonomousMode();
        break;
      } else {
        console.log("Invalid choice. Please enter '1' or '2'.");
      }
    }
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error.message);
    process.exit(1);
  });
}
