import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { registerDomain } from "../../tools";

const registerDomainAction: Action = {
  name: "REGISTER_DOMAIN",
  similes: [
    "register domain",
    "buy domain",
    "get domain name",
    "register .sol",
    "purchase domain",
    "domain registration",
  ],
  description: "Register a .sol domain name using Bonfida Name Service",
  examples: [
    [
      {
        input: {
          name: "mydomain",
          spaceKB: 1,
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Successfully registered mydomain.sol",
        },
        explanation: "Register a new .sol domain with 1KB storage space",
      },
    ],
  ],
  schema: z.object({
    name: z.string().min(1).describe("Domain name to register (without .sol)"),
    spaceKB: z
      .number()
      .min(1)
      .max(10)
      .default(1)
      .describe("Space allocation in KB (max 10KB)"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const name = input.name as string;
      const spaceKB = (input.spaceKB as number) || 1;

      const signature = await registerDomain(agent, name, spaceKB);

      return {
        status: "success",
        signature,
        message: `Successfully registered ${name}.sol`,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Domain registration failed: ${error.message}`,
      };
    }
  },
};

export default registerDomainAction;
