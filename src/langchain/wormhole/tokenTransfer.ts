import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { TokenTransferInput } from "../../types";

export class TokenTransferTool extends Tool {
  name = "token_transfer";
  description = `Transfer a token from Solana to another chain.

  Inputs (input is a JSON string):
  - destinationChain: string, eg "Ethereum" or "BaseSepolia"
  - network: string, eg "Mainnet" or "Testnet"
  - transferAmount: string, eg "1"
  - tokenAddress: string, eg "0x0000000000000000000000000000000000000000 (in case of solana/sol, it is empty)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    const parsedInput = JSON.parse(input) as TokenTransferInput;
    const result = await this.solanaKit.tokenTransfer(parsedInput);
    return JSON.stringify(result);
  }
}
