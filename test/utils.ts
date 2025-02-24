import * as readline from "node:readline";

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const question = (prompt: string): Promise<string> =>
  new Promise((resolve) => rl.question(prompt, resolve));

export async function chooseAgent<T>(availableAgents: T[]): Promise<T> {
  while (true) {
    console.log("\nAvailable agents:");
    availableAgents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent}`);
    });

    const choice = parseInt(
      await question("\nChoose an agent (enter number): "),
      10,
    );

    return availableAgents[choice - 1];
  }
}

export async function chooseMode(): Promise<"agent" | "programmatic"> {
  while (true) {
    console.log("\nAvailable modes:");
    console.log("1. agent    - Interactive agent chat mode");
    console.log("2. programmatic    - Programmatic tests written using Jest");

    const choice = (await question("\nChoose a mode (enter number or name): "))
      .toLowerCase()
      .trim();

    if (choice === "1" || choice === "agent") {
      return "agent";
    } else if (choice === "2" || choice === "programmatic") {
      return "programmatic";
    }
    console.log("Invalid choice. Please try again.");
  }
}
