import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

export class SolanaCrossChainSwapTool extends Tool {
  name = "cross_chain_swap";
  description = `This tool can be used to swap tokens between different chains using Mayan SDK.

  Inputs ( input is a JSON string):
  amount: string, eg "0.02" or "7"
  fromChain: string, eg "solana" or "ethereum"
  fromToken: string, eg "sol" or "Pol" or "0x0000000000000000000000000000000000000000" or "hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux"
  toChain: string, eg "solana" or "ethereum"
  toToken: string, eg "SOL" or "eth" or "0x0000000000000000000000000000000000000000" or "0x6b175474e89094c44da98b954eedeac495271d0f"
  dstAddr: string, eg "4ZgCP2idpqrxuQNfsjakJEm9nFyZ2xnT4CrDPKPULJPk" or "0x0cae42c0cE52E6E64C1e384fF98e686C6eE225f0"
  slippageBps: number, eg 10 (optional)`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const url = await this.solanaKit.swap(
        parsedInput.amount,
        parsedInput.fromChain,
        parsedInput.fromToken,
        parsedInput.toChain,
        parsedInput.toToken,
        parsedInput.dstAddr,
        parsedInput.slippageBps ?? "auto",
      );
      return JSON.stringify({
        status: "success",
        message: "Swap executed successfully",
        url,
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
