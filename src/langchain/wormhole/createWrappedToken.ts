import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { CreateWrappedTokenInput } from "../../types";

export class CreateWrappedTokenTool extends Tool {
  name = "create_wrapped_token";
  description = `Create a wrapped token on a destination chain for a token from Solana.

  Inputs (input is a JSON string):
  - destinationChain: string, eg "Ethereum" or "BaseSepolia"
  - tokenAddress: string, eg "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  - network: string, eg "Mainnet" or "Testnet"`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    const parsedInput = JSON.parse(input) as CreateWrappedTokenInput;
    const result = await this.solanaKit.createWrappedToken(parsedInput);
    return JSON.stringify(result);
  }
}
