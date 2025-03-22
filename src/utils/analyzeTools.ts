import { encoding_for_model, TiktokenModel } from "tiktoken";
import { SolanaAgentKit } from "../index";
import * as dotenv from "dotenv";
import { ACTIONS, Action } from "../actions/index";
import { createSolanaTools as getLangchainTools } from "../langchain/index";
import { createSolanaTools as getVercelTools } from "../vercel-ai/index";
import { type CoreTool } from "ai";
import { Tool } from "langchain/tools";

dotenv.config();

interface ToolAnalysis {
  name: string;
  actionTokens: number;
  langchainTokens: number;
  vercelTokens: number;
  totalTokens: number;
}

function calculateActionTokens(action: Action, enc: any): number {
  // You can customize how you want to weigh or encode the action
  const description = action.description || "";
  const schema = JSON.stringify(action.schema || {});
  const similes = action.similes || [];

  const descTokens = enc.encode(description).length;
  const schemaTokens = enc.encode(schema).length;
  const similesTokens = similes.reduce((acc, simile) => {
    return acc + enc.encode(simile).length;
  }, 0);

  return descTokens + schemaTokens + similesTokens;
}

function calculateLangchainTokens(tool: Tool, enc: any): number {
  // For Langchain, maybe you only want to encode the description
  // or possibly there's a manifest or advanced schema. Adjust to suit your needs.
  const description = tool.description || "";
  const schema = JSON.stringify(tool.schema || {});
  const descTokens = enc.encode(description).length;
  const schemaTokens = enc.encode(schema).length;

  return descTokens + schemaTokens;
}

function calculateVercelTokens(tool: CoreTool, enc: any): number {
  // @ts-expect-error for some reason, the description is not expected to exist
  const description = tool.description || "";
  // @ts-expect-error for some reason, the schema is not expected to exist
  const schemaStr = JSON.stringify(tool.schema || {});
  const parameters = JSON.stringify(tool.parameters || {});

  const descTokens = enc.encode(description).length;
  const schemaTokens = enc.encode(schemaStr).length;
  const parametersTokens = enc.encode(parameters).length;

  return descTokens + schemaTokens + parametersTokens;
}

export async function analyzeToolTokens(
  modelName: TiktokenModel = "gpt-4o",
  includeLangchain: boolean = false,
): Promise<ToolAnalysis[]> {
  const enc = encoding_for_model(modelName);

  const solanaAgentKit = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY! || "",
    process.env.RPC_URL! || "",
    { OPENAI_API_KEY: process.env.OPENAI_API_KEY! || "" },
  );

  // Unify tools by name
  const toolMap = new Map<
    string,
    {
      action: Action | undefined;
      langchain: Tool | undefined;
      vercel: CoreTool | undefined;
    }
  >();

  // Only load Langchain tools if flag is set
  if (includeLangchain) {
    const langchainTools = getLangchainTools(solanaAgentKit) as Tool[];

    langchainTools.forEach((tool) => {
      toolMap.set(tool.name, {
        action: undefined,
        langchain: tool,
        vercel: undefined,
      });
    });
  } else {
    const vercelTools = getVercelTools(solanaAgentKit);

    Object.keys(ACTIONS).forEach((toolName) => {
      toolMap.set(toolName, {
        action: ACTIONS[toolName as keyof typeof ACTIONS] as Action,
        langchain: undefined,
        vercel: vercelTools[toolName as keyof typeof ACTIONS],
      });
    });
  }

  const analysis: ToolAnalysis[] = [];
  for (const [name, implementations] of toolMap) {
    const entry: ToolAnalysis = {
      name,
      actionTokens: 0,
      langchainTokens: 0,
      vercelTokens: 0,
      totalTokens: 0,
    };

    // 1) Action tokens
    if (implementations.action) {
      entry.actionTokens = calculateActionTokens(implementations.action, enc);
    }

    // 2) Langchain tokens
    if (implementations.langchain) {
      entry.langchainTokens = calculateLangchainTokens(
        implementations.langchain,
        enc,
      );
    }

    // 3) Vercel AI tokens
    if (implementations.vercel) {
      entry.vercelTokens = calculateVercelTokens(implementations.vercel, enc);
    }

    // Update total calculation to exclude Langchain if not included
    if (includeLangchain) {
      entry.totalTokens = entry.langchainTokens;
    } else {
      entry.totalTokens = entry.actionTokens + entry.vercelTokens;
    }

    analysis.push(entry);
  }

  // Sort by total tokens descending
  const sorted = analysis.sort((a, b) => b.totalTokens - a.totalTokens);

  // Print final table
  console.log("\nCross-Implementation Tool Token Analysis:");
  if (includeLangchain) {
    console.table(
      sorted.map((t) => ({
        Name: t.name,
        "Langchain Tokens": t.langchainTokens,
      })),
    );
  } else {
    console.table(
      sorted.map((t) => ({
        Name: t.name,
        "Action Tokens": t.actionTokens,
        "Vercel AI Tokens": t.vercelTokens,
      })),
    );
  }

  // Print category totals
  const totals = sorted.reduce(
    (acc, t) => ({
      action: acc.action + t.actionTokens,
      langchain: acc.langchain + t.langchainTokens,
      vercel: acc.vercel + t.vercelTokens,
      total: acc.total + t.totalTokens,
    }),
    { action: 0, langchain: 0, vercel: 0, total: 0 },
  );

  console.log("\nCategory Totals:");
  if (includeLangchain) {
    console.table([
      {
        "Langchain Total": totals.langchain,
        "Grand Total": totals.total,
      },
    ]);
  } else {
    console.table([
      {
        "Action Total": totals.action,
        "Vercel Total": totals.vercel,
        "Grand Total": totals.total,
      },
    ]);
  }

  enc.free();
  return sorted;
}

// Update standalone execution to accept CLI flag
if (require.main === module) {
  const includeLangchain = process.argv.includes("--langchain");
  analyzeToolTokens("gpt-4o", includeLangchain).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
