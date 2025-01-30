import { SolanaAgentKit } from "../../src";
import { createVercelAITools } from "../../src";
import * as dotenv from "dotenv";
import * as readline from "readline";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

dotenv.config();

function validateEnvironment(): void {
  const missingVars: string[] = [];
  const requiredVars = ["OPENAI_API_KEY", "RPC_URL", "SOLANA_PRIVATE_KEY"];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }
}

validateEnvironment();

async function runAutonomousMode(interval = 10) {
  console.log("Starting autonomous mode...");
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  const solanaAgent = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY!,
    process.env.RPC_URL!,
    {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    },
  );

  const tools = createVercelAITools(solanaAgent);

  while (true) {
    try {
      const thought =
        "Be creative and do something interesting on the blockchain. " +
        "Choose an action or set of actions and execute it that highlights your abilities.";

      const response = streamText({
        prompt: thought,
        tools,
        model: openai("gpt-4o-mini"),
        temperature: 0.7,
        system: `You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.`,
        maxSteps: 10,
      });

      for await (const textPart of response.textStream) {
        process.stdout.write(textPart);
      }
      console.log();

      await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    }
  }
}

async function runChatMode() {
  console.log("Starting chat mode... Type 'exit' to end.");
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  const solanaAgent = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY!,
    process.env.RPC_URL!,
    {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    },
  );

  const tools = createVercelAITools(solanaAgent);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    while (true) {
      const userInput = await question("\nPrompt: ");

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      const response = streamText({
        prompt: userInput,
        tools,
        model: openai("gpt-4o-mini"),
        temperature: 0.7,
        system: `You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.`,
        maxSteps: 10,
      });

      for await (const textPart of response.textStream) {
        process.stdout.write(textPart);
      }
      console.log();
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function chooseMode(): Promise<"chat" | "auto"> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  while (true) {
    console.log("\nAvailable modes:");
    console.log("1. chat    - Interactive chat mode");
    console.log("2. auto    - Autonomous action mode");

    const choice = (await question("\nChoose a mode (enter number or name): "))
      .toLowerCase()
      .trim();

    rl.close();

    if (choice === "1" || choice === "chat") {
      return "chat";
    } else if (choice === "2" || choice === "auto") {
      return "auto";
    }
    console.log("Invalid choice. Please try again.");
  }
}

async function main() {
  try {
    console.log("Starting Agent...");
    const mode = await chooseMode();

    if (mode === "chat") {
      await runChatMode();
    } else {
      await runAutonomousMode();
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}