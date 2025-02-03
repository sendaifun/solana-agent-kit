import { Keypair } from "@solana/web3.js";
import { SolanaAgentKit } from "../src";
import { createSolanaTools } from "../src/langchain/index";
import { Tool } from "langchain/tools";
import bs58 from "bs58";

function findDuplicateNames(tools: Tool[]): Map<string, string[]> {
  const nameMap = new Map<string, string[]>();

  tools.forEach((tool) => {
    const existing = nameMap.get(tool.name) || [];
    nameMap.set(tool.name, [...existing, tool.constructor.name]);
  });

  const duplicates = new Map<string, string[]>();
  nameMap.forEach((classes, name) => {
    if (classes.length > 1) {
      duplicates.set(name, classes);
    }
  });

  return duplicates;
}

function findDuplicateClasses(tools: Tool[]): Map<string, string[]> {
  const classMap = new Map<string, string[]>();

  tools.forEach((tool) => {
    const className = tool.constructor.name;
    const existing = classMap.get(className) || [];
    classMap.set(className, [...existing, tool.name]);
  });

  // Filter to only classes with multiple names
  const duplicates = new Map<string, string[]>();
  classMap.forEach((names, className) => {
    if (names.length > 1) {
      duplicates.set(className, names);
    }
  });

  return duplicates;
}

async function main() {
  const kit = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY ||
      bs58.encode(Buffer.from(Keypair.generate().secretKey)),
    process.env.RPC_URL || "",
    { OPENAI_API_KEY: process.env.OPENAI_API_KEY || "" },
  );

  const tools = createSolanaTools(kit);
  const nameDuplicates = findDuplicateNames(tools);
  const classDuplicates = findDuplicateClasses(tools);

  let hasErrors = false;
  const errorMessages: string[] = [];

  if (nameDuplicates.size > 0) {
    hasErrors = true;
    errorMessages.push("❌ Duplicate tool names detected:");
    nameDuplicates.forEach((classes, name) => {
      errorMessages.push(
        `\nName: ${name}`,
        `Used by classes:`,
        ...classes.map((c) => `- ${c}`),
      );
    });
  }

  if (classDuplicates.size > 0) {
    hasErrors = true;
    errorMessages.push("\n❌ Classes used for multiple tools:");
    classDuplicates.forEach((names, className) => {
      errorMessages.push(
        `\nClass: ${className}`,
        "Used for tools:",
        ...names.map((name) => `- ${name}`),
      );
    });
  }

  if (hasErrors) {
    console.error(errorMessages.join("\n"));
    process.exit(1);
  }

  console.log(
    "✅ All checks passed:\n- No duplicate tool names\n- No classes reused for multiple tools",
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
